import { Component, input, linkedSignal, output, signal } from '@angular/core';
import { Word } from '../../../core/models/word.model';
import { AudioPlayerComponent } from '../audio-player/audio-player.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-word-card',
  imports: [AudioPlayerComponent, ConfirmDialogComponent],
  templateUrl: './word-card.component.html',
  styleUrl: './word-card.component.scss',
})
export class WordCardComponent {
  word = input.required<Word>();
  startExpanded = input(false);

  deleted = output<string>();
  favoriteToggled = output<string>();

  showDeleteDialog = signal(false);
  isExpanded = linkedSignal(() => this.startExpanded());

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
