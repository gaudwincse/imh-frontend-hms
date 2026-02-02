import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Staff {
  id: number;
  user_id: number;
  employee_no: string;
  staff_type: 'nurse' | 'lab_technician' | 'administrator' | 'pharmacist' | 'accountant';
  department_id?: number;
  branch_id: number;
  shift: 'morning' | 'afternoon' | 'night' | 'rotating';
  status: 'active' | 'on_leave' | 'resigned';
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  branch?: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
}

export interface StaffSearchParams {
  search?: string;
  staff_type?: 'nurse' | 'lab_technician' | 'administrator' | 'pharmacist' | 'accountant';
  status?: 'active' | 'on_leave' | 'resigned';
  department_id?: number;
  branch_id?: number;
  shift?: 'morning' | 'afternoon' | 'night' | 'rotating';
  per_page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CreateStaffData {
  user_id: number;
  staff_type: 'nurse' | 'lab_technician' | 'administrator' | 'pharmacist' | 'accountant';
  department_id?: number;
  branch_id: number;
  shift?: 'morning' | 'afternoon' | 'night' | 'rotating';
  status?: 'active' | 'on_leave' | 'resigned';
}

export interface StaffType {
  value: string;
  label: string;
}

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  constructor(private http: HttpClient) {}

  getStaff(params?: StaffSearchParams): Observable<PaginatedResponse<Staff>> {
    return this.http.get<PaginatedResponse<Staff>>('/api/staff', { params });
  }

  getStaffMember(id: number): Observable<{ data: Staff }> {
    return this.http.get<{ data: Staff }>(`/api/staff/${id}`);
  }

  getStaffTypes(): Observable<{ data: StaffType[] }> {
    return this.http.get<{ data: StaffType[] }>('/api/staff/types');
  }

  createStaff(data: CreateStaffData): Observable<{ message: string; data: Staff }> {
    return this.http.post<{ message: string; data: Staff }>('/api/staff', data);
  }

  updateStaff(id: number, data: Partial<CreateStaffData>): Observable<{ message: string; data: Staff }> {
    return this.http.put<{ message: string; data: Staff }>(`/api/staff/${id}`, data);
  }

  deleteStaff(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/staff/${id}`);
  }
}