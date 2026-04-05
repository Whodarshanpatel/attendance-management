import { API_URL } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, AuthResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = API_URL + '/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): User | null {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  get isLoggedIn(): boolean {
    return !!this.token && !!this.currentUser;
  }

  get isTeacher(): boolean {
    return this.currentUser?.role === 'teacher';
  }

  signup(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/signup`, data).pipe(
      tap((res) => this.storeAuth(res))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, { email, password }).pipe(
      tap((res) => this.storeAuth(res))
    );
  }

  updateProfile(formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.API}/profile`, formData).pipe(
      tap((res) => {
        if (res.success && res.user) {
          // Merge the returned user (which has consistent keys from our fixed controller)
          const updated: User = {
            ...this.currentUser,
            ...res.user,
            // Ensure profilePicture is set with cache-busting timestamp
            profilePicture: res.user.profilePicture
              ? `${res.user.profilePicture}?t=${Date.now()}`
              : this.currentUser?.profilePicture ?? null,
          } as User;
          localStorage.setItem('currentUser', JSON.stringify(updated));
          this.currentUserSubject.next(updated);
        }
      })
    );
  }

  private storeAuth(res: AuthResponse): void {
    if (res.success) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('currentUser', JSON.stringify(res.user));
      this.currentUserSubject.next(res.user);
      // Teachers → teacher dashboard, Students → student dashboard
      const dest = res.user.role === 'student' ? '/student-dashboard' : '/dashboard';
      this.router.navigate([dest]);
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
