import { InjectionToken } from '@angular/core';
import { AIProvider } from '../../models/ai-response.model';

export const AI_PROVIDER = new InjectionToken<AIProvider>('AI_PROVIDER');
