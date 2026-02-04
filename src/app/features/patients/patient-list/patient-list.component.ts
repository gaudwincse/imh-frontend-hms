import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PatientService,
  Patient,
  PatientSearchParams,
} from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';
import { PatientRegistrationComponent } from '../patient-registration/patient-registration.component';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-list',
  imports: [
    CommonModule,
    FormsModule,
    PatientRegistrationComponent,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressBarModule,
  ],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss',
})
export class PatientListComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private patientService = inject(PatientService);
  public authService = inject(AuthService);
  private router = inject(Router);

  patients = signal<Patient[]>([]);
  meta = signal<any>({ current_page: 1, last_page: 1, per_page: 15, total: 0 });
  loading = signal(false);
  error = signal<string | null>(null);

  searchQuery = '';
  filters: PatientSearchParams = {
    per_page: 15,
    status: undefined,
    gender: undefined,
  };

  displayedColumns = [
    'patient_no',
    'first_name',
    'last_name',
    'gender',
    'age',
    'status',
    'actions',
  ];

  total = signal<number>(0);
  page = signal<number>(1);
  perPage = signal<number>(10);

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients(page = 1) {
    this.loading.set(true);
    this.error.set(null);

    const params: PatientSearchParams = {
      ...this.filters,
      page,
      per_page: this.filters.per_page!,
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
      },
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
    const registrationComponent = document.querySelector(
      'app-patient-registration',
    ) as any;
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

  navigateToAddPatient(): void {
    this.router.navigate(['/patients/register']);
  }

  applyFilters(): void {
  }

  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.perPage.set(event.pageSize);
    this.loadPatients();
  }
}
