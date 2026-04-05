import { API_URL } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttendancePayload } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly API = API_URL + '/api/attendance';
  private readonly STUDENTS_API = API_URL + '/api/students';

  constructor(private http: HttpClient) {}

  markAttendance(payload: AttendancePayload): Observable<any> {
    return this.http.post<any>(this.API, payload);
  }

  getByStudent(studentId: string, filters?: { subject?: string; startDate?: string; endDate?: string }): Observable<any> {
    let params = new HttpParams();
    if (filters?.subject) params = params.set('subject', filters.subject);
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);
    return this.http.get<any>(`${this.API}/student/${studentId}`, { params });
  }

  getByDate(filters: { date?: string; subject?: string; course?: string; semester?: number }): Observable<any> {
    let params = new HttpParams();
    if (filters.date) params = params.set('date', filters.date);
    if (filters.subject) params = params.set('subject', filters.subject);
    if (filters.course) params = params.set('course', filters.course);
    if (filters.semester) params = params.set('semester', filters.semester.toString());
    return this.http.get<any>(this.API, { params });
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.API}/stats`);
  }

  getStudentDashboard(studentId: string): Observable<any> {
    return this.http.get<any>(`${this.API}/student-dashboard/${studentId}`);
  }

  getMyStudentRecord(): Observable<any> {
    return this.http.get<any>(`${this.STUDENTS_API}/me`);
  }
}
