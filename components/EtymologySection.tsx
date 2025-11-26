import React from 'react';
import { WordAnalysis } from '../types';

interface EtymologySectionProps {
  data: WordAnalysis;
  onWordClick: (word: string) => void;
}

export const EtymologySection: React.FC<EtymologySectionProps> = ({ data, onWordClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Origin Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-300 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">词源演变 (Origin)</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base flex-grow">
          {data.etymology}
        </p>
      </div>

      {/* Roots Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-300">
         <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">词根拆解 (Roots)</h3>
        </div>
        
        <div className="space-y-3">
          {data.roots.map((root, idx) => (
            <div 
              key={idx} 
              className="group bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex justify-between items-center mb-2">
                <button 
                  onClick={() => onWordClick(root.root)}
                  className="font-bold text-emerald-700 dark:text-emerald-400 text-lg font-mono tracking-tight hover:underline hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors text-left"
                  title={`点击探索词根: ${root.root}`}
                >
                  {root.root}
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {root.meaning}
                </span>
              </div>

              {root.examples && root.examples.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {root.examples.map((ex, i) => (
                        <button
                           key={i}
                           onClick={() => onWordClick(ex)}
                           className="text-xs px-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
                           title={`点击学习: ${ex}`}
                        >
                           {ex}
                           <svg className="w-2.5 h-2.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                           </svg>
                        </button>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};