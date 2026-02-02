import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Patient, PatientService, PatientSearchParams } from '../../core/services/patient.service';
import { AuthService } from '../../core/services/auth.service';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

@Component({
  selector: 'app-patient-list-enhanced',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Patients</h1>
          <p class="text-gray-600">Manage patient information and records</p>
        </div>
        <button 
          (click)="openPatientModal()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H8m4 8v-8"></path>
          </svg>
          Add New Patient
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          <!-- Search -->
          <div class="lg:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Search Patients</label>
            <div class="relative">
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (keyup.enter)="searchPatients()"
                placeholder="Search by name, patient ID, phone, or email..."
                class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <button 
                *ngIf="searchQuery"
                (click)="clearSearch()"
                class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              [(ngModel)]="filters.status"
              (change)="loadPatients(1)"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>

          <!-- Gender Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select 
              [(ngModel)]="filters.gender"
              (change)="loadPatients(1)"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
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
            <span> patients</span>
          </div>
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-600">Per page:</label>
            <select 
              [(ngModel)]="filters.per_page"
              (change)="loadPatients(1)"
              class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option [value]="10">10</option>
              <option [value]="15">15</option>
              <option [value]="25">25</option>
              <option [value]="50">50</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading patients...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="text-red-800">{{ error() }}</div>
      </div>

      <!-- Patient Grid -->
      <div *ngIf="!loading() && !error()">
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personal</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let patient of patients(); trackBy: trackByPatientId" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span class="text-sm font-medium text-gray-600">
                            {{ patient.first_name?.charAt(0) }}{{ patient.last_name?.charAt(0) }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ patient.first_name }} {{ patient.last_name }}</div>
                        <div class="text-sm text-gray-500">ID: {{ patient.patient_no }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ patient.phone || 'N/A' }}</div>
                    <div class="text-sm text-gray-500">{{ patient.email || 'N/A' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ getGenderLabel(patient.gender) }}</div>
                    <div class="text-sm text-gray-500">{{ calculateAge(patient.date_of_birth) }} years</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ patient.branch?.name || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="getStatusClass(patient.status)">
                      {{ getStatusLabel(patient.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button 
                        (click)="viewPatient(patient)"
                        class="text-blue-600 hover:text-blue-900">
                        View
                      </button>
                      <button 
                        (click)="editPatient(patient)"
                        class="text-indigo-600 hover:text-indigo-900">
                        Edit
                      </button>
                      <button 
                        *ngIf="canDeletePatient()"
                        (click)="deletePatient(patient)"
                        class="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="patients().length === 0" class="text-center py-12">
          <div class="text-gray-400 text-6xl mb-4">👥</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p class="text-gray-600">Get started by adding your first patient or adjust your search filters.</p>
          <button 
            (click)="openPatientModal()"
            class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Add Your First Patient
          </button>
        </div>
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

    <!-- Patient Modal -->
    <app-patient-modal (onSuccess)="onPatientOperationSuccess($event)"></app-patient-modal>
  `
})
export class PatientListEnhancedComponent implements OnInit {
  patients = signal<Patient[]>([]);
  meta = signal<PaginatedResponse<Patient>['meta']>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  loading = signal(false);
  error = signal<string | null>(null);
  searchQuery = '';
  filters: PatientSearchParams = {
    per_page: 15,
    status: undefined,
    gender: undefined
  };

  constructor(
    private patientService: PatientService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadPatients(1);
  }

  loadPatients(page: number = 1) {
    this.loading.set(true);
    this.error.set(null);

    const params: PatientSearchParams = {
      ...this.filters,
      page,
      per_page: this.filters.per_page!
    };

    if (this.searchQuery) {
      params.query = this.searchQuery;
    }

    this.patientService.getPatients(params).subscribe({
      next: (response) => {
        this.patients.set(response.data);
        this.meta.set(response.meta);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load patients');
        this.loading.set(false);
        console.error('Error loading patients:', err);
      }
    });
  }

  searchPatients() {
    this.loadPatients(1);
  }

  clearSearch() {
    this.searchQuery = '';
    this.loadPatients(1);
  }

  viewPatient(patient: Patient) {
    this.router.navigate(['/patients', patient.id]);
  }

  editPatient(patient: Patient) {
    this.openPatientModal(patient);
  }

  deletePatient(patient: Patient) {
    if (confirm(`Are you sure you want to delete ${patient.first_name} ${patient.last_name}? This action cannot be undone.`)) {
      this.loading.set(true);
      
      this.patientService.deletePatient(patient.id).subscribe({
        next: () => {
          this.loadPatients(this.meta().current_page);
        },
        error: (err) => {
          this.error.set('Failed to delete patient');
          this.loading.set(false);
          console.error('Error deleting patient:', err);
        }
      });
    }
  }

  openPatientModal(patient?: Patient) {
    // This would need to be implemented with a modal service
    // For now, navigate to the detail view
    if (patient) {
      this.router.navigate(['/patients', patient.id, 'edit']);
    } else {
      this.router.navigate(['/patients', 'new']);
    }
  }

  onPatientOperationSuccess(event: { action: 'create' | 'update'; patient: Patient }) {
    this.loadPatients(this.meta().current_page);
  }

  // Pagination methods
  previousPage() {
    if (this.meta().current_page > 1) {
      this.loadPatients(this.meta().current_page - 1);
    }
  }

  nextPage() {
    if (this.meta().current_page < this.meta().last_page) {
      this.loadPatients(this.meta().current_page + 1);
    }
  }

  goToPage(page: number) {
    this.loadPatients(page);
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
  getGenderLabel(gender: string): string {
    const labels: { [key: string]: string } = {
      'male': 'Male',
      'female': 'Female',
      'other': 'Other'
    };
    return labels[gender] || gender;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Active',
      'inactive': 'Inactive',
      'deceased': 'Deceased'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-yellow-100 text-yellow-800',
      'deceased': 'bg-gray-100 text-gray-800'
    };
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  calculateAge(dateString: string): number {
    if (!dateString) return 0;
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  canDeletePatient(): boolean {
    const user = this.authService.getCurrentUser();
    return user && user.permissions?.includes('patients.delete');
  }

  trackByPatientId(index: number, patient: Patient) {
    return patient.id;
  }

  trackByPageNumber(index: number, page: number) {
    return page;
  }
}