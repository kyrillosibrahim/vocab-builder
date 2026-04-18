import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    @if (isOpen()) {
      <div class="dialog-backdrop animate-fade-in" (click)="onCancel()">
        <div class="dialog-panel animate-slide-up" (click)="$event.stopPropagation()">
          <div class="dialog-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
          </div>
          <h3 class="dialog-title">{{ title() }}</h3>
          <p class="dialog-msg">{{ message() }}</p>
          <div class="dialog-actions">
            <button (click)="onCancel()" class="btn-cancel">Cancel</button>
            <button (click)="onConfirm()" class="btn-confirm"
                    [class.danger]="confirmType() === 'danger'">
              {{ confirmText() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .dialog-backdrop {
      position: fixed; inset: 0; z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      background: rgba(59, 47, 47, 0.4);
      backdrop-filter: blur(8px);
    }
    .dialog-panel {
      background: white;
      border-radius: 24px;
      padding: 32px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
      text-align: center;
    }
    .dialog-icon {
      width: 56px; height: 56px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #FDF3EE, #FBE8DE);
      color: #CC4400;
      margin: 0 auto 20px;
    }
    .dialog-title {
      font-size: 1.125rem; font-weight: 700; color: #3B2F2F;
      margin-bottom: 8px;
    }
    .dialog-msg {
      font-size: 0.875rem; color: #8A7A6A;
      line-height: 1.6; margin-bottom: 28px;
    }
    .dialog-actions {
      display: flex; gap: 12px;
    }
    .btn-cancel {
      flex: 1; padding: 12px 20px; border-radius: 14px;
      background: #F5F0EA; border: 1px solid #E8DCC8;
      font-size: 0.875rem; font-weight: 600; color: #8A7A6A;
      cursor: pointer; transition: all 0.2s;
      &:hover { background: #E8DCC8; }
    }
    .btn-confirm {
      flex: 1; padding: 12px 20px; border-radius: 14px;
      background: linear-gradient(135deg, #3B2F2F, #6B4C3B);
      border: none; font-size: 0.875rem; font-weight: 600;
      color: white; cursor: pointer; transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(59, 47, 47, 0.25);
      &:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59, 47, 47, 0.35); }
      &.danger {
        background: linear-gradient(135deg, #CC4400, #E06030);
        box-shadow: 0 4px 12px rgba(204, 68, 0, 0.3);
        &:hover { box-shadow: 0 6px 16px rgba(204, 68, 0, 0.4); }
      }
    }
  `,
})
export class ConfirmDialogComponent {
  isOpen = input(false);
  title = input('Confirm');
  message = input('Are you sure?');
  confirmText = input('Confirm');
  confirmType = input<'danger' | 'primary'>('danger');

  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm(): void { this.confirmed.emit(); }
  onCancel(): void { this.cancelled.emit(); }
}
