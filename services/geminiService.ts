import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WordAnalysis } from "../types";
import { base64ToUint8Array } from "./audioUtils";

// Initialize the client
// NOTE: We assume process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes the word to get structured data (Etymology, Story, etc.)
 */
export const analyzeWord = async (word: string): Promise<WordAnalysis> => {
  const prompt = `
    Role: You are an expert English teacher for a Chinese middle school student named Nicole (Wu Deyi).
    Task: Analyze the English word: "${word}" specifically for Nicole.

    Provide the following details in a JSON format designed for a Chinese learner:
    1. Definition: The Chinese translation and part of speech (e.g., "n. 苹果").
    2. Phonetic: The IPA phonetic symbol.
    3. Etymology: Explain the word's origin and evolution in simple, engaging Chinese suitable for a middle schooler.
    4. PronunciationTips: Analyze pronunciation in Chinese. 1. Stress: Explicitly point out the stressed syllable (e.g. "重音在第一个音节"). 2. Common Errors: Warn about specific sounds Chinese speakers often mispronounce (e.g., "注意 'v' 不要读成 'w'").
    5. Roots: Identify root words/prefixes/suffixes. Provide the 'meaning' in Chinese.
    6. SimilarWords: Synonyms or words with similar roots (in English).
    7. Story: A creative short story (approx 60-80 words) in Simple English suitable for Nicole. 
       CRITICAL REQUIREMENT: The story MUST feature characters from "The Legend of Luo Xiaohei" (罗小黑战记) such as Xiaohei (小黑), Wuxian (无限), or Fengxi (风息). 
       Example: "Xiaohei was running through the forest..." 
       The story should illustrate the meaning of the word "${word}" clearly in the context of an adventure or daily life in the spirit world. Keep the tone healing and cute.
    8. MnemonicChant: A rhythmic English poem or chant (2-4 lines) that rhymes and helps remember the meaning.
    9. VisualPrompt: A detailed visual image prompt (in English) describing a scene from the story. 
       Style requirement: "2D anime style, flat colors, clean lines, cute, healing style, similar to The Legend of Luo Xiaohei art style".
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
          similarWords: { type: Type.ARRAY, items: { type: Type.STRING } },
          story: { type: Type.STRING },
          mnemonicChant: { type: Type.STRING },
          visualPrompt: { type: Type.STRING },
        },
        required: ["word", "definition", "etymology", "roots", "story", "visualPrompt", "mnemonicChant"],
      },
    },
  });

  let text = response.text;
  if (!text) throw new Error("No analysis returned");

  // Robustness fix: Remove markdown code blocks if present (Gemini sometimes adds them despite schema)
  if (text.startsWith('```')) {
    text = text.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  return JSON.parse(text) as WordAnalysis;
};

/**
 * Generates an image based on the prompt.
 */
export const generateWordImage = async (imagePrompt: string): Promise<string | null> => {
  try {
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
  } catch (e) {
    console.error("Image generation failed", e);
    return null;
  }
};

/**
 * Generates spoken audio (TTS) for the mnemonic chant.
 */
export const generateAudio = async (textToSpeak: string): Promise<Uint8Array | null> => {
  try {
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
  } catch (e) {
    console.error("Audio generation failed", e);
    return null;
  }
};
