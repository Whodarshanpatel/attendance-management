import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../services/attendance.service';
import { StudentService } from '../../services/student.service';
import { AuthService } from '../../services/auth.service';
import { Student, AttendanceRecord, SubjectStats, User } from '../../models/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-page">
      <div class="page-header">
        <div class="page-header__title">
          <h1>Attendance Reports</h1>
          <p>View and analyze attendance records</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card__body">
          <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end;">
            @if (currentUser?.role === 'teacher') {
              <div class="form-group" style="flex:1;min-width:200px;margin:0;">
                <label>Student</label>
                <select class="form-control" [(ngModel)]="selectedStudentId" (change)="loadReport()">
                  <option value="">Select Student</option>
                  @for (s of students; track s._id) {
                    <option [value]="s._id">{{ s.name }} ({{ s.enrollmentNumber }})</option>
                  }
                </select>
              </div>
            }
            <div class="form-group" style="flex:1;min-width:180px;margin:0;">
              <label>Subject</label>
              <input type="text" class="form-control" [(ngModel)]="filterSubject" placeholder="Filter by subject" (change)="loadReport()">
            </div>
            <div class="form-group" style="min-width:150px;margin:0;">
              <label>From Date</label>
              <input type="date" class="form-control" [(ngModel)]="startDate" (change)="loadReport()">
            </div>
            <div class="form-group" style="min-width:150px;margin:0;">
              <label>To Date</label>
              <input type="date" class="form-control" [(ngModel)]="endDate" (change)="loadReport()">
            </div>
            <button class="btn btn--primary" (click)="loadReport()" [disabled]="isLoading">
              🔍 Generate Report
            </button>
          </div>
        </div>
      </div>

      @if (isLoading) {
        <div style="text-align:center;padding:3rem;">
          <div class="spinner spinner--dark" style="width:2.5rem;height:2.5rem;border-width:3px;margin:0 auto;"></div>
          <p style="margin-top:1rem;color:var(--text-secondary);">Loading report...</p>
        </div>
      } @else if (records.length > 0) {
        <!-- Subject Stats -->
        <div class="grid grid--3" style="margin-bottom:1.5rem;">
          @for (stat of subjectStats; track stat.subject) {
            <div class="card">
              <div class="card__body">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.75rem;">
                  <div>
                    <p style="font-weight:700;font-size:1rem;">{{ stat.subject }}</p>
                    <p style="font-size:.8rem;color:var(--text-secondary);">{{ stat.total }} classes</p>
                  </div>
                  <span style="font-size:1.5rem;font-weight:800;"
                    [style.color]="getColorForPct(+stat.percentage)">
                    {{ stat.percentage }}%
                  </span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar__fill" [class]="getProgressClass(+stat.percentage)"
                    [style.width.%]="stat.percentage">
                  </div>
                </div>
                <div style="display:flex;gap:1rem;margin-top:.75rem;font-size:.8rem;">
                  <span style="color:var(--success);">✅ Present: {{ stat.present }}</span>
                  <span style="color:var(--danger);">❌ Absent: {{ stat.absent }}</span>
                  @if (stat.late) {
                    <span style="color:var(--warning);">⏰ Late: {{ stat.late }}</span>
                  }
                </div>
                @if (+stat.percentage < 75) {
                  <div class="alert alert--warning" style="margin-top:.75rem;padding:.5rem .75rem;font-size:.78rem;">
                    ⚠️ Below 75% threshold!
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- Chart -->
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card__header">
            <h3>📊 Subject-wise Attendance</h3>
          </div>
          <div class="card__body">
            <canvas #pieChart style="max-height:300px;"></canvas>
          </div>
        </div>

        <!-- Records Table -->
        <div class="card">
          <div class="card__header">
            <h3>📋 Attendance Records ({{ records.length }})</h3>
          </div>
          <div class="card__body" style="padding:0;">
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Marked By</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  @for (rec of records; track rec._id) {
                    <tr>
                      <td>{{ formatDate(rec.date) }}</td>
                      <td style="font-weight:600;">{{ rec.subject }}</td>
                      <td><span class="badge badge--{{ rec.status }}">{{ rec.status }}</span></td>
                      <td style="color:var(--text-secondary);font-size:.875rem;">{{ getTeacherName(rec.markedBy) }}</td>
                      <td style="color:var(--text-secondary);font-size:.875rem;">{{ rec.remarks || '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      } @else if (hasSearched) {
        <div class="card">
          <div class="empty-state">
            <div class="emoji">📊</div>
            <h3>No attendance records</h3>
            <p>No records found for the selected filters</p>
          </div>
        </div>
      } @else {
        <div class="card" style="border:2px dashed var(--border-color);box-shadow:none;">
          <div class="empty-state">
            <div class="emoji">🔍</div>
            <h3>Generate a Report</h3>
            <p>Select filters above and click "Generate Report" to view attendance data</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`.reports-page { max-width: 1100px; }`]
})
export class ReportsComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;

  records: AttendanceRecord[] = [];
  subjectStats: SubjectStats[] = [];
  students: Student[] = [];
  currentUser: User | null = null;
  selectedStudentId = '';
  filterSubject = '';
  startDate = '';
  endDate = '';
  isLoading = false;
  hasSearched = false;
  private pieChart: Chart | null = null;

  constructor(
    private attendanceService: AttendanceService,
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    if (this.currentUser?.role === 'teacher') {
      this.studentService.getAll().subscribe(res => { if (res.success) this.students = res.students; });
    } else {
      // Students see their own attendance
      this.loadReport();
    }
  }

  ngAfterViewInit(): void {}

  loadReport(): void {
    const studentId = this.currentUser?.role === 'student'
      ? this.getStudentIdFromUser()
      : this.selectedStudentId;

    if (!studentId) return;

    this.isLoading = true;
    this.hasSearched = true;
    const filters: any = {};
    if (this.filterSubject) filters.subject = this.filterSubject;
    if (this.startDate) filters.startDate = this.startDate;
    if (this.endDate) filters.endDate = this.endDate;

    this.attendanceService.getByStudent(studentId, filters).subscribe({
      next: (res) => {
        if (res.success) {
          this.records = res.records;
          this.subjectStats = res.subjectStats;
          setTimeout(() => this.renderPieChart(), 200);
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  getStudentIdFromUser(): string {
    // For student role, they need to have a student record linked
    return this.currentUser?.id || '';
  }

  renderPieChart(): void {
    if (!this.pieChartRef || !this.subjectStats.length) return;
    if (this.pieChart) this.pieChart.destroy();

    const ctx = this.pieChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

    this.pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.subjectStats.map(s => `${s.subject} (${s.percentage}%)`),
        datasets: [{
          data: this.subjectStats.map(s => s.present),
          backgroundColor: colors.slice(0, this.subjectStats.length),
          borderWidth: 3,
          borderColor: 'var(--bg-card)'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'right' } },
        cutout: '65%'
      }
    });
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  getTeacherName(markedBy: any): string {
    return typeof markedBy === 'object' ? markedBy?.name || '—' : '—';
  }

  getColorForPct(pct: number): string {
    if (pct >= 75) return 'var(--success)';
    if (pct >= 60) return 'var(--warning)';
    return 'var(--danger)';
  }

  getProgressClass(pct: number): string {
    if (pct >= 75) return 'progress-bar__fill--success';
    if (pct >= 60) return 'progress-bar__fill--warning';
    return 'progress-bar__fill--danger';
  }
}
