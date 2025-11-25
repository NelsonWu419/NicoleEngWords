
import React, { useEffect, useRef, useState } from 'react';
import { WordAnalysis } from '../types';
import { decodeAudioData } from '../services/audioUtils';

interface WordCardProps {
  data: WordAnalysis;
  audioData: Uint8Array | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const WordCard: React.FC<WordCardProps> = ({ data, audioData, isFavorite, onToggleFavorite }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playAudio = async () => {
    if (!audioData) return;
    
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    
    try {
        setIsPlaying(true);
        const buffer = await decodeAudioData(audioData, ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
    } catch (e) {
        console.error("Playback failed", e);
        setIsPlaying(false);
    }
  };

  // Helper to highlight stressed syllables in IPA
  const renderPhoneticWithStress = (phonetic: string) => {
    if (!phonetic) return null;
    // Split by primary stress marker (usually ˈ or ')
    // Note: Standard IPA uses ˈ, but sometimes ' is used.
    const parts = phonetic.split(/([ˈ'])/);
    
    return (
        <span className="font-mono text-gray-700 dark:text-gray-300">
            {parts.map((part, index) => {
                if (part === 'ˈ' || part === "'") {
                    return <span key={index} className="text-red-500 dark:text-red-400 font-bold text-xl mx-0.5">ˈ</span>;
                }
                // If the previous part was a stress marker, the current part is the stressed syllable (mostly)
                const isStressed = index > 0 && (parts[index - 1] === 'ˈ' || parts[index - 1] === "'");
                return (
                    <span key={index} className={isStressed ? "font-bold text-gray-900 dark:text-gray-100" : ""}>
                        {part}
                    </span>
                );
            })}
        </span>
    );
  };

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'intermediate': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 p-6 md:p-8 animate-fadeInScale transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
             <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">{data.word}</h2>
             
             {/* Favorite Button */}
             <button
               onClick={onToggleFavorite}
               className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
               title={isFavorite ? "Remove from favorites" : "Add to favorites"}
             >
               {isFavorite ? (
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-yellow-400 drop-shadow-sm">
                   <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                 </svg>
               ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-300 hover:text-yellow-400 dark:text-gray-600 dark:hover:text-yellow-400 transition-colors">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.545.044.739.676.352.959l-4.155 3.018a.565.565 0 00-.183.568l1.226 5.232c.15.638-.567 1.135-1.037.796L12 17.58l-4.706 2.87c-.47.339-1.188-.158-1.037-.796l1.226-5.232a.565.565 0 00-.183-.568l-4.155-3.018c-.387-.283-.193-.915.352-.959l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                 </svg>
               )}
             </button>

             {data.difficulty && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getDifficultyColor(data.difficulty)}`}>
                    {data.difficulty}
                </span>
             )}
          </div>
          <div className="flex items-center gap-3 mt-2 text-gray-500 dark:text-gray-400">
             {/* Simple phonetic display in header */}
            <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm text-gray-700 dark:text-gray-300">{data.phonetic}</span>
          </div>
        </div>
        
        {audioData && (
          <button 
            onClick={playAudio}
            disabled={isPlaying}
            className={`mt-4 md:mt-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm
                ${isPlaying 
                    ? 'bg-secondary/10 text-secondary cursor-default' 
                    : 'bg-gradient-to-r from-primary to-purple-600 dark:from-indigo-600 dark:to-purple-800 text-white hover:shadow-md hover:scale-105 active:scale-95'}
            `}
          >
             {isPlaying ? (
                <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                    </span>
                    播放中...
                </>
             ) : (
                <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    播放助记吟诵
                </>
             )}
          </button>
        )}
      </div>

      <p className="text-xl text-gray-700 dark:text-gray-200 font-medium leading-relaxed mb-6">
        {data.definition}
      </p>

      {/* Textbook/Exam Info Section */}
      {data.textbookInfo && (
        <div className="mb-6 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-xl p-5 animate-fade-in">
           <div className="flex items-center gap-2 mb-3">
              <span className="bg-teal-100 dark:bg-teal-900/40 p-1.5 rounded-md text-teal-600 dark:text-teal-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
              </span>
              <h3 className="font-bold text-teal-800 dark:text-teal-300">人教版初中英语 (PEP Curriculum)</h3>
           </div>
           
           <div className="flex flex-col md:flex-row gap-4 md:gap-8">
              <div className="flex-shrink-0">
                  <span className="block text-xs text-teal-600 dark:text-teal-400 uppercase font-semibold">教材位置</span>
                  <div className="font-bold text-gray-800 dark:text-gray-100 mt-0.5">
                    {data.textbookInfo.grade} {data.textbookInfo.unit ? `• ${data.textbookInfo.unit}` : ''}
                  </div>
              </div>
              <div>
                  <span className="block text-xs text-teal-600 dark:text-teal-400 uppercase font-semibold mb-1">中考考点 / 常用搭配</span>
                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      {data.textbookInfo.examPoints.map((point, idx) => (
                          <li key={idx}>{point}</li>
                      ))}
                  </ul>
              </div>
           </div>
        </div>
      )}

      {/* Pronunciation Analysis Section */}
      <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-5 border border-orange-100 dark:border-orange-800 flex flex-col md:flex-row gap-5 items-start">
        <div className="flex-shrink-0 bg-orange-100 dark:bg-orange-900/40 p-3 rounded-full text-orange-500 dark:text-orange-400">
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
           </svg>
        </div>
        <div className="flex-grow">
             <h4 className="text-sm font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider mb-2">发音实验室 (Pronunciation Lab)</h4>
             <div className="flex items-center gap-3 mb-2">
                 <span className="text-2xl bg-white dark:bg-gray-800 px-3 py-1 rounded-md shadow-sm border border-orange-100 dark:border-gray-700">
                    {renderPhoneticWithStress(data.phonetic)}
                 </span>
             </div>
             <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                 {data.pronunciationTips}
             </p>
        </div>
      </div>

      {/* Mnemonic Chant Box */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800">
        <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-300 uppercase tracking-wider mb-2">助记韵律 (Mnemonic Chant)</h4>
        <p className="font-serif italic text-lg text-indigo-900 dark:text-indigo-200 whitespace-pre-line leading-relaxed">
          "{data.mnemonicChant}"
        </p>
      </div>
    </div>
  );
};
