import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InsuranceClaim {
  id: number;
  patient_id: number;
  invoice_id?: number;
  claim_number: string;
  insurance_provider: string;
  policy_number?: string;
  member_id?: string;
  claim_type: string;
  submission_date?: string;
  status: string;
  service_date_from: string;
  service_date_to: string;
  billed_amount: number;
  approved_amount: number;
  paid_amount: number;
  denied_amount: number;
  patient_responsibility: number;
  insurance_responsibility: number;
  denial_reason?: string;
  explanation_of_benefits?: string;
  processing_notes?: string;
  adjustment_codes?: any;
  submitted_by?: number;
  processed_by?: number;
  processed_date?: string;
  payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: any;
  invoice?: any;
  submitted_by_user?: any;
  processed_by_user?: any;
  items?: ClaimItem[];
  documents?: ClaimDocument[];
  formatted_submission_date?: string;
  formatted_service_date_from?: string;
  formatted_service_date_to?: string;
  formatted_processed_date?: string;
  formatted_payment_date?: string;
  formatted_billed_amount?: string;
  formatted_approved_amount?: string;
  formatted_paid_amount?: string;
  formatted_denied_amount?: string;
  formatted_patient_responsibility?: string;
  formatted_insurance_responsibility?: string;
  status_label?: string;
  status_color?: string;
  claim_type_label?: string;
  insurance_provider_label?: string;
  service_date_range?: string;
  approval_percentage?: number;
  payment_percentage?: number;
  remaining_balance?: number;
  formatted_remaining_balance?: string;
}

export interface ClaimItem {
  id: number;
  claim_id: number;
  description: string;
  service_date: string;
  billed_amount: number;
  procedure_code?: string;
  diagnosis_code?: string;
  created_at: string;
  updated_at: string;
  formatted_service_date?: string;
  formatted_billed_amount?: string;
}

export interface ClaimDocument {
  id: number;
  claim_id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  description?: string;
  uploaded_by: number;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
  uploaded_by_user?: any;
  formatted_uploaded_at?: string;
  formatted_file_size?: string;
}

export interface InsuranceClaimCreate {
  patient_id: number;
  invoice_id?: number;
  insurance_provider: string;
  policy_number?: string;
  member_id?: string;
  claim_type: string;
  service_date_from: string;
  service_date_to: string;
  billed_amount: number;
  submission_date?: string;
  notes?: string;
  items?: {
    description: string;
    service_date: string;
    billed_amount: number;
    procedure_code?: string;
    diagnosis_code?: string;
  }[];
}

export interface InsuranceClaimUpdate {
  insurance_provider: string;
  policy_number?: string;
  member_id?: string;
  claim_type: string;
  service_date_from: string;
  service_date_to: string;
  billed_amount: number;
  submission_date?: string;
  notes?: string;
}

export interface ClaimItemCreate {
  description: string;
  service_date: string;
  billed_amount: number;
  procedure_code?: string;
  diagnosis_code?: string;
}

export interface ClaimItemUpdate {
  description: string;
  service_date: string;
  billed_amount: number;
  procedure_code?: string;
  diagnosis_code?: string;
}

export interface ClaimAppeal {
  appeal_reason: string;
  supporting_documents?: File[];
}

export interface ClaimSummary {
  total_claims: number;
  total_billed_amount: number;
  total_approved_amount: number;
  total_paid_amount: number;
  total_denied_amount: number;
  draft_count: number;
  submitted_count: number;
  in_review_count: number;
  approved_count: number;
  denied_count: number;
  paid_count: number;
  pending_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class InsuranceClaimService {
  private apiUrl = environment.apiUrl;
  public loading = signal(false);
  public error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getInsuranceClaims(params?: {
    patient_id?: number;
    status?: string;
    insurance_provider?: string;
    claim_type?: string;
    start_date?: string;
    end_date?: string;
    service_start_date?: string;
    service_end_date?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: InsuranceClaim[]; meta: any }> {
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

    return this.http.get<{ data: InsuranceClaim[]; meta: any }>(`${this.apiUrl}/insurance-claims`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load insurance claims');
          return throwError(() => error);
        })
      );
  }

  getInsuranceClaim(id: number): Observable<{ data: InsuranceClaim }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<{ data: InsuranceClaim }>(`${this.apiUrl}/insurance-claims/${id}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to load insurance claim');
          return throwError(() => error);
        })
      );
  }

  createInsuranceClaim(claim: InsuranceClaimCreate): Observable<{ data: InsuranceClaim }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<{ data: InsuranceClaim }>(`${this.apiUrl}/insurance-claims`, claim)
      .pipe(
        catchError(error => {
          this.error.set('Failed to create insurance claim');
          return throwError(() => error);
        })
      );
  }

  updateInsuranceClaim(id: number, claim: InsuranceClaimUpdate): Observable<{ data: InsuranceClaim }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<{ data: InsuranceClaim }>(`${this.apiUrl}/insurance-claims/${id}`, claim)
      .pipe(
        catchError(error => {
          this.error.set('Failed to update insurance claim');
          return throwError(() => error);
        })
      );
  }

  deleteInsuranceClaim(id: number): Observable<{ message: string }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<{ message: string }>(`${this.apiUrl}/insurance-claims/${id}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to delete insurance claim');
          return throwError(() => error);
        })
      );
  }

  getPatientInsuranceClaims(patientId: number, params?: {
    status?: string;
    insurance_provider?: string;
    claim_type?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: InsuranceClaim[]; meta: any }> {
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

    return this.http.get<{ data: InsuranceClaim[]; meta: any }>(`${this.apiUrl}/patients/${patientId}/insurance-claims`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load patient insurance claims');
          return throwError(() => error);
        })
      );
  }

  getInsuranceClaimsByStatus(status: string, params?: {
    patient_id?: number;
    insurance_provider?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: InsuranceClaim[]; meta: any }> {
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

    return this.http.get<{ data: InsuranceClaim[]; meta: any }>(`${this.apiUrl}/insurance-claims/status/${status}`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load insurance claims by status');
          return throwError(() => error);
        })
      );
  }

  getDraftClaims(params?: {
    patient_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: InsuranceClaim[]; meta: any }> {
    return this.getInsuranceClaimsByStatus('draft', params);
  }

  getSubmittedClaims(params?: {
    patient_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: InsuranceClaim[]; meta: any }> {
    return this.getInsuranceClaimsByStatus('submitted', params);
  }

  getInReviewClaims(params?: {
    patient_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: InsuranceClaim[]; meta: any }> {
    return this.getInsuranceClaimsByStatus('in_review', params);
  }

  getApprovedClaims(params?: {
    patient_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: InsuranceClaim[]; meta: any }> {
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

    return this.http.get<{ data: InsuranceClaim[]; meta: any }>(`${this.apiUrl}/insurance-claims/approved`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load approved insurance claims');
          return throwError(() => error);
        })
      );
  }

  getDeniedClaims(params?: {
    patient_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: InsuranceClaim[]; meta: any }> {
    return this.getInsuranceClaimsByStatus('denied', params);
  }

  getPaidClaims(params?: {
    patient_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: InsuranceClaim[]; meta: any }> {
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

    return this.http.get<{ data: InsuranceClaim[]; meta: any }>(`${this.apiUrl}/insurance-claims/paid`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load paid insurance claims');
          return throwError(() => error);
        })
      );
  }

  getPendingClaims(params?: {
    patient_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: InsuranceClaim[]; meta: any }> {
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

    return this.http.get<{ data: InsuranceClaim[]; meta: any }>(`${this.apiUrl}/insurance-claims/pending`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load pending insurance claims');
          return throwError(() => error);
        })
      );
  }

  getClaimsByProvider(provider: string, params?: {
    patient_id?: number;
    status?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: InsuranceClaim[]; meta: any }> {
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

    return this.http.get<{ data: InsuranceClaim[]; meta: any }>(`${this.apiUrl}/insurance-claims/provider/${provider}`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load insurance claims by provider');
          return throwError(() => error);
        })
      );
  }

  getClaimsByType(type: string, params?: {
    patient_id?: number;
    status?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: InsuranceClaim[]; meta: any }> {
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

    return this.http.get<{ data: InsuranceClaim[]; meta: any }>(`${this.apiUrl}/insurance-claims/type/${type}`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load insurance claims by type');
          return throwError(() => error);
        })
      );
  }

  searchInsuranceClaims(query: string): Observable<{ data: InsuranceClaim[]; meta: any }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<{ data: InsuranceClaim[]; meta: any }>(`${this.apiUrl}/insurance-claims/search/${encodeURIComponent(query)}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to search insurance claims');
          return throwError(() => error);
        })
      );
  }

  getClaimsByDateRange(startDate: string, endDate: string, params?: {
    patient_id?: number;
    status?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: InsuranceClaim[]; meta: any }> {
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

    return this.http.get<{ data: InsuranceClaim[]; meta: any }>(`${this.apiUrl}/insurance-claims/date-range/${startDate}/${endDate}`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load insurance claims by date range');
          return throwError(() => error);
        })
      );
  }

  getClaimsByServiceDateRange(startDate: string, endDate: string, params?: {
    patient_id?: number;
    status?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: InsuranceClaim[]; meta: any }> {
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

    return this.http.get<{ data: InsuranceClaim[]; meta: any }>(`${this.apiUrl}/insurance-claims/service-date-range/${startDate}/${endDate}`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load insurance claims by service date range');
          return throwError(() => error);
        })
      );
  }

  submitClaim(id: number): Observable<{ data: InsuranceClaim }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<{ data: InsuranceClaim }>(`${this.apiUrl}/insurance-claims/${id}/submit`, {})
      .pipe(
        catchError(error => {
          this.error.set('Failed to submit insurance claim');
          return throwError(() => error);
        })
      );
  }

  appealClaim(id: number, appeal: ClaimAppeal): Observable<{ data: InsuranceClaim }> {
    this.loading.set(true);
    this.error.set(null);

    const formData = new FormData();
    formData.append('appeal_reason', appeal.appeal_reason);
    
    if (appeal.supporting_documents) {
      appeal.supporting_documents.forEach((file, index) => {
        formData.append(`supporting_documents[${index}]`, file);
      });
    }

    return this.http.put<{ data: InsuranceClaim }>(`${this.apiUrl}/insurance-claims/${id}/appeal`, formData)
      .pipe(
        catchError(error => {
          this.error.set('Failed to appeal insurance claim');
          return throwError(() => error);
        })
      );
  }

  generateClaimPdf(id: number): Observable<Blob> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get(`${this.apiUrl}/insurance-claims/${id}/pdf`, { responseType: 'blob' })
      .pipe(
        catchError(error => {
          this.error.set('Failed to generate claim PDF');
          return throwError(() => error);
        })
      );
  }

  getClaimItems(claimId: number): Observable<{ data: ClaimItem[] }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<{ data: ClaimItem[] }>(`${this.apiUrl}/insurance-claims/${claimId}/items`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to load claim items');
          return throwError(() => error);
        })
      );
  }

  addClaimItem(claimId: number, item: ClaimItemCreate): Observable<{ data: ClaimItem }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<{ data: ClaimItem }>(`${this.apiUrl}/insurance-claims/${claimId}/items`, item)
      .pipe(
        catchError(error => {
          this.error.set('Failed to add claim item');
          return throwError(() => error);
        })
      );
  }

  updateClaimItem(claimId: number, itemId: number, item: ClaimItemUpdate): Observable<{ data: ClaimItem }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<{ data: ClaimItem }>(`${this.apiUrl}/insurance-claims/${claimId}/items/${itemId}`, item)
      .pipe(
        catchError(error => {
          this.error.set('Failed to update claim item');
          return throwError(() => error);
        })
      );
  }

  removeClaimItem(claimId: number, itemId: number): Observable<{ message: string }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<{ message: string }>(`${this.apiUrl}/insurance-claims/${claimId}/items/${itemId}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to remove claim item');
          return throwError(() => error);
        })
      );
  }

  getClaimDocuments(claimId: number): Observable<{ data: ClaimDocument[] }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<{ data: ClaimDocument[] }>(`${this.apiUrl}/insurance-claims/${claimId}/documents`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to load claim documents');
          return throwError(() => error);
        })
      );
  }

  uploadClaimDocument(claimId: number, document: File, documentType: string, description?: string): Observable<{ data: ClaimDocument }> {
    this.loading.set(true);
    this.error.set(null);

    const formData = new FormData();
    formData.append('document', document);
    formData.append('document_type', documentType);
    if (description) {
      formData.append('description', description);
    }

    return this.http.post<{ data: ClaimDocument }>(`${this.apiUrl}/insurance-claims/${claimId}/documents`, formData)
      .pipe(
        catchError(error => {
          this.error.set('Failed to upload claim document');
          return throwError(() => error);
        })
      );
  }

  removeClaimDocument(claimId: number, documentId: number): Observable<{ message: string }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<{ message: string }>(`${this.apiUrl}/insurance-claims/${claimId}/documents/${documentId}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to remove claim document');
          return throwError(() => error);
        })
      );
  }

  getClaimSummary(params?: {
    start_date?: string;
    end_date?: string;
  }): Observable<{ data: ClaimSummary }> {
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

    return this.http.get<{ data: ClaimSummary }>(`${this.apiUrl}/insurance-claims/summary`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load claim summary');
          return throwError(() => error);
        })
      );
  }

  getStatuses(): string[] {
    return [
      'draft',
      'submitted',
      'in_review',
      'approved',
      'partially_approved',
      'denied',
      'paid',
      'partially_paid',
      'on_hold',
      'appealed',
      'closed'
    ];
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'draft': 'Draft',
      'submitted': 'Submitted',
      'in_review': 'In Review',
      'approved': 'Approved',
      'partially_approved': 'Partially Approved',
      'denied': 'Denied',
      'paid': 'Paid',
      'partially_paid': 'Partially Paid',
      'on_hold': 'On Hold',
      'appealed': 'Appealed',
      'closed': 'Closed'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'draft': 'gray',
      'submitted': 'blue',
      'in_review': 'yellow',
      'approved': 'green',
      'partially_approved': 'orange',
      'denied': 'red',
      'paid': 'green',
      'partially_paid': 'orange',
      'on_hold': 'yellow',
      'appealed': 'purple',
      'closed': 'gray'
    };
    return colors[status] || 'gray';
  }

  getClaimTypes(): string[] {
    return [
      'medical',
      'dental',
      'vision',
      'pharmacy',
      'mental_health',
      'substance_abuse',
      'rehabilitation',
      'preventive',
      'emergency',
      'surgical',
      'diagnostic',
      'therapeutic'
    ];
  }

  getClaimTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'medical': 'Medical',
      'dental': 'Dental',
      'vision': 'Vision',
      'pharmacy': 'Pharmacy',
      'mental_health': 'Mental Health',
      'substance_abuse': 'Substance Abuse',
      'rehabilitation': 'Rehabilitation',
      'preventive': 'Preventive Care',
      'emergency': 'Emergency',
      'surgical': 'Surgical',
      'diagnostic': 'Diagnostic',
      'therapeutic': 'Therapeutic'
    };
    return labels[type] || type;
  }

  getInsuranceProviders(): string[] {
    return [
      'blue_cross_blue_shield',
      'aetna',
      'united_healthcare',
      'cigna',
      'humana',
      'kaiser_permanente',
      'medicare',
      'medicaid',
      'tricare',
      'va_healthcare',
      'other'
    ];
  }

  getInsuranceProviderLabel(provider: string): string {
    const labels: { [key: string]: string } = {
      'blue_cross_blue_shield': 'Blue Cross Blue Shield',
      'aetna': 'Aetna',
      'united_healthcare': 'United Healthcare',
      'cigna': 'Cigna',
      'humana': 'Humana',
      'kaiser_permanente': 'Kaiser Permanente',
      'medicare': 'Medicare',
      'medicaid': 'Medicaid',
      'tricare': 'TRICARE',
      'va_healthcare': 'VA Healthcare',
      'other': 'Other'
    };
    return labels[provider] || provider;
  }

  clearError(): void {
    this.error.set(null);
  }
}