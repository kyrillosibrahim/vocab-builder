import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { AI_PROVIDER } from './core/services/ai/ai-provider.token';
import { GeminiProvider } from './core/services/ai/gemini-provider';
import { TTS_PROVIDER } from './core/services/tts/tts-provider.token';
import { WebSpeechProvider } from './core/services/tts/web-speech-provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(),
    // AI Provider - swap by changing GeminiProvider to another implementation
    { provide: AI_PROVIDER, useClass: GeminiProvider },
    // TTS Provider - swap by changing WebSpeechProvider to another implementation
    { provide: TTS_PROVIDER, useClass: WebSpeechProvider },
  ],
};
