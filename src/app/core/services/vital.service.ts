import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Vital {
  id: number;
  patient_id: number;
  recorded_by?: number;
  recorded_at: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  pulse_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: any;
  recorded_by_user?: any;
  formatted_recorded_at?: string;
  blood_pressure?: string;
  bmi_data?: {
    bmi: number;
    category: string;
    weight: number;
    height: number;
    height_meters: number;
  };
  temperature_display?: string;
  formatted_weight?: string;
  formatted_height?: string;
  pulse_rate_display?: string;
  respiratory_rate_display?: string;
  oxygen_saturation_display?: string;
}

export interface VitalCreate {
  patient_id: number;
  recorded_at: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  pulse_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  notes?: string;
}

export interface VitalUpdate {
  recorded_at: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  pulse_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  notes?: string;
}

export interface VitalSummary {
  latest_reading: Vital;
  total_readings: number;
  abnormal_readings: number;
  normal_readings: number;
  abnormal_percentage: number;
}

export interface VitalTrends {
  blood_pressure: Array<{
    date: string;
    systolic: number;
    diastolic: number;
  }>;
  pulse_rate: Array<{
    date: string;
    value: number;
  }>;
  temperature: Array<{
    date: string;
    value: number;
  }>;
  oxygen_saturation: Array<{
    date: string;
    value: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class VitalService {
  private apiUrl = environment.apiUrl;
  public loading = signal(false);
  public error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getVitals(params?: {
    patient_id?: number;
    recorded_by?: number;
    start_date?: string;
    end_date?: string;
    status?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Vital[]; meta: any }> {
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

    return this.http.get<{ data: Vital[]; meta: any }>(`${this.apiUrl}/vitals`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load vitals');
          return throwError(() => error);
        })
      );
  }

  getVital(id: number): Observable<{ data: Vital }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<{ data: Vital }>(`${this.apiUrl}/vitals/${id}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to load vital');
          return throwError(() => error);
        })
      );
  }

  createVital(vital: VitalCreate): Observable<{ data: Vital }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<{ data: Vital }>(`${this.apiUrl}/vitals`, vital)
      .pipe(
        catchError(error => {
          this.error.set('Failed to create vital');
          return throwError(() => error);
        })
      );
  }

  updateVital(id: number, vital: VitalUpdate): Observable<{ data: Vital }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<{ data: Vital }>(`${this.apiUrl}/vitals/${id}`, vital)
      .pipe(
        catchError(error => {
          this.error.set('Failed to update vital');
          return throwError(() => error);
        })
      );
  }

  deleteVital(id: number): Observable<{ message: string }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<{ message: string }>(`${this.apiUrl}/vitals/${id}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to delete vital');
          return throwError(() => error);
        })
      );
  }

  getPatientVitals(patientId: number, params?: {
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Vital[]; meta: any }> {
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

    return this.http.get<{ data: Vital[]; meta: any }>(`${this.apiUrl}/patients/${patientId}/vitals`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load patient vitals');
          return throwError(() => error);
        })
      );
  }

  getLatestPatientVital(patientId: number): Observable<{ data: Vital }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<{ data: Vital }>(`${this.apiUrl}/patients/${patientId}/vitals/latest`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to load latest patient vital');
          return throwError(() => error);
        })
      );
  }

  getVitalsByDate(date: string, params?: {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Vital[]; meta: any }> {
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

    return this.http.get<{ data: Vital[]; meta: any }>(`${this.apiUrl}/vitals/date/${date}`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load vitals by date');
          return throwError(() => error);
        })
      );
  }

  getVitalsByDateRange(startDate: string, endDate: string, params?: {
    patient_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Vital[]; meta: any }> {
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

    return this.http.get<{ data: Vital[]; meta: any }>(`${this.apiUrl}/vitals/date-range/${startDate}/${endDate}`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load vitals by date range');
          return throwError(() => error);
        })
      );
  }

  getRecentVitals(days: number = 30, params?: {
    patient_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Vital[]; meta: any }> {
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

    return this.http.get<{ data: Vital[]; meta: any }>(`${this.apiUrl}/vitals/recent/${days}`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load recent vitals');
          return throwError(() => error);
        })
      );
  }

  getAbnormalVitals(params?: {
    patient_id?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Vital[]; meta: any }> {
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

    return this.http.get<{ data: Vital[]; meta: any }>(`${this.apiUrl}/vitals/abnormal`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load abnormal vitals');
          return throwError(() => error);
        })
      );
  }

  getNormalVitals(params?: {
    patient_id?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Vital[]; meta: any }> {
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

    return this.http.get<{ data: Vital[]; meta: any }>(`${this.apiUrl}/vitals/normal`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load normal vitals');
          return throwError(() => error);
        })
      );
  }

  searchVitals(query: string): Observable<{ data: Vital[]; meta: any }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<{ data: Vital[]; meta: any }>(`${this.apiUrl}/vitals/search/${encodeURIComponent(query)}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to search vitals');
          return throwError(() => error);
        })
      );
  }

  getPatientVitalSummary(patientId: number): Observable<{ data: VitalSummary }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<{ data: VitalSummary }>(`${this.apiUrl}/patients/${patientId}/vitals/summary`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to load patient vital summary');
          return throwError(() => error);
        })
      );
  }

  getPatientVitalTrends(patientId: number, params?: {
    days?: number;
  }): Observable<{ data: VitalTrends }> {
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

    return this.http.get<{ data: VitalTrends }>(`${this.apiUrl}/patients/${patientId}/vitals/trends`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load patient vital trends');
          return throwError(() => error);
        })
      );
  }

  // Helper methods for vital analysis
  isNormalBloodPressure(systolic?: number, diastolic?: number): boolean {
    if (!systolic || !diastolic) return false;
    return systolic < 120 && diastolic < 80;
  }

  isHighBloodPressure(systolic?: number, diastolic?: number): boolean {
    if (!systolic || !diastolic) return false;
    return systolic >= 140 || diastolic >= 90;
  }

  isNormalTemperature(temperature?: number): boolean {
    if (!temperature) return false;
    return temperature >= 36.1 && temperature <= 37.2;
  }

  isFever(temperature?: number): boolean {
    if (!temperature) return false;
    return temperature > 37.2;
  }

  isNormalOxygenSaturation(oxygenSaturation?: number): boolean {
    if (!oxygenSaturation) return false;
    return oxygenSaturation >= 95 && oxygenSaturation <= 100;
  }

  isLowOxygenSaturation(oxygenSaturation?: number): boolean {
    if (!oxygenSaturation) return false;
    return oxygenSaturation < 95;
  }

  calculateBMI(weight?: number, height?: number): { bmi: number; category: string } | null {
    if (!weight || !height) return null;
    
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    let category: string;
    if (bmi < 18.5) {
      category = 'Underweight';
    } else if (bmi < 25) {
      category = 'Normal';
    } else if (bmi < 30) {
      category = 'Overweight';
    } else {
      category = 'Obese';
    }
    
    return { bmi: Math.round(bmi * 100) / 100, category };
  }

  getBMICategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Underweight': 'blue',
      'Normal': 'green',
      'Overweight': 'yellow',
      'Obese': 'red'
    };
    return colors[category] || 'gray';
  }

  clearError(): void {
    this.error.set(null);
  }
}