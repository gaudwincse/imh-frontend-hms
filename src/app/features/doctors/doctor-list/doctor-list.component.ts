import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  DoctorService,
  Doctor,
  DoctorSearchParams,
} from '../../../core/services/doctor.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-doctor-list',
  imports: [
    CommonModule,
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
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.scss',
})
export class DoctorListComponent implements OnInit {
  private doctorService = inject(DoctorService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  doctors = signal<Doctor[]>([]);
  specializations = signal<string[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  displayedColumns = [
    'employee_no',
    'name',
    'specialization',
    'qualification',
    'status',
    'actions',
  ];

  ngOnInit(): void {
    console.log('👨‍⚕️ DoctorListComponent initialized');
    this.checkAuthentication();
    this.loadData();
  }

  private checkAuthentication(): void {
    if (!this.authService.isLoggedIn()) {
      console.error('❌ User not authenticated, redirecting to login...');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.authService.hasPermission('view_doctors')) {
      console.error('❌ User lacks permission to view doctors');
      this.snackBar.open(
        'You do not have permission to view doctors',
        'Close',
        {
          duration: 3000,
        },
      );
      this.router.navigate(['/dashboard']);
      return;
    }

    console.log('✅ Authentication and permissions verified');
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    // Load data in parallel
    this.loadSpecializations();
    this.loadDoctors();
  }

  loadSpecializations(): void {
    this.doctorService.getSpecializations().subscribe({
      next: (response) => {
        const specs = (response.data || []).map((s) => s.name);
        this.specializations.set(specs);
        console.log('📋 Specializations loaded:', specs);
      },
      error: (err) => {
        console.error('❌ Error loading specializations:', err);
        this.snackBar.open('Failed to load specializations', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  loadDoctors(params?: DoctorSearchParams): void {
    this.doctorService.getDoctors(params).subscribe({
      next: (response) => {
        this.doctors.set(response.data || []);
        this.loading.set(false);
        console.log('👨‍⚕️ Doctors loaded:', response.data?.length || 0);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Failed to load doctors');
        console.error('❌ Error loading doctors:', err);

        if (err.status === 401) {
          console.error('❌ 401 Unauthorized - may need to re-login');
          this.snackBar.open('Session expired. Please login again.', 'Close', {
            duration: 3000,
          });
        }
      },
    });
  }

  applyFilters(): void {
    // Implement filter logic based on form values
    const filters: DoctorSearchParams = {};
    this.loadDoctors(filters);
  }

  refreshData(): void {
    console.log('🔄 Refreshing doctor data...');
    this.loadData();
  }

  viewDoctor(id: number): void {
    this.router.navigate(['/doctors', id]);
  }

  editDoctor(id: number): void {
    this.router.navigate(['/doctors', id, 'edit']);
  }

  navigateToAddDoctor(): void {
    this.router.navigate(['/doctors/add']);
  }

  deleteDoctor(id: number): void {
    // Implement delete confirmation and logic
    console.log('🗑️ Delete doctor:', id);
  }
}
