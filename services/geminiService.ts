
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WordAnalysis, AIConfig } from "../types";
import { base64ToUint8Array } from "./audioUtils";

// Declare process to satisfy TypeScript for the build-time replacement
declare const process: any;

// Lazy initialization of the AI client to prevent crash on load if API key is missing/invalid
let geminiClient: GoogleGenAI | null = null;

const getGeminiClient = (apiKey?: string) => {
  const key = apiKey || process.env.API_KEY;
  if (!key) {
      // Return null or throw depending on usage context, but mostly we need a key.
      return null;
  }
  // If client exists and key matches (simple check), return it. 
  // For simplicity, we create new if key provided to support config switching.
  if (apiKey || !geminiClient) {
      geminiClient = new GoogleGenAI({ apiKey: key });
  }
  return geminiClient;
};

/**
 * Helper function to retry operations with exponential backoff.
 */
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) throw error;
    
    // Check for rate limit 429
    const isRateLimit = error?.toString().includes('429');
    const waitTime = isRateLimit ? 4000 : delay; // Wait longer for rate limits

    console.warn(`Operation failed, retrying... (${retries} attempts left). Error:`, error);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    return retryOperation(operation, retries - 1, delay * 2);
  }
}

/**
 * Analysis Prompt Template (Shared)
 */
const generateAnalysisPrompt = (word: string) => `
  Role: You are an expert English teacher for a Chinese middle school student named Nicole (Wu Deyi).
  Task: Analyze the English word: "${word}" specifically for Nicole.

  Provide the following details in a STRICT JSON format designed for a Chinese learner:
  1. Definition: The Chinese translation and part of speech (e.g., "n. 苹果").
  2. Difficulty: Assess the word difficulty for a middle school student. Choose exactly one: "Beginner", "Intermediate", or "Advanced".
  3. Phonetic: The IPA phonetic symbol.
  4. Etymology: Explain the word's origin and evolution in simple, engaging Chinese suitable for a middle schooler.
  5. PronunciationTips: Analyze pronunciation in Chinese. 1. Stress: Explicitly point out the stressed syllable (e.g. "重音在第一个音节"). 2. Common Errors: Warn about specific sounds Chinese speakers often mispronounce (e.g., "注意 'v' 不要读成 'w'").
  6. Roots: Identify root words/prefixes/suffixes. Provide the 'meaning' in Chinese.
  7. Synonyms: List 3-5 synonyms (English words).
  8. Antonyms: List 3-5 antonyms (English words).
  9. TextbookInfo: Check if this word appears in the "People's Education Press" (PEP/人教版) Junior High School English textbooks (Go for it!). 
      - If yes, provide the 'grade' (e.g., "八年级下册"), 'unit' (approximate unit), and 'examPoints' (2-3 key phrases or grammar points often tested in the Zhongkao/High School Entrance Exam).
      - If the word is too advanced or not in the syllabus, strictly return null.
  10. Story: A creative short story (approx 60-80 words total) in Simple English suitable for Nicole. 
      CRITICAL REQUIREMENT: The story MUST feature characters from "The Legend of Luo Xiaohei" (罗小黑战记) such as Xiaohei (小黑), Wuxian (无限), or Fengxi (风息). 
      The story should illustrate the meaning of the word "${word}" clearly. Keep the tone healing and cute.
  11. Scenes: Divide the story above into 3 to 5 distinct chronological scenes for a picture book. For each scene, provide:
      - narrative: The English text for this specific part of the story.
      - visualPrompt: A detailed visual image prompt (in English) describing this specific scene. Style: "2D anime style, flat colors, clean lines, cute, healing style, The Legend of Luo Xiaohei style".
  12. MnemonicChant: A rhythmic English poem or chant (2-4 lines) that rhymes and helps remember the meaning.
  13. VisualPrompt: (Legacy field) Use the visual prompt from the first scene here.

  IMPORTANT: Return ONLY valid JSON. Do not use Markdown code blocks.
`;

/**
 * Parse JSON response helper
 */
const parseJSONResponse = (text: string): WordAnalysis => {
  if (!text) throw new Error("No analysis returned");
  
  let cleanText = text;
  // Regex to extract JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
      cleanText = jsonMatch[0];
  } else {
    // Fallback cleanup
    cleanText = text.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  return JSON.parse(cleanText) as WordAnalysis;
};

/**
 * Analyze word using Qwen (via OpenAI Compatible API)
 */
const analyzeWithQwen = async (word: string, config: AIConfig): Promise<WordAnalysis> => {
    const prompt = generateAnalysisPrompt(word);
    
    const response = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            model: config.model, // e.g., 'qwen-plus'
            messages: [
                { role: "system", content: "You are a helpful assistant that outputs JSON." },
                { role: "user", content: prompt }
            ],
            // force json mode if supported, but prompt engineering usually works
            response_format: { type: "json_object" } 
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Qwen API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return parseJSONResponse(content);
};

/**
 * Analyze word using Gemini
 */
const analyzeWithGemini = async (word: string, config?: AIConfig): Promise<WordAnalysis> => {
    const apiKey = config?.apiKey || process.env.API_KEY;
    if (!apiKey) throw new Error("Google API Key not configured");

    const client = getGeminiClient(apiKey);
    if (!client) throw new Error("Failed to initialize Gemini Client");

    const prompt = generateAnalysisPrompt(word);

    const response = await client.models.generateContent({
      model: config?.model || "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            definition: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            etymology: { type: Type.STRING },
            pronunciationTips: { type: Type.STRING },
            roots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  root: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  examples: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
              },
            },
            synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
            antonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
            textbookInfo: {
              type: Type.OBJECT,
              properties: {
                grade: { type: Type.STRING },
                unit: { type: Type.STRING },
                examPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              nullable: true, 
            },
            story: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  narrative: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING },
                }
              }
            },
            mnemonicChant: { type: Type.STRING },
            visualPrompt: { type: Type.STRING },
          },
          required: ["word", "definition", "difficulty", "etymology", "roots", "story", "scenes", "visualPrompt", "mnemonicChant", "synonyms", "antonyms"],
        },
      },
    });

    const text = response.text;
    return parseJSONResponse(text);
};


/**
 * Analyzes the word to get structured data (Etymology, Story, etc.)
 * Dispatches to correct provider based on config.
 */
export const analyzeWord = async (word: string, config?: AIConfig): Promise<WordAnalysis> => {
  return retryOperation(async () => {
    if (config?.provider === 'QWEN') {
        return analyzeWithQwen(word, config);
    } else {
        return analyzeWithGemini(word, config);
    }
  });
};

/**
 * Generates an image based on the prompt.
 * Currently only supported for Gemini. Qwen mode returns null (skips).
 */
export const generateWordImage = async (imagePrompt: string, config?: AIConfig): Promise<string | null> => {
  if (config?.provider === 'QWEN') {
      console.warn("Image generation is currently disabled for Qwen mode to ensure stability.");
      return null;
  }

  try {
    return await retryOperation(async () => {
      // Use config API key if available, otherwise env
      const apiKey = config?.apiKey || process.env.API_KEY;
      const client = getGeminiClient(apiKey);
      if (!client) return null;

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash-image", // Nano Banana
        contents: {
          parts: [{ text: imagePrompt }],
        },
        config: {
          imageConfig: {
              aspectRatio: "4:3",
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    });
  } catch (e) {
    console.error("Image generation failed:", e);
    // Rethrow to allow UI to handle error display
    throw e;
  }
};

/**
 * Generates spoken audio (TTS).
 * Currently only supported for Gemini.
 */
export const generateAudio = async (textToSpeak: string, config?: AIConfig): Promise<Uint8Array | null> => {
  if (config?.provider === 'QWEN') {
      return null;
  }

  try {
    return await retryOperation(async () => {
      const apiKey = config?.apiKey || process.env.API_KEY;
      const client = getGeminiClient(apiKey);
      if (!client) return null;

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: textToSpeak }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return base64ToUint8Array(base64Audio);
      }
      return null;
    });
  } catch (e) {
    console.error("Audio generation failed:", e);
    return null;
  }
};
