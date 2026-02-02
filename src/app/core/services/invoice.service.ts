import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Invoice {
  id: number;
  patient_id: number;
  appointment_id?: number;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  payment_method?: string;
  payment_date?: string;
  notes?: string;
  created_by: number;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  patient?: any;
  appointment?: any;
  created_by_user?: any;
  approved_by_user?: any;
  items?: InvoiceItem[];
  formatted_issue_date?: string;
  formatted_due_date?: string;
  formatted_payment_date?: string;
  formatted_subtotal?: string;
  formatted_tax_amount?: string;
  formatted_discount_amount?: string;
  formatted_total_amount?: string;
  formatted_paid_amount?: string;
  formatted_balance_amount?: string;
  status_label?: string;
  status_color?: string;
  payment_method_label?: string;
  payment_status?: string;
  remaining_balance?: number;
  formatted_remaining_balance?: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
  updated_at: string;
  formatted_unit_price?: string;
  formatted_total?: string;
}

export interface InvoiceCreate {
  patient_id: number;
  appointment_id?: number;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  payment_method?: string;
  notes?: string;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
}

export interface InvoiceUpdate {
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  payment_method?: string;
  notes?: string;
}

export interface InvoicePayment {
  amount: number;
  payment_method: string;
  notes?: string;
}

export interface InvoiceItemCreate {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface InvoiceItemUpdate {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface InvoiceSummary {
  total_invoices: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  draft_count: number;
  pending_count: number;
  paid_count: number;
  overdue_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = environment.apiUrl;
  public loading = signal(false);
  public error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getInvoices(params?: {
    patient_id?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
    payment_method?: string;
    created_by?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Invoice[]; meta: any }> {
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

    return this.http.get<{ data: Invoice[]; meta: any }>(`${this.apiUrl}/invoices`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load invoices');
          return throwError(() => error);
        })
      );
  }

  getInvoice(id: number): Observable<{ data: Invoice }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<{ data: Invoice }>(`${this.apiUrl}/invoices/${id}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to load invoice');
          return throwError(() => error);
        })
      );
  }

  createInvoice(invoice: InvoiceCreate): Observable<{ data: Invoice }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<{ data: Invoice }>(`${this.apiUrl}/invoices`, invoice)
      .pipe(
        catchError(error => {
          this.error.set('Failed to create invoice');
          return throwError(() => error);
        })
      );
  }

  updateInvoice(id: number, invoice: InvoiceUpdate): Observable<{ data: Invoice }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<{ data: Invoice }>(`${this.apiUrl}/invoices/${id}`, invoice)
      .pipe(
        catchError(error => {
          this.error.set('Failed to update invoice');
          return throwError(() => error);
        })
      );
  }

  deleteInvoice(id: number): Observable<{ message: string }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<{ message: string }>(`${this.apiUrl}/invoices/${id}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to delete invoice');
          return throwError(() => error);
        })
      );
  }

  getPatientInvoices(patientId: number, params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Invoice[]; meta: any }> {
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

    return this.http.get<{ data: Invoice[]; meta: any }>(`${this.apiUrl}/patients/${patientId}/invoices`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load patient invoices');
          return throwError(() => error);
        })
      );
  }

  getInvoicesByStatus(status: string, params?: {
    patient_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Invoice[]; meta: any }> {
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

    return this.http.get<{ data: Invoice[]; meta: any }>(`${this.apiUrl}/invoices/status/${status}`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load invoices by status');
          return throwError(() => error);
        })
      );
  }

  getDraftInvoices(params?: {
    patient_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Invoice[]; meta: any }> {
    return this.getInvoicesByStatus('draft', params);
  }

  getPendingInvoices(params?: {
    patient_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Invoice[]; meta: any }> {
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

    return this.http.get<{ data: Invoice[]; meta: any }>(`${this.apiUrl}/invoices/pending`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load pending invoices');
          return throwError(() => error);
        })
      );
  }

  getPaidInvoices(params?: {
    patient_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Invoice[]; meta: any }> {
    return this.getInvoicesByStatus('paid', params);
  }

  getOverdueInvoices(params?: {
    patient_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Invoice[]; meta: any }> {
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

    return this.http.get<{ data: Invoice[]; meta: any }>(`${this.apiUrl}/invoices/overdue`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load overdue invoices');
          return throwError(() => error);
        })
      );
  }

  getUnpaidInvoices(params?: {
    patient_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Invoice[]; meta: any }> {
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

    return this.http.get<{ data: Invoice[]; meta: any }>(`${this.apiUrl}/invoices/unpaid`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load unpaid invoices');
          return throwError(() => error);
        })
      );
  }

  searchInvoices(query: string): Observable<{ data: Invoice[]; meta: any }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<{ data: Invoice[]; meta: any }>(`${this.apiUrl}/invoices/search/${encodeURIComponent(query)}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to search invoices');
          return throwError(() => error);
        })
      );
  }

  getInvoicesByDateRange(startDate: string, endDate: string, params?: {
    patient_id?: number;
    status?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<{ data: Invoice[]; meta: any }> {
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

    return this.http.get<{ data: Invoice[]; meta: any }>(`${this.apiUrl}/invoices/date-range/${startDate}/${endDate}`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load invoices by date range');
          return throwError(() => error);
        })
      );
  }

  approveInvoice(id: number): Observable<{ data: Invoice }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<{ data: Invoice }>(`${this.apiUrl}/invoices/${id}/approve`, {})
      .pipe(
        catchError(error => {
          this.error.set('Failed to approve invoice');
          return throwError(() => error);
        })
      );
  }

  cancelInvoice(id: number): Observable<{ data: Invoice }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<{ data: Invoice }>(`${this.apiUrl}/invoices/${id}/cancel`, {})
      .pipe(
        catchError(error => {
          this.error.set('Failed to cancel invoice');
          return throwError(() => error);
        })
      );
  }

  addPayment(id: number, payment: InvoicePayment): Observable<{ data: Invoice }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<{ data: Invoice }>(`${this.apiUrl}/invoices/${id}/payment`, payment)
      .pipe(
        catchError(error => {
          this.error.set('Failed to add payment');
          return throwError(() => error);
        })
      );
  }

  generateInvoicePdf(id: number): Observable<Blob> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get(`${this.apiUrl}/invoices/${id}/pdf`, { responseType: 'blob' })
      .pipe(
        catchError(error => {
          this.error.set('Failed to generate invoice PDF');
          return throwError(() => error);
        })
      );
  }

  getInvoiceItems(invoiceId: number): Observable<{ data: InvoiceItem[] }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<{ data: InvoiceItem[] }>(`${this.apiUrl}/invoices/${invoiceId}/items`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to load invoice items');
          return throwError(() => error);
        })
      );
  }

  addInvoiceItem(invoiceId: number, item: InvoiceItemCreate): Observable<{ data: InvoiceItem }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<{ data: InvoiceItem }>(`${this.apiUrl}/invoices/${invoiceId}/items`, item)
      .pipe(
        catchError(error => {
          this.error.set('Failed to add invoice item');
          return throwError(() => error);
        })
      );
  }

  updateInvoiceItem(invoiceId: number, itemId: number, item: InvoiceItemUpdate): Observable<{ data: InvoiceItem }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<{ data: InvoiceItem }>(`${this.apiUrl}/invoices/${invoiceId}/items/${itemId}`, item)
      .pipe(
        catchError(error => {
          this.error.set('Failed to update invoice item');
          return throwError(() => error);
        })
      );
  }

  removeInvoiceItem(invoiceId: number, itemId: number): Observable<{ message: string }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<{ message: string }>(`${this.apiUrl}/invoices/${invoiceId}/items/${itemId}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to remove invoice item');
          return throwError(() => error);
        })
      );
  }

  getInvoiceSummary(params?: {
    start_date?: string;
    end_date?: string;
  }): Observable<{ data: InvoiceSummary }> {
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

    return this.http.get<{ data: InvoiceSummary }>(`${this.apiUrl}/invoices/summary`, { params })
      .pipe(
        catchError(error => {
          this.error.set('Failed to load invoice summary');
          return throwError(() => error);
        })
      );
  }

  getStatuses(): string[] {
    return [
      'draft',
      'pending',
      'approved',
      'partially_paid',
      'paid',
      'overdue',
      'cancelled'
    ];
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'draft': 'Draft',
      'pending': 'Pending',
      'approved': 'Approved',
      'partially_paid': 'Partially Paid',
      'paid': 'Paid',
      'overdue': 'Overdue',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'draft': 'gray',
      'pending': 'yellow',
      'approved': 'blue',
      'partially_paid': 'orange',
      'paid': 'green',
      'overdue': 'red',
      'cancelled': 'gray'
    };
    return colors[status] || 'gray';
  }

  getPaymentMethods(): string[] {
    return [
      'cash',
      'credit_card',
      'debit_card',
      'bank_transfer',
      'check',
      'insurance',
      'online'
    ];
  }

  getPaymentMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      'cash': 'Cash',
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card',
      'bank_transfer': 'Bank Transfer',
      'check': 'Check',
      'insurance': 'Insurance',
      'online': 'Online Payment'
    };
    return labels[method] || method;
  }

  clearError(): void {
    this.error.set(null);
  }
}