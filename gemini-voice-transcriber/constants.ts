import { AppSettings } from './types';

export const DEFAULT_TRANSCRIPTION_MODEL_ID = 'gemini-2.5-flash';

export const AVAILABLE_TRANSCRIPTION_MODELS: { id: string; name: string }[] = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5-flash-lite-preview-06-17', name: 'Gemini 2.5 Flash Lite (预览版)' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
];

export const APP_SETTINGS_KEY = 'voiceTranscriberAppSettings';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  useCustomApiConfig: false,
  apiKey: null,
  apiUrl: 'https://generativelanguage.googleapis.com/v1beta',
  transcriptionModelId: DEFAULT_TRANSCRIPTION_MODEL_ID,
  systemPrompt: '你是一个乐于助人的助手，负责将将提供的音频文件，逐字、无遗漏、无修改地转录为文本。',
  theme: 'light',
  enableThinking: false,
};
