import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AIProvider, AIWordResponse, AIImageResponse } from '../../models/ai-response.model';
import { AI_CONSTANTS, AI_PROMPTS } from '../../constants/ai.constants';

@Injectable({ providedIn: 'root' })
export class GeminiProvider implements AIProvider {
  readonly providerName = 'gemini';
  private readonly http = inject(HttpClient);

  async generateWordData(word: string): Promise<AIWordResponse> {
    const url = `${AI_CONSTANTS.GEMINI_BASE_URL}/models/${AI_CONSTANTS.GEMINI_TEXT_MODEL}:generateContent?key=${AI_CONSTANTS.GEMINI_API_KEY}`;

    const body = {
      contents: [{ parts: [{ text: AI_PROMPTS.WORD_DATA(word) }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    };

    let response: any;
    try {
      response = await firstValueFrom(this.http.post<any>(url, body));
    } catch (httpErr: any) {
      const apiMsg = httpErr?.error?.error?.message || httpErr?.message || 'Unknown API error';
      throw new Error(`Gemini API error: ${apiMsg}`);
    }

    const jsonText = response.candidates[0].content.parts[0].text;

    try {
      return JSON.parse(jsonText) as AIWordResponse;
    } catch {
      const match = jsonText.match(/```json?\s*([\s\S]*?)\s*```/);
      if (match) {
        return JSON.parse(match[1]) as AIWordResponse;
      }
      throw new Error('Failed to parse AI response as JSON');
    }
  }

  async generateImage(word: string, definition: string): Promise<AIImageResponse> {
    const url = `${AI_CONSTANTS.GEMINI_BASE_URL}/models/${AI_CONSTANTS.GEMINI_IMAGE_MODEL}:generateContent?key=${AI_CONSTANTS.GEMINI_API_KEY}`;

    const body = {
      contents: [{ parts: [{ text: AI_PROMPTS.IMAGE(word, definition) }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    };

    try {
      const response = await firstValueFrom(this.http.post<any>(url, body));
      const parts = response.candidates[0].content.parts;
      const imagePart = parts.find((p: any) => p.inlineData);

      if (imagePart) {
        const base64 = imagePart.inlineData.data;
        const mimeType = imagePart.inlineData.mimeType || 'image/png';
        const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const blob = new Blob([byteArray], { type: mimeType });
        return { imageBlob: blob, mimeType };
      }
    } catch (err) {
      console.warn('Image generation failed, using placeholder:', err);
    }

    // Fallback: generate a colored placeholder with the word's first letter
    return this.generatePlaceholderImage(word);
  }

  private generatePlaceholderImage(word: string): AIImageResponse {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
    const color = colors[word.length % colors.length];
    const letter = word.charAt(0).toUpperCase();

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect width="400" height="300" rx="16" fill="${color}" opacity="0.15"/>
        <rect x="20" y="20" width="360" height="260" rx="12" fill="${color}" opacity="0.08"/>
        <text x="200" y="170" font-family="Inter, sans-serif" font-size="120" font-weight="700"
              fill="${color}" text-anchor="middle" dominant-baseline="central">${letter}</text>
      </svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    return { imageBlob: blob, mimeType: 'image/svg+xml' };
  }
}
