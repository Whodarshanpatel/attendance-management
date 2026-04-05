import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AttendanceService } from '../../services/attendance.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface SubjectStat {
  subject: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: string;
}

interface DayRecord {
  date: string;
  present: number;
  absent: number;
  late: number;
  total: number;
}

interface StudentStats {
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
  subjectStats: SubjectStat[];
  recentRecords: DayRecord[];
  streak: number;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="student-dash">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header__title">
          <h1>Good {{ greeting }}, {{ getFirstName() }}! 👋</h1>
          <p>Here's your attendance summary — {{ today }}</p>
        </div>
        <a routerLink="/reports" class="btn btn--primary">📊 Full Reports</a>
      </div>

      @if (isLoading) {
        <div class="loading-wrap">
          <div class="spinner spinner--dark" style="width:3rem;height:3rem;border-width:3px;margin:0 auto;"></div>
          <p style="margin-top:1rem;color:var(--text-secondary);">Loading your attendance...</p>
        </div>
      } @else if (noRecord) {
        <!-- No student record found -->
        <div class="card" style="text-align:center;padding:4rem 2rem;">
          <div style="font-size:4rem;">📋</div>
          <h3 style="margin-top:1rem;">No attendance records yet</h3>
          <p style="color:var(--text-secondary);margin-top:.5rem;">
            Your teacher hasn't marked your attendance yet.<br>Check back later!
          </p>
        </div>
      } @else {
        <!-- Hero attendance ring + streak -->
        <div class="hero-row">
          <!-- Overall Ring -->
          <div class="card hero-card">
            <div class="hero-ring-wrap">
              <svg viewBox="0 0 160 160" class="ring-svg">
                <circle cx="80" cy="80" r="65" fill="none" stroke="var(--border-color)" stroke-width="14"/>
                <circle cx="80" cy="80" r="65" fill="none"
                  [attr.stroke]="getRingColor(stats!.percentage)"
                  stroke-width="14"
                  stroke-linecap="round"
                  [attr.stroke-dasharray]="408.41"
                  [attr.stroke-dashoffset]="getDashOffset(stats!.percentage)"
                  transform="rotate(-90 80 80)"
                  style="transition:stroke-dashoffset 1.2s ease;"/>
                <text x="80" y="74" text-anchor="middle" class="ring-pct">{{ stats!.percentage }}%</text>
                <text x="80" y="96" text-anchor="middle" class="ring-label">Overall</text>
              </svg>
            </div>
            <div class="hero-info">
              <h3 style="font-size:1.25rem;font-weight:800;margin-bottom:.5rem;">Overall Attendance</h3>
              <p [style.color]="getRingColor(stats!.percentage)" style="font-size:1rem;font-weight:700;">
                {{ getAttendanceLabel(stats!.percentage) }}
              </p>
              @if (stats!.percentage < 75) {
                <div class="warning-pill">⚠️ Below 75% threshold!</div>
              }
            </div>
          </div>

          <!-- 4 mini stat cards -->
          <div class="mini-grid">
            <div class="mini-card mini-card--blue">
              <div class="mini-icon">📚</div>
              <div class="mini-val">{{ stats!.totalClasses }}</div>
              <div class="mini-label">Total Classes</div>
            </div>
            <div class="mini-card mini-card--green">
              <div class="mini-icon">✅</div>
              <div class="mini-val">{{ stats!.present }}</div>
              <div class="mini-label">Present</div>
            </div>
            <div class="mini-card mini-card--red">
              <div class="mini-icon">❌</div>
              <div class="mini-val">{{ stats!.absent }}</div>
              <div class="mini-label">Absent</div>
            </div>
            <div class="mini-card mini-card--amber">
              <div class="mini-icon">🔥</div>
              <div class="mini-val">{{ stats!.streak }}</div>
              <div class="mini-label">Day Streak</div>
            </div>
          </div>
        </div>

        <!-- Subject breakdown -->
        <div class="grid grid--2" style="margin-bottom:1.5rem;">
          <div class="card">
            <div class="card__header">
              <h3>📖 Subject-wise Attendance</h3>
            </div>
            <div class="card__body" style="padding:0;">
              @if (!stats!.subjectStats.length) {
                <p style="padding:2rem;text-align:center;color:var(--text-secondary);">No data</p>
              }
              @for (sub of stats!.subjectStats; track sub.subject) {
                <div class="subject-row">
                  <div class="subject-row__top">
                    <span class="subject-name">{{ sub.subject }}</span>
                    <span class="subject-pct" [style.color]="getRingColor(+sub.percentage)">
                      {{ sub.percentage }}%
                    </span>
                  </div>
                  <div class="subject-bar">
                    <div class="subject-bar__fill"
                      [style.width.%]="sub.percentage"
                      [style.background]="getRingColor(+sub.percentage)">
                    </div>
                  </div>
                  <div class="subject-row__meta">
                    <span>✅ {{ sub.present }} present</span>
                    <span>❌ {{ sub.absent }} absent</span>
                    @if (sub.late) { <span>⏰ {{ sub.late }} late</span> }
                    <span style="color:var(--text-muted);">/ {{ sub.total }} total</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Trend Chart -->
          <div class="card">
            <div class="card__header">
              <h3>📈 30-Day Trend</h3>
            </div>
            <div class="card__body">
              @if (stats!.recentRecords.length) {
                <canvas #trendChart style="max-height:280px;"></canvas>
              } @else {
                <div class="empty-state" style="padding:2rem;">
                  <div class="emoji">📊</div>
                  <p>No recent data</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Eligibility card -->
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card__header">
            <h3>🎓 Exam Eligibility Calculator</h3>
          </div>
          <div class="card__body">
            <div class="eligibility-grid">
              <div class="elig-item">
                <div class="elig-icon">{{ stats!.percentage >= 75 ? '✅' : '❌' }}</div>
                <div class="elig-label">Current Status</div>
                <div class="elig-val" [style.color]="stats!.percentage >= 75 ? 'var(--success)' : 'var(--danger)'">
                  {{ stats!.percentage >= 75 ? 'Eligible' : 'Not Eligible' }}
                </div>
              </div>
              <div class="elig-item">
                <div class="elig-icon">📋</div>
                <div class="elig-label">Classes to Attend</div>
                <div class="elig-val" style="color:var(--primary);">{{ classesNeeded() }}</div>
              </div>
              <div class="elig-item">
                <div class="elig-icon">📅</div>
                <div class="elig-label">Can Miss</div>
                <div class="elig-val" style="color:var(--warning);">{{ canMiss() }} classes</div>
              </div>
              <div class="elig-item">
                <div class="elig-icon">🎯</div>
                <div class="elig-label">Target</div>
                <div class="elig-val" style="color:var(--text-secondary);">75% minimum</div>
              </div>
            </div>
          </div>
        </div>

        <!-- My Details -->
        <div class="card">
          <div class="card__header">
            <h3>🧑‍🎓 My Details</h3>
          </div>
          <div class="card__body">
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Name</span>
                <span class="detail-val">{{ user?.name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Enrollment No.</span>
                <span class="detail-val">{{ user?.enrollmentNumber || studentRecord?.enrollmentNumber || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Course</span>
                <span class="detail-val">{{ user?.course || studentRecord?.course || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Semester</span>
                <span class="detail-val">Semester {{ user?.semester || studentRecord?.semester || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email</span>
                <span class="detail-val">{{ user?.email }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">WhatsApp Alerts</span>
                <span class="detail-val">{{ user?.phone ? '✅ ' + user?.phone : '❌ Not set' }}</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .student-dash { max-width: 1100px; }
    .loading-wrap { text-align: center; padding: 4rem; }

    /* Hero row */
    .hero-row {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      align-items: start;
    }
    .hero-card {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 2rem !important;
      min-width: 320px;
    }
    .hero-ring-wrap { flex-shrink: 0; }
    .ring-svg { width: 160px; height: 160px; }
    .ring-pct {
      font-size: 1.75rem;
      font-weight: 900;
      fill: var(--text-primary);
      font-family: inherit;
    }
    .ring-label {
      font-size: 0.75rem;
      fill: var(--text-secondary);
      font-family: inherit;
    }
    .warning-pill {
      margin-top: .75rem;
      background: rgba(239,68,68,.12);
      color: var(--danger);
      border-radius: 8px;
      padding: .375rem .75rem;
      font-size: .8rem;
      font-weight: 600;
      display: inline-block;
    }

    /* Mini stat cards */
    .mini-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 1rem;
    }
    .mini-card {
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .25rem;
      text-align: center;
      border: 1px solid var(--border-color);
    }
    .mini-card--blue  { background: rgba(99,102,241,.08); }
    .mini-card--green { background: rgba(16,185,129,.08); }
    .mini-card--red   { background: rgba(239,68,68,.08);  }
    .mini-card--amber { background: rgba(245,158,11,.08); }
    .mini-icon { font-size: 1.75rem; }
    .mini-val  { font-size: 2rem; font-weight: 900; color: var(--text-primary); line-height: 1; }
    .mini-label { font-size: .75rem; color: var(--text-secondary); font-weight: 600; }

    /* Subject rows */
    .subject-row {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
      &:last-child { border-bottom: none; }
    }
    .subject-row__top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: .5rem;
    }
    .subject-name { font-weight: 700; font-size: .9rem; color: var(--text-primary); }
    .subject-pct  { font-weight: 800; font-size: 1rem; }
    .subject-bar  {
      height: 8px;
      background: var(--border-color);
      border-radius: 99px;
      overflow: hidden;
      margin-bottom: .35rem;
    }
    .subject-bar__fill {
      height: 100%;
      border-radius: 99px;
      transition: width 1s ease;
    }
    .subject-row__meta {
      display: flex;
      gap: .75rem;
      font-size: .75rem;
      color: var(--text-secondary);
      flex-wrap: wrap;
    }

    /* Eligibility */
    .eligibility-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }
    .elig-item {
      text-align: center;
      padding: 1.25rem 1rem;
      background: var(--bg-primary);
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }
    .elig-icon  { font-size: 1.75rem; margin-bottom: .5rem; }
    .elig-label { font-size: .75rem; color: var(--text-secondary); margin-bottom: .25rem; font-weight: 600; }
    .elig-val   { font-size: 1.1rem; font-weight: 800; }

    /* Details */
    .details-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: .25rem;
      padding: .75rem 1rem;
      background: var(--bg-primary);
      border-radius: 10px;
    }
    .detail-label { font-size: .75rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: .05em; }
    .detail-val   { font-size: .9rem; font-weight: 700; color: var(--text-primary); }

    @media (max-width: 768px) {
      .hero-row { grid-template-columns: 1fr; }
      .hero-card { min-width: unset; flex-direction: column; }
      .mini-grid { grid-template-columns: repeat(4, 1fr); }
      .eligibility-grid { grid-template-columns: repeat(2, 1fr); }
      .details-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class StudentDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;

  user: User | null = null;
  studentRecord: any = null;
  stats: StudentStats | null = null;
  isLoading = true;
  noRecord = false;
  greeting = '';
  today = '';
  private chart: Chart | null = null;

  constructor(
    private authService: AuthService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser;
    const h = new Date().getHours();
    this.greeting = h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
    this.today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    this.loadData();
  }

  ngAfterViewInit(): void {}

  loadData(): void {
    this.attendanceService.getMyStudentRecord().subscribe({
      next: (res) => {
        if (res.success && res.student) {
          this.studentRecord = res.student;
          this.loadStats(res.student._id);
        } else {
          this.noRecord = true;
          this.isLoading = false;
        }
      },
      error: () => {
        this.noRecord = true;
        this.isLoading = false;
      }
    });
  }

  loadStats(studentId: string): void {
    this.attendanceService.getStudentDashboard(studentId).subscribe({
      next: (res) => {
        if (res.success) {
          this.stats = res.stats;
          this.isLoading = false;
          if (this.stats!.recentRecords.length) {
            setTimeout(() => this.renderChart(), 150);
          }
        }
      },
      error: () => { this.isLoading = false; }
    });
  }

  renderChart(): void {
    if (!this.trendChartRef || !this.stats?.recentRecords.length) return;
    if (this.chart) this.chart.destroy();
    const ctx = this.trendChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels  = this.stats.recentRecords.map(d => new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
    const present = this.stats.recentRecords.map(d => d.present);
    const absent  = this.stats.recentRecords.map(d => d.absent);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Present',
            data: present,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,.15)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#10b981',
          },
          {
            label: 'Absent',
            data: absent,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#ef4444',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { position: 'bottom' } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,.05)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  getFirstName(): string {
    return this.user?.name?.split(' ')[0] || '';
  }

  getRingColor(pct: number): string {
    if (pct >= 75) return '#10b981';
    if (pct >= 60) return '#f59e0b';
    return '#ef4444';
  }

  getDashOffset(pct: number): number {
    return 408.41 * (1 - pct / 100);
  }

  getAttendanceLabel(pct: number): string {
    if (pct >= 90) return '🌟 Excellent!';
    if (pct >= 75) return '✅ Good standing';
    if (pct >= 60) return '⚠️ At risk';
    return '🚨 Critical!';
  }

  classesNeeded(): string {
    if (!this.stats) return '0';
    const { present, totalClasses } = this.stats;
    if (present / totalClasses >= 0.75) return 'Already eligible! ✅';
    // Need: present + x >= 0.75 * (total + x)  →  x >= (0.75*total - present) / 0.25
    const needed = Math.ceil((0.75 * totalClasses - present) / 0.25);
    return `${needed} more classes`;
  }

  canMiss(): number {
    if (!this.stats) return 0;
    const { present, totalClasses } = this.stats;
    // Already eligible: can miss x where (present)/(total+x) >= 0.75  →  x <= (present/0.75) - total
    const canMiss = Math.floor(present / 0.75 - totalClasses);
    return Math.max(0, canMiss);
  }
}
