import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DoctorService, CreateDoctorData, Specialization, User, Branch } from '../../core/services/doctor.service';
import { UserService, CreateUserRequest } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { finalize, catchError, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-add-doctor',
  standalone: true,
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
  template: `
    <div class="add-doctor-container">
      <mat-card class="stepper-card">
        <mat-card-header>
          <mat-card-title class="card-title">
            <mat-icon>person_add</mat-icon>
            Add New Doctor
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <mat-stepper [linear]="true" #stepper>
            
            <!-- Step 1: Personal Information -->
            <mat-step [stepControl]="personalInfoForm" label="Personal Information">
              <form [formGroup]="personalInfoForm" class="form-container">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Full Name</mat-label>
                    <input matInput formControlName="name" placeholder="Enter full name">
                    <mat-error *ngIf="personalInfoForm.get('name')?.hasError('required')">
                      Full name is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Email</mat-label>
                    <input matInput formControlName="email" placeholder="Enter email address" type="email">
                    <mat-error *ngIf="personalInfoForm.get('email')?.hasError('required')">
                      Email is required
                    </mat-error>
                    <mat-error *ngIf="personalInfoForm.get('email')?.hasError('email')">
                      Please enter a valid email
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Phone</mat-label>
                    <input matInput formControlName="phone" placeholder="Enter phone number">
                    <mat-error *ngIf="personalInfoForm.get('phone')?.hasError('required')">
                      Phone number is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Date of Birth</mat-label>
                    <input matInput [matDatepicker]="dobPicker" formControlName="dob">
                    <mat-datepicker #dobPicker></mat-datepicker>
                    <mat-error *ngIf="personalInfoForm.get('dob')?.hasError('required')">
                      Date of birth is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Gender</mat-label>
                    <mat-select formControlName="gender">
                      <mat-option value="">Select Gender</mat-option>
                      <mat-option value="male">Male</mat-option>
                      <mat-option value="female">Female</mat-option>
                      <mat-option value="other">Other</mat-option>
                    </mat-select>
                    <mat-error *ngIf="personalInfoForm.get('gender')?.hasError('required')">
                      Gender is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button mat-raised-button matStepperNext color="primary" 
                          [disabled]="!personalInfoForm.valid">
                    Next
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 2: Professional Information -->
            <mat-step [stepControl]="professionalInfoForm" label="Professional Information">
              <form [formGroup]="professionalInfoForm" class="form-container">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Specialization</mat-label>
                    <mat-select formControlName="specialization_id">
                      <mat-option value="">Select Specialization</mat-option>
                      <mat-option *ngFor="let spec of specializations()" [value]="spec.id">
                        {{ spec.name }}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="professionalInfoForm.get('specialization_id')?.hasError('required')">
                      Specialization is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Qualification</mat-label>
                    <input matInput formControlName="qualification" placeholder="Enter qualification">
                    <mat-error *ngIf="professionalInfoForm.get('qualification')?.hasError('required')">
                      Qualification is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Years of Experience</mat-label>
                    <input matInput formControlName="experience_years" type="number" placeholder="Enter years of experience">
                    <mat-error *ngIf="professionalInfoForm.get('experience_years')?.hasError('required')">
                      Experience years is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Consultation Fee</mat-label>
                    <input matInput formControlName="consultation_fee" type="number" step="0.01" placeholder="Enter consultation fee">
                    <mat-error *ngIf="professionalInfoForm.get('consultation_fee')?.hasError('required')">
                      Consultation fee is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Available Days</mat-label>
                    <mat-select formControlName="available_days" multiple>
                      <mat-option value="monday">Monday</mat-option>
                      <mat-option value="tuesday">Tuesday</mat-option>
                      <mat-option value="wednesday">Wednesday</mat-option>
                      <mat-option value="thursday">Thursday</mat-option>
                      <mat-option value="friday">Friday</mat-option>
                      <mat-option value="saturday">Saturday</mat-option>
                      <mat-option value="sunday">Sunday</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Slot Duration (minutes)</mat-label>
                    <input matInput formControlName="slot_duration_minutes" type="number" placeholder="Enter slot duration">
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Branch</mat-label>
                    <mat-select formControlName="branch_id">
                      <mat-option value="">Select Branch</mat-option>
                      <mat-option *ngFor="let branch of userBranches()" [value]="branch.id">
                        {{ branch.name }}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="professionalInfoForm.get('branch_id')?.hasError('required')">
                      Branch is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Status</mat-label>
                    <mat-select formControlName="status">
                      <mat-option value="active">Active</mat-option>
                      <mat-option value="on_leave">On Leave</mat-option>
                      <mat-option value="resigned">Resigned</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button mat-stroked-button matStepperPrevious>Back</button>
                  <button mat-raised-button matStepperNext color="primary" 
                          [disabled]="!professionalInfoForm.valid">
                    Next
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 3: Review & Submit -->
            <mat-step label="Review & Submit">
              <div class="review-container" *ngIf="combinedFormValid">
                <h3>Review Doctor Information</h3>
                
                <div class="review-section">
                  <h4>Personal Information</h4>
                  <p><strong>Name:</strong> {{ personalInfoForm.value.name }}</p>
                  <p><strong>Email:</strong> {{ personalInfoForm.value.email }}</p>
                  <p><strong>Phone:</strong> {{ personalInfoForm.value.phone }}</p>
                  <p><strong>Date of Birth:</strong> {{ personalInfoForm.value.dob | date:'mediumDate' }}</p>
                  <p><strong>Gender:</strong> {{ personalInfoForm.value.gender | titlecase }}</p>
                </div>

                <div class="review-section">
                  <h4>Professional Information</h4>
                  <p><strong>Specialization:</strong> {{ getSpecializationName(professionalInfoForm.value.specialization_id) }}</p>
                  <p><strong>Qualification:</strong> {{ professionalInfoForm.value.qualification }}</p>
                  <p><strong>Experience:</strong> {{ professionalInfoForm.value.experience_years }} years</p>
                  <p><strong>Consultation Fee:</strong> \${{ professionalInfoForm.value.consultation_fee }}</p>
                  <p><strong>Available Days:</strong> {{ professionalInfoForm.value.available_days?.join(', ') || 'Not specified' }}</p>
                  <p><strong>Status:</strong> {{ professionalInfoForm.value.status | titlecase }}</p>
                </div>

                <div class="step-actions">
                  <button mat-stroked-button matStepperPrevious>Back</button>
                  <button mat-raised-button color="primary" 
                          (click)="submitDoctor()"
                          [disabled]="isLoading()">
                    <mat-progress-spinner *ngIf="isLoading()" diameter="20"></mat-progress-spinner>
                    <span *ngIf="!isLoading()">Create Doctor</span>
                  </button>
                </div>
              </div>
            </mat-step>
          </mat-stepper>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .add-doctor-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .stepper-card {
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: 500;
    }

    .form-container {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 2rem;
    }

    .review-container {
      padding: 1rem;
    }

    .review-section {
      margin-bottom: 2rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .review-section h4 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: #1976d2;
    }

    .review-section p {
      margin: 0.5rem 0;
      line-height: 1.6;
    }

    mat-card-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    mat-card-content {
      padding: 2rem;
    }

    mat-step-header {
      font-size: 14px;
    }

    mat-progress-spinner {
      margin-right: 8px;
    }
  `]
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
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      gender: ['', [Validators.required]],
    });

    this.professionalInfoForm = this.fb.group({
      specialization_id: ['', [Validators.required]],
      qualification: ['', [Validators.required]],
      experience_years: ['', [Validators.required, Validators.min(0), Validators.max(50)]],
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
      }
    });
  }

  private loadUserBranches(): void {
    const user = this.authService.getCurrentUser();
    if (user?.branches) {
      this.userBranches.set(user.branches);
    }
  }

  getSpecializationName(specializationId: number): string {
    const spec = this.specializations().find(s => s.id === specializationId);
    return spec ? spec.name : 'Unknown';
  }

  submitDoctor(): void {
    if (!this.combinedFormValid) {
      return;
    }

    this.isLoading.set(true);

    // Step 1: Create user first
    const userData: CreateUserRequest = {
      name: this.personalInfoForm.value.name,
      email: this.personalInfoForm.value.email,
      phone: this.personalInfoForm.value.phone,
      gender: this.personalInfoForm.value.gender,
      dob: this.personalInfoForm.value.dob,
      password: 'TempPassword123!' // In production, this should be handled better
    };

    this.userService.createUser(userData).pipe(
      switchMap(userResponse => {
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
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response) => {
        if (response?.success) {
          this.showSuccess('Doctor created successfully!');
          this.router.navigate(['/doctors']);
        }
      },
      error: (err) => {
        console.error('Error creating doctor:', err);
        const message = err.error?.message || err || 'Failed to create doctor';
        this.showError(message);
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}