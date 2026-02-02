import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LabResult {
  id: number;
  patient_id: number;
  ordered_by?: number;
  performed_by?: number;
  test_name: string;
  test_category: string;
  result_value?: string;
  normal_range?: string;
  unit?: string;
  status: string;
  result_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  lab_test?: {
    name: string;
    category: string;
    normal_range_min?: number;
    normal_range_max?: number;
    unit: string;
  };
  doctor?: {
    user?: {
      name: string;
      email: string;
    };
  };
  patient?: {
    id?: number;
    first_name: string;
    last_name: string;
    patient_no: string;
  };
}

export interface PaginatedLabResultResponse<T = LabResult> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface LabResultSearchParams {
  patient_id?: number;
  test_category?: string;
  test_name?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root',
})
export class LabResultService {
  private readonly API_URL = `${environment.apiUrl}/lab-results`;

  constructor(private http: HttpClient) {}

  getLabResults(params: LabResultSearchParams = {}): Observable<PaginatedLabResultResponse<LabResult>> {
    let httpParams = new HttpParams();

    if (params.patient_id) {
      httpParams = httpParams.set('patient_id', params.patient_id.toString());
    }
    if (params.test_category) {
      httpParams = httpParams.set('test_category', params.test_category);
    }
    if (params.test_name) {
      httpParams = httpParams.set('test_name', params.test_name);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.date_from) {
      httpParams = httpParams.set('date_from', params.date_from);
    }
    if (params.date_to) {
      httpParams = httpParams.set('date_to', params.date_to);
    }
    if (params.per_page) {
      httpParams = httpParams.set('per_page', params.per_page.toString());
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.sort_by) {
      httpParams = httpParams.set('sort_by', params.sort_by);
    }
    if (params.sort_order) {
      httpParams = httpParams.set('sort_order', params.sort_order);
    }

    return this.http.get<PaginatedLabResultResponse<LabResult>>(this.API_URL, { params: httpParams }).pipe(
      catchError(err => {
        console.error('Lab Results API Error:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to load lab results'));
      })
    );
  }

  getPatientLabResults(patientId: number, params: Omit<LabResultSearchParams, 'patient_id'> = {}): Observable<PaginatedLabResultResponse<LabResult>> {
    return this.getLabResults({ ...params, patient_id: patientId });
  }

  getLabResult(id: number): Observable<LabResult> {
    return this.http.get<LabResult>(`${this.API_URL}/${id}`).pipe(
      catchError(err => {
        console.error('Lab Result API Error:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to load lab result'));
      })
    );
  }

  createLabResult(data: Partial<LabResult>): Observable<LabResult> {
    return this.http.post<LabResult>(this.API_URL, data).pipe(
      catchError(err => {
        console.error('Create Lab Result API Error:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to create lab result'));
      })
    );
  }

  updateLabResult(id: number, data: Partial<LabResult>): Observable<LabResult> {
    return this.http.put<LabResult>(`${this.API_URL}/${id}`, data).pipe(
      catchError(err => {
        console.error('Update Lab Result API Error:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to update lab result'));
      })
    );
  }

  deleteLabResult(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(err => {
        console.error('Delete Lab Result API Error:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to delete lab result'));
      })
    );
  }

  // New methods for analytics
  getLabResultStats(params: LabResultSearchParams = {}): Observable<any> {
    let httpParams = new HttpParams();

    if (params.patient_id) {
      httpParams = httpParams.set('patient_id', params.patient_id.toString());
    }
    if (params.test_category) {
      httpParams = httpParams.set('test_category', params.test_category);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.date_from) {
      httpParams = httpParams.set('date_from', params.date_from);
    }
    if (params.date_to) {
      httpParams = httpParams.set('date_to', params.date_to);
    }
    if (params.per_page) {
      httpParams = httpParams.set('per_page', params.per_page.toString());
    }

    return this.http.get(`${this.API_URL}/stats`, { params: httpParams }).pipe(
      catchError(err => {
        console.error('Lab Stats API Error:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to load lab stats'));
      })
    );
  }

  getLabResultTrends(patientId: number, testName?: string): Observable<any> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('patient_id', patientId.toString());
    if (testName) {
      httpParams = httpParams.set('test_name', testName);
    }

    return this.http.get(`${this.API_URL}/trends`, { params: httpParams }).pipe(
      catchError(err => {
        console.error('Lab Trends API Error:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to load lab trends'));
      })
    );
  }

  getLabResultCategories(): Observable<any> {
    return this.http.get(`${this.API_URL}/categories`).pipe(
      catchError(err => {
        console.error('Lab Categories API Error:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to load lab categories'));
      })
    );
  }
}
