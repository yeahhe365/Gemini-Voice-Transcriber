
import { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { DEFAULT_APP_SETTINGS, APP_SETTINGS_KEY, AVAILABLE_TRANSCRIPTION_MODELS } from '../constants';
import { transcriptionService } from '../services/geminiService';

export const useAppSettings = () => {
    const [appSettings, setAppSettings] = useState<AppSettings>(() => {
        try {
            const stored = localStorage.getItem(APP_SETTINGS_KEY);
            const loadedSettings = stored ? { ...DEFAULT_APP_SETTINGS, ...JSON.parse(stored) } : DEFAULT_APP_SETTINGS;
            
            // If the saved model is no longer available, reset to default.
            if (!AVAILABLE_TRANSCRIPTION_MODELS.some(model => model.id === loadedSettings.transcriptionModelId)) {
                loadedSettings.transcriptionModelId = DEFAULT_APP_SETTINGS.transcriptionModelId;
            }

            const apiKeyToUse = loadedSettings.useCustomApiConfig ? loadedSettings.apiKey : null;
            const apiUrlToUse = loadedSettings.useCustomApiConfig ? loadedSettings.apiUrl : null;
            transcriptionService.updateApiKeyAndUrl(apiKeyToUse, apiUrlToUse, loadedSettings.useCustomApiConfig);
            
            return loadedSettings;
        } catch (error) {
            console.error("Failed to load settings from localStorage:", error);
            return DEFAULT_APP_SETTINGS;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(appSettings));
            const apiKeyToUse = appSettings.useCustomApiConfig ? appSettings.apiKey : null;
            const apiUrlToUse = appSettings.useCustomApiConfig ? appSettings.apiUrl : null;
            transcriptionService.updateApiKeyAndUrl(apiKeyToUse, apiUrlToUse, appSettings.useCustomApiConfig);
        } catch (error) {
            console.error("Failed to save settings to localStorage:", error);
        }
    }, [appSettings]);

    return { appSettings, setAppSettings };
};
