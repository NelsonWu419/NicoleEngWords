
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WordAnalysis } from "../types";
import { base64ToUint8Array } from "./audioUtils";

// Declare process to satisfy TypeScript for the build-time replacement
declare const process: any;

// Initialize the client
// NOTE: We assume process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper function to retry operations with exponential backoff.
 * This helps handle transient network errors (like RPC/XHR failures).
 */
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.warn(`Operation failed, retrying... (${retries} attempts left). Error:`, error);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retryOperation(operation, retries - 1, delay * 2);
  }
}

/**
 * Analyzes the word to get structured data (Etymology, Story, etc.)
 */
export const analyzeWord = async (word: string): Promise<WordAnalysis> => {
  return retryOperation(async () => {
    const prompt = `
      Role: You are an expert English teacher for a Chinese middle school student named Nicole (Wu Deyi).
      Task: Analyze the English word: "${word}" specifically for Nicole.

      Provide the following details in a JSON format designed for a Chinese learner:
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
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

    let text = response.text;
    if (!text) throw new Error("No analysis returned");

    // Robustness fix: Remove markdown code blocks if present (Gemini sometimes adds them despite schema)
    // Also try to extract JSON using regex if simple stripping fails
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        text = jsonMatch[0];
    } else if (text.startsWith('```')) {
      text = text.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    return JSON.parse(text) as WordAnalysis;
  });
};

/**
 * Generates an image based on the prompt.
 */
export const generateWordImage = async (imagePrompt: string): Promise<string | null> => {
  try {
    return await retryOperation(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
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
    console.error("Image generation failed after retries", e);
    return null;
  }
};

/**
 * Generates spoken audio (TTS) for the mnemonic chant.
 */
export const generateAudio = async (textToSpeak: string): Promise<Uint8Array | null> => {
  try {
    return await retryOperation(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: textToSpeak }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' }, // 'Puck' is often good for storytelling
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
    console.error("Audio generation failed after retries", e);
    return null;
  }
};