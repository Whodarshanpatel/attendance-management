import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { ToastService } from '../../services/toast.service';
import { Student } from '../../models/models';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="students-page">
      <div class="page-header">
        <div class="page-header__title">
          <h1>Student Management</h1>
          <p>{{ students.length }} students enrolled</p>
        </div>
        <button class="btn btn--primary" (click)="openModal()">
          ➕ Add Student
        </button>
      </div>

      <!-- Filters -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card__body">
          <div style="display:flex;gap:1rem;flex-wrap:wrap;">
            <div style="flex:1;min-width:200px;">
              <input type="text" class="form-control" placeholder="🔍 Search by name, email or enrollment..."
                [(ngModel)]="searchTerm" (input)="onSearch()">
            </div>
            <select class="form-control" style="width:160px;" [(ngModel)]="filterCourse" (change)="onSearch()">
              <option value="">All Courses</option>
              <option>B.Tech</option><option>B.Sc</option><option>BCA</option>
              <option>BBA</option><option>M.Tech</option><option>MCA</option><option>MBA</option>
            </select>
            <select class="form-control" style="width:140px;" [(ngModel)]="filterSemester" (change)="onSearch()">
              <option value="">All Semesters</option>
              @for (s of [1,2,3,4,5,6,7,8]; track s) {
                <option [value]="s">Semester {{ s }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="card__body" style="padding:0;">
          @if (isLoading) {
            <div style="text-align:center;padding:3rem;">
              <div class="spinner spinner--dark" style="width:2.5rem;height:2.5rem;border-width:3px;margin:0 auto;"></div>
            </div>
          } @else if (students.length === 0) {
            <div class="empty-state">
              <div class="emoji">👥</div>
              <h3>No students found</h3>
              <p>Add students to get started</p>
            </div>
          } @else {
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Enrollment</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (student of students; track student._id; let i = $index) {
                    <tr>
                      <td style="color:var(--text-muted);font-weight:500;">{{ i + 1 }}</td>
                      <td>
                        <div style="display:flex;align-items:center;gap:.75rem;">
                          <div class="avatar avatar--sm">{{ getInitials(student.name) }}</div>
                          <div>
                            <p style="font-weight:600;">{{ student.name }}</p>
                            <p style="font-size:.8rem;color:var(--text-secondary);">{{ student.email }}</p>
                          </div>
                        </div>
                      </td>
                      <td><span style="font-family:monospace;font-weight:600;font-size:.875rem;">{{ student.enrollmentNumber }}</span></td>
                      <td><span class="badge badge--info">{{ student.course }}</span></td>
                      <td><span class="badge" style="background:rgba(139,92,246,.15);color:#7c3aed;">Sem {{ student.semester }}</span></td>
                      <td style="color:var(--text-secondary);font-size:.875rem;">{{ student.phone || '—' }}</td>
                      <td>
                        <div style="display:flex;gap:.5rem;">
                          <button class="btn btn--secondary btn--sm" (click)="editStudent(student)">✏️ Edit</button>
                          <button class="btn btn--danger btn--sm" (click)="deleteStudent(student)">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Modal -->
    @if (showModal) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal__header">
            <h2>{{ isEditing ? '✏️ Edit Student' : '➕ Add Student' }}</h2>
            <button (click)="closeModal()" style="background:none;border:none;cursor:pointer;font-size:1.5rem;color:var(--text-muted);">×</button>
          </div>
          <div class="modal__body">
            <form (ngSubmit)="saveStudent()" #studentForm="ngForm">
              <div class="grid grid--2">
                <div class="form-group">
                  <label>Full Name *</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.name" name="name" required placeholder="Student name">
                </div>
                <div class="form-group">
                  <label>Enrollment Number *</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.enrollmentNumber" name="enrollmentNumber" required placeholder="2021BTCS001">
                </div>
              </div>
              <div class="grid grid--2">
                <div class="form-group">
                  <label>Email *</label>
                  <input type="email" class="form-control" [(ngModel)]="formData.email" name="email" required placeholder="student@college.edu">
                </div>
                <div class="form-group">
                  <label>Phone (WhatsApp)</label>
                  <input type="tel" class="form-control" [(ngModel)]="formData.phone" name="phone" placeholder="+91 9876543210">
                </div>
              </div>
              <div class="grid grid--2">
                <div class="form-group">
                  <label>Course *</label>
                  <select class="form-control" [(ngModel)]="formData.course" name="course" required>
                    <option value="">Select Course</option>
                    <option>B.Tech</option><option>B.Sc</option><option>BCA</option>
                    <option>BBA</option><option>M.Tech</option><option>MCA</option><option>MBA</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Semester *</label>
                  <select class="form-control" [(ngModel)]="formData.semester" name="semester" required>
                    <option value="">Select</option>
                    @for (s of [1,2,3,4,5,6,7,8]; track s) {
                      <option [value]="s">Semester {{ s }}</option>
                    }
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div class="modal__footer">
            <button class="btn btn--secondary" (click)="closeModal()">Cancel</button>
            <button class="btn btn--primary" (click)="saveStudent()" [disabled]="isSaving || !formData.name || !formData.enrollmentNumber || !formData.email || !formData.course || !formData.semester">
              @if (isSaving) { <span class="spinner"></span> Saving... }
              @else { 💾 {{ isEditing ? 'Update' : 'Add' }} Student }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`.students-page { max-width: 1200px; }`]
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  isLoading = false;
  showModal = false;
  isEditing = false;
  isSaving = false;
  searchTerm = '';
  filterCourse = '';
  filterSemester = '';
  selectedStudentId = '';

  formData: Partial<Student> = { name: '', enrollmentNumber: '', email: '', phone: '', course: '', semester: undefined };

  constructor(private studentService: StudentService, private toast: ToastService) {}

  ngOnInit(): void { this.loadStudents(); }

  loadStudents(): void {
    this.isLoading = true;
    const filters: any = {};
    if (this.searchTerm) filters.search = this.searchTerm;
    if (this.filterCourse) filters.course = this.filterCourse;
    if (this.filterSemester) filters.semester = parseInt(this.filterSemester);

    this.studentService.getAll(filters).subscribe({
      next: (res) => { if (res.success) this.students = res.students; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  onSearch(): void { this.loadStudents(); }

  openModal(): void {
    this.isEditing = false;
    this.formData = { name: '', enrollmentNumber: '', email: '', phone: '', course: '', semester: undefined };
    this.showModal = true;
  }

  editStudent(student: Student): void {
    this.isEditing = true;
    this.selectedStudentId = student._id;
    this.formData = { name: student.name, enrollmentNumber: student.enrollmentNumber, email: student.email, phone: student.phone || '', course: student.course, semester: student.semester };
    this.showModal = true;
  }

  saveStudent(): void {
    this.isSaving = true;
    const obs = this.isEditing
      ? this.studentService.update(this.selectedStudentId, this.formData)
      : this.studentService.create(this.formData);

    obs.subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success(this.isEditing ? 'Student updated! ✅' : 'Student added! 🎉');
          this.closeModal();
          this.loadStudents();
        }
        this.isSaving = false;
      },
      error: (err) => { this.toast.error(err.error?.message || 'Operation failed'); this.isSaving = false; }
    });
  }

  deleteStudent(student: Student): void {
    if (!confirm(`Delete ${student.name}? This action cannot be undone.`)) return;
    this.studentService.delete(student._id).subscribe({
      next: (res) => { if (res.success) { this.toast.success('Student deleted'); this.loadStudents(); } },
      error: (err) => this.toast.error(err.error?.message || 'Delete failed')
    });
  }

  closeModal(): void { this.showModal = false; }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
