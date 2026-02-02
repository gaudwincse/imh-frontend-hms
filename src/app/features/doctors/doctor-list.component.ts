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
    styleUrls: ['./doctor-list.component.scss'],
    template: `
    <div class="container">
      <!-- Header -->
      <div class="header-section">
        <h1>Doctor <span>Directory</span></h1>
        <button
          *ngIf="canManageDoctors()"
          class="btn-add-doctor">
          ➕ Add New Doctor
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="search-filters">
        <div class="filters-grid">
          <input
            type="text"
            placeholder="Search doctors..."
            class="search-input"
            [(ngModel)]="searchQuery"
            (keyup.enter)="search()">

          <select
            class="filter-select"
            [(ngModel)]="filters.specialization"
            (change)="search()">
            <option value="">All Specializations</option>
            <option *ngFor="let spec of specializations()" [value]="spec">{{ spec }}</option>
          </select>

          <select
            class="filter-select"
            [(ngModel)]="filters.status"
            (change)="search()">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="resigned">Resigned</option>
          </select>

          <div class="checkbox-wrapper">
            <input
              type="checkbox"
              id="available_today"
              [(ngModel)]="filters.available_today"
              (change)="search()">
            <label for="available_today">Available Today</label>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="loading-state">
        <div class="spinner"></div>
        <p>Loading doctors...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="error-alert">
        <p>{{ error() }}</p>
      </div>

      <!-- Doctors Grid -->
      <div *ngIf="!loading() && !error()" class="doctors-grid">
        <div *ngFor="let doctor of doctors(); trackBy: trackByDoctorId"
             class="doctor-card"
             (click)="viewDoctor(doctor.id)">
          <div class="card-content">
            <!-- Doctor Header -->
            <div class="doctor-header">
              <div class="doctor-avatar">
                {{ (doctor.user?.name?.charAt(0) || 'D').toUpperCase() }}
              </div>
              <div class="doctor-info">
                <h3>{{ doctor.user?.name || 'Unknown' }}</h3>
                <p>{{ doctor.employee_no }}</p>
              </div>
            </div>

            <!-- Doctor Details -->
            <div class="doctor-details">
              <div class="detail-item">
                <span class="label">Specialty</span>
                <span class="value">{{ doctor.specialization }}</span>
              </div>

              <div class="detail-item">
                <span class="label">Experience</span>
                <span class="value">{{ doctor.experience_years }} yrs</span>
              </div>

              <div class="detail-item">
                <span class="label">Consultation</span>
                <span class="value">{{ doctor.consultation_fee }}</span>
              </div>

              <div class="detail-item">
                <span class="label">Branch</span>
                <span class="value">{{ doctor.branch?.name || '-' }}</span>
              </div>
            </div>

            <!-- Available Days -->
            <div *ngIf="doctor.available_days && doctor.available_days.length > 0" class="available-days">
              <span class="label">Available Days</span>
              <div class="days-list">
                <span *ngFor="let day of doctor.available_days"
                      class="day-tag">
                  {{ day.charAt(0).toUpperCase() + day.slice(1, 3) }}
                </span>
              </div>
            </div>
          </div>

            <!-- Footer -->
            <div class="doctor-footer">
              <span class="status-badge"
                    [ngClass]="doctor.status === 'active' ? 'active' : doctor.status === 'on_leave' ? 'on-leave' : 'resigned'">
                {{ doctor.status.replace('_', ' ') }}
              </span>

              <button (click)="viewProfile(doctor, $event)"
                      class="btn-view-profile">
                View Profile →
              </button>
            </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && !error() && doctors().length === 0" class="empty-state">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        <h3>No doctors found</h3>
        <p>Try adjusting your search filters.</p>
      </div>

      <!-- Pagination -->
      <div *ngIf="meta().total > 0" class="pagination">
        <div class="pagination-info">
          Showing <span class="highlight">{{ (meta().current_page - 1) * meta().per_page + 1 }}</span> to
          <span class="highlight">{{ getToNumber() }}</span> of
          <span class="highlight">{{ meta().total }}</span> doctors
        </div>
        <div class="pagination-buttons">
          <button
            class="btn-pagination"
            [disabled]="meta().current_page === 1"
            (click)="previousPage()">
            ← Previous
          </button>
          <button
            class="btn-pagination"
            [disabled]="meta().current_page === meta().last_page"
            (click)="nextPage()">
            Next →
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
    specialization: undefined,
    status: undefined,
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
      per_page: this.filters.per_page!
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

  getToNumber(): number {
    const current = this.meta().current_page;
    const perPage = this.meta().per_page;
    const total = this.meta().total;
    const to = current * perPage;
    return to > total ? total : to;
  }
}
