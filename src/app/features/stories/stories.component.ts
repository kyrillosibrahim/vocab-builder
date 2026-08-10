import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Story, StoryHighlight } from '../../core/models/story.model';
import { Word } from '../../core/models/word.model';
import { StoryService, reanchorHighlights } from '../../core/services/story/story.service';
import { WordService } from '../../core/services/word/word.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

type Segment =
  | { kind: 'text'; text: string; start: number }
  | { kind: 'highlight'; text: string; start: number; highlight: StoryHighlight };

interface TextRange {
  start: number;
  end: number;
}

const UNTITLED_STORY = 'Untitled Story';

function plainSegments(text: string, start: number): Segment[] {
  const segments: Segment[] = [];
  let offset = start;

  for (const part of text.split(/(\s+)/)) {
    if (!part) continue;
    segments.push({ kind: 'text', text: part, start: offset });
    offset += part.length;
  }

  return segments;
}

function storySegments(story: Story): Segment[] {
  const highlights = [...story.highlights].sort((a, b) => a.start - b.start);
  const segments: Segment[] = [];
  let offset = 0;

  for (const highlight of highlights) {
    segments.push(...plainSegments(story.content.slice(offset, highlight.start), offset));
    segments.push({ kind: 'highlight', text: highlight.text, start: highlight.start, highlight });
    offset = highlight.end;
  }

  segments.push(...plainSegments(story.content.slice(offset), offset));
  return segments;
}

@Component({
  selector: 'app-stories',
  imports: [FormsModule, ConfirmDialogComponent, EmptyStateComponent],
  templateUrl: './stories.component.html',
  styleUrl: './stories.component.scss',
})
export class StoriesComponent implements OnInit {
  readonly storyService = inject(StoryService);
  readonly wordService = inject(WordService);
  private readonly storyBody = viewChild<ElementRef<HTMLElement>>('storyBody');

  readonly isInitialLoad = signal(true);
  readonly selectedStoryId = signal<string | null>(null);
  readonly mode = signal<'edit' | 'read'>('read');
  readonly editTitle = signal('');
  readonly editContent = signal('');
  readonly activeHighlightId = signal<string | null>(null);
  readonly noteDraft = signal('');
  readonly noteSaved = signal(false);
  readonly dictionarySuccess = signal(false);
  readonly lostHighlightCount = signal(0);
  readonly deleteStoryId = signal<string | null>(null);
  private isCreatingHighlight = false;

  readonly selectedStory = computed(() =>
    this.storyService.stories().find(story => story.id === this.selectedStoryId()) ?? null
  );
  readonly segments = computed<Segment[]>(() => {
    const story = this.selectedStory();
    return story ? storySegments(story) : [];
  });
  readonly activeHighlight = computed(() => {
    const story = this.selectedStory();
    const highlightId = this.activeHighlightId();
    return story?.highlights.find(highlight => highlight.id === highlightId) ?? null;
  });
  readonly wordCandidate = computed(() => {
    const text = this.activeHighlight()?.text.trim() ?? '';
    if (!text || /\s/.test(text) || !/^[a-zA-Z]+(-[a-zA-Z]+)?$/.test(text)) return null;
    return text.toLowerCase();
  });
  readonly dictionaryWord = computed<Word | null>(() => {
    const candidate = this.wordCandidate();
    if (!candidate) return null;
    return this.wordService.words().find(
      word => word.englishWord.toLowerCase() === candidate,
    ) ?? null;
  });
  readonly storyPendingDelete = computed(() =>
    this.storyService.stories().find(story => story.id === this.deleteStoryId()) ?? null
  );

  constructor() {
    if (this.wordService.words().length === 0) void this.wordService.loadAllWords();
  }

  async ngOnInit(): Promise<void> {
    await this.storyService.loadAllStories();
    const firstStory = this.storyService.stories()[0];
    if (firstStory) this.selectedStoryId.set(firstStory.id);
    this.isInitialLoad.set(false);
  }

  async onNewStory(): Promise<void> {
    try {
      const story = await this.storyService.createStory(UNTITLED_STORY, '');
      this.openStory(story.id);
      this.startEdit();
    } catch {
      return;
    }
  }

  openStory(id: string): void {
    this.selectedStoryId.set(id);
    this.mode.set('read');
    this.lostHighlightCount.set(0);
    this.closeNotePanel();
  }

  startEdit(): void {
    const story = this.selectedStory();
    if (!story) return;
    this.editTitle.set(story.title);
    this.editContent.set(story.content);
    this.mode.set('edit');
    this.closeNotePanel();
  }

  cancelEdit(): void {
    this.mode.set('read');
    this.lostHighlightCount.set(0);
    // Discard the placeholder row New Story persisted, so cancelling leaves nothing behind.
    const story = this.selectedStory();
    if (story && !story.content && story.highlights.length === 0 && story.title === UNTITLED_STORY) {
      this.deleteStoryId.set(story.id);
      void this.confirmDelete();
    }
  }

  async saveEdits(): Promise<void> {
    const story = this.selectedStory();
    if (!story) return;
    const anchored = reanchorHighlights(this.editContent(), story.highlights);
    const updatedStory = {
      ...story,
      title: this.editTitle(),
      content: this.editContent(),
      highlights: anchored.kept,
    };

    try {
      await this.storyService.saveStory(updatedStory);
      this.lostHighlightCount.set(anchored.lost);
      this.mode.set('read');
    } catch {
      return;
    }
  }

  onWordClick(segment: Segment): void {
    if (segment.kind !== 'text' || this.isWhitespace(segment.text)) return;
    void this.createHighlight(segment.start, segment.start + segment.text.length);
  }

  onSelectionEnd(): void {
    const selection = window.getSelection();
    const body = this.storyBody()?.nativeElement;
    if (!selection || !body) return;
    const range = this.selectionRange(selection, body);
    if (!range) return;
    selection.removeAllRanges();
    void this.createHighlight(range.start, range.end);
  }

  onHighlightClick(highlight: StoryHighlight): void {
    this.openHighlight(highlight);
  }

  async saveNote(): Promise<void> {
    const story = this.selectedStory();
    const highlight = this.activeHighlight();
    if (!story || !highlight) return;
    const now = new Date().toISOString();
    const highlights = story.highlights.map(existing =>
      existing.id === highlight.id
        ? { ...existing, note: this.noteDraft(), updatedAt: now }
        : existing
    );

    try {
      await this.storyService.saveStory({ ...story, highlights });
      this.noteSaved.set(true);
      setTimeout(() => this.noteSaved.set(false), 2000);
    } catch {
      return;
    }
  }

  async removeHighlight(): Promise<void> {
    const story = this.selectedStory();
    const highlightId = this.activeHighlightId();
    if (!story || !highlightId) return;

    try {
      await this.storyService.saveStory({
        ...story,
        highlights: story.highlights.filter(highlight => highlight.id !== highlightId),
      });
      this.closeNotePanel();
    } catch {
      return;
    }
  }

  closeNotePanel(): void {
    this.activeHighlightId.set(null);
    this.noteDraft.set('');
    this.noteSaved.set(false);
    this.dictionarySuccess.set(false);
    this.wordService.clearError();
  }

  async addCandidateToWords(): Promise<void> {
    const candidate = this.wordCandidate();
    if (!candidate) return;
    this.dictionarySuccess.set(false);
    this.wordService.clearError();

    try {
      await this.wordService.addWord({ englishWord: candidate });
      this.dictionarySuccess.set(true);
    } catch {
      this.dictionarySuccess.set(false);
    }
  }

  requestDelete(event: Event, id: string): void {
    event.stopPropagation();
    this.deleteStoryId.set(id);
  }

  async confirmDelete(): Promise<void> {
    const id = this.deleteStoryId();
    if (!id) return;
    this.deleteStoryId.set(null);

    try {
      await this.storyService.deleteStory(id);
    } catch {
      return;
    }

    if (this.selectedStoryId() === id) {
      const nextStory = this.storyService.stories()[0];
      this.selectedStoryId.set(nextStory?.id ?? null);
      this.mode.set('read');
      this.closeNotePanel();
    }
  }

  cancelDelete(): void {
    this.deleteStoryId.set(null);
  }

  isWhitespace(text: string): boolean {
    return /^\s+$/.test(text);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private async createHighlight(start: number, end: number): Promise<void> {
    // A mouse selection fires mouseup then click, so without this guard the
    // in-flight save lets the second call through before the overlap check sees it.
    if (this.isCreatingHighlight) return;

    const story = this.selectedStory();
    if (!story) return;
    const overlapping = story.highlights.find(highlight => start < highlight.end && end > highlight.start);
    if (overlapping) {
      this.openHighlight(overlapping);
      return;
    }

    const now = new Date().toISOString();
    const highlight: StoryHighlight = {
      id: crypto.randomUUID(),
      start,
      end,
      text: story.content.slice(start, end),
      note: '',
      createdAt: now,
      updatedAt: now,
    };
    const highlights = [...story.highlights, highlight].sort((a, b) => a.start - b.start);

    this.isCreatingHighlight = true;
    try {
      await this.storyService.saveStory({ ...story, highlights });
      this.openHighlight(highlight);
    } catch {
      return;
    } finally {
      this.isCreatingHighlight = false;
    }
  }

  private openHighlight(highlight: StoryHighlight): void {
    this.wordService.clearError();
    this.activeHighlightId.set(highlight.id);
    this.noteDraft.set(highlight.note);
    this.noteSaved.set(false);
    this.dictionarySuccess.set(false);
  }

  private selectionRange(selection: Selection, body: HTMLElement): TextRange | null {
    const anchorNode = selection.anchorNode;
    const focusNode = selection.focusNode;
    if (selection.isCollapsed || !anchorNode || !focusNode) return null;
    if (!body.contains(anchorNode) || !body.contains(focusNode)) return null;
    const anchor = this.selectionOffset(anchorNode, selection.anchorOffset);
    const focus = this.selectionOffset(focusNode, selection.focusOffset);
    if (anchor === null || focus === null) return null;

    const story = this.selectedStory();
    if (!story) return null;
    let start = Math.min(anchor, focus);
    let end = Math.max(anchor, focus);
    while (start < end && /\s/.test(story.content[start])) start++;
    while (end > start && /\s/.test(story.content[end - 1])) end--;
    return start < end ? { start, end } : null;
  }

  private selectionOffset(node: Node, offset: number): number | null {
    const parent = node instanceof HTMLElement ? node : node.parentElement;
    const segment = parent?.closest('[data-start]');
    if (!(segment instanceof HTMLElement)) return null;
    return Number(segment.dataset['start']) + offset;
  }
}
