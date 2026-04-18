import { Component, inject, input, output, signal, OnInit, OnDestroy } from '@angular/core';
import { Word } from '../../../core/models/word.model';
import { WordService } from '../../../core/services/word/word.service';
import { AudioPlayerComponent } from '../audio-player/audio-player.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-word-card',
  imports: [AudioPlayerComponent, ConfirmDialogComponent],
  templateUrl: './word-card.component.html',
  styleUrl: './word-card.component.scss',
})
export class WordCardComponent implements OnInit, OnDestroy {
  private readonly wordService = inject(WordService);

  word = input.required<Word>();
  compact = input(false);

  deleted = output<string>();
  favoriteToggled = output<string>();

  imageUrl = signal<string | null>(null);
  showDeleteDialog = signal(false);
  isExpanded = signal(false);

  async ngOnInit(): Promise<void> {
    const word = this.word();
    if (word.imageId) {
      const url = await this.wordService.getImageUrl(word.imageId);
      this.imageUrl.set(url);
    }
  }

  ngOnDestroy(): void {
    const url = this.imageUrl();
    if (url) {
      this.wordService.revokeImageUrl(url);
    }
  }

  toggleExpand(): void {
    this.isExpanded.update(v => !v);
  }

  onFavoriteToggle(): void {
    this.favoriteToggled.emit(this.word().id);
  }

  onDeleteClick(): void {
    this.showDeleteDialog.set(true);
  }

  onDeleteConfirm(): void {
    this.showDeleteDialog.set(false);
    this.deleted.emit(this.word().id);
  }

  onDeleteCancel(): void {
    this.showDeleteDialog.set(false);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
