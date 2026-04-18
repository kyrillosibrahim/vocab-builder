import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  template: `
    @switch (type()) {
      @case ('card') {
        <div class="skeleton-card">
          <div class="skel-accent"></div>
          <div class="skel-image animate-shimmer"></div>
          <div class="skel-body">
            <div class="skel-row">
              <div class="animate-shimmer" style="height: 24px; width: 60%; border-radius: 8px;"></div>
              <div class="animate-shimmer" style="height: 30px; width: 30px; border-radius: 10px;"></div>
            </div>
            <div class="animate-shimmer" style="height: 14px; width: 40%; border-radius: 6px;"></div>
            <div class="skel-arabic animate-shimmer"></div>
            <div class="skel-lines">
              <div class="animate-shimmer" style="height: 12px; border-radius: 6px;"></div>
              <div class="animate-shimmer" style="height: 12px; width: 85%; border-radius: 6px;"></div>
            </div>
            <div class="skel-lines">
              <div class="animate-shimmer" style="height: 12px; border-radius: 6px;"></div>
              <div class="animate-shimmer" style="height: 12px; width: 70%; border-radius: 6px;"></div>
            </div>
          </div>
        </div>
      }
      @case ('line') {
        <div class="animate-shimmer" [style.width]="width()" style="height: 16px; border-radius: 8px;"></div>
      }
      @case ('circle') {
        <div class="animate-shimmer" [style.width]="width()" [style.height]="width()" style="border-radius: 50%;"></div>
      }
    }
  `,
  styles: `
    .skeleton-card {
      background: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.6);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
    }
    .skel-accent { height: 4px; background: linear-gradient(90deg, #E8DCC8, #D4C4A8, #E8DCC8); }
    .skel-image { height: 180px; }
    .skel-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
    .skel-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .skel-arabic { height: 52px; border-radius: 14px; }
    .skel-lines { display: flex; flex-direction: column; gap: 8px; }
  `,
})
export class SkeletonLoaderComponent {
  type = input<'card' | 'line' | 'circle'>('card');
  width = input('100%');
}
