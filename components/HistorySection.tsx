import React from 'react';
import { WordAnalysis } from '../types';

interface HistorySectionProps {
  history: WordAnalysis[];
  onSelectWord: (word: WordAnalysis) => void;
  onClearHistory: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({ history, onSelectWord, onClearHistory }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mt-16 animate-fade-in pb-12">
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <h2 className="text-2xl font-bold text-gray-800">Nicole的单词宝库 <span className="text-primary text-lg">({history.length})</span></h2>
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
            className="group relative bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all text-left flex flex-col h-full"
          >
            <div className="flex justify-between items-start w-full mb-2">
              <h3 className="font-bold text-lg text-gray-800 group-hover:text-primary transition-colors">
                {item.word}
              </h3>
              {item.phonetic && (
                <span className="text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded-md font-mono">
                  {item.phonetic}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-grow">
              {item.definition}
            </p>
            <div className="text-xs text-gray-400 mt-auto pt-3 border-t border-gray-50 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>点击复习故事</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};