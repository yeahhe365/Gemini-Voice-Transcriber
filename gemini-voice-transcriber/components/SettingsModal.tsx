
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { AVAILABLE_TRANSCRIPTION_MODELS } from '../constants';
import { X, KeyRound, BrainCircuit, SunMoon } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
  const [settings, setSettings] = useState(currentSettings);

  useEffect(() => {
    setSettings(currentSettings);
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(settings);
    onClose();
  };
  
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const inputClasses = "w-full p-2.5 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400";

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-lg flex flex-col gap-6 border border-gray-200 dark:border-gray-700 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">设置</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors p-1 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
          <div className="p-4 bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <SunMoon size={20} className="text-indigo-500 dark:text-indigo-400"/>
                  外观
              </h3>
              <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">主题</label>
                  <div className="flex gap-2">
                      <button 
                          onClick={() => updateSetting('theme', 'light')}
                          className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${settings.theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'}`}
                      >
                          浅色
                      </button>
                      <button 
                          onClick={() => updateSetting('theme', 'dark')}
                          className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${settings.theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'}`}
                      >
                          深色
                      </button>
                  </div>
              </div>
          </div>
          
          <div className="p-4 bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <KeyRound size={20} className="text-indigo-500 dark:text-indigo-400"/>
                API 配置
            </h3>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700 dark:text-gray-300">使用自定义 API 密钥</span>
              <div className="relative">
                <input type="checkbox" className="sr-only peer" checked={settings.useCustomApiConfig} onChange={(e) => updateSetting('useCustomApiConfig', e.target.checked)} />
                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 peer-checked:bg-indigo-600"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
            <div>
              <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Gemini API 密钥</label>
              <input id="api-key-input" type="password" value={settings.apiKey || ''} onChange={(e) => updateSetting('apiKey', e.target.value)}
                className={`${inputClasses} ${!settings.useCustomApiConfig ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder={settings.useCustomApiConfig ? "请输入您的 API 密钥" : "使用环境中默认的密钥"}
                disabled={!settings.useCustomApiConfig} />
            </div>
          </div>
          
          <div className="p-4 bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <BrainCircuit size={20} className="text-teal-500 dark:text-teal-400"/>
                转录
            </h3>
             <div>
                <label htmlFor="model-select" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">模型</label>
                <select id="model-select" value={settings.transcriptionModelId} onChange={(e) => updateSetting('transcriptionModelId', e.target.value)} className={inputClasses}>
                  {AVAILABLE_TRANSCRIPTION_MODELS.map(model => (<option key={model.id} value={model.id}>{model.name}</option>))}
                </select>
            </div>
            <div className="space-y-2 pt-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-medium text-gray-700 dark:text-gray-300">开启模型思考</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" checked={settings.enableThinking} onChange={(e) => updateSetting('enableThinking', e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 peer-checked:bg-indigo-600"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </div>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  开启后，模型会花更多时间思考以提升转录质量，但响应时间会变长。
                </p>
            </div>
            <div>
                <label htmlFor="system-prompt-input" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">系统提示词 (角色设定)</label>
                <textarea
                    id="system-prompt-input"
                    value={settings.systemPrompt}
                    onChange={(e) => updateSetting('systemPrompt', e.target.value)}
                    className={`${inputClasses} min-h-[80px] resize-y`}
                    placeholder="例如：你是一个乐于助人的助手。请转录音频并将其总结为要点。"
                    rows={3}
                />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white font-semibold rounded-md transition-colors">
            取消
          </button>
          <button onClick={handleSave} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition-colors">
            保存
          </button>
        </div>
      </div>
    </div>
  );
};
