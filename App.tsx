import React, { useState, useEffect } from 'react';
import { InputSection } from './components/InputSection';
import { WordCard } from './components/WordCard';
import { EtymologySection } from './components/EtymologySection';
import { SimilarWordsSection } from './components/SimilarWordsSection';
import { StoryCard } from './components/StoryCard';
import { HistorySection } from './components/HistorySection';
import { ReviewMode } from './components/ReviewMode';
import { analyzeWord, generateWordImage, generateAudio } from './services/geminiService';
import { AppState, LoadingState, WordAnalysis, QuizResult } from './types';

const STORAGE_KEY = 'nicole_vocab_history';
const QUIZ_STATS_KEY = 'nicole_quiz_stats';

type ViewMode = 'LEARN' | 'REVIEW';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('LEARN');
  const [state, setState] = useState<AppState>({
    status: LoadingState.IDLE,
    data: null,
    imageUrl: null,
    audioData: null,
    error: null,
  });

  const [history, setHistory] = useState<WordAnalysis[]>([]);
  const [lastQuizResult, setLastQuizResult] = useState<QuizResult | null>(null);

  // Load history and stats on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      const savedStats = localStorage.getItem(QUIZ_STATS_KEY);
      if (savedStats) {
        setLastQuizResult(JSON.parse(savedStats));
      }
    } catch (e) {
      console.error("Failed to load storage", e);
    }
  }, []);

  const saveToHistory = (newItem: WordAnalysis) => {
    setHistory((prev) => {
      // Remove duplicate if exists (move to top)
      const filtered = prev.filter(item => item.word.toLowerCase() !== newItem.word.toLowerCase());
      const newHistory = [newItem, ...filtered].slice(0, 50); // Keep last 50
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (e) {
        console.warn("Storage quota exceeded", e);
      }
      return newHistory;
    });
  };

  const handleSaveQuizResult = (result: QuizResult) => {
      setLastQuizResult(result);
      localStorage.setItem(QUIZ_STATS_KEY, JSON.stringify(result));
  };

  const handleClearHistory = () => {
    if(window.confirm("确定要清空所有单词记录吗？")) {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
        setLastQuizResult(null);
        localStorage.removeItem(QUIZ_STATS_KEY);
    }
  };

  const handleSelectHistory = (wordData: WordAnalysis) => {
      setState({
          status: LoadingState.COMPLETE,
          data: wordData,
          imageUrl: null, // Don't persist large images
          audioData: null,
          error: null
      });
      setViewMode('LEARN');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      
      // Save to history immediately after text analysis success
      saveToHistory(data);
      
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
    <div className="min-h-screen pb-20 bg-[#f3f4f6]">
      {/* Header / Background Decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-[300px] -left-[200px] w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-3xl opacity-50"></div>
         <div className="absolute top-[100px] -right-[200px] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="font-bold text-xl tracking-tight text-gray-800">
                  Nicole<span className="text-primary">单词通</span>
              </div>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setViewMode('LEARN')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'LEARN' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    学习模式
                  </button>
                  <button 
                    onClick={() => setViewMode('REVIEW')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'REVIEW' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    复习挑战
                  </button>
              </div>
          </div>
      </nav>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {viewMode === 'REVIEW' ? (
            <ReviewMode 
                history={history} 
                onSaveResult={handleSaveQuizResult}
                lastResult={lastQuizResult}
            />
        ) : (
            <>
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

                        {/* Similar Words */}
                        <SimilarWordsSection words={state.data.similarWords} onWordClick={handleSearch} />

                        {/* Story & Image */}
                        <StoryCard 
                            story={state.data.story} 
                            imageUrl={state.imageUrl} 
                            isLoading={state.status === LoadingState.GENERATING_MEDIA}
                        />
                    </div>
                )}

                {/* Vocabulary History List */}
                <HistorySection 
                    history={history} 
                    onSelectWord={handleSelectHistory} 
                    onClearHistory={handleClearHistory}
                />
            </>
        )}
      </div>
    </div>
  );
};

export default App;