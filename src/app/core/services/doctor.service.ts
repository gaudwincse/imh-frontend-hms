import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Branch {
  id: number;
  name: string;
}

export interface Specialization {
  id: number;
  name: string;
  description?: string;
}

export interface Doctor {
  id: number;
  employee_no: string;
  user: User;
  specialization: string;
  specialization_id?: number;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  available_days?: string[];
  slot_duration_minutes: number;
  branch: Branch;
  branch_id: number;
  status: 'active' | 'on_leave' | 'resigned';
  created_at: string;
  updated_at: string;
}

export interface CreateDoctorData {
  user_id: number;
  specialization_id: number;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  available_days?: string[];
  slot_duration_minutes?: number;
  branch_id: number;
  status?: 'active' | 'on_leave' | 'resigned';
}

export interface DoctorSearchParams {
  search?: string;
  specialization?: string;
  status?: 'active' | 'on_leave' | 'resigned';
  branch_id?: number;
  available_today?: boolean;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private readonly http = inject(HttpClient);

  constructor() {}

  // GET /api/doctors - List doctors
  getDoctors(params?: DoctorSearchParams): Observable<PaginatedResponse<Doctor>> {
    const httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof DoctorSearchParams];
        if (value !== undefined && value !== null) {
          httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Doctor>>('/api/doctors', { params: httpParams });
  }

  // GET /api/doctors/:id - Get single doctor
  getDoctor(id: number): Observable<ApiResponse<Doctor>> {
    return this.http.get<ApiResponse<Doctor>>(`/api/doctors/${id}`);
  }

  // POST /api/doctors - Create doctor
  createDoctor(data: CreateDoctorData): Observable<ApiResponse<Doctor>> {
    return this.http.post<ApiResponse<Doctor>>('/api/doctors', data);
  }

  // PUT /api/doctors/:id - Update doctor
  updateDoctor(id: number, data: Partial<CreateDoctorData>): Observable<ApiResponse<Doctor>> {
    return this.http.put<ApiResponse<Doctor>>(`/api/doctors/${id}`, data);
  }

  // DELETE /api/doctors/:id - Delete doctor
  deleteDoctor(id: number): Observable<ApiResponse<{message: string}>> {
    return this.http.delete<ApiResponse<{message: string}>>(`/api/doctors/${id}`);
  }

  // GET /api/specializations - Get specializations
  getSpecializations(): Observable<ApiResponse<Specialization[]>> {
    return this.http.get<ApiResponse<Specialization[]>>('/api/specializations');
  }

  // Get distinct specializations from doctors (for backward compatibility)
  getDoctorSpecializations(): Observable<{data: string[]}> {
    return this.http.get<{data: string[]}>('/api/doctors/specializations');
  }
}
