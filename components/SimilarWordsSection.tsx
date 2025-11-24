import React from 'react';

interface SimilarWordsSectionProps {
  words: string[];
  onWordClick: (word: string) => void;
}

export const SimilarWordsSection: React.FC<SimilarWordsSectionProps> = ({ words, onWordClick }) => {
  if (!words || words.length === 0) return null;

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
           </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800">相似词扩展 (Similar Words)</h3>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {words.map((word, index) => (
          <button
            key={index}
            onClick={() => onWordClick(word)}
            className="group px-5 py-2.5 bg-gray-50 hover:bg-primary hover:text-white border border-gray-200 hover:border-primary rounded-xl text-gray-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 text-base font-medium flex items-center gap-2"
          >
            <span>{word}</span>
            <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
};