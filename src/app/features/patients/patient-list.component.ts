import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService, Patient, PatientSearchParams } from '../../core/services/patient.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientRegistrationComponent } from './patient-registration.component';

@Component({
    selector: 'app-patient-list',
    standalone: true,
    imports: [CommonModule, FormsModule, PatientRegistrationComponent],
    template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Patient Directory</h1>
        <button 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          (click)="showRegistrationModal()">
          Add New Patient
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow mb-6 p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            type="text" 
            placeholder="Search patients..." 
            class="border rounded-lg px-3 py-2"
            [(ngModel)]="searchQuery"
            (keyup.enter)="search()">
          
          <select 
            class="border rounded-lg px-3 py-2"
            [(ngModel)]="filters.status"
            (change)="search()">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="deceased">Deceased</option>
          </select>

          <select 
            class="border rounded-lg px-3 py-2"
            [(ngModel)]="filters.gender"
            (change)="search()">
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading patients...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ error() }}</p>
      </div>

      <!-- Patients Table -->
      <div *ngIf="!loading() && !error()" class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient No</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let patient of patients(); trackBy: trackByPatientId">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ patient.patient_no }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ patient.first_name }} {{ patient.last_name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ patient.gender }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ patient.phone || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="{
                        'bg-green-100 text-green-800': patient.status === 'active',
                        'bg-yellow-100 text-yellow-800': patient.status === 'inactive',
                        'bg-red-100 text-red-800': patient.status === 'deceased'
                      }">
                  {{ patient.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3" (click)="viewPatient(patient.id)">View</button>
                <button class="text-indigo-600 hover:text-indigo-900" (click)="editPatient(patient.id)">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div *ngIf="patients().length === 0" class="text-center py-8">
          <p class="text-gray-500">No patients found.</p>
        </div>

        <!-- Pagination -->
        <div *ngIf="meta().total > 0" class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div class="text-sm text-gray-700">
            Showing <span class="font-medium">{{ (meta().current_page - 1) * meta().per_page + 1 }}</span> to 
            <span class="font-medium">{{ getToNumber() }}</span> of 
            <span class="font-medium">{{ meta().total }}</span> results
          </div>
          <div class="flex space-x-2">
            <button 
              class="px-3 py-1 border rounded text-sm disabled:opacity-50"
              [disabled]="meta().current_page === 1"
              (click)="previousPage()">
              Previous
            </button>
            <button 
              class="px-3 py-1 border rounded text-sm disabled:opacity-50"
              [disabled]="meta().current_page === meta().last_page"
              (click)="nextPage()">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Patient Registration Modal -->
    <app-patient-registration 
      (patientRegistered)="onPatientRegistered($event)">
    </app-patient-registration>
  `,
})
export class PatientListComponent implements OnInit {
  patients = signal<Patient[]>([]);
  meta = signal<any>({ current_page: 1, last_page: 1, per_page: 15, total: 0 });
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
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients(page = 1) {
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
        this.error.set('Failed to load patients. Please try again.');
        this.loading.set(false);
        console.error('Error loading patients:', err);
      }
    });
  }

  search() {
    this.loadPatients(1);
  }

  nextPage() {
    if (this.meta().current_page < this.meta().last_page) {
      this.loadPatients(this.meta().current_page + 1);
    }
  }

  previousPage() {
    if (this.meta().current_page > 1) {
      this.loadPatients(this.meta().current_page - 1);
    }
  }

  viewPatient(id: number) {
    // TODO: Navigate to patient detail view
    console.log('View patient:', id);
  }

  editPatient(id: number) {
    // TODO: Navigate to patient edit view
    console.log('Edit patient:', id);
  }

  trackByPatientId(index: number, patient: Patient) {
    return patient.id;
  }

  showRegistrationModal() {
    const registrationComponent = document.querySelector('app-patient-registration') as any;
    if (registrationComponent) {
      registrationComponent.show();
    }
  }

  onPatientRegistered(patient: Patient) {
    this.loadPatients(1);
  }

  getToNumber(): number {
    const current = this.meta().current_page;
    const perPage = this.meta().per_page;
    const total = this.meta().total;
    const to = current * perPage;
    return to > total ? total : to;
  }
}
