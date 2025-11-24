import React from 'react';

interface StoryCardProps {
  story: string;
  imageUrl: string | null;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, imageUrl }) => {
  return (
    <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
       <div className="flex flex-col md:flex-row">
           {/* Image Section */}
           <div className="md:w-1/2 bg-gray-100 min-h-[300px] relative">
               {imageUrl ? (
                   <img 
                    src={imageUrl} 
                    alt="Visual Mnemonic" 
                    className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500" 
                   />
               ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-400">
                       <div className="text-center">
                           <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                           </svg>
                           <span className="text-sm font-medium">正在生成图像...</span>
                       </div>
                   </div>
               )}
               {/* Overlay Badge */}
               <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                   视觉记忆 (Visual)
               </div>
           </div>

           {/* Story Section */}
           <div className="md:w-1/2 p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">场景故事 (Story)</h3>
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