import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="auth-blob blob-1"></div>
        <div class="auth-blob blob-2"></div>
        <div class="auth-blob blob-3"></div>
      </div>

      <div class="auth-container">
        <!-- Left Panel -->
        <div class="auth-left">
          <div class="auth-brand">
            <span class="brand-icon">🎓</span>
            <h1 class="brand-name">AttendEase</h1>
          </div>
          <h2 class="auth-tagline">Smart Attendance<br>Management System</h2>
          <p class="auth-desc">Track attendance effortlessly. Get instant notifications. Manage your college with ease.</p>
          <div class="auth-features">
            <div class="feature-item">✨ Real-time attendance tracking</div>
            <div class="feature-item">🔔 WhatsApp & email notifications</div>
            <div class="feature-item">📊 Detailed analytics & reports</div>
            <div class="feature-item">👥 Role-based access control</div>
          </div>
        </div>

        <!-- Right Panel (Form) -->
        <div class="auth-right">
          <div class="auth-card">
            <div class="auth-card__header">
              <h2>Welcome Back! 👋</h2>
              <p>Sign in to your account</p>
            </div>

            @if (error) {
              <div class="alert alert--error">⚠️ {{ error }}</div>
            }

            <form (ngSubmit)="onLogin()" #loginForm="ngForm">
              <div class="form-group">
                <label for="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  class="form-control"
                  placeholder="you@example.com"
                  [(ngModel)]="email"
                  name="email"
                  required
                  email
                  #emailInput="ngModel"
                  [class.error]="emailInput.invalid && emailInput.touched"
                />
              </div>

              <div class="form-group">
                <label for="password">Password</label>
                <div style="position:relative;">
                  <input
                    id="password"
                    [type]="showPassword ? 'text' : 'password'"
                    class="form-control"
                    placeholder="Enter your password"
                    [(ngModel)]="password"
                    name="password"
                    required
                    minlength="6"
                    #passwordInput="ngModel"
                    [class.error]="passwordInput.invalid && passwordInput.touched"
                  />
                  <button type="button" (click)="showPassword = !showPassword"
                    style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:1.1rem;color:var(--text-muted);">
                    {{ showPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                class="btn btn--primary btn--lg"
                style="width:100%;"
                [disabled]="isLoading || loginForm.invalid"
              >
                @if (isLoading) {
                  <span class="spinner"></span> Signing In...
                } @else {
                  🔐 Sign In
                }
              </button>
            </form>

            <p class="auth-switch">
              Don't have an account?
              <a routerLink="/auth/signup" style="font-weight:600;">Create Account →</a>
            </p>

            <div class="demo-creds">
              <p>🧪 Demo Accounts:</p>
              <button type="button" class="demo-btn" (click)="fillDemo('teacher')">Teacher</button>
              <button type="button" class="demo-btn" (click)="fillDemo('student')">Student</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      position: relative;
      overflow: hidden;
    }

    .auth-bg {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }

    .auth-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.15;
    }

    .blob-1 {
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, #6366f1, #8b5cf6);
      top: -200px;
      left: -200px;
      animation: float 8s ease-in-out infinite;
    }

    .blob-2 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, #06b6d4, #3b82f6);
      bottom: -100px;
      right: 100px;
      animation: float 10s ease-in-out infinite reverse;
    }

    .blob-3 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, #f59e0b, #ec4899);
      top: 50%;
      right: -100px;
      animation: float 12s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-30px) scale(1.05); }
    }

    .auth-container {
      display: flex;
      width: 100%;
      max-width: 1000px;
      min-height: 600px;
      z-index: 1;
      padding: 2rem;
      gap: 3rem;
      align-items: center;
    }

    .auth-left {
      flex: 1;
      padding: 2rem 0;
    }

    .auth-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }

    .brand-icon { font-size: 3rem; }

    .brand-name {
      font-size: 2rem;
      font-weight: 900;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .auth-tagline {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1.2;
      margin-bottom: 1rem;
    }

    .auth-desc {
      color: var(--text-secondary);
      font-size: 1rem;
      line-height: 1.7;
      margin-bottom: 2rem;
      max-width: 360px;
    }

    .auth-features {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .feature-item {
      color: var(--text-secondary);
      font-size: 0.9rem;
      padding: 0.5rem 0.75rem;
      background: rgba(99, 102, 241, 0.08);
      border-radius: 8px;
      border-left: 3px solid var(--primary);
    }

    .auth-right {
      flex: 0 0 420px;
    }

    .auth-card {
      background: var(--bg-card);
      border-radius: 24px;
      padding: 2.5rem;
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--border-color);

      &__header {
        margin-bottom: 1.75rem;
        h2 { font-size: 1.75rem; font-weight: 800; }
        p { color: var(--text-secondary); margin-top: 0.375rem; }
      }
    }

    .auth-switch {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .demo-creds {
      margin-top: 1rem;
      padding: 0.75rem;
      background: var(--bg-primary);
      border-radius: 10px;
      border: 1px dashed var(--border-color);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .demo-btn {
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
      &:hover { opacity: 0.9; }
    }

    @media (max-width: 768px) {
      .auth-container { flex-direction: column; padding: 1rem; gap: 1rem; }
      .auth-left { display: none; }
      .auth-right { flex: none; width: 100%; }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  error = '';
  showPassword = false;

  constructor(private authService: AuthService, private toast: ToastService) {}

  onLogin(): void {
    this.error = '';
    this.isLoading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.toast.success('Welcome back! 🎉');
      },
      error: (err) => {
        this.error = err.error?.message || 'Login failed. Please try again.';
        this.isLoading = false;
      },
      complete: () => { this.isLoading = false; },
    });
  }

  fillDemo(role: 'teacher' | 'student'): void {
    if (role === 'teacher') {
      this.email = 'teacher@college.edu';
      this.password = 'teacher123';
    } else {
      this.email = 'student@college.edu';
      this.password = 'student123';
    }
  }
}
