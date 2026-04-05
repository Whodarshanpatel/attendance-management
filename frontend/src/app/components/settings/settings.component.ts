import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { Theme } from '../../models/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <div class="page-header">
        <div class="page-header__title">
          <h1>Settings</h1>
          <p>Customize your experience</p>
        </div>
      </div>

      <!-- Theme Settings -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card__header">
          <h3>🎨 Theme Preferences</h3>
        </div>
        <div class="card__body">
          <p style="color:var(--text-secondary);margin-bottom:1.5rem;">Choose how AttendEase looks for you.</p>
          <div class="theme-options">
            @for (option of themeOptions; track option.value) {
              <div class="theme-option" [class.active]="currentTheme === option.value" (click)="setTheme(option.value)">
                <div class="theme-preview" [class]="'preview-' + option.value">
                  <div class="preview-bar"></div>
                  <div class="preview-content">
                    <div class="preview-sidebar"></div>
                    <div class="preview-main">
                      <div class="preview-card"></div>
                      <div class="preview-card"></div>
                    </div>
                  </div>
                </div>
                <div class="theme-label">
                  <span class="theme-icon">{{ option.icon }}</span>
                  <span>{{ option.label }}</span>
                </div>
                @if (currentTheme === option.value) {
                  <div class="theme-check">✓</div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card__header">
          <h3>🔔 Notification Preferences</h3>
        </div>
        <div class="card__body">
          <div class="setting-row">
            <div>
              <p style="font-weight:600;">In-App Notifications</p>
              <p style="font-size:.875rem;color:var(--text-secondary);">Show notifications inside the application</p>
            </div>
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="settings.inApp">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="setting-row">
            <div>
              <p style="font-weight:600;">📧 Email Notifications</p>
              <p style="font-size:.875rem;color:var(--text-secondary);">Receive attendance alerts via email</p>
            </div>
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="settings.email">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="setting-row">
            <div>
              <p style="font-weight:600;">💬 WhatsApp Notifications</p>
              <p style="font-size:.875rem;color:var(--text-secondary);">Receive attendance alerts on WhatsApp</p>
            </div>
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="settings.whatsapp">
              <span class="toggle-slider"></span>
            </label>
          </div>
          @if (settings.whatsapp && !user?.phone) {
            <div class="alert alert--warning" style="margin-top:1rem;">
              ⚠️ Please add your phone number in your profile to receive WhatsApp notifications.
            </div>
          }
        </div>
      </div>

      <!-- Account Info -->
      <div class="card">
        <div class="card__header">
          <h3>👤 Account Information</h3>
        </div>
        <div class="card__body">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Name</span>
              <span class="info-value">{{ user?.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">{{ user?.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Role</span>
              <span class="info-value"><span class="badge badge--{{ user?.role }}">{{ user?.role | titlecase }}</span></span>
            </div>
            <div class="info-item">
              <span class="info-label">Phone</span>
              <span class="info-value">{{ user?.phone || 'Not set' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Course</span>
              <span class="info-value">{{ user?.course || 'Not set' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Semester</span>
              <span class="info-value">{{ user?.semester ? 'Semester ' + user?.semester : 'Not set' }}</span>
            </div>
          </div>
          <div style="margin-top:1.5rem;">
            <button class="btn btn--danger" (click)="logout()">🚪 Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page { max-width: 800px; }

    .theme-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .theme-option {
      border: 2px solid var(--border-color);
      border-radius: 16px;
      padding: 1rem;
      cursor: pointer;
      transition: all .2s;
      position: relative;

      &:hover { border-color: var(--primary); }
      &.active { border-color: var(--primary); background: rgba(99,102,241,.06); }
    }

    .theme-preview {
      border-radius: 10px;
      overflow: hidden;
      height: 90px;
      margin-bottom: .75rem;

      &.preview-light { background: #f8fafc; }
      &.preview-dark { background: #0f172a; }
      &.preview-system { background: linear-gradient(135deg, #f8fafc 50%, #0f172a 50%); }
    }

    .preview-bar { height: 12px; background: rgba(99,102,241,.5); }
    .preview-content { display: flex; padding: 4px; gap: 4px; height: calc(100% - 12px); }
    .preview-sidebar { width: 20px; background: rgba(99,102,241,.2); border-radius: 4px; }
    .preview-main { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .preview-card { flex: 1; border-radius: 4px; background: rgba(255,255,255,.3); }

    .preview-dark .preview-card { background: rgba(255,255,255,.1); }

    .theme-label {
      display: flex;
      align-items: center;
      gap: .375rem;
      font-size: .875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .theme-icon { font-size: 1rem; }

    .theme-check {
      position: absolute;
      top: .5rem;
      right: .75rem;
      width: 22px;
      height: 22px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: .75rem;
      font-weight: 700;
    }

    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: .875rem 0;
      border-bottom: 1px solid var(--border-light);

      &:last-of-type { border-bottom: none; }
    }

    /* Toggle Switch */
    .toggle {
      position: relative;
      width: 44px;
      height: 24px;
      cursor: pointer;

      input { opacity: 0; width: 0; height: 0; }
    }

    .toggle-slider {
      position: absolute;
      inset: 0;
      background: var(--border-color);
      border-radius: 12px;
      transition: .3s;

      &::before {
        content: '';
        position: absolute;
        width: 18px;
        height: 18px;
        left: 3px;
        top: 3px;
        background: white;
        border-radius: 50%;
        transition: .3s;
        box-shadow: 0 1px 3px rgba(0,0,0,.2);
      }
    }

    input:checked + .toggle-slider {
      background: var(--primary);
      &::before { transform: translateX(20px); }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: .25rem;
      padding: .75rem;
      background: var(--bg-primary);
      border-radius: 10px;
    }

    .info-label { font-size: .75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: .05em; }
    .info-value { font-size: .9375rem; font-weight: 600; color: var(--text-primary); }

    @media (max-width: 640px) {
      .theme-options { grid-template-columns: 1fr; }
      .info-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class SettingsComponent implements OnInit {
  currentTheme: Theme = 'system';
  user = this.authService.currentUser;
  settings = { inApp: true, email: true, whatsapp: false };

  themeOptions = [
    { value: 'light' as Theme, label: 'Light', icon: '☀️' },
    { value: 'system' as Theme, label: 'System', icon: '🖥️' },
    { value: 'dark' as Theme, label: 'Dark', icon: '🌙' },
  ];

  constructor(private themeService: ThemeService, private authService: AuthService) {}

  ngOnInit(): void {
    this.themeService.theme$.subscribe(t => this.currentTheme = t);
    this.authService.currentUser$.subscribe(u => this.user = u);
  }

  setTheme(theme: Theme): void { this.themeService.setTheme(theme); }
  logout(): void { this.authService.logout(); }
}
