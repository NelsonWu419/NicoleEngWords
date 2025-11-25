import React, { useState, useEffect } from 'react';
import { WordAnalysis, QuizResult } from '../types';

interface ReviewModeProps {
  history: WordAnalysis[];
  onSaveResult: (result: QuizResult) => void;
  lastResult: QuizResult | null;
}

interface Question {
  id: number;
  type: 'DEFINITION' | 'STORY';
  questionText: string;
  correctAnswer: string; // The word
  options: string[]; // Array of 4 words
  context?: string; // Extra info like the full definition or story context
}

export const ReviewMode: React.FC<ReviewModeProps> = ({ history, onSaveResult, lastResult }) => {
  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'SUMMARY'>('INTRO');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongWords, setWrongWords] = useState<WordAnalysis[]>([]);

  // Generate Quiz
  const startQuiz = () => {
    if (history.length < 4) return;

    const shuffledHistory = [...history].sort(() => 0.5 - Math.random());
    const selectedWords = shuffledHistory.slice(0, Math.min(10, history.length));

    const newQuestions: Question[] = selectedWords.map((targetWord, index) => {
      // Pick 3 distractors
      const distractors = history
        .filter(w => w.word !== targetWord.word)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.word);
      
      const options = [targetWord.word, ...distractors].sort(() => 0.5 - Math.random());
      
      // Randomly decide question type
      const type = Math.random() > 0.5 ? 'DEFINITION' : 'STORY';
      
      let questionText = '';
      let context = '';

      if (type === 'DEFINITION') {
        questionText = `Which word means: "${targetWord.definition}"?`;
        context = targetWord.definition;
      } else {
        // Create a blank in the story
        // Simple regex to replace the word (case insensitive) with blanks
        const regex = new RegExp(targetWord.word, 'gi');
        const blankedStory = targetWord.story.replace(regex, '_______');
        questionText = `Fill in the blank: "${blankedStory.substring(0, 150)}..."`;
        context = "From the story of " + targetWord.word;
      }

      return {
        id: index,
        type,
        questionText,
        correctAnswer: targetWord.word,
        options,
        context
      };
    });

    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setWrongWords([]);
    setSelectedOption(null);
    setIsCorrect(null);
    setGameState('PLAYING');
  };

  const handleAnswer = (option: string) => {
    if (selectedOption) return; // Prevent double click

    setSelectedOption(option);
    const currentQ = questions[currentIndex];
    const correct = option === currentQ.correctAnswer;
    
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
    } else {
      const wordData = history.find(w => w.word === currentQ.correctAnswer);
      if (wordData) {
        setWrongWords(prev => [...prev, wordData]);
      }
    }

    // Auto advance after short delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        finishQuiz(correct ? score + 1 : score);
      }
    }, 2000);
  };

  const finishQuiz = (finalScore: number) => {
    const result: QuizResult = {
      date: new Date().toISOString(),
      score: finalScore,
      totalQuestions: questions.length,
      correctCount: finalScore
    };
    onSaveResult(result);
    setGameState('SUMMARY');
  };

  if (history.length < 4) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="text-6xl mb-6">🌱</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">单词库还在成长中</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Nicole, 目前我们只有 {history.length} 个单词。
          <br />请至少学习 4 个单词后，才能开启复习挑战模式哦！
        </p>
      </div>
    );
  }

  if (gameState === 'INTRO') {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border-b-4 border-primary dark:border-indigo-600 max-w-md w-full text-center transition-colors">
          <div className="w-20 h-20 bg-primary/10 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            🏆
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">复习挑战</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            准备好测试你的记忆力了吗？<br/>
            我们将从你的 <span className="font-bold text-primary dark:text-indigo-400">{history.length}</span> 个单词中随机抽取题目。
          </p>

          {lastResult && (
             <div className="mb-8 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">上次成绩</p>
                <p className="text-xl font-bold text-gray-700 dark:text-gray-200">
                    {lastResult.correctCount} / {lastResult.totalQuestions} 
                    <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-2">
                        ({new Date(lastResult.date).toLocaleDateString()})
                    </span>
                </p>
             </div>
          )}

          <button
            onClick={startQuiz}
            className="w-full py-4 bg-primary dark:bg-indigo-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
          >
            开始挑战
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'SUMMARY') {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl max-w-lg w-full text-center relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>
          
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">挑战完成!</h2>
          
          <div className="relative inline-block mb-8">
             <svg className="w-32 h-32 text-gray-100 dark:text-gray-700" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={score / questions.length > 0.7 ? "#10B981" : "#F59E0B"} strokeWidth="4" strokeDasharray={`${(score / questions.length) * 100}, 100`} />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center flex-col">
                 <span className="text-4xl font-bold text-gray-800 dark:text-white">{score}</span>
                 <span className="text-xs text-gray-400">/ {questions.length}</span>
             </div>
          </div>

          {score === questions.length ? (
              <p className="text-lg text-green-600 dark:text-green-400 font-medium mb-6">太棒了！小黑为你点赞！🎉</p>
          ) : (
              <p className="text-lg text-gray-600 dark:text-gray-300 font-medium mb-6">继续加油，熟能生巧！💪</p>
          )}

          {wrongWords.length > 0 && (
            <div className="text-left bg-red-50 dark:bg-red-900/20 rounded-xl p-5 mb-8">
                <h3 className="font-bold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                    <span className="bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-100 text-xs px-2 py-1 rounded">需复习</span>
                </h3>
                <ul className="space-y-2">
                    {wrongWords.map((w, i) => (
                        <li key={i} className="flex justify-between text-sm">
                            <span className="font-bold text-gray-800 dark:text-gray-200">{w.word}</span>
                            <span className="text-gray-600 dark:text-gray-400 truncate ml-4">{w.definition}</span>
                        </li>
                    ))}
                </ul>
            </div>
          )}

          <button
            onClick={() => setGameState('INTRO')}
            className="px-8 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  // PLAYING STATE
  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-8">
        <div className="bg-primary dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 relative transition-colors">
         {/* Question Header */}
         <div className="bg-gray-50 dark:bg-gray-700/50 p-6 border-b border-gray-100 dark:border-gray-700">
             <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase">
                    Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full">
                    {currentQ.type === 'DEFINITION' ? '含义测试' : '故事填空'}
                </span>
             </div>
             <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 leading-relaxed">
                 {currentQ.questionText}
             </h3>
         </div>

         {/* Options */}
         <div className="p-6 grid gap-4">
             {currentQ.options.map((option, idx) => {
                 let btnClass = "bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-indigo-200 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30";
                 
                 // Reveal state
                 if (selectedOption) {
                     if (option === currentQ.correctAnswer) {
                         btnClass = "bg-green-100 dark:bg-green-900/40 border-green-500 dark:border-green-500 text-green-800 dark:text-green-200 font-bold"; // Correct
                     } else if (option === selectedOption && option !== currentQ.correctAnswer) {
                         btnClass = "bg-red-100 dark:bg-red-900/40 border-red-500 dark:border-red-500 text-red-800 dark:text-red-200 opacity-75"; // Wrong choice
                     } else {
                         btnClass = "bg-gray-50 dark:bg-gray-700/50 border-transparent text-gray-400 dark:text-gray-500 opacity-50"; // Others
                     }
                 }

                 return (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(option)}
                        disabled={selectedOption !== null}
                        className={`w-full p-4 rounded-xl text-left text-lg transition-all duration-200 flex justify-between items-center ${btnClass}`}
                    >
                        <span>{option}</span>
                        {selectedOption && option === currentQ.correctAnswer && (
                            <span className="text-xl">✅</span>
                        )}
                        {selectedOption && option === selectedOption && option !== currentQ.correctAnswer && (
                            <span className="text-xl">❌</span>
                        )}
                    </button>
                 );
             })}
         </div>
         
         {/* Context Tip / Feedback Area */}
         <div className={`h-16 px-6 flex items-center justify-center transition-opacity duration-300 ${selectedOption ? 'opacity-100' : 'opacity-0'}`}>
            {isCorrect ? (
                <span className="text-green-600 dark:text-green-400 font-bold text-lg animate-bounce">Good Job! 🎉</span>
            ) : (
                <span className="text-red-500 dark:text-red-400 font-medium">Correct answer: {currentQ.correctAnswer}</span>
            )}
         </div>
      </div>
    </div>
  );
};