import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-wrapper animate-fade-in">
      <div class="empty-icon-wrap">
        <div class="empty-icon animate-float">
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            @switch (icon()) {
              @case ('book') {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              }
              @case ('search') {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"/>
              }
            }
          </svg>
        </div>
      </div>
      <h3 class="empty-title">{{ title() }}</h3>
      <p class="empty-msg">{{ message() }}</p>
    </div>
  `,
  styles: `
    .empty-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 64px 24px;
    }
    .empty-icon-wrap {
      width: 120px; height: 120px;
      border-radius: 32px;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #FBF7F2, #F7F0E8);
      border: 1px solid rgba(192, 112, 64, 0.06);
      margin-bottom: 24px;
    }
    .empty-icon { color: #C07040; }
    .empty-title {
      font-size: 1.25rem; font-weight: 700; color: #3B2F2F;
      margin-bottom: 8px; letter-spacing: -0.01em;
    }
    .empty-msg {
      font-size: 0.9375rem; color: #8A7A6A;
      max-width: 360px; line-height: 1.6;
    }
  `,
})
export class EmptyStateComponent {
  title = input('No words yet');
  message = input('Start building your vocabulary by adding your first word!');
  icon = input<'book' | 'search'>('book');
}
