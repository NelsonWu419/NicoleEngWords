
import React, { useState, useEffect } from 'react';
import { AIConfig, AIProvider } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIConfig;
  onSave: (config: AIConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [provider, setProvider] = useState<AIProvider>(config.provider);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [model, setModel] = useState(config.model);

  // Sync local state with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setProvider(config.provider);
      setApiKey(config.apiKey);
      setModel(config.model);
    }
  }, [isOpen, config]);

  // Set default models when provider changes
  useEffect(() => {
    if (provider === 'GEMINI' && !model.includes('gemini')) {
        setModel('gemini-2.5-flash');
    } else if (provider === 'QWEN' && !model.includes('qwen')) {
        setModel('qwen-plus');
    }
  }, [provider]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ provider, apiKey, model });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeInScale">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                AI 模型配置
              </h2>
           </div>

           <form onSubmit={handleSave} className="space-y-5">
             
             {/* Provider Selection */}
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 模型服务商 (Provider)
               </label>
               <div className="grid grid-cols-2 gap-3">
                 <button
                   type="button"
                   onClick={() => setProvider('GEMINI')}
                   className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                     provider === 'GEMINI'
                       ? 'bg-primary/10 border-primary text-primary dark:text-indigo-400'
                       : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                   }`}
                 >
                   Google Gemini
                 </button>
                 <button
                   type="button"
                   onClick={() => setProvider('QWEN')}
                   className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                     provider === 'QWEN'
                       ? 'bg-primary/10 border-primary text-primary dark:text-indigo-400'
                       : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                   }`}
                 >
                   通义千问 (Qwen)
                 </button>
               </div>
             </div>

             {/* API Key Input */}
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 API Key <span className="text-red-500">*</span>
               </label>
               <input
                 type="password"
                 required
                 className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-700 dark:text-white transition-all"
                 placeholder={provider === 'GEMINI' ? "AIza..." : "sk-..."}
                 value={apiKey}
                 onChange={(e) => setApiKey(e.target.value)}
               />
               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                 {provider === 'GEMINI' 
                    ? "从 Google AI Studio 获取" 
                    : "从阿里云 DashScope 获取"}
               </p>
             </div>

             {/* Model Name Input */}
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 模型名称 (Model Name)
               </label>
               <input
                 type="text"
                 required
                 className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-700 dark:text-white transition-all"
                 placeholder="e.g. gemini-2.5-flash"
                 value={model}
                 onChange={(e) => setModel(e.target.value)}
               />
               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                 推荐: {provider === 'GEMINI' ? "gemini-2.5-flash" : "qwen-plus, qwen-max"}
               </p>
             </div>

             <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-primary dark:bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  保存配置
                </button>
             </div>
           </form>
        </div>
      </div>
    </div>
  );
};
