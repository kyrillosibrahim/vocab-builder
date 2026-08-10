import { Injectable, computed, inject, signal } from '@angular/core';
import { Story, StoryHighlight } from '../../models/story.model';
import { StorageService } from '../storage/storage.service';

export function reanchorHighlights(
  content: string,
  highlights: StoryHighlight[],
): { kept: StoryHighlight[]; lost: number } {
  const orderedHighlights = [...highlights].sort((a, b) => a.start - b.start);
  const kept: StoryHighlight[] = [];
  let lost = 0;
  let searchStart = 0;

  for (const highlight of orderedHighlights) {
    if (content.slice(highlight.start, highlight.end) === highlight.text) {
      kept.push(highlight);
      searchStart = highlight.end;
      continue;
    }

    const start = content.indexOf(highlight.text, searchStart);
    if (start === -1) {
      lost++;
      continue;
    }

    const anchoredHighlight = { ...highlight, start, end: start + highlight.text.length };
    kept.push(anchoredHighlight);
    searchStart = anchoredHighlight.end;
  }

  return { kept: kept.sort((a, b) => a.start - b.start), lost };
}

@Injectable({ providedIn: 'root' })
export class StoryService {
  private readonly storage = inject(StorageService);

  readonly stories = signal<Story[]>([]);
  readonly error = signal<string | null>(null);
  readonly storyCount = computed(() => this.stories().length);

  async loadAllStories(): Promise<void> {
    try {
      const stories = await this.storage.getAllStories();
      this.stories.set(stories);
    } catch (error: unknown) {
      this.error.set('Failed to load stories: ' + this.errorMessage(error));
    }
  }

  async createStory(title: string, content: string): Promise<Story> {
    this.error.set(null);

    try {
      const now = new Date().toISOString();
      const story: Story = {
        id: crypto.randomUUID(),
        title,
        content,
        highlights: [],
        createdAt: now,
        updatedAt: now,
      };

      await this.storage.saveStory(story);
      this.stories.update(current => [story, ...current]);
      return story;
    } catch (error: unknown) {
      this.error.set(this.errorMessage(error, 'Failed to create story'));
      throw error;
    }
  }

  async saveStory(story: Story): Promise<void> {
    this.error.set(null);

    try {
      const updatedStory = { ...story, updatedAt: new Date().toISOString() };
      await this.storage.saveStory(updatedStory);
      this.stories.update(current =>
        current.map(existing => existing.id === story.id ? updatedStory : existing)
      );
    } catch (error: unknown) {
      this.error.set('Failed to save story: ' + this.errorMessage(error));
      throw error;
    }
  }

  async deleteStory(id: string): Promise<void> {
    this.error.set(null);

    try {
      await this.storage.deleteStory(id);
      this.stories.update(current => current.filter(story => story.id !== id));
    } catch (error: unknown) {
      this.error.set('Failed to delete story: ' + this.errorMessage(error));
      throw error;
    }
  }

  clearError(): void {
    this.error.set(null);
  }

  private errorMessage(error: unknown, fallback = 'Unknown error'): string {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
