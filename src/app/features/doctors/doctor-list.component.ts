import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DoctorService, Doctor, DoctorSearchParams } from '../../core/services/doctor.service';
import { AuthService } from '../../core/services/auth.service';
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
  standalone: true,
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
    MatProgressBarModule
  ],
  template: `
    <div class="doctor-list-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Doctors</mat-card-title>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
            <button 
              mat-raised-button 
              color="accent" 
              (click)="createDoctor()"
              *ngIf="authService.hasPermission('create_doctors')"
            >
              <mat-icon>add</mat-icon>
              Add Doctor
            </button>
          </mat-card-actions>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Loading Indicator -->
          <mat-progress-bar 
            *ngIf="loading()" 
            mode="indeterminate"
            class="loading-indicator"
          ></mat-progress-bar>

          <!-- Error Display -->
          <div class="error-message" *ngIf="error()">
            <mat-icon color="warn">error</mat-icon>
            <span>{{ error() }}</span>
          </div>

          <!-- Filters -->
          <div class="filters-section">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput (keyup)="applyFilters()" placeholder="Search doctors...">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Specialization</mat-label>
              <mat-select (selectionChange)="applyFilters()">
                <mat-option value="">All Specializations</mat-option>
                <mat-option *ngFor="let spec of specializations()" [value]="spec">
                  {{ spec }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select (selectionChange)="applyFilters()">
                <mat-option value="">All Status</mat-option>
                <mat-option value="active">Active</mat-option>
                <mat-option value="on_leave">On Leave</mat-option>
                <mat-option value="resigned">Resigned</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Doctors Table -->
          <div class="table-container">
            <table mat-table [dataSource]="doctors()">
              <ng-container matColumnDef="employee_no">
                <th mat-header-cell *matHeaderCellDef>Employee No</th>
                <td mat-cell *matCellDef="let doctor">{{ doctor.employee_no }}</td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let doctor">
                  {{ doctor.user?.name || 'N/A' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="specialization">
                <th mat-header-cell *matHeaderCellDef>Specialization</th>
                <td mat-cell *matCellDef="let doctor">{{ doctor.specialization }}</td>
              </ng-container>

              <ng-container matColumnDef="qualification">
                <th mat-header-cell *matHeaderCellDef>Qualification</th>
                <td mat-cell *matCellDef="let doctor">{{ doctor.qualification }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let doctor">
                  <span class="status-badge" [ngClass]="doctor.status">
                    {{ doctor.status?.replace('_', ' ') || 'Unknown' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let doctor">
                  <button mat-icon-button color="primary" (click)="viewDoctor(doctor.id)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button 
                    mat-icon-button 
                    color="accent" 
                    (click)="editDoctor(doctor.id)"
                    *ngIf="authService.hasPermission('update_doctors')"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button 
                    mat-icon-button 
                    color="warn" 
                    (click)="deleteDoctor(doctor.id)"
                    *ngIf="authService.hasPermission('delete_doctors')"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .doctor-list-container {
      padding: 1rem;
    }

    .loading-indicator {
      margin-bottom: 1rem;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background-color: #ffebee;
      border-radius: 4px;
      color: #c62828;
    }

    .filters-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .filters-section mat-form-field {
      flex: 1;
      min-width: 200px;
    }

    .table-container {
      overflow-x: auto;
    }

    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-badge.active {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-badge.on_leave {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-badge.resigned {
      background-color: #ffebee;
      color: #c62828;
    }

    mat-card-header {
      margin-bottom: 1rem;
    }

    mat-card-actions {
      display: flex;
      gap: 0.5rem;
    }
  `]
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
    'actions'
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
      this.snackBar.open('You do not have permission to view doctors', 'Close', {
        duration: 3000
      });
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
        this.specializations.set(response.data || []);
        console.log('📋 Specializations loaded:', response.data);
      },
      error: (err) => {
        console.error('❌ Error loading specializations:', err);
        this.snackBar.open('Failed to load specializations', 'Close', {
          duration: 3000
        });
      }
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
            duration: 3000
          });
        }
      }
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

  createDoctor(): void {
    this.router.navigate(['/doctors', 'create']);
  }

  deleteDoctor(id: number): void {
    // Implement delete confirmation and logic
    console.log('🗑️ Delete doctor:', id);
  }
}