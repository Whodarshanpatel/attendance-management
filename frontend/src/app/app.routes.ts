import { Routes } from '@angular/router';
import { authGuard, guestGuard, teacherGuard } from './guards/auth.guard';
import { LandingComponent } from './components/landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full', canActivate: [guestGuard] },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./components/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('./components/auth/signup/signup.component').then((m) => m.SignupComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'student-dashboard',
        loadComponent: () =>
          import('./components/student-dashboard/student-dashboard.component').then(
            (m) => m.StudentDashboardComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'students',
        canActivate: [teacherGuard],
        loadComponent: () =>
          import('./components/students/students.component').then((m) => m.StudentsComponent),
      },
      {
        path: 'attendance',
        canActivate: [teacherGuard],
        loadComponent: () =>
          import('./components/attendance/attendance.component').then((m) => m.AttendanceComponent),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./components/reports/reports.component').then((m) => m.ReportsComponent),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./components/notifications/notifications.component').then(
            (m) => m.NotificationsComponent
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./components/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];
