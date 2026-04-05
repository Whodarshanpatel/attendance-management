import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AttendanceService } from '../../services/attendance.service';
import { AuthService } from '../../services/auth.service';
import { DashboardStats, User } from '../../models/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <div class="page-header__title">
          <h1>Good {{ greeting }}, {{ getUserFirstName() }}! 👋</h1>
          <p>Here's what's happening at your college today — {{ today }}</p>
        </div>
        @if (user?.role === 'teacher') {
          <a routerLink="/attendance" class="btn btn--primary">
            ✅ Mark Attendance
          </a>
        }
      </div>

      @if (isLoading) {
        <div style="text-align:center;padding:4rem;">
          <div class="spinner spinner--dark" style="width:3rem;height:3rem;border-width:3px;margin:0 auto;"></div>
          <p style="margin-top:1rem;color:var(--text-secondary);">Loading dashboard...</p>
        </div>
      } @else {
        <!-- Stat Cards -->
        <div class="grid grid--4" style="margin-bottom:2rem;">
          <div class="stat-card" style="--card-color: #6366f1;">
            <div class="stat-card__icon" style="background:rgba(99,102,241,.15);">👥</div>
            <div class="stat-card__label">Total Students</div>
            <div class="stat-card__value">{{ stats?.totalStudents || 0 }}</div>
            <div class="stat-card__change" style="color:var(--success);">↗ Enrolled</div>
          </div>

          <div class="stat-card">
            <div class="stat-card__icon" style="background:rgba(6,182,212,.15);">📋</div>
            <div class="stat-card__label">Today's Classes</div>
            <div class="stat-card__value">{{ stats?.todayAttendance || 0 }}</div>
            <div class="stat-card__change" style="color:var(--text-secondary);">Records today</div>
          </div>

          <div class="stat-card">
            <div class="stat-card__icon" style="background:rgba(16,185,129,.15);">✅</div>
            <div class="stat-card__label">Present Today</div>
            <div class="stat-card__value" style="color:var(--success);">{{ stats?.presentToday || 0 }}</div>
            <div class="stat-card__change" style="color:var(--success);">↗ Present</div>
          </div>

          <div class="stat-card">
            <div class="stat-card__icon" style="background:rgba(239,68,68,.15);">❌</div>
            <div class="stat-card__label">Absent Today</div>
            <div class="stat-card__value" style="color:var(--danger);">{{ stats?.absentToday || 0 }}</div>
            <div class="stat-card__change" style="color:var(--danger);">↘ Absent</div>
          </div>
        </div>

        <!-- Attendance Percentage -->
        <div class="grid grid--2" style="margin-bottom:2rem;">
          <div class="card">
            <div class="card__header">
              <h3>📊 Today's Attendance Rate</h3>
            </div>
            <div class="card__body" style="text-align:center;padding:2rem;">
              <div class="percentage-ring">
                <svg viewBox="0 0 120 120" style="width:160px;height:160px;">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-color)" stroke-width="10"/>
                  <circle cx="60" cy="60" r="50" fill="none"
                    [attr.stroke]="getPercentageColor(stats?.attendancePercentage || 0)"
                    stroke-width="10"
                    stroke-linecap="round"
                    stroke-dasharray="314.16"
                    [attr.stroke-dashoffset]="getStrokeDashoffset(stats?.attendancePercentage || 0)"
                    transform="rotate(-90 60 60)"
                    style="transition: stroke-dashoffset 1s ease;"
                  />
                  <text x="60" y="65" text-anchor="middle" style="font-size:1.375rem;font-weight:800;fill:var(--text-primary);">
                    {{ stats?.attendancePercentage || 0 }}%
                  </text>
                </svg>
              </div>
              <p style="color:var(--text-secondary);margin-top:0.5rem;">Overall attendance rate</p>
              <div class="percentage-bar-wrap" style="margin-top:1rem;">
                <div class="progress-bar">
                  <div class="progress-bar__fill"
                    [class]="getProgressClass(stats?.attendancePercentage || 0)"
                    [style.width.%]="stats?.attendancePercentage || 0">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card__header">
              <h3>📈 Weekly Trend</h3>
            </div>
            <div class="card__body">
              <canvas #weeklyChart style="max-height:220px;"></canvas>
              @if (!stats?.weeklyData?.length) {
                <div class="empty-state" style="padding:2rem;">
                  <div class="emoji">📊</div>
                  <p>No data available yet</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <div class="card__header">
            <h3>⚡ Quick Actions</h3>
          </div>
          <div class="card__body">
            <div class="grid grid--4">
              @if (user?.role === 'teacher') {
                <a routerLink="/students" class="quick-action">
                  <span class="quick-action__icon">👥</span>
                  <span>Manage Students</span>
                </a>
                <a routerLink="/attendance" class="quick-action">
                  <span class="quick-action__icon">✅</span>
                  <span>Mark Attendance</span>
                </a>
              }
              <a routerLink="/reports" class="quick-action">
                <span class="quick-action__icon">📊</span>
                <span>View Reports</span>
              </a>
              <a routerLink="/notifications" class="quick-action">
                <span class="quick-action__icon">🔔</span>
                <span>Notifications</span>
              </a>
              <a routerLink="/profile" class="quick-action">
                <span class="quick-action__icon">👤</span>
                <span>My Profile</span>
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1200px; }

    .quick-action {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .5rem;
      padding: 1.25rem;
      background: var(--bg-primary);
      border-radius: 12px;
      border: 1px solid var(--border-color);
      cursor: pointer;
      text-decoration: none;
      color: var(--text-primary);
      font-size: .875rem;
      font-weight: 600;
      transition: all .2s;
      text-align: center;

      &:hover {
        background: linear-gradient(135deg, rgba(99,102,241,.1), rgba(139,92,246,.1));
        border-color: var(--primary);
        color: var(--primary);
        transform: translateY(-2px);
        box-shadow: var(--shadow-sm);
      }

      &__icon { font-size: 1.75rem; }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('weeklyChart') weeklyChartRef!: ElementRef<HTMLCanvasElement>;

  stats: DashboardStats | null = null;
  user: User | null = null;
  isLoading = true;
  greeting = '';
  today = '';
  private chart: Chart | null = null;

  constructor(
    private attendanceService: AttendanceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser;
    const hour = new Date().getHours();
    this.greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
    this.today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    this.loadStats();
  }

  ngAfterViewInit(): void {
    if (this.stats?.weeklyData?.length) {
      this.renderChart();
    }
  }

  loadStats(): void {
    this.attendanceService.getDashboardStats().subscribe({
      next: (res) => {
        if (res.success) {
          this.stats = res.stats;
          this.isLoading = false;
          setTimeout(() => this.renderChart(), 200);
        }
      },
      error: () => { this.isLoading = false; }
    });
  }

  renderChart(): void {
    if (!this.weeklyChartRef || !this.stats?.weeklyData?.length) return;
    if (this.chart) this.chart.destroy();

    const ctx = this.weeklyChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.stats.weeklyData.map(d => new Date(d._id).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }));
    const present = this.stats.weeklyData.map(d => d.present);
    const absent = this.stats.weeklyData.map(d => d.absent);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Present', data: present, backgroundColor: 'rgba(16,185,129,.7)', borderColor: '#10b981', borderWidth: 2, borderRadius: 6 },
          { label: 'Absent', data: absent, backgroundColor: 'rgba(239,68,68,.7)', borderColor: '#ef4444', borderWidth: 2, borderRadius: 6 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { position: 'bottom' } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.05)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  getStrokeDashoffset(pct: number): number {
    return 314.16 * (1 - pct / 100);
  }

  getPercentageColor(pct: number): string {
    if (pct >= 75) return '#10b981';
    if (pct >= 60) return '#f59e0b';
    return '#ef4444';
  }

  getProgressClass(pct: number): string {
    if (pct >= 75) return 'progress-bar__fill--success';
    if (pct >= 60) return 'progress-bar__fill--warning';
    return 'progress-bar__fill--danger';
  }

  getUserFirstName(): string {
    if (!this.user?.name) return '';
    return this.user.name.split(' ')[0];
  }
}
