import React, { useState } from 'react';
import { WordAnalysis } from '../types';

interface EtymologySectionProps {
  data: WordAnalysis;
}

export const EtymologySection: React.FC<EtymologySectionProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Origin Card */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">词源演变 (Origin)</h3>
        </div>
        <p className="text-gray-600 leading-relaxed text-sm md:text-base">
          {data.etymology}
        </p>
      </div>

      {/* Roots Table */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
         <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">词根拆解 (Roots)</h3>
        </div>
        
        <div className="space-y-4">
          {data.roots.map((root, idx) => (
            <div key={idx} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-gray-800 text-lg">{root.root}</span>
                <span className="text-sm text-gray-500 italic">{root.meaning}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                {root.examples.map((ex, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};