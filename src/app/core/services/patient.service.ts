import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Patient {
  id: number;
  user_id?: number;
  patient_no: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  blood_group?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_policy_no?: string;
  branch_id?: number;
  status: 'active' | 'inactive' | 'deceased';
  created_at: string;
  updated_at: string;
  branch?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    name: string;
  };
}

export interface PatientSearchParams {
  [key: string]: string | number | undefined;
  query?: string;
  first_name?: string;
  last_name?: string;
  patient_no?: string;
  phone?: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  blood_group?: string;
  status?: 'active' | 'inactive' | 'deceased';
  branch_id?: number;
  age_from?: number;
  age_to?: number;
  created_from?: string;
  created_to?: string;
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

export interface CreatePatientData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  blood_group?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_policy_no?: string;
  branch_id?: number;
  status?: 'active' | 'inactive' | 'deceased';
}

export interface RegisterPatientData extends CreatePatientData {
  create_user_account?: boolean;
  user_email?: string;
  user_password?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  constructor(private http: HttpClient) {}

  getPatients(params?: PatientSearchParams): Observable<PaginatedResponse<Patient>> {
    const httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof PatientSearchParams];
        if (value !== undefined && value !== null) {
          httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<PaginatedResponse<Patient>>('/api/patients', { params: httpParams });
  }

  searchPatients(params: PatientSearchParams): Observable<PaginatedResponse<Patient>> {
    const httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof PatientSearchParams];
        if (value !== undefined && value !== null) {
          httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<PaginatedResponse<Patient>>('/api/patients/search', { params: httpParams });
  }

  getPatient(id: number): Observable<{ data: Patient }> {
    return this.http.get<{ data: Patient }>(`/api/patients/${id}`);
  }

  createPatient(data: CreatePatientData): Observable<{ message: string; data: Patient }> {
    return this.http.post<{ message: string; data: Patient }>('/api/patients', data);
  }

  registerPatient(data: RegisterPatientData): Observable<{ message: string; data: Patient }> {
    return this.http.post<{ message: string; data: Patient }>('/api/patients/register', data);
  }

  updatePatient(id: number, data: Partial<CreatePatientData>): Observable<{ message: string; data: Patient }> {
    return this.http.put<{ message: string; data: Patient }>(`/api/patients/${id}`, data);
  }

  deletePatient(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/patients/${id}`);
  }
}
