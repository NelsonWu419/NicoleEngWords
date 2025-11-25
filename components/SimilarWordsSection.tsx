import React from 'react';

interface SimilarWordsSectionProps {
  synonyms?: string[];
  antonyms?: string[];
  onWordClick: (word: string) => void;
}

export const SimilarWordsSection: React.FC<SimilarWordsSectionProps> = ({ synonyms = [], antonyms = [], onWordClick }) => {
  if ((!synonyms || synonyms.length === 0) && (!antonyms || antonyms.length === 0)) return null;

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
           </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800">词汇扩展 (Word Expansion)</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Synonyms Section */}
        {synonyms && synonyms.length > 0 && (
            <div>
                 <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    同义词 (Synonyms)
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {synonyms.map((word, index) => (
                      <button
                        key={`syn-${index}`}
                        onClick={() => onWordClick(word)}
                        className="group px-4 py-2 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-100 hover:border-blue-600 rounded-lg text-blue-700 transition-all duration-200 shadow-sm text-sm font-medium flex items-center gap-1"
                      >
                        <span>{word}</span>
                        <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    ))}
                 </div>
            </div>
        )}

        {/* Antonyms Section */}
        {antonyms && antonyms.length > 0 && (
            <div>
                 <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    反义词 (Antonyms)
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {antonyms.map((word, index) => (
                      <button
                        key={`ant-${index}`}
                        onClick={() => onWordClick(word)}
                        className="group px-4 py-2 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-100 hover:border-rose-600 rounded-lg text-rose-700 transition-all duration-200 shadow-sm text-sm font-medium flex items-center gap-1"
                      >
                         <span>{word}</span>
                         <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    ))}
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};