import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Prescription {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  prescription_number: string;
  issue_date: string;
  expiry_date?: string;
  status: string;
  diagnosis: string;
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  patient?: any;
  doctor?: any;
  appointment?: any;
  created_by_user?: any;
  items?: PrescriptionItem[];
}

export interface PrescriptionItem {
  id: number;
  prescription_id: number;
  medicine_id?: number;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  quantity: number;
  instructions?: string;
  unit_price: number;
  created_at: string;
  updated_at: string;
  medicine?: any;
  full_dosage?: string;
  formatted_frequency?: string;
  formatted_duration?: string;
  formatted_total_price?: string;
  total_price?: number;
}

export interface PrescriptionCreate {
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  issue_date: string;
  expiry_date?: string;
  diagnosis: string;
  notes?: string;
  items: {
    medicine_id?: number;
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration_days: number;
    quantity: number;
    instructions?: string;
    unit_price: number;
  }[];
}

export interface PrescriptionUpdate {
  issue_date?: string;
  expiry_date?: string;
  diagnosis?: string;
  notes?: string;
  status?: string;
}

export interface PrescriptionItemCreate {
  medicine_id?: number;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  quantity: number;
  instructions?: string;
  unit_price: number;
}

export interface PrescriptionItemUpdate {
  medicine_id?: number;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  quantity: number;
  instructions?: string;
  unit_price: number;
}

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  private apiUrl = environment.apiUrl;
  public loading = signal(false);
  public error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getPrescriptions(params?: {
    patient_id?: number;
    doctor_id?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Prescription[]; meta: any }> {
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

    return this.http.get<{ data: Prescription[]; meta: any }>(`${this.apiUrl}/prescriptions`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load prescriptions');
          return throwError(() => error);
        })
      );
  }

  getPrescription(id: number): Observable<{ data: Prescription }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<{ data: Prescription }>(`${this.apiUrl}/prescriptions/${id}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to load prescription');
          return throwError(() => error);
        })
      );
  }

  createPrescription(prescription: PrescriptionCreate): Observable<{ data: Prescription }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<{ data: Prescription }>(`${this.apiUrl}/prescriptions`, prescription)
      .pipe(
        catchError(error => {
          this.error.set('Failed to create prescription');
          return throwError(() => error);
        })
      );
  }

  updatePrescription(id: number, prescription: PrescriptionUpdate): Observable<{ data: Prescription }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<{ data: Prescription }>(`${this.apiUrl}/prescriptions/${id}`, prescription)
      .pipe(
        catchError(error => {
          this.error.set('Failed to update prescription');
          return throwError(() => error);
        })
      );
  }

  deletePrescription(id: number): Observable<{ message: string }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<{ message: string }>(`${this.apiUrl}/prescriptions/${id}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to delete prescription');
          return throwError(() => error);
        })
      );
  }

  getPatientPrescriptions(patientId: number, params?: {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Prescription[]; meta: any }> {
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

    return this.http.get<{ data: Prescription[]; meta: any }>(`${this.apiUrl}/patients/${patientId}/prescriptions`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load patient prescriptions');
          return throwError(() => error);
        })
      );
  }

  getDoctorPrescriptions(doctorId: number, params?: {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Prescription[]; meta: any }> {
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

    return this.http.get<{ data: Prescription[]; meta: any }>(`${this.apiUrl}/doctors/${doctorId}/prescriptions`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load doctor prescriptions');
          return throwError(() => error);
        })
      );
  }

  getActivePrescriptions(params?: {
    patient_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Prescription[]; meta: any }> {
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

    return this.http.get<{ data: Prescription[]; meta: any }>(`${this.apiUrl}/prescriptions/active`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load active prescriptions');
          return throwError(() => error);
        })
      );
  }

  getExpiredPrescriptions(params?: {
    patient_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Prescription[]; meta: any }> {
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

    return this.http.get<{ data: Prescription[]; meta: any }>(`${this.apiUrl}/prescriptions/expired`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load expired prescriptions');
          return throwError(() => error);
        })
      );
  }

  searchPrescriptions(query: string): Observable<{ data: Prescription[]; meta: any }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<{ data: Prescription[]; meta: any }>(`${this.apiUrl}/prescriptions/search/${encodeURIComponent(query)}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to search prescriptions');
          return throwError(() => error);
        })
      );
  }

  generatePrescriptionPdf(id: number): Observable<Blob> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get(`${this.apiUrl}/prescriptions/${id}/pdf`, { responseType: 'blob' })
      .pipe(
        catchError(error => {
          this.error.set('Failed to generate prescription PDF');
          return throwError(() => error);
        })
      );
  }

  getPrescriptionItems(prescriptionId: number): Observable<{ data: PrescriptionItem[] }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<{ data: PrescriptionItem[] }>(`${this.apiUrl}/prescriptions/${prescriptionId}/items`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to load prescription items');
          return throwError(() => error);
        })
      );
  }

  addPrescriptionItem(prescriptionId: number, item: PrescriptionItemCreate): Observable<{ data: PrescriptionItem }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<{ data: PrescriptionItem }>(`${this.apiUrl}/prescriptions/${prescriptionId}/items`, item)
      .pipe(
        catchError(error => {
          this.error.set('Failed to add prescription item');
          return throwError(() => error);
        })
      );
  }

  updatePrescriptionItem(prescriptionId: number, itemId: number, item: PrescriptionItemUpdate): Observable<{ data: PrescriptionItem }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<{ data: PrescriptionItem }>(`${this.apiUrl}/prescriptions/${prescriptionId}/items/${itemId}`, item)
      .pipe(
        catchError(error => {
          this.error.set('Failed to update prescription item');
          return throwError(() => error);
        })
      );
  }

  removePrescriptionItem(prescriptionId: number, itemId: number): Observable<{ message: string }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<{ message: string }>(`${this.apiUrl}/prescriptions/${prescriptionId}/items/${itemId}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to remove prescription item');
          return throwError(() => error);
        })
      );
  }

  getStatuses(): string[] {
    return [
      'draft',
      'active',
      'completed',
      'expired',
      'cancelled'
    ];
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'draft': 'Draft',
      'active': 'Active',
      'completed': 'Completed',
      'expired': 'Expired',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'draft': 'gray',
      'active': 'green',
      'completed': 'blue',
      'expired': 'red',
      'cancelled': 'gray'
    };
    return colors[status] || 'gray';
  }

  getFrequencies(): string[] {
    return [
      'once_daily',
      'twice_daily',
      'three_times_daily',
      'four_times_daily',
      'every_4_hours',
      'every_6_hours',
      'every_8_hours',
      'every_12_hours',
      'as_needed',
      'before_meals',
      'after_meals'
    ];
  }

  getFrequencyLabel(frequency: string): string {
    const labels: { [key: string]: string } = {
      'once_daily': 'Once daily',
      'twice_daily': 'Twice daily',
      'three_times_daily': 'Three times daily',
      'four_times_daily': 'Four times daily',
      'every_4_hours': 'Every 4 hours',
      'every_6_hours': 'Every 6 hours',
      'every_8_hours': 'Every 8 hours',
      'every_12_hours': 'Every 12 hours',
      'as_needed': 'As needed',
      'before_meals': 'Before meals',
      'after_meals': 'After meals'
    };
    return labels[frequency] || frequency;
  }

  clearError(): void {
    this.error.set(null);
  }
}