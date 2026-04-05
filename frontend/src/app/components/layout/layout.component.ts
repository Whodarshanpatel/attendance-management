import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/models';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.sidebar--collapsed]="sidebarCollapsed">
        <div class="sidebar__header">
          <div class="sidebar__logo">
            <div class="logo-icon">🎓</div>
            <span class="logo-text">AttendEase</span>
          </div>
          <button class="sidebar__toggle" (click)="toggleSidebar()">
            {{ sidebarCollapsed ? '▶' : '◀' }}
          </button>
        </div>

        <nav class="sidebar__nav">
          @if (user?.role === 'teacher') {
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📊</span>
              <span class="nav-label">Dashboard</span>
            </a>
            <a routerLink="/students" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">👥</span>
              <span class="nav-label">Students</span>
            </a>
            <a routerLink="/attendance" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">✅</span>
              <span class="nav-label">Mark Attendance</span>
            </a>
          } @else {
            <a routerLink="/student-dashboard" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">🏠</span>
              <span class="nav-label">My Dashboard</span>
            </a>
          }
          <a routerLink="/reports" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📈</span>
            <span class="nav-label">Reports</span>
          </a>
          <a routerLink="/notifications" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🔔</span>
            <span class="nav-label">Notifications</span>
            @if (unreadCount > 0) {
              <span class="nav-badge">{{ unreadCount }}</span>
            }
          </a>
          <a routerLink="/profile" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">👤</span>
            <span class="nav-label">Profile</span>
          </a>
          <a routerLink="/settings" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">⚙️</span>
            <span class="nav-label">Settings</span>
          </a>
        </nav>

        <div class="sidebar__footer">
          <div class="user-info">
            <div class="avatar avatar--sm">
              @if (user?.profilePicture) {
                <img [src]="getImgUrl(user?.profilePicture)" [alt]="user?.name || ''" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
              } @else {
                {{ getInitials(user?.name) }}
              }
            </div>
            <div class="user-details">
              <p class="user-name">{{ user?.name }}</p>
              <p class="user-role">{{ user?.role }}</p>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()">🚪</button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Top Navbar -->
        <header class="navbar">
          <div class="navbar__left">
            <button class="btn--icon" (click)="toggleSidebar()" style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:var(--text-secondary);">☰</button>
            <h2 class="navbar__title">{{ getPageTitle() }}</h2>
          </div>

          <div class="navbar__right">
            <!-- Theme Toggle -->
            <div class="theme-toggle">
              <button class="theme-btn" [class.active]="currentTheme === 'light'" (click)="setTheme('light')" title="Light Mode">☀️</button>
              <button class="theme-btn" [class.active]="currentTheme === 'system'" (click)="setTheme('system')" title="System Mode">🖥️</button>
              <button class="theme-btn" [class.active]="currentTheme === 'dark'" (click)="setTheme('dark')" title="Dark Mode">🌙</button>
            </div>

            <!-- Notifications Bell -->
            <div class="notif-bell" [routerLink]="['/notifications']" style="cursor:pointer;position:relative;">
              <span class="bell-icon" [class.bell-ring]="unreadCount > 0">🔔</span>
              @if (unreadCount > 0) {
                <span class="bell-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
              }
            </div>

            <!-- User Avatar -->
            <div class="navbar__user" [routerLink]="['/profile']" style="cursor:pointer;">
              <div class="avatar avatar--sm">
                @if (user?.profilePicture) {
                  <img [src]="getImgUrl(user?.profilePicture)" [alt]="user?.name || ''" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
                } @else {
                  {{ getInitials(user?.name) }}
                }
              </div>
              <span class="navbar__username">{{ getUserFirstName() }}</span>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .sidebar {
      width: var(--sidebar-width);
      background: var(--bg-sidebar);
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      z-index: 100;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;

      &--collapsed {
        width: 72px;
        .logo-text, .nav-label, .user-details { display: none; }
        .sidebar__toggle { transform: none; }
      }

      &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1rem;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }

      &__logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        .logo-icon { font-size: 1.75rem; }
        .logo-text {
          font-size: 1.125rem;
          font-weight: 800;
          color: white;
          white-space: nowrap;
          background: linear-gradient(135deg, #818cf8, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      &__toggle {
        background: rgba(255,255,255,0.1);
        border: none;
        color: rgba(255,255,255,0.7);
        width: 28px;
        height: 28px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.2s;
        &:hover { background: rgba(255,255,255,0.2); }
      }

      &__nav {
        flex: 1;
        padding: 1rem 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        overflow-y: auto;
      }

      &__footer {
        padding: 1rem;
        border-top: 1px solid rgba(255,255,255,0.1);
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      color: rgba(255,255,255,0.65);
      transition: all 0.2s;
      text-decoration: none;
      white-space: nowrap;
      position: relative;

      .nav-icon { font-size: 1.1rem; flex-shrink: 0; }
      .nav-label { font-size: 0.9rem; font-weight: 500; }
      .nav-badge {
        margin-left: auto;
        background: #ef4444;
        color: white;
        border-radius: 10px;
        font-size: 0.7rem;
        font-weight: 700;
        padding: 0.15rem 0.4rem;
        min-width: 18px;
        text-align: center;
      }

      &:hover {
        background: rgba(255,255,255,0.1);
        color: white;
      }

      &.active {
        background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3));
        color: white;
        border: 1px solid rgba(99,102,241,0.4);
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.5);
    }

    .logout-btn {
      background: rgba(239,68,68,0.2);
      border: none;
      font-size: 1rem;
      cursor: pointer;
      padding: 0.4rem;
      border-radius: 8px;
      transition: all 0.2s;
      flex-shrink: 0;
      &:hover { background: rgba(239,68,68,0.4); }
    }

    /* Navbar */
    .navbar {
      height: var(--navbar-height);
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 50;

      &__left {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      &__title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      &__right {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      &__user {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0.75rem;
        border-radius: 10px;
        transition: background 0.2s;
        &:hover { background: var(--bg-primary); }
      }

      &__username {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    /* Theme Toggle */
    .theme-toggle {
      display: flex;
      background: var(--bg-primary);
      border-radius: 10px;
      padding: 0.25rem;
      gap: 0.125rem;
      border: 1px solid var(--border-color);
    }

    .theme-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.375rem 0.5rem;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.2s;
      line-height: 1;

      &.active {
        background: var(--bg-card);
        box-shadow: 0 1px 3px rgba(0,0,0,0.15);
      }

      &:hover:not(.active) { background: rgba(0,0,0,0.05); }
    }

    /* Notification Bell */
    .notif-bell {
      position: relative;
      padding: 0.5rem;
      border-radius: 10px;
      transition: background 0.2s;
      &:hover { background: var(--bg-primary); }
    }

    .bell-icon { font-size: 1.2rem; }

    .bell-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      background: #ef4444;
      color: white;
      border-radius: 10px;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.1rem 0.3rem;
      min-width: 16px;
      text-align: center;
      line-height: 1.4;
    }

    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); }
      .main-content { margin-left: 0 !important; }
      .navbar__title { display: none; }
    }
  `]
})
export class LayoutComponent implements OnInit {
  user: User | null = null;
  sidebarCollapsed = false;
  currentTheme: 'light' | 'dark' | 'system' = 'system';
  unreadCount = 0;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((u) => (this.user = u));
    this.themeService.theme$.subscribe((t) => (this.currentTheme = t));
    this.notificationService.unreadCount$.subscribe((c) => (this.unreadCount = c));
    this.notificationService.getAll().subscribe();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.themeService.setTheme(theme);
  }

  logout(): void {
    this.authService.logout();
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getImgUrl(path?: string | null): string {
    if (!path) return '';
    return path.startsWith('http') ? path : `http://localhost:5001${path}`;
  }

  getUserFirstName(): string {
    if (!this.user?.name) return '';
    return this.user.name.split(' ')[0];
  }

  getPageTitle(): string {
    const path = window.location.pathname;
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/student-dashboard': 'My Dashboard',
      '/students': 'Student Management',
      '/attendance': 'Mark Attendance',
      '/reports': 'Attendance Reports',
      '/notifications': 'Notifications',
      '/profile': 'My Profile',
      '/settings': 'Settings',
    };
    return titles[path] || 'AttendEase';
  }
}
