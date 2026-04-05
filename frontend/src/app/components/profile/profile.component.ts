import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { User } from '../../models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">
      <div class="page-header">
        <div class="page-header__title">
          <h1>My Profile</h1>
          <p>Manage your personal information</p>
        </div>
      </div>

      <div class="grid grid--2" style="align-items:start;">
        <!-- Profile Card -->
        <div class="card">
          <div class="card__body" style="text-align:center;padding:2.5rem;">
            <div class="profile-avatar-wrap" (click)="fileInput.click()" style="cursor:pointer;display:inline-block;position:relative;margin-bottom:1.5rem;">
              <div class="avatar avatar--xl" [style]="(previewUrl || user?.profilePicture) ? 'background:transparent;' : ''">
                @if (previewUrl) {
                  <img [src]="previewUrl" alt="Preview" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
                } @else if (user?.profilePicture) {
                  <img [src]="getImgUrl(user?.profilePicture)" [alt]="user?.name" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
                } @else {
                  {{ getInitials(user?.name) }}
                }
              </div>
              <div class="avatar-edit-overlay">📷</div>
              <input #fileInput type="file" accept="image/*" style="display:none;" (change)="onFileSelected($event, fileInput)">
            </div>

            <h2 style="font-size:1.5rem;font-weight:800;">{{ user?.name }}</h2>
            <p style="color:var(--text-secondary);margin-top:.25rem;">{{ user?.email }}</p>

            <div style="display:flex;justify-content:center;gap:.5rem;margin-top:.75rem;">
              <span class="badge badge--{{ user?.role }}">{{ user?.role | titlecase }}</span>
              @if (user?.course) {
                <span class="badge badge--info">{{ user?.course }}</span>
              }
              @if (user?.semester) {
                <span class="badge badge--info">Sem {{ user?.semester }}</span>
              }
            </div>

            @if (user?.enrollmentNumber) {
              <p style="margin-top:1rem;font-size:.875rem;color:var(--text-secondary);">
                🆔 Enrollment: <strong>{{ user?.enrollmentNumber }}</strong>
              </p>
            }
          </div>
        </div>

        <!-- Edit Form -->
        <div class="card">
          <div class="card__header">
            <h3>✏️ Edit Profile</h3>
          </div>
          <div class="card__body">
            @if (successMsg) {
              <div class="alert alert--success">✅ {{ successMsg }}</div>
            }
            @if (error) {
              <div class="alert alert--error">⚠️ {{ error }}</div>
            }

            <form (ngSubmit)="onSave()" #profileForm="ngForm">
              <div class="form-group">
                <label>Full Name *</label>
                <input type="text" class="form-control" [(ngModel)]="editData.name" name="name" required placeholder="Your full name">
              </div>

              <div class="form-group">
                <label>Email Address</label>
                <input type="email" class="form-control" [value]="user?.email" disabled style="opacity:.6;cursor:not-allowed;">
                <small style="color:var(--text-muted);font-size:.75rem;">Email cannot be changed</small>
              </div>

              <div class="form-group">
                <label>📱 Phone Number (for WhatsApp notifications)</label>
                <input type="tel" class="form-control" [(ngModel)]="editData.phone" name="phone"
                  placeholder="+91 9876543210">
              </div>

              <div class="grid grid--2">
                <div class="form-group">
                  <label>Course</label>
                  <select class="form-control" [(ngModel)]="editData.course" name="course">
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
                  <label>Semester</label>
                  <select class="form-control" [(ngModel)]="editData.semester" name="semester">
                    <option value="">Select</option>
                    @for (s of [1,2,3,4,5,6,7,8]; track s) {
                      <option [value]="s">Semester {{ s }}</option>
                    }
                  </select>
                </div>
              </div>

              <button type="submit" class="btn btn--primary btn--lg" style="width:100%;" [disabled]="isSaving">
                @if (isSaving) {
                  <span class="spinner"></span> Saving...
                } @else {
                  💾 Save Changes
                }
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Stats Card (for students) -->
      @if (user?.role === 'student') {
        <div class="card" style="margin-top:1.5rem;">
          <div class="card__header">
            <h3>📊 My Quick Info</h3>
          </div>
          <div class="card__body">
            <div class="grid grid--4">
              <div style="text-align:center;padding:1rem;background:var(--bg-primary);border-radius:12px;">
                <div style="font-size:1.75rem;">🆔</div>
                <p style="font-size:.8rem;color:var(--text-secondary);margin-top:.25rem;">Enrollment</p>
                <p style="font-weight:700;font-size:.9rem;">{{ user?.enrollmentNumber || 'N/A' }}</p>
              </div>
              <div style="text-align:center;padding:1rem;background:var(--bg-primary);border-radius:12px;">
                <div style="font-size:1.75rem;">📚</div>
                <p style="font-size:.8rem;color:var(--text-secondary);margin-top:.25rem;">Course</p>
                <p style="font-weight:700;font-size:.9rem;">{{ user?.course || 'N/A' }}</p>
              </div>
              <div style="text-align:center;padding:1rem;background:var(--bg-primary);border-radius:12px;">
                <div style="font-size:1.75rem;">📅</div>
                <p style="font-size:.8rem;color:var(--text-secondary);margin-top:.25rem;">Semester</p>
                <p style="font-weight:700;font-size:.9rem;">Sem {{ user?.semester || 'N/A' }}</p>
              </div>
              <div style="text-align:center;padding:1rem;background:var(--bg-primary);border-radius:12px;">
                <div style="font-size:1.75rem;">📱</div>
                <p style="font-size:.8rem;color:var(--text-secondary);margin-top:.25rem;">WhatsApp</p>
                <p style="font-weight:700;font-size:.9rem;">{{ user?.phone ? '✅ Set' : '❌ Not set' }}</p>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-page { max-width: 900px; }
    .profile-avatar-wrap { position: relative; }
    .avatar-edit-overlay {
      position: absolute;
      bottom: 4px;
      right: 4px;
      width: 32px;
      height: 32px;
      background: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      border: 2px solid var(--bg-card);
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  editData = { name: '', phone: '', course: '', semester: '' as number | '' };
  selectedFile: File | null = null;
  previewUrl: string | null = null;   // instant local preview before upload
  isSaving = false;
  successMsg = '';
  error = '';

  constructor(private authService: AuthService, private toast: ToastService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((u) => {
      this.user = u;
      if (u) {
        this.editData = { name: u.name || '', phone: u.phone || '', course: u.course || '', semester: u.semester || '' };
      }
    });
  }

  onFileSelected(event: Event, input?: HTMLInputElement): void {
    const el = event.target as HTMLInputElement;
    if (!el.files?.length) return;
    this.selectedFile = el.files[0];
    // Show instant local preview
    const reader = new FileReader();
    reader.onload = (e) => this.previewUrl = e.target?.result as string;
    reader.readAsDataURL(this.selectedFile);
  }

  onSave(): void {
    this.isSaving = true; this.successMsg = ''; this.error = '';
    const formData = new FormData();
    formData.append('name', this.editData.name);
    if (this.editData.phone)    formData.append('phone',    this.editData.phone);
    if (this.editData.course)   formData.append('course',   this.editData.course);
    if (this.editData.semester) formData.append('semester', this.editData.semester.toString());
    if (this.selectedFile)      formData.append('profilePicture', this.selectedFile);

    this.authService.updateProfile(formData).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMsg = 'Profile updated successfully!';
          this.toast.success('Profile updated! ✅');
          this.selectedFile = null;
          this.previewUrl = null;  // clear preview — the stored URL will now show the real image
        }
        this.isSaving = false;
      },
      error: (err) => { this.error = err.error?.message || 'Update failed'; this.isSaving = false; }
    });
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // Add timestamp to bust browser cache after upload
  getImgUrl(path?: string | null): string {
    if (!path) return '';
    const base = path.startsWith('http') ? path : `http://localhost:5001${path}`;
    return `${base}?t=${Date.now()}`;
  }
}
