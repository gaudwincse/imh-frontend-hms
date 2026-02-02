import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService, Doctor, DoctorSearchParams } from '../../core/services/doctor.service';
import { AuthService } from '../../core/services/auth.service';
import { DoctorProfileModalComponent } from './doctor-profile-modal.component';

@Component({
    selector: 'app-doctor-list',
    standalone: true,
    imports: [CommonModule, FormsModule, DoctorProfileModalComponent],
    template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Doctor Directory</h1>
        <button 
          *ngIf="canManageDoctors()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Add New Doctor
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow mb-6 p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input 
            type="text" 
            placeholder="Search doctors..." 
            class="border rounded-lg px-3 py-2"
            [(ngModel)]="searchQuery"
            (keyup.enter)="search()">
          
          <select 
            class="border rounded-lg px-3 py-2"
            [(ngModel)]="filters.specialization"
            (change)="search()">
            <option value="">All Specializations</option>
            <option *ngFor="let spec of specializations()" value="{{ spec }}">{{ spec }}</option>
          </select>

          <select 
            class="border rounded-lg px-3 py-2"
            [(ngModel)]="filters.status"
            (change)="search()">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="resigned">Resigned</option>
          </select>

          <div class="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="available_today"
              [(ngModel)]="filters.available_today"
              (change)="search()"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
            <label for="available_today" class="text-sm text-gray-700">Available Today</label>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading doctors...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ error() }}</p>
      </div>

      <!-- Doctors Grid -->
      <div *ngIf="!loading() && !error()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let doctor of doctors(); trackBy: trackByDoctorId" 
             class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
             (click)="viewDoctor(doctor.id)">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 font-semibold text-lg">
                  {{ doctor.user?.name?.charAt(0).toUpperCase() || 'D' }}
                </span>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">{{ doctor.user?.name || 'Unknown' }}</h3>
                <p class="text-sm text-gray-600">{{ doctor.employee_no }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center">
                <span class="text-sm text-gray-600 w-20">Specialty:</span>
                <span class="text-sm font-medium text-gray-900">{{ doctor.specialization }}</span>
              </div>
              
              <div class="flex items-center">
                <span class="text-sm text-gray-600 w-20">Experience:</span>
                <span class="text-sm font-medium text-gray-900">{{ doctor.experience_years }} years</span>
              </div>

              <div class="flex items-center">
                <span class="text-sm text-gray-600 w-20">Consultation:</span>
                <span class="text-sm font-medium text-gray-900">${{ doctor.consultation_fee }}</span>
              </div>

              <div class="flex items-center">
                <span class="text-sm text-gray-600 w-20">Branch:</span>
                <span class="text-sm font-medium text-gray-900">{{ doctor.branch?.name || '-' }}</span>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t">
              <div class="flex items-center justify-between">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="{
                        'bg-green-100 text-green-800': doctor.status === 'active',
                        'bg-yellow-100 text-yellow-800': doctor.status === 'on_leave',
                        'bg-red-100 text-red-800': doctor.status === 'resigned'
                      }">
                  {{ doctor.status.replace('_', ' ') }}
                </span>
                
                <button (click)="viewProfile(doctor, $event)" 
                        class="text-blue-600 hover:text-blue-900 text-sm font-medium">
                  View Profile
                </button>
              </div>
            </div>

            <!-- Available Days -->
            <div *ngIf="doctor.available_days && doctor.available_days.length > 0" class="mt-3">
              <p class="text-xs text-gray-600 mb-1">Available:</p>
              <div class="flex flex-wrap gap-1">
                <span *ngFor="let day of doctor.available_days" 
                      class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {{ day.charAt(0).toUpperCase() + day.slice(1, 3) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && !error() && doctors().length === 0" class="text-center py-12">
        <div class="text-gray-400 text-lg mb-4">
          <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <p>No doctors found.</p>
        </div>
        <p class="text-gray-600">Try adjusting your search filters.</p>
      </div>

      <!-- Pagination -->
      <div *ngIf="meta().total > 0" class="bg-white rounded-lg shadow px-6 py-3 flex items-center justify-between mt-6">
        <div class="text-sm text-gray-700">
          Showing <span class="font-medium">{{ (meta().current_page - 1) * meta().per_page + 1 }}</span> to 
          <span class="font-medium">{{ Math.min(meta().current_page * meta().per_page, meta().total) }}</span> of 
          <span class="font-medium">{{ meta().total }}</span> doctors
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

    <!-- Doctor Profile Modal -->
    <app-doctor-profile-modal [doctor]="selectedDoctor" (close)="onProfileClosed()"></app-doctor-profile-modal>
  `,
})
export class DoctorListComponent implements OnInit {
  doctors = signal<Doctor[]>([]);
  meta = signal<any>({ current_page: 1, last_page: 1, per_page: 15, total: 0 });
  loading = signal(false);
  error = signal<string | null>(null);
  specializations = signal<string[]>([]);
  searchQuery = '';
  selectedDoctor: Doctor | null = null;
  filters: DoctorSearchParams = {
    per_page: 12,
    specialization: '',
    status: '',
    available_today: false
  };

  constructor(
    private doctorService: DoctorService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadSpecializations();
    this.loadDoctors();
  }

  loadSpecializations() {
    this.doctorService.getSpecializations().subscribe({
      next: (response) => {
        this.specializations.set(response.data);
      },
      error: (err) => {
        console.error('Error loading specializations:', err);
      }
    });
  }

  loadDoctors(page = 1) {
    this.loading.set(true);
    this.error.set(null);

    const params: DoctorSearchParams = {
      ...this.filters,
      page,
      per_page: this.filters.per_page
    };

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    this.doctorService.getDoctors(params).subscribe({
      next: (response) => {
        this.doctors.set(response.data);
        this.meta.set(response.meta);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load doctors. Please try again.');
        this.loading.set(false);
        console.error('Error loading doctors:', err);
      }
    });
  }

  search() {
    this.loadDoctors(1);
  }

  nextPage() {
    if (this.meta().current_page < this.meta().last_page) {
      this.loadDoctors(this.meta().current_page + 1);
    }
  }

  previousPage() {
    if (this.meta().current_page > 1) {
      this.loadDoctors(this.meta().current_page - 1);
    }
  }

  viewDoctor(id: number) {
    // TODO: Navigate to doctor detail view
    console.log('View doctor:', id);
  }

  viewProfile(doctor: Doctor, event: Event) {
    event.stopPropagation();
    this.selectedDoctor = doctor;
    
    // Use setTimeout to ensure the modal component is rendered
    setTimeout(() => {
      const modal = document.querySelector('app-doctor-profile-modal') as any;
      if (modal && modal.show) {
        modal.show(doctor);
      }
    }, 0);
  }

  onProfileClosed() {
    this.selectedDoctor = null;
  }

  canManageDoctors() {
    const user = this.authService.getCurrentUser();
    return user?.permissions?.includes('create_doctors') || user?.permissions?.includes('manage_users');
  }

  trackByDoctorId(index: number, doctor: Doctor) {
    return doctor.id;
  }
}
