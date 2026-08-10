import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  railExpanded = signal(false);

  constructor() {
    try {
      const storedValue = localStorage.getItem('vocab-rail-expanded');
      if (storedValue === 'true' || storedValue === 'false') {
        this.railExpanded.set(storedValue === 'true');
      }
    } catch {}
  }

  toggleRail(): void {
    this.railExpanded.update(v => !v);
    try {
      localStorage.setItem('vocab-rail-expanded', String(this.railExpanded()));
    } catch {}
  }

  closeRail(): void {
    this.railExpanded.set(false);
    try {
      localStorage.setItem('vocab-rail-expanded', 'false');
    } catch {}
  }

  // On mobile the expanded rail covers the content, so navigating must dismiss it.
  // On desktop it pushes the content and stays open.
  onNavClick(): void {
    if (window.innerWidth <= 640) {
      this.closeRail();
    }
  }
}
