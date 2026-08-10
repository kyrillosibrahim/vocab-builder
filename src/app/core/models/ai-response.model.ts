import { ExampleSentence } from './word.model';

export interface AIWordResponse {
  arabicTranslation: string;
  englishDefinition: string;
  arabicDefinition: string;
  exampleSentences: ExampleSentence[];
  pronunciationText: string;
}

export interface AIProvider {
  readonly providerName: string;
  generateWordData(word: string): Promise<AIWordResponse>;
}

export interface TTSProvider {
  readonly providerName: string;
  speakDirect(text: string, lang: 'en' | 'ar'): void;
  stop(): void;
  isAvailable(): boolean;
}
