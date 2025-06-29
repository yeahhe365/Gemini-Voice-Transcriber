import React, { useState, useEffect, useCallback } from 'react';
import { Mic, Settings, Loader2, AlertTriangle, Check, Copy } from 'lucide-react';
import { useAppSettings } from './hooks/useAppSettings';
import { useTranscription } from './hooks/useTranscription';
import { SettingsModal } from './components/SettingsModal';
import { AppSettings } from './types';

const App: React.FC = () => {
    const { appSettings, setAppSettings } = useAppSettings();
    const {
        isRecording,
        isInitializing,
        isTranscribing,
        transcribedText,
        setTranscribedText,
        error,
        toggleRecording
    } = useTranscription(appSettings);

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (appSettings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [appSettings.theme]);
    
    const handleSaveSettings = (newSettings: AppSettings) => {
        setAppSettings(newSettings);
    };

    const handleCopy = useCallback(() => {
        if (!transcribedText) return;
        navigator.clipboard.writeText(transcribedText).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    }, [transcribedText]);

    const getButtonState = () => {
        if (isInitializing) return { text: '正在初始化...', icon: <Loader2 size={32} className="animate-spin" />, disabled: true, bg: 'bg-gray-500' };
        if (isRecording) return { text: '录音中...', icon: <Mic size={32} />, disabled: false, bg: 'bg-red-600 pulse-ring' };
        if (isTranscribing) return { text: '转录中...', icon: <Loader2 size={32} className="animate-spin" />, disabled: true, bg: 'bg-indigo-600' };
        return { text: '点击录音', icon: <Mic size={32} />, disabled: false, bg: 'bg-indigo-600 hover:bg-indigo-700' };
    };

    const { text, icon, disabled, bg } = getButtonState();

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-600/20 rounded-lg">
                        <Mic size={24} className="text-indigo-500 dark:text-indigo-400"/>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gemini Voice Transcriber</h1>
                </div>
                <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition-colors"
                    aria-label="打开设置"
                >
                    <Settings size={22} />
                </button>
            </header>

            <main className="flex-grow p-4 sm:p-6 flex flex-col">
                <div className="relative flex-grow bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg flex">
                    <textarea
                        value={transcribedText}
                        onChange={(e) => setTranscribedText(e.target.value)}
                        placeholder={isInitializing ? "正在初始化麦克风..." : "转录的文本将显示在此处..."}
                        className="w-full h-full p-4 sm:p-6 bg-transparent text-gray-800 dark:text-gray-200 text-lg leading-relaxed resize-none focus:outline-none placeholder-gray-500 dark:placeholder-gray-500"
                        aria-label="转录文本输出"
                    />
                    {transcribedText && (
                        <button
                            onClick={handleCopy}
                            className="absolute top-3 right-3 p-2 bg-gray-200/50 hover:bg-gray-300/70 dark:bg-gray-700/50 dark:hover:bg-gray-600/70 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all backdrop-blur-sm"
                            aria-label="复制文本"
                        >
                           {copySuccess ? <Check size={20} className="text-green-500 dark:text-green-400" /> : <Copy size={20} />}
                        </button>
                    )}
                </div>
            </main>

            <footer className="flex flex-col items-center justify-center p-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
                 {error && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-lg">
                        <AlertTriangle size={20} />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}
                <button
                    onClick={toggleRecording}
                    disabled={disabled}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${bg} ${disabled ? 'cursor-not-allowed' : 'focus:ring-indigo-400'}`}
                    aria-label={text}
                >
                    {icon}
                </button>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium h-5">{!error && text}</p>
            </footer>

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                currentSettings={appSettings}
                onSave={handleSaveSettings}
            />
        </div>
    );
};

export default App;