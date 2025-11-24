import React, { useEffect, useRef, useState } from 'react';
import { WordAnalysis } from '../types';
import { decodeAudioData } from '../services/audioUtils';

interface WordCardProps {
  data: WordAnalysis;
  audioData: Uint8Array | null;
}

export const WordCard: React.FC<WordCardProps> = ({ data, audioData }) => {
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
    // Split by primary stress marker (usually ˈ or ')
    // Note: Standard IPA uses ˈ, but sometimes ' is used.
    const parts = phonetic.split(/([ˈ'])/);
    
    return (
        <span className="font-mono text-gray-700">
            {parts.map((part, index) => {
                if (part === 'ˈ' || part === "'") {
                    return <span key={index} className="text-red-500 font-bold text-xl mx-0.5">ˈ</span>;
                }
                // If the previous part was a stress marker, the current part is the stressed syllable (mostly)
                const isStressed = index > 0 && (parts[index - 1] === 'ˈ' || parts[index - 1] === "'");
                return (
                    <span key={index} className={isStressed ? "font-bold text-gray-900" : ""}>
                        {part}
                    </span>
                );
            })}
        </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-6 md:p-8 animate-fadeInScale">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight">{data.word}</h2>
          <div className="flex items-center gap-3 mt-2 text-gray-500">
             {/* Simple phonetic display in header */}
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm text-gray-700">{data.phonetic}</span>
          </div>
        </div>
        
        {audioData && (
          <button 
            onClick={playAudio}
            disabled={isPlaying}
            className={`mt-4 md:mt-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm
                ${isPlaying 
                    ? 'bg-secondary/10 text-secondary cursor-default' 
                    : 'bg-gradient-to-r from-primary to-purple-600 text-white hover:shadow-md hover:scale-105 active:scale-95'}
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

      <p className="text-xl text-gray-700 font-medium leading-relaxed mb-6">
        {data.definition}
      </p>

      {/* Pronunciation Analysis Section */}
      <div className="mb-6 bg-orange-50 rounded-xl p-5 border border-orange-100 flex flex-col md:flex-row gap-5 items-start">
        <div className="flex-shrink-0 bg-orange-100 p-3 rounded-full text-orange-500">
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
           </svg>
        </div>
        <div className="flex-grow">
             <h4 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-2">发音实验室 (Pronunciation Lab)</h4>
             <div className="flex items-center gap-3 mb-2">
                 <span className="text-2xl bg-white px-3 py-1 rounded-md shadow-sm border border-orange-100">
                    {renderPhoneticWithStress(data.phonetic)}
                 </span>
             </div>
             <p className="text-gray-700 text-sm leading-relaxed">
                 {data.pronunciationTips}
             </p>
        </div>
      </div>

      {/* Mnemonic Chant Box */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100">
        <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">助记韵律 (Mnemonic Chant)</h4>
        <p className="font-serif italic text-lg text-indigo-900 whitespace-pre-line leading-relaxed">
          "{data.mnemonicChant}"
        </p>
      </div>
    </div>
  );
};
