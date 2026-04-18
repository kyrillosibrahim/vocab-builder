import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { WordService } from '../../core/services/word/word.service';
import { WordFilter } from '../../core/models/word.model';
import { Word } from '../../core/models/word.model';
import { WordCardComponent } from '../../shared/components/word-card/word-card.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-view-words',
  imports: [WordCardComponent, SearchBarComponent, EmptyStateComponent, SkeletonLoaderComponent],
  templateUrl: './view-words.component.html',
  styleUrl: './view-words.component.scss',
})
export class ViewWordsComponent implements OnInit {
  readonly wordService = inject(WordService);

  filteredWords = signal<Word[]>([]);
  isFiltering = signal(false);
  hasActiveFilter = signal(false);
  isInitialLoad = signal(true);
  sidebarOpen = signal(false);

  totalWords = computed(() => this.wordService.wordCount());
  favoriteCount = computed(() => this.wordService.favoriteCount());
  thisWeekCount = computed(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return this.wordService.words().filter(w => new Date(w.createdAt) >= weekAgo).length;
  });

  async ngOnInit(): Promise<void> {
    await this.wordService.loadAllWords();
    this.filteredWords.set(this.wordService.words());
    this.isInitialLoad.set(false);
  }

  async onFilterChanged(filter: WordFilter): Promise<void> {
    this.isFiltering.set(true);
    this.hasActiveFilter.set(!!(filter.searchTerm || filter.favoritesOnly || filter.dateFrom));

    try {
      const results = await this.wordService.searchWords(filter);
      this.filteredWords.set(results);
    } finally {
      this.isFiltering.set(false);
    }
  }

  async onDeleteWord(id: string): Promise<void> {
    await this.wordService.deleteWord(id);
    this.filteredWords.update(words => words.filter(w => w.id !== id));
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  scrollToWord(id: string): void {
    this.sidebarOpen.set(false);
    const el = document.getElementById('word-' + id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-card');
      setTimeout(() => el.classList.remove('highlight-card'), 1500);
    }
  }

  async onFavoriteToggle(id: string): Promise<void> {
    await this.wordService.toggleFavorite(id);
    this.filteredWords.update(words =>
      words.map(w => w.id === id ? { ...w, isFavorite: !w.isFavorite } : w)
    );
  }
}
