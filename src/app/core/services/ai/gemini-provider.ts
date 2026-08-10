import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AIProvider, AIWordResponse } from '../../models/ai-response.model';
import { AI_CONSTANTS, AI_PROMPTS } from '../../constants/ai.constants';

@Injectable({ providedIn: 'root' })
export class GeminiProvider implements AIProvider {
  readonly providerName = 'gemini';
  private readonly http = inject(HttpClient);

  async generateWordData(word: string): Promise<AIWordResponse> {
    const url = AI_CONSTANTS.GEMINI_PROXY_URL;

    const body = {
      contents: [{ parts: [{ text: AI_PROMPTS.WORD_DATA(word) }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    };

    let response: any;
    try {
      response = await firstValueFrom(
        this.http.post<any>(url, { model: AI_CONSTANTS.GEMINI_TEXT_MODEL, body }),
      );
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
}
