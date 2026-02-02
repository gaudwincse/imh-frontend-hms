import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  record_type: string;
  chief_complaint: string;
  history_of_present_illness: string;
  past_medical_history: string;
  past_surgical_history: string;
  family_history: string;
  social_history: string;
  allergies: string;
  medications: string;
  review_of_systems: string;
  physical_examination: string;
  assessment: string;
  plan: string;
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  patient?: any;
  doctor?: any;
  appointment?: any;
  created_by_user?: any;
}

export interface MedicalRecordCreate {
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  record_type: string;
  chief_complaint: string;
  history_of_present_illness: string;
  past_medical_history: string;
  past_surgical_history: string;
  family_history: string;
  social_history: string;
  allergies: string;
  medications: string;
  review_of_systems: string;
  physical_examination: string;
  assessment: string;
  plan: string;
  notes?: string;
}

export interface MedicalRecordUpdate {
  record_type?: string;
  chief_complaint?: string;
  history_of_present_illness?: string;
  past_medical_history?: string;
  past_surgical_history?: string;
  family_history?: string;
  social_history?: string;
  allergies?: string;
  medications?: string;
  review_of_systems?: string;
  physical_examination?: string;
  assessment?: string;
  plan?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordService {
  private apiUrl = environment.apiUrl;
  public loading = signal(false);
  public error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getMedicalRecords(params?: {
    patient_id?: number;
    doctor_id?: number;
    record_type?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: MedicalRecord[]; meta: any }> {
    this.loading.set(true);
    this.error.set(null);

    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] !== undefined) {
          httpParams = httpParams.set(key, params[key as keyof typeof params]!.toString());
        }
      });
    }

    return this.http.get<{ data: MedicalRecord[]; meta: any }>(`${this.apiUrl}/medical-records`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load medical records');
          return throwError(() => error);
        })
      );
  }

  getMedicalRecord(id: number): Observable<{ data: MedicalRecord }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<{ data: MedicalRecord }>(`${this.apiUrl}/medical-records/${id}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to load medical record');
          return throwError(() => error);
        })
      );
  }

  createMedicalRecord(medicalRecord: MedicalRecordCreate): Observable<{ data: MedicalRecord }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<{ data: MedicalRecord }>(`${this.apiUrl}/medical-records`, medicalRecord)
      .pipe(
        catchError(error => {
          this.error.set('Failed to create medical record');
          return throwError(() => error);
        })
      );
  }

  updateMedicalRecord(id: number, medicalRecord: MedicalRecordUpdate): Observable<{ data: MedicalRecord }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<{ data: MedicalRecord }>(`${this.apiUrl}/medical-records/${id}`, medicalRecord)
      .pipe(
        catchError(error => {
          this.error.set('Failed to update medical record');
          return throwError(() => error);
        })
      );
  }

  deleteMedicalRecord(id: number): Observable<{ message: string }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<{ message: string }>(`${this.apiUrl}/medical-records/${id}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to delete medical record');
          return throwError(() => error);
        })
      );
  }

  getPatientMedicalRecords(patientId: number, params?: {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: MedicalRecord[]; meta: any }> {
    this.loading.set(true);
    this.error.set(null);

    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] !== undefined) {
          httpParams = httpParams.set(key, params[key as keyof typeof params]!.toString());
        }
      });
    }

    return this.http.get<{ data: MedicalRecord[]; meta: any }>(`${this.apiUrl}/patients/${patientId}/medical-records`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load patient medical records');
          return throwError(() => error);
        })
      );
  }

  getDoctorMedicalRecords(doctorId: number, params?: {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: MedicalRecord[]; meta: any }> {
    this.loading.set(true);
    this.error.set(null);

    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] !== undefined) {
          httpParams = httpParams.set(key, params[key as keyof typeof params]!.toString());
        }
      });
    }

    return this.http.get<{ data: MedicalRecord[]; meta: any }>(`${this.apiUrl}/doctors/${doctorId}/medical-records`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load doctor medical records');
          return throwError(() => error);
        })
      );
  }

  searchMedicalRecords(query: string): Observable<{ data: MedicalRecord[]; meta: any }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<{ data: MedicalRecord[]; meta: any }>(`${this.apiUrl}/medical-records/search/${encodeURIComponent(query)}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to search medical records');
          return throwError(() => error);
        })
      );
  }

  getMedicalRecordsByDateRange(startDate: string, endDate: string, params?: {
    patient_id?: number;
    doctor_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: MedicalRecord[]; meta: any }> {
    this.loading.set(true);
    this.error.set(null);

    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] !== undefined) {
          httpParams = httpParams.set(key, params[key as keyof typeof params]!.toString());
        }
      });
    }

    return this.http.get<{ data: MedicalRecord[]; meta: any }>(`${this.apiUrl}/medical-records/date-range/${startDate}/${endDate}`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load medical records by date range');
          return throwError(() => error);
        })
      );
  }

  getRecordTypes(): string[] {
    return [
      'initial_consultation',
      'follow_up',
      'emergency',
      'pre_op',
      'post_op',
      'discharge_summary',
      'consultation',
      'progress_note',
      'other'
    ];
  }

  getRecordTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'initial_consultation': 'Initial Consultation',
      'follow_up': 'Follow Up',
      'emergency': 'Emergency',
      'pre_op': 'Pre-operative',
      'post_op': 'Post-operative',
      'discharge_summary': 'Discharge Summary',
      'consultation': 'Consultation',
      'progress_note': 'Progress Note',
      'other': 'Other'
    };
    return labels[type] || type;
  }

  clearError(): void {
    this.error.set(null);
  }
}