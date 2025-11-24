import React from 'react';

interface StoryCardProps {
  story: string;
  imageUrl: string | null;
  isLoading?: boolean;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, imageUrl, isLoading = false }) => {
  return (
    <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
       <div className="flex flex-col md:flex-row">
           {/* Image Section */}
           <div className="md:w-1/2 bg-gray-100 min-h-[300px] relative group">
               {imageUrl ? (
                   <img 
                    src={imageUrl} 
                    alt="Visual Mnemonic" 
                    className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500" 
                   />
               ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                       <div className="text-center p-6">
                           {isLoading ? (
                               <>
                                   <svg className="animate-spin w-10 h-10 mx-auto mb-3 text-primary/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                   </svg>
                                   <span className="text-sm font-medium animate-pulse">正在绘制记忆图像...</span>
                               </>
                           ) : (
                               <>
                                   <div className="mb-2 opacity-30 text-6xl">🎨</div>
                                   <p className="text-sm font-medium">暂无图像</p>
                                   <p className="text-xs mt-1 text-gray-300">重新搜索以生成新图像</p>
                               </>
                           )}
                       </div>
                   </div>
               )}
               {/* Overlay Badge */}
               {imageUrl && (
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                   视觉记忆 (Visual)
                </div>
               )}
           </div>

           {/* Story Section */}
           <div className="md:w-1/2 p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">小黑的故事 (Story)</h3>
                </div>
                <div className="prose prose-purple">
                    <p className="text-gray-600 leading-relaxed font-serif text-lg">
                        {story}
                    </p>
                </div>
           </div>
       </div>
    </div>
  );
};