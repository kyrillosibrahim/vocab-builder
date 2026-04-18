import { environment } from '../../../environments/environment';

export const AI_CONSTANTS = {
  GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
  GEMINI_API_KEY: environment.geminiApiKey,
  GEMINI_TEXT_MODEL: 'gemini-2.5-flash',
  GEMINI_IMAGE_MODEL: 'gemini-2.5-flash-image',
} as const;

export const AI_PROMPTS = {
  WORD_DATA: (word: string) => `You are a vocabulary teaching assistant. For the English word "${word}", provide the following in JSON format:
{
  "arabicTranslation": "the Arabic translation of the word",
  "englishDefinition": "clear English definition in 1-2 sentences",
  "arabicDefinition": "Arabic definition in 1-2 sentences",
  "exampleSentences": [
    { "english": "example sentence 1 using the word in context", "arabic": "Arabic translation of sentence 1" },
    { "english": "example sentence 2 using the word in context", "arabic": "Arabic translation of sentence 2" }
  ],
  "pronunciationText": "IPA or phonetic pronunciation like /pruh-NUN-see-AY-shun/"
}
Return ONLY valid JSON. No markdown fences, no extra text.`,

  IMAGE: (word: string, definition: string) =>
    `Generate a simple, clean illustration for the English word "${word}" (meaning: ${definition}). Flat design style, minimal, colorful, suitable as a vocabulary flashcard image. No text in the image.`,
} as const;
