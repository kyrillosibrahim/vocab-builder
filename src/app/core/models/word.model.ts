export interface ExampleSentence {
  english: string;
  arabic: string;
}

export interface Word {
  id: string;
  englishWord: string;
  arabicTranslation: string;
  englishDefinition: string;
  arabicDefinition: string;
  exampleSentences: ExampleSentence[];
  pronunciationText: string;
  imageId: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WordFormData {
  englishWord: string;
}

export interface WordFilter {
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  favoritesOnly?: boolean;
  sortBy?: 'createdAt' | 'englishWord' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
