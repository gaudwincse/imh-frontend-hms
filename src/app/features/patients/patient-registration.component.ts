import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService, RegisterPatientData } from '../../core/services/patient.service';

@Component({
  selector: 'app-patient-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" *ngIf="visible()">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-900">Register New Patient</h3>
          <button (click)="close()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form [formGroup]="patientForm" (ngSubmit)="onSubmit()">
          <!-- Personal Information -->
          <div class="mb-6">
            <h4 class="text-md font-semibold text-gray-800 mb-3">Personal Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input 
                  type="text" 
                  formControlName="first_name"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <div *ngIf="patientForm.get('first_name')?.invalid && patientForm.get('first_name')?.touched" 
                     class="text-red-600 text-sm mt-1">
                  First name is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input 
                  type="text" 
                  formControlName="last_name"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <div *ngIf="patientForm.get('last_name')?.invalid && patientForm.get('last_name')?.touched" 
                     class="text-red-600 text-sm mt-1">
                  Last name is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input 
                  type="date" 
                  formControlName="date_of_birth"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <div *ngIf="patientForm.get('date_of_birth')?.invalid && patientForm.get('date_of_birth')?.touched" 
                     class="text-red-600 text-sm mt-1">
                  Date of birth is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select 
                  formControlName="gender"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <div *ngIf="patientForm.get('gender')?.invalid && patientForm.get('gender')?.touched" 
                     class="text-red-600 text-sm mt-1">
                  Gender is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <input 
                  type="text" 
                  formControlName="blood_group"
                  placeholder="e.g., O+, A-"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input 
                  type="tel" 
                  formControlName="phone"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <div *ngIf="patientForm.get('phone')?.invalid && patientForm.get('phone')?.touched" 
                     class="text-red-600 text-sm mt-1">
                  Phone is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  formControlName="email"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <div *ngIf="patientForm.get('email')?.invalid && patientForm.get('email')?.touched" 
                     class="text-red-600 text-sm mt-1">
                  Please enter a valid email
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
                <select 
                  formControlName="branch_id"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Branch</option>
                  <!-- TODO: Load branches from API -->
                  <option value="1">Main Hospital</option>
                  <option value="2">Dental Clinic</option>
                </select>
                <div *ngIf="patientForm.get('branch_id')?.invalid && patientForm.get('branch_id')?.touched" 
                     class="text-red-600 text-sm mt-1">
                  Branch is required
                </div>
              </div>
            </div>

            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea 
                formControlName="address"
                rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
          </div>

          <!-- Emergency Contact -->
          <div class="mb-6">
            <h4 class="text-md font-semibold text-gray-800 mb-3">Emergency Contact</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input 
                  type="text" 
                  formControlName="emergency_contact_name"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input 
                  type="tel" 
                  formControlName="emergency_contact_phone"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
            </div>
          </div>

          <!-- Insurance Information -->
          <div class="mb-6">
            <h4 class="text-md font-semibold text-gray-800 mb-3">Insurance Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                <input 
                  type="text" 
                  formControlName="insurance_provider"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                <input 
                  type="text" 
                  formControlName="insurance_policy_no"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
            </div>
          </div>

          <!-- User Account Creation -->
          <div class="mb-6">
            <h4 class="text-md font-semibold text-gray-800 mb-3">User Account (Optional)</h4>
            <div class="flex items-center mb-3">
              <input 
                type="checkbox" 
                id="create_user_account"
                formControlName="create_user_account"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <label for="create_user_account" class="ml-2 block text-sm text-gray-900">
                Create user account for patient
              </label>
            </div>

            <div *ngIf="patientForm.get('create_user_account')?.value" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">User Email *</label>
                <input 
                  type="email" 
                  formControlName="user_email"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <div *ngIf="patientForm.get('user_email')?.invalid && patientForm.get('user_email')?.touched" 
                     class="text-red-600 text-sm mt-1">
                  User email is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">User Password *</label>
                <input 
                  type="password" 
                  formControlName="user_password"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <div *ngIf="patientForm.get('user_password')?.invalid && patientForm.get('user_password')?.touched" 
                     class="text-red-600 text-sm mt-1">
                  Password must be at least 8 characters
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-3">
            <button 
              type="button"
              (click)="close()"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button 
              type="submit"
              [disabled]="patientForm.invalid || loading()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              <span *ngIf="!loading()">Register Patient</span>
              <span *ngIf="loading()">Registering...</span>
            </button>
          </div>
        </form>

        <!-- Error Message -->
        <div *ngIf="error()" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-red-800 text-sm">{{ error() }}</p>
        </div>
      </div>
    </div>
  `,
})
export class PatientRegistrationComponent {
  visible = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  @Output() patientRegistered = new EventEmitter<any>();

  patientForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService
  ) {
    this.patientForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      date_of_birth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      blood_group: [''],
      phone: ['', [Validators.required]],
      email: ['', [Validators.email]],
      address: [''],
      emergency_contact_name: [''],
      emergency_contact_phone: [''],
      insurance_provider: [''],
      insurance_policy_no: [''],
      branch_id: ['', [Validators.required]],
      create_user_account: [false],
      user_email: [''],
      user_password: ['']
    });
  }

  show() {
    this.visible.set(true);
    this.error.set(null);
    this.patientForm.reset();
  }

  close() {
    this.visible.set(false);
    this.error.set(null);
  }

  onSubmit() {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formData = this.patientForm.value;
    
    const patientData: RegisterPatientData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
      blood_group: formData.blood_group,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      emergency_contact_name: formData.emergency_contact_name,
      emergency_contact_phone: formData.emergency_contact_phone,
      insurance_provider: formData.insurance_provider,
      insurance_policy_no: formData.insurance_policy_no,
      branch_id: formData.branch_id,
      create_user_account: formData.create_user_account,
      user_email: formData.create_user_account ? formData.user_email : undefined,
      user_password: formData.create_user_account ? formData.user_password : undefined
    };

    this.patientService.registerPatient(patientData).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.close();
        this.patientRegistered.emit(response.data);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to register patient. Please try again.');
      }
    });
  }
}