import { ExampleSentence } from './word.model';

export interface AIWordResponse {
  arabicTranslation: string;
  englishDefinition: string;
  arabicDefinition: string;
  exampleSentences: ExampleSentence[];
  pronunciationText: string;
}

export interface AIImageResponse {
  imageBlob: Blob;
  mimeType: string;
}

export interface AIProvider {
  readonly providerName: string;
  generateWordData(word: string): Promise<AIWordResponse>;
  generateImage(word: string, definition: string): Promise<AIImageResponse>;
}

export interface TTSProvider {
  readonly providerName: string;
  speakDirect(text: string, lang: 'en' | 'ar'): void;
  stop(): void;
  isAvailable(): boolean;
}
