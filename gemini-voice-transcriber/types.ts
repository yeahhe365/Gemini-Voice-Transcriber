
export interface AppSettings {
 useCustomApiConfig: boolean;
 apiKey: string | null;
 apiUrl: string | null;
 transcriptionModelId: string;
 systemPrompt: string;
 theme: 'light' | 'dark';
 enableThinking: boolean;
}

export interface TranscriptionService {
  updateApiKeyAndUrl: (apiKey: string | null, apiUrl: string | null, useCustomApiConfig: boolean) => void;
  transcribeAudio: (audioFile: File, settings: AppSettings) => Promise<string>;
}
