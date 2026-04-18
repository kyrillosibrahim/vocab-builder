import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import { Word, WordFilter } from '../../models/word.model';
import { BlobRecord } from '../../models/storage.model';
import { DB_CONSTANTS } from '../../constants/app.constants';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private dbPromise: Promise<IDBPDatabase>;
  private objectUrls = new Set<string>();

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBPDatabase> {
    return openDB(DB_CONSTANTS.DB_NAME, DB_CONSTANTS.DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(DB_CONSTANTS.WORDS_STORE)) {
          const wordStore = db.createObjectStore(DB_CONSTANTS.WORDS_STORE, { keyPath: 'id' });
          wordStore.createIndex('by-date', 'createdAt');
          wordStore.createIndex('by-word', 'englishWord');
          wordStore.createIndex('by-favorite', 'isFavorite');
        }
        if (!db.objectStoreNames.contains(DB_CONSTANTS.BLOBS_STORE)) {
          const blobStore = db.createObjectStore(DB_CONSTANTS.BLOBS_STORE, { keyPath: 'id' });
          blobStore.createIndex('by-word-id', 'wordId');
        }
      },
    });
  }

  // --- WORD OPERATIONS ---

  async addWord(word: Word): Promise<void> {
    const db = await this.dbPromise;
    await db.put(DB_CONSTANTS.WORDS_STORE, word);
  }

  async getWord(id: string): Promise<Word | undefined> {
    const db = await this.dbPromise;
    return db.get(DB_CONSTANTS.WORDS_STORE, id);
  }

  async getAllWords(): Promise<Word[]> {
    const db = await this.dbPromise;
    const words = await db.getAll(DB_CONSTANTS.WORDS_STORE);
    return words.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateWord(word: Word): Promise<void> {
    const db = await this.dbPromise;
    await db.put(DB_CONSTANTS.WORDS_STORE, { ...word, updatedAt: new Date().toISOString() });
  }

  async deleteWord(id: string): Promise<void> {
    const db = await this.dbPromise;
    await this.deleteBlobsForWord(id);
    await db.delete(DB_CONSTANTS.WORDS_STORE, id);
  }

  async toggleFavorite(id: string): Promise<Word | undefined> {
    const db = await this.dbPromise;
    const word = await db.get(DB_CONSTANTS.WORDS_STORE, id);
    if (word) {
      word.isFavorite = !word.isFavorite;
      word.updatedAt = new Date().toISOString();
      await db.put(DB_CONSTANTS.WORDS_STORE, word);
    }
    return word;
  }

  async getFilteredWords(filter: WordFilter): Promise<Word[]> {
    let words = await this.getAllWords();

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      words = words.filter(w =>
        w.englishWord.toLowerCase().includes(term) ||
        w.arabicTranslation.includes(term) ||
        w.englishDefinition.toLowerCase().includes(term)
      );
    }

    if (filter.favoritesOnly) {
      words = words.filter(w => w.isFavorite);
    }

    if (filter.dateFrom) {
      const from = new Date(filter.dateFrom).getTime();
      words = words.filter(w => new Date(w.createdAt).getTime() >= from);
    }

    if (filter.dateTo) {
      const to = new Date(filter.dateTo).getTime() + 86400000; // include full day
      words = words.filter(w => new Date(w.createdAt).getTime() <= to);
    }

    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder || 'desc';
    words.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'englishWord') {
        comparison = a.englishWord.localeCompare(b.englishWord);
      } else {
        comparison = new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime();
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return words;
  }

  async getWordCount(): Promise<number> {
    const db = await this.dbPromise;
    return db.count(DB_CONSTANTS.WORDS_STORE);
  }

  async wordExists(englishWord: string): Promise<boolean> {
    const db = await this.dbPromise;
    const existing = await db.getFromIndex(DB_CONSTANTS.WORDS_STORE, 'by-word', englishWord.toLowerCase().trim());
    return !!existing;
  }

  // --- BLOB OPERATIONS ---

  async saveBlob(record: BlobRecord): Promise<string> {
    const db = await this.dbPromise;
    await db.put(DB_CONSTANTS.BLOBS_STORE, record);
    return record.id;
  }

  async getBlob(id: string): Promise<BlobRecord | undefined> {
    const db = await this.dbPromise;
    return db.get(DB_CONSTANTS.BLOBS_STORE, id);
  }

  async getBlobUrl(id: string): Promise<string | null> {
    const record = await this.getBlob(id);
    if (!record) return null;
    const url = URL.createObjectURL(record.data);
    this.objectUrls.add(url);
    return url;
  }

  async deleteBlobsForWord(wordId: string): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(DB_CONSTANTS.BLOBS_STORE, 'readwrite');
    const index = tx.store.index('by-word-id');
    let cursor = await index.openCursor(wordId);
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  }

  revokeObjectUrl(url: string): void {
    if (this.objectUrls.has(url)) {
      URL.revokeObjectURL(url);
      this.objectUrls.delete(url);
    }
  }

  revokeAllObjectUrls(): void {
    this.objectUrls.forEach(url => URL.revokeObjectURL(url));
    this.objectUrls.clear();
  }
}
