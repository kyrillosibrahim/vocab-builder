import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';

interface DatamuseSuggestion {
  word: string;
  score: number;
}

@Injectable({ providedIn: 'root' })
export class WordSuggestionService {
  private readonly http = inject(HttpClient);
  private readonly suggestionUrl = 'https://api.datamuse.com/sug';
  private readonly cache = new Map<string, string[]>();

  suggest(query: string): Observable<string[]> {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length < 2) return of([]);

    const cachedSuggestions = this.cache.get(normalizedQuery);
    if (cachedSuggestions) return of(cachedSuggestions);

    const url = `${this.suggestionUrl}?s=${encodeURIComponent(normalizedQuery)}&max=10`;
    return this.http.get<DatamuseSuggestion[]>(url).pipe(
      map(suggestions => this.normalizeSuggestions(suggestions, normalizedQuery)),
      tap(suggestions => this.cacheSuggestions(normalizedQuery, suggestions)),
      catchError(() => of([])),
    );
  }

  private normalizeSuggestions(
    suggestions: DatamuseSuggestion[],
    normalizedQuery: string,
  ): string[] {
    const words = suggestions.map(suggestion => suggestion.word.toLowerCase().trim());
    const validWords = words.filter(word => /^[a-z]+(-[a-z]+)?$/.test(word));
    const differentWords = validWords.filter(word => word !== normalizedQuery);
    return [...new Set(differentWords)].slice(0, 8);
  }

  private cacheSuggestions(query: string, suggestions: string[]): void {
    if (this.cache.size >= 200) this.cache.clear();
    this.cache.set(query, suggestions);
  }
}
