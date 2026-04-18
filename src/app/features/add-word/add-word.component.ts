import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WordService } from '../../core/services/word/word.service';
import { Word } from '../../core/models/word.model';
import { WordCardComponent } from '../../shared/components/word-card/word-card.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-add-word',
  imports: [FormsModule, WordCardComponent, SkeletonLoaderComponent],
  templateUrl: './add-word.component.html',
  styleUrl: './add-word.component.scss',
})
export class AddWordComponent {
  readonly wordService = inject(WordService);

  wordInput = '';
  lastAddedWord = signal<Word | null>(null);
  successMessage = signal('');

  async onSubmit(): Promise<void> {
    const word = this.wordInput.trim();
    if (!word) return;

    this.lastAddedWord.set(null);
    this.successMessage.set('');
    this.wordService.clearError();

    try {
      const addedWord = await this.wordService.addWord({ englishWord: word });
      this.lastAddedWord.set(addedWord);
      this.successMessage.set(`"${addedWord.englishWord}" has been added to your vocabulary!`);
      this.wordInput = '';

      // Auto-clear success after 5s
      setTimeout(() => this.successMessage.set(''), 5000);
    } catch {
      // Error is already set in wordService.error signal
    }
  }

  onDeletePreview(id: string): void {
    this.wordService.deleteWord(id);
    this.lastAddedWord.set(null);
  }

  onFavoriteToggle(id: string): void {
    this.wordService.toggleFavorite(id);
    const current = this.lastAddedWord();
    if (current && current.id === id) {
      this.lastAddedWord.set({ ...current, isFavorite: !current.isFavorite });
    }
  }
}
