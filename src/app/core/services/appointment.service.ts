import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Appointment {
  id: number;
  appointment_no: string;
  patient_id: number;
  doctor_id: number;
  branch_id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  type: 'consultation' | 'follow_up' | 'emergency' | 'procedure';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  symptoms?: string;
  notes?: string;
  booked_by: number;
  created_at: string;
  updated_at: string;
  patient?: {
    id: number;
    first_name: string;
    last_name: string;
    patient_no: string;
    user?: {
      name: string;
      email: string;
    };
  };
  doctor?: {
    id: number;
    user?: {
      name: string;
      email: string;
    };
    specialization: string;
  };
  branch?: {
    id: number;
    name: string;
  };
  bookedByUser?: {
    id: number;
    name: string;
  };
}

export interface AppointmentSearchParams {
  search?: string;
  patient_id?: number;
  doctor_id?: number;
  branch_id?: number;
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  type?: 'consultation' | 'follow_up' | 'emergency' | 'procedure';
  date_from?: string;
  date_to?: string;
  filter?: 'today' | 'this_week' | 'this_month' | 'upcoming' | 'past';
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

export interface CreateAppointmentData {
  patient_id: number;
  doctor_id: number;
  branch_id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  type: 'consultation' | 'follow_up' | 'emergency' | 'procedure';
  symptoms?: string;
  notes?: string;
}

export interface AppointmentAvailability {
  available: boolean;
  schedule: {
    day: string;
    working_hours: string;
    break_time: string;
  };
  slots: Array<{
    start: string;
    end: string;
    display: string;
  }>;
  total_slots: number;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  constructor(private http: HttpClient) {}

  getAppointments(params?: AppointmentSearchParams): Observable<PaginatedResponse<Appointment>> {
    const httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof AppointmentSearchParams];
        if (value !== undefined && value !== null) {
          httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<PaginatedResponse<Appointment>>('/api/appointments', { params: httpParams });
  }

  getAppointment(id: number): Observable<{ data: Appointment }> {
    return this.http.get<{ data: Appointment }>(`/api/appointments/${id}`);
  }

  createAppointment(data: CreateAppointmentData): Observable<{ message: string; data: Appointment }> {
    return this.http.post<{ message: string; data: Appointment }>('/api/appointments', data);
  }

  updateAppointment(id: number, data: Partial<CreateAppointmentData>): Observable<{ message: string; data: Appointment }> {
    return this.http.put<{ message: string; data: Appointment }>(`/api/appointments/${id}`, data);
  }

  cancelAppointment(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`/api/appointments/${id}/cancel`, {});
  }

  getAvailability(params: {
    doctor_id: number;
    date: string;
    duration_minutes?: number;
  }): Observable<AppointmentAvailability> {
    const httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const value = params[key as keyof typeof params];
      if (value !== undefined && value !== null) {
        httpParams.set(key, value.toString());
      }
    });
    return this.http.get<AppointmentAvailability>('/api/appointments/availability', { params: httpParams });
  }
}