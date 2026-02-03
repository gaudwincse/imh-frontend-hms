import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  DoctorService,
  Doctor,
  DoctorSearchParams,
  Specialization,
  CreateDoctorData,
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
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {
  CreateUserRequest,
  UserService,
} from '../../../core/services/user.service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { finalize } from 'rxjs/internal/operators/finalize';

@Component({
  selector: 'app-add-doctor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './add-doctor.component.html',
  styleUrl: './add-doctor.component.scss',
})
export class AddDoctorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private doctorService = inject(DoctorService);
  private userService = inject(UserService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  personalInfoForm!: FormGroup;
  professionalInfoForm!: FormGroup;

  specializations = signal<Specialization[]>([]);
  userBranches = signal<any[]>([]);
  isLoading = signal<boolean>(false);

  constructor() {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadSpecializations();
    this.loadUserBranches();
  }

  private initializeForms(): void {
    this.personalInfoForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      gender: ['', [Validators.required]],
    });

    this.professionalInfoForm = this.fb.group({
      specialization_id: ['', [Validators.required]],
      qualification: ['', [Validators.required]],
      experience_years: [
        '',
        [Validators.required, Validators.min(0), Validators.max(50)],
      ],
      consultation_fee: ['', [Validators.required, Validators.min(0)]],
      available_days: [[]],
      slot_duration_minutes: [30],
      branch_id: ['', [Validators.required]],
      status: ['active'],
    });
  }

  get combinedFormValid(): boolean {
    return this.personalInfoForm.valid && this.professionalInfoForm.valid;
  }

  private loadSpecializations(): void {
    this.doctorService.getSpecializations().subscribe({
      next: (response) => {
        if (response.success) {
          this.specializations.set(response.data || []);
        }
      },
      error: (err) => {
        this.showError('Failed to load specializations');
        console.error('Error loading specializations:', err);
      },
    });
  }

  private loadUserBranches(): void {
    const user = this.authService.getCurrentUser();
    if (user?.branches) {
      this.userBranches.set(user.branches);
    }
  }

  getSpecializationName(specializationId: number): string {
    const spec = this.specializations().find((s) => s.id === specializationId);
    return spec ? spec.name : 'Unknown';
  }

  submitDoctor(): void {
    if (!this.combinedFormValid) {
      return;
    }

    this.isLoading.set(true);

    // Step 1: Create user first
    const userData: CreateUserRequest = {
      first_name: this.personalInfoForm.value.first_name,
      last_name: this.personalInfoForm.value.last_name,
      name: this.personalInfoForm.value.name,
      email: this.personalInfoForm.value.email,
      phone: this.personalInfoForm.value.phone,
      gender: this.personalInfoForm.value.gender,
      dob: this.personalInfoForm.value.dob,
      password: 'TempPassword123!', // In production, this should be handled better
    };

    this.userService
      .createUser(userData)
      .pipe(
        switchMap((userResponse) => {
          if (!userResponse?.success || !userResponse.data) {
            throw new Error(userResponse?.message || 'Failed to create user');
          }

          // Step 2: Create doctor with the user ID
          const doctorData: CreateDoctorData = {
            user_id: userResponse.data.id,
            ...this.professionalInfoForm.value,
          };

          return this.doctorService.createDoctor(doctorData);
        }),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (response) => {
          if (response?.success) {
            this.showSuccess('Doctor created successfully!');
            this.router.navigate(['/doctors']);
          }
        },
        error: (err) => {
          console.error('Error creating doctor:', err);
          const message =
            err.error?.message || err || 'Failed to create doctor';
          this.showError(message);
        },
      });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }
}
