import React, { useState } from 'react';
import { InputSection } from './components/InputSection';
import { WordCard } from './components/WordCard';
import { EtymologySection } from './components/EtymologySection';
import { StoryCard } from './components/StoryCard';
import { analyzeWord, generateWordImage, generateAudio } from './services/geminiService';
import { AppState, LoadingState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    status: LoadingState.IDLE,
    data: null,
    imageUrl: null,
    audioData: null,
    error: null,
  });

  const handleSearch = async (word: string) => {
    setState({
      status: LoadingState.ANALYZING,
      data: null,
      imageUrl: null,
      audioData: null,
      error: null,
    });

    try {
      // 1. Analyze Word (Text)
      const data = await analyzeWord(word);
      setState((prev) => ({ ...prev, data, status: LoadingState.GENERATING_MEDIA }));

      // 2. Generate Media in Parallel
      const imagePromise = generateWordImage(data.visualPrompt);
      
      // Use only English parts for the audio to avoid mixing languages with English TTS voice
      const audioPrompt = `The word is ${data.word}. Listen to this rhythm: ${data.mnemonicChant}`;
      const audioPromise = generateAudio(audioPrompt);

      const [imageUrl, audioData] = await Promise.all([imagePromise, audioPromise]);

      setState((prev) => ({
        ...prev,
        imageUrl,
        audioData,
        status: LoadingState.COMPLETE,
      }));

    } catch (error: any) {
      console.error(error);
      setState((prev) => ({
        ...prev,
        status: LoadingState.ERROR,
        error: error.message || "Something went wrong. Please check your API key and try again.",
      }));
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header / Background Decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-[300px] -left-[200px] w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-3xl opacity-50"></div>
         <div className="absolute top-[100px] -right-[200px] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <InputSection onSearch={handleSearch} loadingStatus={state.status} />

        {state.error && (
            <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center animate-fade-in">
                出错了: {state.error}
            </div>
        )}

        {state.data && (
            <div className="max-w-4xl mx-auto animate-fade-in-up transition-all duration-500 ease-out">
                {/* Main Word Card */}
                <WordCard data={state.data} audioData={state.audioData} />
                
                {/* Etymology & Roots */}
                <EtymologySection data={state.data} />

                {/* Story & Image */}
                <StoryCard story={state.data.story} imageUrl={state.imageUrl} />
            </div>
        )}
      </div>
    </div>
  );
};

export default App;