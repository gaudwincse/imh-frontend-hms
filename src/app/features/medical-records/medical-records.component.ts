import { Component, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Patient, PatientService } from '../../core/services/patient.service';
import { MedicalRecordService, MedicalRecord, CreateMedicalRecordData } from '../../core/services/medical-record.service';

interface MedicalRecordWithDetails extends MedicalRecord {
  patient_name?: string;
  doctor_name?: string;
  created_by_user?: any;
  formatted_created_at?: string;
}

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, DatePipe],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Medical Records</h1>
          <p class="text-gray-600">Manage patient medical history and records</p>
        </div>
        <button 
          (click)="openNewRecordModal()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H8m4 8v-8"></path>
          </svg>
          Add Medical Record
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading medical records...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="text-red-800">{{ error() }}</div>
      </div>

      <!-- Medical Records List -->
      <div *ngIf="!loading() && !error()">
        <!-- Search and Filters -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <!-- Search -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Search Records</label>
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (keyup.enter)="searchRecords()"
                placeholder="Search by diagnosis, symptoms, or notes..."
                class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500">
            </div>
          </div>

          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-600">
              <span>Showing </span>
              <span class="font-medium">{{ (meta().current_page - 1) * meta().per_page! + 1 }}</span>
              <span> to </span>
              <span class="font-medium">{{ Math.min(meta().current_page * meta().per_page!, meta().total) }}</span>
              <span> of </span>
              <span class="font-medium">{{ meta().total }}</span>
              <span> records</span>
            </div>
            <div class="flex items-center space-x-2">
              <label class="text-sm text-gray-600">Per page:</label>
              <select 
                [(ngModel)]="filters.per_page"
                (change)="loadRecords(1)"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                <option [value]="10">10</option>
                <option [value]="15">15</option>
                <option [value]="25">25</option>
                <option [value]="50">50</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Records List -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chief Complaint</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let record of records(); trackBy: trackByRecordId" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ formatDate(record.created_at) }}</div>
                    <div class="text-xs text-gray-500">{{ formatTime(record.created_at) }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span 
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="getTypeClass(record.record_type)">
                      {{ getTypeLabel(record.record_type) }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="max-w-xs truncate text-sm text-gray-900" [title]="record.chief_complaint">
                      {{ record.chief_complaint }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">{{ record.doctor_name || 'N/A' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button 
                        (click)="viewRecord(record)"
                        class="text-blue-600 hover:text-blue-900">
                        View
                      </button>
                      <button 
                        (click)="editRecord(record)"
                        class="text-indigo-600 hover:text-indigo-900">
                        Edit
                      </button>
                      <button 
                        (click)="downloadRecord(record)"
                        class="text-green-600 hover:text-green-900">
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
        </div>

        <!-- Empty State -->
        <div *ngIf="records().length === 0" class="text-center py-12">
          <div class="text-gray-400 text-6xl mb-4">📋</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No medical records found</h3>
          <p class="text-gray-600">Start by adding your first medical record for this patient.</p>
          <button 
            (click)="openNewRecordModal()"
            class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Add Medical Record
          </button>
        </div>

        <!-- Pagination -->
        <div *ngIf="meta().last_page > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button 
              (click)="previousPage()"
              [disabled]="meta().current_page === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-50">
              Previous
            </button>
            <button 
              (click)="nextPage()"
              [disabled]="meta().current_page === meta().last_page"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-50">
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing
                <span class="font-medium">{{ (meta().current_page - 1) * meta().per_page! + 1 }}</span>
                to
                <span class="font-medium">{{ Math.min(meta().current_page * meta().per_page!, meta().total) }}</span>
                of
                <span class="font-medium">{{ meta().total }}</span>
                results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button 
                  (click)="previousPage()"
                  [disabled]="meta().current_page === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                  Previous
                </button>
                
                <!-- Page Numbers -->
                <button 
                  *ngFor="let page of getPageNumbers(); trackBy: trackByPageNumber"
                  (click)="goToPage(page)"
                  [ngClass]="{
                    'bg-blue-50 border-blue-500 text-blue-600': page === meta().current_page,
                    'bg-white border-gray-300 text-gray-500 hover:bg-gray-50': page !== meta().current_page
                  }"
                  class="relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  {{ page }}
                </button>
                
                <button 
                  (click)="nextPage()"
                  [disabled]="meta().current_page === meta().last_page"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Medical Record Modal -->
      <app-medical-record-modal 
        *ngIf="showRecordModal"
        [record]="selectedRecord()"
        [patient]="currentPatient()"
        (close)="closeRecordModal()"
        (success)="onRecordOperationSuccess($event)">
      </app-medical-record-modal>

      <!-- New Record Modal -->
      <app-medical-record-modal 
        *ngIf="showNewRecordModal"
        [patient]="currentPatient()"
        (close)="closeNewRecordModal()"
        (success)="onRecordOperationSuccess($event)">
      </app-medical-record-modal>
    </div>
  `
})
export class MedicalRecordsComponent implements OnInit {
  records = signal<MedicalRecordWithDetails[]>([]);
  meta = signal<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  }>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  loading = signal(false);
  error = signal<string | null>(null);
  searchQuery = '';
  filters = {
    per_page: 15
  };

  patientId = signal<number | null>(null);
  currentPatient = signal<Patient | null>(null);
  
  showRecordModal = signal(false);
  showNewRecordModal = signal(false);
  selectedRecord = signal<MedicalRecord | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private medicalRecordService: MedicalRecordService
  ) {}

  ngOnInit() {
    this.route.parent?.params.subscribe(params => {
      const id = params?.['id'];
      if (id) {
        this.patientId.set(parseInt(id, 10));
        this.loadPatient();
        this.loadRecords(1);
      }
    });
  }

  loadPatient() {
    if (!this.patientId()) return;
    
    this.patientService.getPatient(this.patientId()!).subscribe({
      next: (response) => {
        this.currentPatient.set(response.data);
      },
      error: (err) => {
        console.error('Error loading patient:', err);
      }
    });
  }

  loadRecords(page: number = 1) {
    if (!this.patientId()) return;
    
    this.loading.set(true);
    this.error.set(null);

    const params = {
      patient_id: this.patientId()!,
      page,
      per_page: this.filters.per_page!
    };

    if (this.searchQuery) {
      params.query = this.searchQuery;
    }

    this.medicalRecordService.getMedicalRecords(params).subscribe({
      next: (response) => {
        this.records.set(response.data);
        this.meta.set(response.meta);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load medical records');
        this.loading.set(false);
        console.error('Error loading medical records:', err);
      }
    });
  }

  searchRecords() {
    this.loadRecords(1);
  }

  viewRecord(record: MedicalRecord) {
    this.selectedRecord.set(record);
    this.showRecordModal.set(true);
  }

  editRecord(record: MedicalRecord) {
    this.selectedRecord.set(record);
    this.showRecordModal.set(true);
  }

  closeRecordModal() {
    this.showRecordModal.set(false);
    this.selectedRecord.set(null);
  }

  openNewRecordModal() {
    this.showNewRecordModal.set(true);
  }

  closeNewRecordModal() {
    this.showNewRecordModal.set(false);
  }

  onRecordOperationSuccess(event: { action: 'create' | 'update'; record: MedicalRecord }) {
    this.closeRecordModal();
    this.closeNewRecordModal();
    this.loadRecords(this.meta().current_page);
  }

  downloadRecord(record: MedicalRecord) {
    // TODO: Implement PDF download functionality
    console.log('Download record:', record);
  }

  // Pagination methods
  previousPage() {
    if (this.meta().current_page > 1) {
      this.loadRecords(this.meta().current_page - 1);
    }
  }

  nextPage() {
    if (this.meta().current_page < this.meta().last_page) {
      this.loadRecords(this.meta().current_page + 1);
    }
  }

  goToPage(page: number) {
    this.loadRecords(page);
  }

  getPageNumbers(): number[] {
    const currentPage = this.meta().current_page;
    const lastPage = this.meta().last_page;
    const pages: number[] = [];

    // Show max 7 page numbers
    let startPage = Math.max(1, currentPage - 3);
    let endPage = Math.min(lastPage, currentPage + 3);

    // Adjust if we're near the beginning or end
    if (endPage - startPage < 6) {
      endPage = Math.min(lastPage, startPage + 6);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Helper methods
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  }

  getTypeLabel(type: string): string {
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

  getTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'initial_consultation': 'bg-blue-100 text-blue-800',
      'follow_up': 'bg-green-100 text-green-800',
      'emergency': 'bg-red-100 text-red-800',
      'pre_op': 'bg-purple-100 text-purple-800',
      'post_op': 'bg-yellow-100 text-yellow-800',
      'discharge_summary': 'bg-indigo-100 text-indigo-800',
      'consultation': 'bg-gray-100 text-gray-800',
      'progress_note': 'bg-pink-100 text-pink-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return classes[type as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  trackByRecordId(index: number, record: MedicalRecord): number {
    return record.id;
  }

  trackByPageNumber(index: number, page: number): number {
    return page;
  }
}