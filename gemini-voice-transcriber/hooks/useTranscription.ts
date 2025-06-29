
import { useState, useRef, useCallback, useEffect } from 'react';
import { AppSettings } from '../types';
import { transcriptionService } from '../services/geminiService';

export const useTranscription = (settings: AppSettings) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const initialize = useCallback(async () => {
        if (streamRef.current) return; // Already initialized

        setError(null);
        setIsInitializing(true);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError("此浏览器不支持录音功能。");
            setIsInitializing(false);
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            // Disable tracks to turn off the mic indicator, while keeping the stream ready
            stream.getTracks().forEach(track => track.enabled = false);
            setIsInitializing(false);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("麦克风访问被拒绝。请在浏览器设置中授予权限。");
            setIsInitializing(false);
        }
    }, []);

    useEffect(() => {
        initialize();
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [initialize]);

    const toggleRecording = useCallback(async () => {
        if (isRecording) {
            if (mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            setIsRecording(false);
        } else {
            if (!streamRef.current) {
                setError("麦克风尚未准备好。请刷新页面或检查权限。");
                return;
            }
            
            setError(null);
            setTranscribedText('');
            
            try {
                // Enable stream tracks to start capturing audio. This is fast.
                streamRef.current.getTracks().forEach(track => track.enabled = true);

                const mediaRecorder = new MediaRecorder(streamRef.current);
                mediaRecorderRef.current = mediaRecorder;

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    // Disable tracks again to turn off mic icon
                    if (streamRef.current) {
                        streamRef.current.getTracks().forEach(track => track.enabled = false);
                    }

                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
                    
                    setIsTranscribing(true);
                    try {
                        const text = await transcriptionService.transcribeAudio(
                            audioFile,
                            settings
                        );
                        setTranscribedText(text);
                    } catch (err) {
                        console.error("Transcription error:", err);
                        setError(err instanceof Error ? err.message : "转录过程中发生未知错误。");
                    } finally {
                        setIsTranscribing(false);
                        audioChunksRef.current = [];
                    }
                };

                audioChunksRef.current = [];
                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Error starting recording:", err);
                setError("无法开始录音。请检查麦克风权限。");
                setIsRecording(false);
                 if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.enabled = false);
                }
            }
        }
    }, [isRecording, settings]);

    return {
        isRecording,
        isInitializing,
        isTranscribing,
        transcribedText,
        setTranscribedText,
        error,
        toggleRecording
    };
};
