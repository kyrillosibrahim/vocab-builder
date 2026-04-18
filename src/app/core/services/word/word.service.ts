import { Injectable, inject, signal, computed } from '@angular/core';
import { AI_PROVIDER } from '../ai/ai-provider.token';
import { StorageService } from '../storage/storage.service';
import { Word, WordFormData, WordFilter } from '../../models/word.model';

@Injectable({ providedIn: 'root' })
export class WordService {
  private readonly aiProvider = inject(AI_PROVIDER);
  private readonly storage = inject(StorageService);

  // Reactive state
  readonly words = signal<Word[]>([]);
  readonly isLoading = signal(false);
  readonly loadingMessage = signal('');
  readonly error = signal<string | null>(null);
  readonly wordCount = computed(() => this.words().length);
  readonly favoriteCount = computed(() => this.words().filter(w => w.isFavorite).length);

  async loadAllWords(): Promise<void> {
    try {
      const words = await this.storage.getAllWords();
      this.words.set(words);
    } catch (err: any) {
      this.error.set('Failed to load words: ' + err.message);
    }
  }

  async addWord(formData: WordFormData): Promise<Word> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const normalizedWord = formData.englishWord.trim().toLowerCase();

      // Check for duplicates
      const exists = await this.storage.wordExists(normalizedWord);
      if (exists) {
        throw new Error(`"${formData.englishWord}" already exists in your vocabulary.`);
      }

      // Step 1: Generate word data from AI
      this.loadingMessage.set('Generating definitions and translations...');
      const aiData = await this.aiProvider.generateWordData(normalizedWord);

      // Step 2: Generate image from AI
      this.loadingMessage.set('Creating vocabulary image...');
      const imageResponse = await this.aiProvider.generateImage(normalizedWord, aiData.englishDefinition);

      // Step 3: Store image blob
      const wordId = crypto.randomUUID();
      const now = new Date().toISOString();
      const imageId = crypto.randomUUID();

      await this.storage.saveBlob({
        id: imageId,
        data: imageResponse.imageBlob,
        mimeType: imageResponse.mimeType,
        wordId,
        type: 'image',
        createdAt: now,
      });

      // Step 4: Create and store word
      const word: Word = {
        id: wordId,
        englishWord: normalizedWord,
        arabicTranslation: aiData.arabicTranslation,
        englishDefinition: aiData.englishDefinition,
        arabicDefinition: aiData.arabicDefinition,
        exampleSentences: aiData.exampleSentences,
        pronunciationText: aiData.pronunciationText,
        imageId,
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      };

      await this.storage.addWord(word);

      // Step 5: Update reactive state
      this.words.update(current => [word, ...current]);
      this.loadingMessage.set('');

      return word;
    } catch (err: any) {
      this.error.set(err.message || 'Failed to add word');
      throw err;
    } finally {
      this.isLoading.set(false);
      this.loadingMessage.set('');
    }
  }

  async deleteWord(id: string): Promise<void> {
    try {
      await this.storage.deleteWord(id);
      this.words.update(current => current.filter(w => w.id !== id));
    } catch (err: any) {
      this.error.set('Failed to delete word: ' + err.message);
    }
  }

  async toggleFavorite(id: string): Promise<void> {
    try {
      const updated = await this.storage.toggleFavorite(id);
      if (updated) {
        this.words.update(current =>
          current.map(w => w.id === id ? { ...w, isFavorite: updated.isFavorite } : w)
        );
      }
    } catch (err: any) {
      this.error.set('Failed to update favorite: ' + err.message);
    }
  }

  async updateWord(word: Word): Promise<void> {
    try {
      await this.storage.updateWord(word);
      this.words.update(current =>
        current.map(w => w.id === word.id ? { ...word, updatedAt: new Date().toISOString() } : w)
      );
    } catch (err: any) {
      this.error.set('Failed to update word: ' + err.message);
    }
  }

  async searchWords(filter: WordFilter): Promise<Word[]> {
    return this.storage.getFilteredWords(filter);
  }

  async getImageUrl(imageId: string | null): Promise<string | null> {
    if (!imageId) return null;
    return this.storage.getBlobUrl(imageId);
  }

  revokeImageUrl(url: string): void {
    this.storage.revokeObjectUrl(url);
  }

  clearError(): void {
    this.error.set(null);
  }
}
