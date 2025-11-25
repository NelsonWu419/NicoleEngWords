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
const THEME_KEY = 'nicole_theme_pref';
const FAVORITES_KEY = 'nicole_favorites';

type ViewMode = 'LEARN' | 'REVIEW';
type Theme = 'light' | 'dark';

// Helper to prevent hitting API rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('LEARN');
  const [theme, setTheme] = useState<Theme>('light');
  const [state, setState] = useState<AppState>({
    status: LoadingState.IDLE,
    data: null,
    imageUrls: [], // Initialized as empty array
    imageErrors: [], // Initialized as empty array
    audioData: null,
    error: null,
  });

  const [history, setHistory] = useState<WordAnalysis[]>([]);
  const [favorites, setFavorites] = useState<WordAnalysis[]>([]);
  const [lastQuizResult, setLastQuizResult] = useState<QuizResult | null>(null);

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Load history, stats, and favorites on mount
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
      const savedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
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

  const handleToggleFavorite = (wordData: WordAnalysis) => {
    setFavorites((prev) => {
      const isFavorite = prev.some((item) => item.word.toLowerCase() === wordData.word.toLowerCase());
      let newFavorites;
      if (isFavorite) {
        newFavorites = prev.filter((item) => item.word.toLowerCase() !== wordData.word.toLowerCase());
      } else {
        newFavorites = [wordData, ...prev];
      }
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return newFavorites;
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
          imageUrls: [], // Don't persist large images
          imageErrors: [],
          audioData: null,
          error: null
      });
      setViewMode('LEARN');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatError = (error: any): string => {
      const msg = error?.toString() || "";
      if (msg.includes("429")) return "服务器繁忙(429)，请稍后重试";
      if (msg.includes("400")) return "图片生成受限(400)，可能包含敏感词";
      if (msg.includes("403")) return "权限不足(403)，请检查API Key设置";
      return "生成失败，请点击重试";
  };

  const handleRegenerateImage = async (index: number) => {
    if (!state.data) return;

    // Set a temporary loading state for specific image slot
    const newImageUrls = [...state.imageUrls];
    newImageUrls[index] = null;
    
    // Clear error before retry
    const newImageErrors = [...state.imageErrors];
    newImageErrors[index] = null;

    setState(prev => ({ 
        ...prev, 
        imageUrls: newImageUrls, 
        imageErrors: newImageErrors,
        status: LoadingState.GENERATING_MEDIA 
    }));

    try {
      let prompt = "";
      if (state.data.scenes && state.data.scenes.length > 0) {
        prompt = state.data.scenes[index]?.visualPrompt;
      } else {
        prompt = state.data.visualPrompt;
      }

      if (!prompt) throw new Error("No prompt found");

      const newImageUrl = await generateWordImage(prompt);
      
      setState(prev => {
        const updatedUrls = [...prev.imageUrls];
        updatedUrls[index] = newImageUrl;
        return {
          ...prev,
          imageUrls: updatedUrls,
          status: LoadingState.COMPLETE
        };
      });
    } catch (e: any) {
      console.error("Failed to regenerate image", e);
      const errorMsg = formatError(e);
      setState(prev => {
          const updatedErrors = [...prev.imageErrors];
          updatedErrors[index] = errorMsg;
          return { ...prev, imageErrors: updatedErrors, status: LoadingState.COMPLETE };
      });
    }
  };

  const handleSearch = async (word: string) => {
    setState({
      status: LoadingState.ANALYZING,
      data: null,
      imageUrls: [],
      imageErrors: [],
      audioData: null,
      error: null,
    });

    try {
      // 1. Analyze Word (Text)
      const data = await analyzeWord(word);
      
      // Save to history immediately after text analysis success
      saveToHistory(data);
      
      // Initialize empty placeholders for images and errors
      const count = data.scenes && data.scenes.length > 0 ? data.scenes.length : 1;
      const initialImageUrls = new Array(count).fill(null);
      const initialImageErrors = new Array(count).fill(null);

      setState((prev) => ({ 
          ...prev, 
          data, 
          imageUrls: initialImageUrls,
          imageErrors: initialImageErrors,
          status: LoadingState.GENERATING_MEDIA 
      }));

      // 2. Generate Audio (Lightweight)
      const audioPrompt = `The word is ${data.word}. Listen to this rhythm: ${data.mnemonicChant}`;
      generateAudio(audioPrompt).then(audioData => {
          setState(prev => ({ ...prev, audioData }));
      }).catch(e => console.error("Audio failed", e));

      // 3. Generate Images Sequentially to avoid Nano Banana Rate Limits
      // If we request 5 images at once, the API often returns 429 Too Many Requests
      const prompts = data.scenes && data.scenes.length > 0 
          ? data.scenes.map(s => s.visualPrompt) 
          : [data.visualPrompt];

      // We process them one by one
      for (let i = 0; i < prompts.length; i++) {
          if (i > 0) {
            // Add a short delay between requests to be gentle on the API
            await delay(500);
          }
          
          try {
              const imgUrl = await generateWordImage(prompts[i]);
              setState(prev => {
                  const updatedUrls = [...prev.imageUrls];
                  updatedUrls[i] = imgUrl;
                  return { ...prev, imageUrls: updatedUrls };
              });
          } catch (e: any) {
              console.error(`Image ${i} generation failed`, e);
              const errorMsg = formatError(e);
              setState(prev => {
                  const updatedErrors = [...prev.imageErrors];
                  updatedErrors[i] = errorMsg;
                  return { ...prev, imageErrors: updatedErrors };
              });
          }
      }

      setState((prev) => ({
        ...prev,
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
    <div className="min-h-screen pb-20 bg-[#f3f4f6] dark:bg-gray-900 transition-colors duration-300">
      {/* Header / Background Decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-[300px] -left-[200px] w-[600px] h-[600px] bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50"></div>
         <div className="absolute top-[100px] -right-[200px] w-[500px] h-[500px] bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 transition-colors duration-300">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="font-bold text-xl tracking-tight text-gray-800 dark:text-gray-100">
                  Nicole<span className="text-primary dark:text-indigo-400">单词通</span>
              </div>
              <div className="flex items-center gap-3">
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Toggle Dark Mode"
                  >
                    {theme === 'light' ? (
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                       </svg>
                    ) : (
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                       </svg>
                    )}
                  </button>
                  <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                      <button 
                        onClick={() => setViewMode('LEARN')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'LEARN' ? 'bg-white dark:bg-gray-700 text-primary dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                      >
                        学习模式
                      </button>
                      <button 
                        onClick={() => setViewMode('REVIEW')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'REVIEW' ? 'bg-white dark:bg-gray-700 text-primary dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                      >
                        复习挑战
                      </button>
                  </div>
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
                    <div className="max-w-2xl mx-auto p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 text-center animate-fade-in">
                        出错了: {state.error}
                    </div>
                )}

                {state.data && (
                    <div className="max-w-4xl mx-auto animate-fade-in-up transition-all duration-500 ease-out">
                        {/* Main Word Card */}
                        <WordCard 
                            data={state.data} 
                            audioData={state.audioData} 
                            isFavorite={favorites.some(f => f.word.toLowerCase() === state.data!.word.toLowerCase())}
                            onToggleFavorite={() => handleToggleFavorite(state.data!)}
                        />
                        
                        {/* Etymology & Roots */}
                        <EtymologySection data={state.data} />

                        {/* Similar Words (Split into Synonyms and Antonyms) */}
                        <SimilarWordsSection 
                            synonyms={state.data.synonyms} 
                            antonyms={state.data.antonyms} 
                            onWordClick={handleSearch} 
                        />

                        {/* Story & Image */}
                        <StoryCard 
                            story={state.data.story}
                            scenes={state.data.scenes}
                            imageUrls={state.imageUrls} 
                            imageErrors={state.imageErrors}
                            isLoading={state.status === LoadingState.GENERATING_MEDIA}
                            targetWord={state.data.word}
                            onRegenerateImage={handleRegenerateImage}
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