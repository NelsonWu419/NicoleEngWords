export interface RootInfo {
  root: string;
  meaning: string;
  examples: string[];
}

export interface WordAnalysis {
  word: string;
  definition: string;
  phonetic: string;
  etymology: string;
  pronunciationTips: string;
  roots: RootInfo[];
  synonyms: string[]; // Changed from similarWords
  antonyms: string[]; // New field
  story: string;
  mnemonicChant: string; // Rhythmic text for audio generation
  visualPrompt: string; // Prompt for image generation
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
  imageUrl: string | null;
  audioData: Uint8Array | null; // Raw PCM data
  error: string | null;
}

export interface QuizResult {
  date: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
}