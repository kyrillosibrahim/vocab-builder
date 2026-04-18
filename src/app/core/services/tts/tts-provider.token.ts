import { InjectionToken } from '@angular/core';
import { TTSProvider } from '../../models/ai-response.model';

export const TTS_PROVIDER = new InjectionToken<TTSProvider>('TTS_PROVIDER');
