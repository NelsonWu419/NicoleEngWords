import React, { useState } from 'react';
import { LoadingState } from '../types';

interface InputSectionProps {
  onSearch: (word: string) => void;
  loadingStatus: LoadingState;
}

export const InputSection: React.FC<InputSectionProps> = ({ onSearch, loadingStatus }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && loadingStatus === LoadingState.IDLE) {
      onSearch(input.trim());
    }
  };

  const isLoading = loadingStatus !== LoadingState.IDLE && loadingStatus !== LoadingState.ERROR && loadingStatus !== LoadingState.COMPLETE;

  return (
    <div className="w-full max-w-2xl mx-auto text-center py-10">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 tracking-tight">
        Nicole<span className="text-primary">单词通</span>
      </h1>
      <p className="text-gray-500 mb-8 text-lg">
        Nicole的专属单词魔法书 —— 探索单词的起源，声音与灵魂。
      </p>

      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="relative w-full">
          <input
            type="text"
            className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-full focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all text-gray-700 bg-white"
            placeholder="Nicole, 今天想学哪个单词？"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`absolute right-2 top-2 bottom-2 px-6 rounded-full font-medium text-white transition-all transform duration-200 
              ${isLoading || !input.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-indigo-700 hover:shadow-md active:scale-95'}
            `}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                解析中
              </span>
            ) : (
              '深度解析'
            )}
          </button>
        </div>
      </form>
      
      {loadingStatus !== LoadingState.IDLE && loadingStatus !== LoadingState.ERROR && (
         <div className="mt-4 text-sm font-medium text-primary animate-pulse">
           {loadingStatus === LoadingState.ANALYZING && "正在解构词源与释义..."}
           {loadingStatus === LoadingState.GENERATING_MEDIA && "正在生成记忆图像与助记音乐..."}
         </div>
      )}
    </div>
  );
};