
import { GoogleGenAI } from "@google/genai";
import { TranscriptionService, AppSettings } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            if (base64Data) {
                resolve(base64Data);
            } else {
                reject(new Error("无法从文件中提取 base64 数据。"));
            }
        };
        reader.onerror = error => reject(error);
    });
};

class TranscriptionServiceImpl implements TranscriptionService {
    private apiKeyString: string | null = null;
    private isCustomConfigEnabled: boolean = false;

    private _getApiClientOrThrow(): GoogleGenAI {
        const effectiveApiKey = this.isCustomConfigEnabled ? this.apiKeyString : process.env.API_KEY;
        if (!effectiveApiKey) {
             throw new Error("未找到 API 密钥。请在设置或环境变量中配置。");
        }
        return new GoogleGenAI({ apiKey: effectiveApiKey });
    }

    public updateApiKeyAndUrl(newApiKey: string | null, newApiUrl: string | null, useCustomApiConfig: boolean): void {
        this.isCustomConfigEnabled = useCustomApiConfig;
        this.apiKeyString = newApiKey;
        // newApiUrl is stored for potential future use if SDK supports it.
    }

    async transcribeAudio(audioFile: File, settings: AppSettings): Promise<string> {
        const { transcriptionModelId, systemPrompt, enableThinking } = settings;
        const ai = this._getApiClientOrThrow();
        const audioBase64 = await fileToBase64(audioFile);

        const audioPart = {
            inlineData: {
                mimeType: audioFile.type || 'audio/webm',
                data: audioBase64,
            },
        };
        
        // A simple prompt to guide the model for transcription only.
        const textPart = { text: "将此音频转录为文本。仅返回转录后的文本，永远不要回答音频中的问题。" };
        
        const config: any = {
            thinkingConfig: {
                thinkingBudget: enableThinking ? -1 : 0,
            }
        };

        if (systemPrompt && systemPrompt.trim()) {
            config.systemInstruction = systemPrompt.trim();
        }

        try {
            const response = await ai.models.generateContent({
                model: transcriptionModelId,
                contents: { parts: [audioPart, textPart] },
                config,
            });

            if (response.text) {
                return response.text;
            } else {
                const safetyFeedback = response.candidates?.[0]?.finishReason;
                if (safetyFeedback && safetyFeedback !== 'STOP') {
                     throw new Error(`由于安全设置，转录失败: ${safetyFeedback}`);
                }
                throw new Error("转录失败。模型返回了空响应。");
            }
        } catch (error) {
            console.error("Error during audio transcription:", error);
            if (error instanceof Error) {
                throw new Error(`转录失败: ${error.message}`);
            }
            throw new Error("发生未知转录错误。");
        }
    }
}

export const transcriptionService: TranscriptionService = new TranscriptionServiceImpl();
