import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { AttendanceService } from '../../services/attendance.service';
import { ToastService } from '../../services/toast.service';
import { Student } from '../../models/models';

interface AttendanceRow {
  student: Student;
  status: 'present' | 'absent' | 'late';
  remarks: string;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="attendance-page">
      <div class="page-header">
        <div class="page-header__title">
          <h1>Mark Attendance</h1>
          <p>Select class details and mark student attendance</p>
        </div>
      </div>

      <!-- Class Setup -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card__header">
          <h3>📋 Class Details</h3>
        </div>
        <div class="card__body">
          <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end;">
            <div class="form-group" style="flex:1;min-width:180px;margin:0;">
              <label>Subject *</label>
              <input type="text" class="form-control" [(ngModel)]="subject" placeholder="e.g. Data Structures" list="subjects-list">
              <datalist id="subjects-list">
                @for (s of commonSubjects; track s) {
                  <option [value]="s"></option>
                }
              </datalist>
            </div>
            <div class="form-group" style="flex:1;min-width:160px;margin:0;">
              <label>Course</label>
              <select class="form-control" [(ngModel)]="course" (change)="onCourseChange()">
                <option value="">All Courses</option>
                <option>B.Tech</option><option>B.Sc</option><option>BCA</option>
                <option>BBA</option><option>M.Tech</option><option>MCA</option><option>MBA</option>
              </select>
            </div>
            <div class="form-group" style="flex:1;min-width:140px;margin:0;">
              <label>Semester</label>
              <select class="form-control" [(ngModel)]="semester" (change)="onCourseChange()">
                <option value="">All</option>
                @for (s of [1,2,3,4,5,6,7,8]; track s) {
                  <option [value]="s">Sem {{ s }}</option>
                }
              </select>
            </div>
            <div class="form-group" style="flex:1;min-width:160px;margin:0;">
              <label>Date *</label>
              <input type="date" class="form-control" [(ngModel)]="date" [max]="today">
            </div>
            <button class="btn btn--primary" (click)="loadStudents()" [disabled]="!subject || !date || isLoading">
              @if (isLoading) { <span class="spinner"></span> } @else { 👥 }
              Load Students
            </button>
          </div>
        </div>
      </div>

      <!-- Attendance Table -->
      @if (attendanceRows.length > 0) {
        <div class="card">
          <div class="card__header">
            <h3>👥 Students ({{ attendanceRows.length }})</h3>
            <div style="display:flex;gap:.75rem;align-items:center;">
              <span style="font-size:.875rem;color:var(--text-secondary);">
                ✅ {{ getPresentCount() }} Present |
                ❌ {{ getAbsentCount() }} Absent |
                ⏰ {{ getLateCount() }} Late
              </span>
              <div style="display:flex;gap:.5rem;">
                <button class="btn btn--success btn--sm" (click)="markAll('present')">All Present</button>
                <button class="btn btn--danger btn--sm" (click)="markAll('absent')">All Absent</button>
              </div>
            </div>
          </div>
          <div class="card__body" style="padding:0;">
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Enrollment</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of attendanceRows; track row.student._id; let i = $index) {
                    <tr [style.background]="getRowBg(row.status)">
                      <td style="color:var(--text-muted);">{{ i + 1 }}</td>
                      <td>
                        <div style="display:flex;align-items:center;gap:.75rem;">
                          <div class="avatar avatar--sm">{{ getInitials(row.student.name) }}</div>
                          <div>
                            <p style="font-weight:600;">{{ row.student.name }}</p>
                            <p style="font-size:.78rem;color:var(--text-secondary);">{{ row.student.email }}</p>
                          </div>
                        </div>
                      </td>
                      <td><span style="font-family:monospace;font-size:.875rem;">{{ row.student.enrollmentNumber }}</span></td>
                      <td>
                        <div style="display:flex;gap:.5rem;">
                          <button class="status-btn status-btn--present" [class.active]="row.status === 'present'" (click)="setStatus(row, 'present')">✅ P</button>
                          <button class="status-btn status-btn--absent" [class.active]="row.status === 'absent'" (click)="setStatus(row, 'absent')">❌ A</button>
                          <button class="status-btn status-btn--late" [class.active]="row.status === 'late'" (click)="setStatus(row, 'late')">⏰ L</button>
                        </div>
                      </td>
                      <td>
                        <input type="text" class="form-control" style="padding:.375rem .75rem;font-size:.8rem;" [(ngModel)]="row.remarks" placeholder="Optional remark">
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
          <div style="padding:1.25rem;border-top:1px solid var(--border-color);display:flex;justify-content:flex-end;gap:.75rem;">
            <button class="btn btn--secondary" (click)="resetForm()">🔄 Reset</button>
            <button class="btn btn--primary btn--lg" (click)="submitAttendance()" [disabled]="isSaving">
              @if (isSaving) { <span class="spinner"></span> Saving... }
              @else { 💾 Save Attendance }
            </button>
          </div>
        </div>
      } @else if (searched && !isLoading) {
        <div class="card">
          <div class="empty-state">
            <div class="emoji">👥</div>
            <h3>No students found</h3>
            <p>No students match the selected course/semester filters</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .attendance-page { max-width: 1100px; }
  `]
})
export class AttendanceComponent implements OnInit {
  subject = '';
  course = '';
  semester = '';
  date = new Date().toISOString().split('T')[0];
  today = new Date().toISOString().split('T')[0];
  isLoading = false;
  isSaving = false;
  searched = false;
  attendanceRows: AttendanceRow[] = [];

  commonSubjects = [
    'Data Structures', 'Algorithms', 'DBMS', 'Operating Systems',
    'Computer Networks', 'Software Engineering', 'Web Development',
    'Machine Learning', 'Mathematics', 'Physics', 'Chemistry'
  ];

  constructor(
    private studentService: StudentService,
    private attendanceService: AttendanceService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {}

  onCourseChange(): void {
    if (this.attendanceRows.length) this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.searched = true;
    const filters: any = {};
    if (this.course) filters.course = this.course;
    if (this.semester) filters.semester = parseInt(this.semester);

    this.studentService.getAll(filters).subscribe({
      next: (res) => {
        if (res.success) {
          this.attendanceRows = res.students.map((s: Student) => ({
            student: s,
            status: 'present' as const,
            remarks: ''
          }));
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  setStatus(row: AttendanceRow, status: 'present' | 'absent' | 'late'): void {
    row.status = status;
  }

  markAll(status: 'present' | 'absent' | 'late'): void {
    this.attendanceRows.forEach(r => r.status = status);
  }

  getPresentCount(): number { return this.attendanceRows.filter(r => r.status === 'present').length; }
  getAbsentCount(): number { return this.attendanceRows.filter(r => r.status === 'absent').length; }
  getLateCount(): number { return this.attendanceRows.filter(r => r.status === 'late').length; }

  getRowBg(status: string): string {
    const map: Record<string, string> = {
      present: 'rgba(16,185,129,.04)',
      absent: 'rgba(239,68,68,.04)',
      late: 'rgba(245,158,11,.04)'
    };
    return map[status] || '';
  }

  submitAttendance(): void {
    if (!this.subject || !this.date || !this.attendanceRows.length) {
      this.toast.error('Please fill all required fields');
      return;
    }
    this.isSaving = true;
    const payload = {
      subject: this.subject,
      date: this.date,
      course: this.course || undefined,
      semester: this.semester ? parseInt(this.semester) : undefined,
      records: this.attendanceRows.map(r => ({ studentId: r.student._id, status: r.status, remarks: r.remarks }))
    };

    this.attendanceService.markAttendance(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success(`Attendance saved! ${this.getPresentCount()} present, ${this.getAbsentCount()} absent 🎉`);
          this.resetForm();
        }
        this.isSaving = false;
      },
      error: (err) => { this.toast.error(err.error?.message || 'Failed to save attendance'); this.isSaving = false; }
    });
  }

  resetForm(): void {
    this.attendanceRows = [];
    this.searched = false;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
