import { API_URL } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../models/models';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly API = API_URL + '/api/students';

  constructor(private http: HttpClient) {}

  getAll(filters?: { search?: string; course?: string; semester?: number }): Observable<any> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.course) params = params.set('course', filters.course);
    if (filters?.semester) params = params.set('semester', filters.semester.toString());
    return this.http.get<any>(this.API, { params });
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.API}/${id}`);
  }

  create(student: Partial<Student>): Observable<any> {
    return this.http.post<any>(this.API, student);
  }

  update(id: string, student: Partial<Student>): Observable<any> {
    return this.http.put<any>(`${this.API}/${id}`, student);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API}/${id}`);
  }
}
