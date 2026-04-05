// User Model
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  phone?: string;
  course?: string;
  semester?: number;
  enrollmentNumber?: string;
  profilePicture?: string;
  createdAt?: string;
}

// Student Model
export interface Student {
  _id: string;
  name: string;
  enrollmentNumber: string;
  email: string;
  phone?: string;
  course: string;
  semester: number;
  isActive?: boolean;
  createdAt?: string;
}

// Attendance Record
export interface AttendanceRecord {
  _id?: string;
  student: Student | string;
  subject: string;
  date: string | Date;
  status: 'present' | 'absent' | 'late';
  markedBy?: User | string;
  course?: string;
  semester?: number;
  remarks?: string;
}

// Attendance Marking Payload
export interface AttendancePayload {
  subject: string;
  date: string;
  course?: string;
  semester?: number;
  records: { studentId: string; status: 'present' | 'absent' | 'late'; remarks?: string }[];
}

// Subject Stats
export interface SubjectStats {
  subject: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: string;
}

// Notification
export interface Notification {
  _id: string;
  recipient: string;
  student?: Student;
  type: 'absent' | 'low_attendance' | 'info' | 'warning';
  title: string;
  message: string;
  subject?: string;
  isRead: boolean;
  channels: { inApp: boolean; email: boolean; whatsapp: boolean };
  emailSent?: boolean;
  whatsappSent?: boolean;
  createdAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalStudents: number;
  todayAttendance: number;
  presentToday: number;
  absentToday: number;
  attendancePercentage: number;
  weeklyData: { _id: string; present: number; absent: number; total: number }[];
}

// Auth Response
export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message: string;
}

// API Generic Response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Theme
export type Theme = 'light' | 'dark' | 'system';
