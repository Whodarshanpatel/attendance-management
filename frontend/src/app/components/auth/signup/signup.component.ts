import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="auth-blob blob-1"></div>
        <div class="auth-blob blob-2"></div>
      </div>

      <div class="auth-container" style="align-items:flex-start;padding-top:2rem;">
        <div class="auth-right" style="flex:0 0 480px;margin:0 auto;">
          <div class="auth-card">
            <div class="auth-card__header">
              <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem;">
                <span style="font-size:2rem;">🎓</span>
                <span style="font-size:1.5rem;font-weight:900;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">AttendEase</span>
              </div>
              <h2>Create Account</h2>
              <p>Join the smart attendance system</p>
            </div>

            @if (error) {
              <div class="alert alert--error">⚠️ {{ error }}</div>
            }

            <form (ngSubmit)="onSignup()" #signupForm="ngForm">
              <!-- Role Selection -->
              <div class="role-selector">
                <button type="button" class="role-btn" [class.active]="role === 'student'" (click)="role='student'">
                  🧑‍🎓 Student
                </button>
                <button type="button" class="role-btn" [class.active]="role === 'teacher'" (click)="role='teacher'">
                  👨‍🏫 Teacher
                </button>
              </div>

              <div class="grid grid--2">
                <div class="form-group">
                  <label>Full Name *</label>
                  <input type="text" class="form-control" placeholder="John Doe"
                    [(ngModel)]="name" name="name" required #nameInput="ngModel"
                    [class.error]="nameInput.invalid && nameInput.touched">
                </div>
                <div class="form-group">
                  <label>Email *</label>
                  <input type="email" class="form-control" placeholder="john@college.edu"
                    [(ngModel)]="email" name="email" required email #emailInput="ngModel"
                    [class.error]="emailInput.invalid && emailInput.touched">
                </div>
              </div>

              <div class="grid grid--2">
                <div class="form-group">
                  <label>Password *</label>
                  <input type="password" class="form-control" placeholder="Min 6 characters"
                    [(ngModel)]="password" name="password" required minlength="6">
                </div>
                <div class="form-group">
                  <label>Phone (for WhatsApp)</label>
                  <input type="tel" class="form-control" placeholder="+91 9876543210"
                    [(ngModel)]="phone" name="phone">
                </div>
              </div>

              <div class="grid grid--2">
                <div class="form-group">
                  <label>Course</label>
                  <select class="form-control" [(ngModel)]="course" name="course">
                    <option value="">Select Course</option>
                    <option>B.Tech</option>
                    <option>B.Sc</option>
                    <option>BCA</option>
                    <option>BBA</option>
                    <option>M.Tech</option>
                    <option>MCA</option>
                    <option>MBA</option>
                  </select>
                </div>
                <div class="form-group">
                  @if (role === 'student') {
                    <label>Semester</label>
                    <select class="form-control" [(ngModel)]="semester" name="semester">
                      <option value="">Select</option>
                      @for (s of [1,2,3,4,5,6,7,8]; track s) {
                        <option [value]="s">Semester {{ s }}</option>
                      }
                    </select>
                  } @else {
                    <label>Employee ID</label>
                    <input type="text" class="form-control" placeholder="EMP001"
                      [(ngModel)]="enrollmentNumber" name="enrollmentNumber">
                  }
                </div>
              </div>

              @if (role === 'student') {
                <div class="form-group">
                  <label>Enrollment Number</label>
                  <input type="text" class="form-control" placeholder="2021BTCS001"
                    [(ngModel)]="enrollmentNumber" name="enrollmentNumber">
                </div>
              }

              <button type="submit" class="btn btn--primary btn--lg" style="width:100%;"
                [disabled]="isLoading || !name || !email || !password">
                @if (isLoading) {
                  <span class="spinner"></span> Creating Account...
                } @else {
                  🚀 Create Account
                }
              </button>
            </form>

            <p class="auth-switch">
              Already have an account?
              <a routerLink="/auth/login" style="font-weight:600;">Sign In →</a>
            </p>
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
    .auth-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
    .auth-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12; }
    .blob-1 { width: 500px; height: 500px; background: radial-gradient(circle, #6366f1, #8b5cf6); top: -150px; right: -100px; animation: float 8s ease-in-out infinite; }
    .blob-2 { width: 400px; height: 400px; background: radial-gradient(circle, #06b6d4, #10b981); bottom: -100px; left: -100px; animation: float 10s ease-in-out infinite reverse; }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }

    .auth-container { display: flex; width: 100%; max-width: 560px; z-index: 1; padding: 1rem; justify-content: center; }
    .auth-right { width: 100%; }
    .auth-card { background: var(--bg-card); border-radius: 24px; padding: 2rem; box-shadow: var(--shadow-xl); border: 1px solid var(--border-color); &__header { margin-bottom: 1.5rem; h2 { font-size: 1.5rem; font-weight: 800; } p { color: var(--text-secondary); margin-top: .25rem; } } }
    .auth-switch { text-align: center; margin-top: 1rem; font-size: .9rem; color: var(--text-secondary); }
    .role-selector { display: flex; gap: .5rem; margin-bottom: 1.25rem; background: var(--bg-primary); border-radius: 12px; padding: .375rem; border: 1px solid var(--border-color); }
    .role-btn {
      flex: 1; padding: .625rem; border-radius: 9px; border: none; cursor: pointer; font-family: inherit; font-size: .9rem; font-weight: 600; transition: all .2s; background: transparent; color: var(--text-secondary);
      &.active { background: var(--bg-card); color: var(--primary); box-shadow: var(--shadow-sm); }
    }
  `]
})
export class SignupComponent {
  name = ''; email = ''; password = ''; phone = '';
  role: 'teacher' | 'student' = 'student';
  course = ''; semester: number | '' = ''; enrollmentNumber = '';
  isLoading = false; error = '';

  constructor(private authService: AuthService, private toast: ToastService) {}

  onSignup(): void {
    this.error = '';
    this.isLoading = true;
    const data = { name: this.name, email: this.email, password: this.password, role: this.role, phone: this.phone, course: this.course, semester: this.semester || undefined, enrollmentNumber: this.enrollmentNumber };
    this.authService.signup(data).subscribe({
      next: () => this.toast.success('Account created! Welcome 🎓'),
      error: (err) => { this.error = err.error?.message || 'Signup failed.'; this.isLoading = false; },
      complete: () => { this.isLoading = false; },
    });
  }
}
