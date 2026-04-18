import { Injectable } from '@angular/core';
import { TTSProvider } from '../../models/ai-response.model';

@Injectable({ providedIn: 'root' })
export class WebSpeechProvider implements TTSProvider {
  readonly providerName = 'web-speech-api';

  isAvailable(): boolean {
    return 'speechSynthesis' in window;
  }

  speakDirect(text: string, lang: 'en' | 'ar'): void {
    if (!this.isAvailable()) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'en' ? 'en-US' : 'ar-SA';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    speechSynthesis.speak(utterance);
  }

  stop(): void {
    if (this.isAvailable()) {
      speechSynthesis.cancel();
    }
  }
}
