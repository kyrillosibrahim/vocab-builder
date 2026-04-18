import { Component, inject, input, signal } from '@angular/core';
import { TTS_PROVIDER } from '../../../core/services/tts/tts-provider.token';

@Component({
  selector: 'app-audio-player',
  template: `
    <button (click)="play()" class="audio-btn" [class.playing]="isPlaying()" [class.sm]="size() === 'sm'"
            [attr.aria-label]="'Play pronunciation: ' + text()">
      @if (isPlaying()) {
        <span class="pulse-ring"></span>
      }
      <svg [attr.width]="size() === 'sm' ? 14 : 18" [attr.height]="size() === 'sm' ? 14 : 18"
           fill="currentColor" viewBox="0 0 24 24" style="position: relative; z-index: 1;">
        @if (isPlaying()) {
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        } @else {
          <path d="M8 5v14l11-7z"/>
        }
      </svg>
    </button>
  `,
  styles: `
    :host { display: inline-flex; }

    .audio-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 11px;
      border: 1px solid rgba(192, 112, 64, 0.08);
      background: linear-gradient(135deg, #FBF7F2, #F7F0E8);
      color: #C07040;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: linear-gradient(135deg, #F7F0E8, #F2E8D8);
        transform: scale(1.08);
        box-shadow: 0 4px 12px rgba(192, 112, 64, 0.12);
      }

      &.sm {
        width: 30px;
        height: 30px;
        border-radius: 9px;
      }

      &.playing {
        background: linear-gradient(135deg, #3B2F2F, #6B4C3B);
        color: #F7F0E8;
        border-color: transparent;
        box-shadow: 0 4px 16px rgba(59, 47, 47, 0.35);
      }
    }

    .pulse-ring {
      position: absolute;
      inset: -3px;
      border-radius: inherit;
      border: 2px solid rgba(192, 112, 64, 0.2);
      animation: pulse-ring 1.5s ease-out infinite;
    }

    @keyframes pulse-ring {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.25); opacity: 0; }
    }
  `,
})
export class AudioPlayerComponent {
  private readonly tts = inject(TTS_PROVIDER);

  text = input.required<string>();
  lang = input<'en' | 'ar'>('en');
  size = input<'sm' | 'md'>('md');

  isPlaying = signal(false);

  play(): void {
    if (this.isPlaying()) {
      this.tts.stop();
      this.isPlaying.set(false);
      return;
    }

    this.isPlaying.set(true);
    this.tts.speakDirect(this.text(), this.lang());

    const checkInterval = setInterval(() => {
      if (!speechSynthesis.speaking) {
        this.isPlaying.set(false);
        clearInterval(checkInterval);
      }
    }, 200);

    setTimeout(() => {
      this.isPlaying.set(false);
      clearInterval(checkInterval);
    }, 15000);
  }
}
