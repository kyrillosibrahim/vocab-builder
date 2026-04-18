import { Component, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WordFilter } from '../../../core/models/word.model';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  template: `
    <div class="search-card">
      <!-- Search Row -->
      <div class="search-row">
        <div class="search-field">
          <svg class="search-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"/>
          </svg>
          <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="emitFilter()"
                 placeholder="Search words, translations, definitions..."
                 class="search-input" />
          @if (searchTerm) {
            <button class="search-clear" (click)="searchTerm = ''; emitFilter()">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          }
        </div>

        <!-- Filter Toggle -->
        <button class="filter-toggle" [class.has-filters]="hasActiveFilters()" (click)="toggleFilters()">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
          </svg>
          <span>Filters</span>
          @if (hasActiveFilters()) {
            <span class="filter-badge">{{ activeFilterCount() }}</span>
          }
        </button>
      </div>

      <!-- Expandable Filters -->
      @if (filtersOpen()) {
        <div class="filters-panel">
          <div class="filters-grid">
            <!-- Favorites -->
            <button (click)="toggleFavorites()" class="filter-item" [class.active]="favoritesOnly()">
              <div class="filter-item-icon" [class.active]="favoritesOnly()">
                <svg width="16" height="16" [attr.fill]="favoritesOnly() ? 'currentColor' : 'none'"
                     stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
              </div>
              <span class="filter-item-label">Favorites only</span>
            </button>

            <!-- Sort -->
            <div class="filter-group">
              <label class="filter-group-label">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
                </svg>
                Sort by
              </label>
              <div class="sort-options">
                <button class="sort-btn" [class.active]="sortBy === 'createdAt'"
                        (click)="sortBy = 'createdAt'; emitFilter()">Newest</button>
                <button class="sort-btn" [class.active]="sortBy === 'englishWord'"
                        (click)="sortBy = 'englishWord'; emitFilter()">A-Z</button>
                <button class="sort-btn" [class.active]="sortBy === 'updatedAt'"
                        (click)="sortBy = 'updatedAt'; emitFilter()">Updated</button>
              </div>
            </div>

            <!-- Date -->
            <div class="filter-group">
              <label class="filter-group-label">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Added after
              </label>
              <input type="date" [(ngModel)]="dateFrom" (ngModelChange)="emitFilter()"
                     class="date-input" />
            </div>
          </div>

          <!-- Clear All -->
          @if (hasActiveFilters()) {
            <div class="filters-footer">
              <button (click)="clearFilters()" class="clear-all-btn">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Clear all filters
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    /* ========== CARD CONTAINER ========== */
    .search-card {
      background: white;
      border: 1px solid #E8DCC8;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.03);
      transition: all 0.3s;
      &:focus-within {
        border-color: rgba(192, 112, 64, 0.2);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 20px rgba(192, 112, 64, 0.06);
      }
    }

    /* ========== SEARCH ROW ========== */
    .search-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 6px 6px 18px;
    }

    .search-field {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .search-icon {
      color: #8A7A6A;
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      padding: 12px 0;
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.9375rem;
      color: #3B2F2F;
      min-width: 0;
      &::placeholder { color: #A09080; }
    }

    .search-clear {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: none;
      background: #F2EBDF;
      color: #8A7A6A;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.15s;
      &:hover { background: #E8DCC8; color: #5A4A3A; }
    }

    /* ========== FILTER TOGGLE ========== */
    .filter-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border-radius: 14px;
      border: 1px solid #E8DCC8;
      background: #FDF9F5;
      color: #3A3A3A;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s;

      &:hover {
        background: #F7F0E8;
        border-color: #D4C4A8;
      }

      &.has-filters {
        background: linear-gradient(135deg, #FBF7F2, #F7F0E8);
        border-color: rgba(192, 112, 64, 0.15);
        color: #6B4C3B;
      }
    }

    .filter-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 100px;
      background: #C07040;
      color: white;
      font-size: 0.6875rem;
      font-weight: 700;
      line-height: 1;
    }

    /* ========== FILTERS PANEL ========== */
    .filters-panel {
      border-top: 1px solid #F0E8DC;
      padding: 16px 18px;
      background: #FDF9F5;
      animation: slideDown 0.2s ease;
    }

    .filters-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: flex-start;
    }

    /* ========== FAVORITE TOGGLE ========== */
    .filter-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 18px 10px 12px;
      border-radius: 14px;
      border: 1px solid #E8DCC8;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      &:hover { border-color: #D4C4A8; box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
      &.active {
        background: linear-gradient(135deg, #FBF7F2, #F7F0E8);
        border-color: rgba(192, 112, 64, 0.15);
        .filter-item-label { color: #6B4C3B; }
      }
    }

    .filter-item-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: #F2EBDF;
      color: #8A7A6A;
      transition: all 0.2s;
      &.active {
        background: rgba(192, 112, 64, 0.08);
        color: #C07040;
      }
    }

    .filter-item-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #5A4A3A;
      transition: color 0.2s;
    }

    /* ========== FILTER GROUPS ========== */
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-group-label {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #8A7A6A;
      padding-left: 2px;
    }

    /* ========== SORT BUTTONS ========== */
    .sort-options {
      display: flex;
      background: white;
      border: 1px solid #E8DCC8;
      border-radius: 12px;
      overflow: hidden;
    }

    .sort-btn {
      padding: 8px 16px;
      border: none;
      background: transparent;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #6B6B6B;
      cursor: pointer;
      transition: all 0.15s;
      position: relative;

      &:not(:last-child)::after {
        content: '';
        position: absolute;
        right: 0;
        top: 20%;
        height: 60%;
        width: 1px;
        background: #E8DCC8;
      }

      &:hover { background: #FDF9F5; }

      &.active {
        background: linear-gradient(135deg, #FBF7F2, #F7F0E8);
        color: #6B4C3B;
        &::after { display: none; }
      }
    }

    /* ========== DATE INPUT ========== */
    .date-input {
      padding: 8px 14px;
      border-radius: 12px;
      border: 1px solid #E8DCC8;
      background: white;
      font-size: 0.8125rem;
      font-weight: 500;
      color: #5A4A3A;
      outline: none;
      cursor: pointer;
      transition: all 0.2s;
      &:hover { border-color: #D4C4A8; }
      &:focus { border-color: #C07040; box-shadow: 0 0 0 3px rgba(192, 112, 64, 0.06); }
    }

    /* ========== CLEAR ALL ========== */
    .filters-footer {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid #F0E8DC;
    }

    .clear-all-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 10px;
      border: none;
      background: transparent;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #CC4400;
      cursor: pointer;
      transition: all 0.15s;
      &:hover { background: #FDF3EE; }
    }

    /* ========== ANIMATION ========== */
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ========== RESPONSIVE ========== */
    @media (max-width: 640px) {
      .search-row { padding: 4px 4px 4px 14px; }
      .filter-toggle span { display: none; }
      .filter-toggle { padding: 10px 12px; }
      .filters-grid { flex-direction: column; gap: 12px; }
      .sort-btn { padding: 8px 12px; font-size: 0.75rem; }
      .filter-item { width: 100%; }
    }
  `,
})
export class SearchBarComponent {
  filterChanged = output<WordFilter>();

  searchTerm = '';
  favoritesOnly = signal(false);
  filtersOpen = signal(false);
  sortBy: 'createdAt' | 'englishWord' | 'updatedAt' = 'createdAt';
  dateFrom = '';

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.favoritesOnly()) count++;
    if (this.dateFrom) count++;
    if (this.sortBy !== 'createdAt') count++;
    return count;
  });

  toggleFilters(): void {
    this.filtersOpen.update(v => !v);
  }

  toggleFavorites(): void {
    this.favoritesOnly.update(v => !v);
    this.emitFilter();
  }

  hasActiveFilters(): boolean {
    return !!this.searchTerm || this.favoritesOnly() || !!this.dateFrom;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.favoritesOnly.set(false);
    this.sortBy = 'createdAt';
    this.dateFrom = '';
    this.emitFilter();
  }

  emitFilter(): void {
    this.filterChanged.emit({
      searchTerm: this.searchTerm || undefined,
      favoritesOnly: this.favoritesOnly() || undefined,
      sortBy: this.sortBy,
      sortOrder: this.sortBy === 'englishWord' ? 'asc' : 'desc',
      dateFrom: this.dateFrom || undefined,
    });
  }
}
