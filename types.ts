
export interface RootInfo {
  root: string;
  meaning: string;
  examples: string[];
}

export interface StoryScene {
  narrative: string;
  visualPrompt: string;
}

export interface TextbookInfo {
  grade: string; // e.g., "八年级下册"
  unit: string;  // e.g., "Unit 5 What were you doing when the rainstorm came?"
  examPoints: string[]; // Key phrases or grammar points for exams
}

export interface WordAnalysis {
  word: string;
  definition: string;
  difficulty: string; // 'Beginner' | 'Intermediate' | 'Advanced'
  phonetic: string;
  etymology: string;
  pronunciationTips: string;
  roots: RootInfo[];
  synonyms: string[]; 
  antonyms: string[]; 
  story: string; // Keep as full concatenated text for backward compatibility
  scenes?: StoryScene[]; // New field for multi-scene stories
  mnemonicChant: string; 
  visualPrompt: string; // Fallback/Main prompt
  textbookInfo?: TextbookInfo; // New field for PEP curriculum info
}

export enum LoadingState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_MEDIA = 'GENERATING_MEDIA',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface AppState {
  status: LoadingState;
  data: WordAnalysis | null;
  imageUrls: (string | null)[]; // Changed from single imageUrl to array
  audioData: Uint8Array | null; 
  error: string | null;
}

export interface QuizResult {
  date: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
}
