import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Doctor {
  id: number;
  user_id: number;
  employee_no: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  available_days: string[];
  slot_duration_minutes: number;
  branch_id: number;
  status: 'active' | 'on_leave' | 'resigned';
  created_at: string;
  updated_at: string;
  phone?: string;
  license_number?: string;
  qualifications?: string;
  is_active?: boolean;
  working_hours?: {
    days?: string;
    hours?: string;
    break?: string;
    max_appointments?: number;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
  branch?: {
    id: number;
    name: string;
  };
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
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CreateDoctorData {
  user_id: number;
  specialization: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  available_days: string[];
  slot_duration_minutes: number;
  branch_id: number;
  status?: 'active' | 'on_leave' | 'resigned';
}

export interface DoctorAvailability {
  available_days: string[];
  slot_duration_minutes: number;
  consultation_fee: number;
  status: string;
  today_appointments: Array<{
    start_time: string;
    end_time: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  constructor(private http: HttpClient) {}

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

  getAvailableDoctors(params?: DoctorSearchParams): Observable<PaginatedResponse<Doctor>> {
    const httpParams = new HttpParams();
    const allParams = { ...params, available_today: true };
    Object.keys(allParams).forEach(key => {
      const value = allParams[key as keyof typeof allParams];
      if (value !== undefined && value !== null) {
        httpParams.set(key, value.toString());
      }
    });
    return this.http.get<PaginatedResponse<Doctor>>('/api/doctors/available', { 
      params: httpParams
    });
  }

  getDoctor(id: number): Observable<{ data: Doctor }> {
    return this.http.get<{ data: Doctor }>(`/api/doctors/${id}`);
  }

  getDoctorAvailability(id: number): Observable<{ data: DoctorAvailability }> {
    return this.http.get<{ data: DoctorAvailability }>(`/api/doctors/${id}/availability`);
  }

  getSpecializations(): Observable<{ data: string[] }> {
    return this.http.get<{ data: string[] }>('/api/doctors/specializations');
  }

  createDoctor(data: CreateDoctorData): Observable<{ message: string; data: Doctor }> {
    return this.http.post<{ message: string; data: Doctor }>('/api/doctors', data);
  }

  updateDoctor(id: number, data: Partial<CreateDoctorData>): Observable<{ message: string; data: Doctor }> {
    return this.http.put<{ message: string; data: Doctor }>(`/api/doctors/${id}`, data);
  }

  deleteDoctor(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/doctors/${id}`);
  }
}