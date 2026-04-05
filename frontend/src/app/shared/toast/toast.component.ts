import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts$ | async; track toast.id) {
        <div class="toast toast--{{ toast.type }}">
          <span class="toast-icon">{{ getIcon(toast.type) }}</span>
          <span style="flex:1; font-size:.9rem; color: var(--text-primary);">{{ toast.message }}</span>
          <button (click)="toastService.remove(toast.id)"
            style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:1.2rem;padding:0;line-height:1;">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-icon { font-size: 1.2rem; }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  }
}
