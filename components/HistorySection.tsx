
import React from 'react';
import { WordAnalysis } from '../types';

interface HistorySectionProps {
  history: WordAnalysis[];
  onSelectWord: (word: WordAnalysis) => void;
  onClearHistory: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({ history, onSelectWord, onClearHistory }) => {
  if (history.length === 0) return null;

  const getDifficultyColor = (level: string) => {
    if (!level) return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
      case 'intermediate': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
      case 'advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-16 animate-fade-in pb-12">
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Nicole的单词宝库 <span className="text-primary dark:text-indigo-400 text-lg">({history.length})</span></h2>
        </div>
        <button 
          onClick={onClearHistory}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors underline"
        >
          清空记录
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2">
        {history.map((item, index) => (
          <button
            key={`${item.word}-${index}`}
            onClick={() => onSelectWord(item)}
            className="group relative bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:border-primary/30 dark:hover:border-indigo-400/30 hover:-translate-y-1 transition-all text-left flex flex-col h-full"
          >
            <div className="flex justify-between items-start w-full mb-2">
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors">
                {item.word}
              </h3>
              <div className="flex flex-col items-end gap-1">
                 {item.phonetic && (
                    <span className="text-xs bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-2 py-1 rounded-md font-mono">
                      {item.phonetic}
                    </span>
                 )}
                 {item.difficulty && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${getDifficultyColor(item.difficulty)}`}>
                        {item.difficulty}
                    </span>
                 )}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 flex-grow">
              {item.definition}
            </p>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-auto pt-3 border-t border-gray-50 dark:border-gray-700 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>点击复习</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
