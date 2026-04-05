import { API_URL } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Notification } from '../models/models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly API = API_URL + '/api/notifications';
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get<any>(this.API).pipe(
      tap((res) => {
        if (res.success) this.unreadCountSubject.next(res.unreadCount);
      })
    );
  }

  markAsRead(id: string): Observable<any> {
    return this.http.put<any>(`${this.API}/${id}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put<any>(`${this.API}/read-all`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API}/${id}`);
  }

  decrementCount(): void {
    const current = this.unreadCountSubject.value;
    if (current > 0) this.unreadCountSubject.next(current - 1);
  }
}
