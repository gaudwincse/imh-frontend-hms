import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Patient, PatientService, PatientSearchParams } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';
import { PatientModalComponent } from '../patient-modal/patient-modal.component';

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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, PatientModalComponent],
  templateUrl: './patient-list-enhanced.component.html',
  styleUrl: './patient-list-enhanced.component.scss',
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
    return !!(user?.permissions?.includes('patients.delete') ?? false);
  }

  trackByPatientId(index: number, patient: Patient) {
    return patient.id;
  }

  trackByPageNumber(index: number, page: number) {
    return page;
  }

  get lastItemIndex() {
    return Math.min(
      this.meta().current_page * this.meta().per_page!,
      this.meta().total
    );
  }
}
