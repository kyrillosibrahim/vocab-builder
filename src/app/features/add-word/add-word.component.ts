import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { WordService } from '../../core/services/word/word.service';
import { WordSuggestionService } from '../../core/services/suggestions/word-suggestion.service';
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
  private readonly suggestionService = inject(WordSuggestionService);
  private readonly inputChanges = new Subject<string>();

  wordInput = '';
  lastAddedWord = signal<Word | null>(null);
  successMessage = signal('');
  suggestions = signal<string[]>([]);
  showSuggestions = signal(false);
  activeIndex = signal(-1);

  constructor() {
    this.inputChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(query => this.suggestionService.suggest(query)),
      takeUntilDestroyed(),
    ).subscribe(suggestions => this.suggestions.set(suggestions));

    // Needed so already-saved suggestions can be badged on a direct visit
    if (this.wordService.words().length === 0) void this.wordService.loadAllWords();
  }

  onInputChange(value: string): void {
    this.wordInput = value;
    const query = value.trim();
    this.inputChanges.next(query);
    this.activeIndex.set(-1);
    this.showSuggestions.set(query.length >= 2);
    if (query.length < 2) this.suggestions.set([]);
  }

  selectSuggestion(word: string): void {
    this.wordInput = word;
    this.showSuggestions.set(false);
    this.suggestions.set([]);
    this.onSubmit();
  }

  onKeydown(event: KeyboardEvent): void {
    const suggestions = this.suggestions();

    if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault();
      this.activeIndex.update(index => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault();
      this.activeIndex.update(index => index <= 0 ? suggestions.length - 1 : index - 1);
    } else if (event.key === 'Enter' && this.showSuggestions() && this.activeIndex() > -1) {
      event.preventDefault();
      this.selectSuggestion(suggestions[this.activeIndex()]);
    } else if (event.key === 'Escape') {
      this.showSuggestions.set(false);
      this.activeIndex.set(-1);
    }
  }

  hideSuggestions(): void {
    setTimeout(() => {
      this.showSuggestions.set(false);
      this.activeIndex.set(-1);
    }, 150);
  }

  isAlreadySaved(word: string): boolean {
    return this.wordService.words().some(
      savedWord => savedWord.englishWord.toLowerCase() === word.toLowerCase(),
    );
  }

  async onSubmit(): Promise<void> {
    this.showSuggestions.set(false);
    this.suggestions.set([]);
    this.activeIndex.set(-1);
    // Resets distinctUntilChanged so retyping the same query still fetches
    this.inputChanges.next('');

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
