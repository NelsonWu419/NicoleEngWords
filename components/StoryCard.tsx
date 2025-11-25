
import React, { useState, useEffect } from 'react';
import { StoryScene } from '../types';

interface StoryCardProps {
  story: string;
  scenes?: StoryScene[];
  imageUrls: (string | null)[];
  imageErrors?: (string | null)[]; // New prop for displaying errors
  isLoading?: boolean;
  targetWord: string;
  onRegenerateImage: (index: number) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, scenes, imageUrls, imageErrors = [], isLoading = false, targetWord, onRegenerateImage }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when content changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [story]);

  const hasScenes = scenes && scenes.length > 0;
  const currentImage = imageUrls && imageUrls[currentIndex] ? imageUrls[currentIndex] : null;
  const currentError = imageErrors && imageErrors[currentIndex] ? imageErrors[currentIndex] : null;
  const currentText = hasScenes ? scenes[currentIndex].narrative : story;
  const totalScenes = hasScenes ? scenes.length : 1;

  const nextScene = () => {
    if (currentIndex < totalScenes - 1) setCurrentIndex(prev => prev + 1);
  };

  const prevScene = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  // Helper function to highlight the target word in text
  const renderHighlightedText = (text: string, wordToHighlight: string) => {
    if (!wordToHighlight || !text) return text;
    
    // Escape special regex characters in the word to prevent errors
    const safeWord = wordToHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create regex with capturing group to include the delimiter in the result
    // Case insensitive matching
    const regex = new RegExp(`(${safeWord})`, 'gi');
    
    // Split the text. The capturing group () ensures the separator (the word) is included in the array.
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
        // Check if this part matches the word (case-insensitive)
        if (part.toLowerCase() === wordToHighlight.toLowerCase()) {
            return (
                <span 
                    key={i} 
                    className="text-primary dark:text-indigo-400 font-bold bg-primary/10 dark:bg-indigo-400/20 px-1 rounded mx-0.5 shadow-sm border border-primary/20 dark:border-indigo-400/20"
                >
                    {part}
                </span>
            );
        }
        return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300 max-w-2xl mx-auto flex flex-col">
      
      {/* Header */}
      <div className="p-6 pb-2 flex justify-between items-center border-b border-gray-50 dark:border-gray-700/50">
           <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">小黑的故事 (Story)</h3>
            </div>
            {hasScenes && (
                <div className="text-sm font-medium text-gray-400 dark:text-gray-500">
                    Scene {currentIndex + 1} / {totalScenes}
                </div>
            )}
      </div>

       <div className="flex flex-col">
           {/* Image Viewer - Aspect Ratio 4:3 enforced */}
           <div className="w-full aspect-[4/3] bg-gray-100 dark:bg-gray-900 relative group flex items-center justify-center overflow-hidden">
               {currentImage ? (
                   <img 
                    key={currentIndex} // Force re-render for animation
                    src={currentImage} 
                    alt={`Scene ${currentIndex + 1}`} 
                    className="w-full h-full object-cover animate-fade-in absolute inset-0" 
                   />
               ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 p-8">
                       <div className="text-center flex flex-col items-center">
                           {isLoading && !currentError ? (
                               <>
                                   <svg className="animate-spin w-10 h-10 mx-auto mb-3 text-primary/50 dark:text-indigo-400/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                   </svg>
                                   <span className="text-sm font-medium animate-pulse text-gray-500 dark:text-gray-400">正在绘制场景 {currentIndex + 1}...</span>
                               </>
                           ) : (
                               <>
                                   <div className="mb-2 opacity-30 text-6xl">🎨</div>
                                   {currentError ? (
                                     <div className="mb-4 text-rose-500 dark:text-rose-400 text-sm px-4 py-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg max-w-xs">
                                        <div className="font-bold mb-0.5">生成失败</div>
                                        <div className="text-xs opacity-90">{currentError}</div>
                                     </div>
                                   ) : (
                                     <p className="text-sm font-medium mb-3">暂无图像</p>
                                   )}
                                   
                                   <button 
                                      onClick={() => onRegenerateImage(currentIndex)}
                                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm font-medium text-primary dark:text-indigo-400 shadow-sm hover:shadow hover:bg-gray-50 dark:hover:bg-gray-600 transition-all active:scale-95"
                                   >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                      重新生成图片
                                   </button>
                               </>
                           )}
                       </div>
                   </div>
               )}
               
               {/* Scene Overlay Badge */}
               {currentImage && hasScenes && (
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                   Scene {currentIndex + 1}
                </div>
               )}
           </div>

           {/* Narrative Section */}
           <div className="w-full p-6 md:p-8 flex flex-col relative">
                <div className="flex-grow">
                    <div className="prose prose-purple dark:prose-invert max-h-60 overflow-y-auto pr-2 w-full text-center md:text-left">
                        <p className="text-gray-700 dark:text-gray-200 leading-relaxed font-serif text-xl md:text-2xl animate-fade-in">
                            {renderHighlightedText(currentText, targetWord)}
                        </p>
                    </div>
                </div>

                {/* Navigation Controls */}
                {hasScenes && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <button 
                            onClick={prevScene}
                            disabled={currentIndex === 0}
                            className={`p-2 rounded-full transition-all ${currentIndex === 0 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-primary dark:text-indigo-400 hover:bg-primary/10 dark:hover:bg-indigo-400/10'}`}
                        >
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        
                        <div className="flex gap-2">
                            {scenes.map((_, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentIndex ? 'bg-primary dark:bg-indigo-400 scale-125' : 'bg-gray-300 dark:bg-gray-600'}`}
                                />
                            ))}
                        </div>

                        <button 
                            onClick={nextScene}
                            disabled={currentIndex === totalScenes - 1}
                            className={`p-2 rounded-full transition-all ${currentIndex === totalScenes - 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-primary dark:text-indigo-400 hover:bg-primary/10 dark:hover:bg-indigo-400/10'}`}
                        >
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
           </div>
       </div>
    </div>
  );
};
