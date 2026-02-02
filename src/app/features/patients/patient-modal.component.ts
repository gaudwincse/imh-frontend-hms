import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Patient, PatientService, CreatePatientData } from '../../core/services/patient.service';

@Component({
  selector: 'app-patient-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" *ngIf="visible()">
      <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">
            {{ isEditMode() ? 'Edit Patient' : 'Add New Patient' }}
          </h2>
          <button (click)="close()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading()" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">{{ isEditMode() ? 'Updating...' : 'Creating...' }} patient</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="text-red-800">{{ error() }}</div>
        </div>

        <!-- Form -->
        <form [formGroup]="patientForm" (ngSubmit)="onSubmit()" *ngIf="!loading()">
          <!-- Personal Information -->
          <div class="space-y-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input 
                    type="text" 
                    formControlName="first_name"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <div *ngIf="patientForm.get('first_name')?.invalid && patientForm.get('first_name')?.touched" class="text-red-600 text-sm mt-1">
                    First name is required
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input 
                    type="text" 
                    formControlName="last_name"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <div *ngIf="patientForm.get('last_name')?.invalid && patientForm.get('last_name')?.touched" class="text-red-600 text-sm mt-1">
                    Last name is required
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input 
                    type="date" 
                    formControlName="date_of_birth"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <div *ngIf="patientForm.get('date_of_birth')?.invalid && patientForm.get('date_of_birth')?.touched" class="text-red-600 text-sm mt-1">
                    Date of birth is required
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select 
                    formControlName="gender"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <div *ngIf="patientForm.get('gender')?.invalid && patientForm.get('gender')?.touched" class="text-red-600 text-sm mt-1">
                    Gender is required
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    formControlName="phone"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    formControlName="email"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <div *ngIf="patientForm.get('email')?.invalid && patientForm.get('email')?.touched" class="text-red-600 text-sm mt-1">
                    Please enter a valid email
                  </div>
                </div>

                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea 
                    formControlName="address"
                    rows="3"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  </textarea>
                </div>
              </div>
            </div>

            <!-- Medical Information -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select 
                    formControlName="blood_group"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Emergency Contact -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              
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
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                  <input 
                    type="text" 
                    formControlName="insurance_provider"
                    placeholder="e.g., Blue Cross Blue Shield"
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

            <!-- System Information -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
                  <select 
                    formControlName="branch_id"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Branch</option>
                    <option value="1">Main Hospital</option>
                    <option value="2">Dental Clinic</option>
                    <option value="3">Pediatrics Center</option>
                  </select>
                  <div *ngIf="patientForm.get('branch_id')?.invalid && patientForm.get('branch_id')?.touched" class="text-red-600 text-sm mt-1">
                    Branch is required
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select 
                    formControlName="status"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <div *ngIf="patientForm.get('status')?.invalid && patientForm.get('status')?.touched" class="text-red-600 text-sm mt-1">
                    Status is required
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-3 mt-6 pt-6 border-t">
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
              {{ isEditMode() ? 'Update Patient' : 'Create Patient' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class PatientModalComponent {
  visible = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  patient = signal<Patient | null>(null);
  isEditMode = signal(false);
  patientForm: FormGroup;

  constructor(
    private patientService: PatientService,
    private fb: FormBuilder
  ) {
    this.patientForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      date_of_birth: ['', [Validators.required]],
      gender: ['male', [Validators.required]],
      blood_group: [''],
      phone: [''],
      email: ['', [Validators.email]],
      address: [''],
      emergency_contact_name: [''],
      emergency_contact_phone: [''],
      insurance_provider: [''],
      insurance_policy_no: [''],
      branch_id: ['', [Validators.required]],
      status: ['active', [Validators.required]]
    });
  }

  show(patient?: Patient) {
    this.visible.set(true);
    this.error.set(null);
    this.patient.set(patient || null);
    this.isEditMode.set(!!patient);
    
    if (patient) {
      this.patientForm.patchValue({
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        blood_group: patient.blood_group,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        emergency_contact_name: patient.emergency_contact_name,
        emergency_contact_phone: patient.emergency_contact_phone,
        insurance_provider: patient.insurance_provider,
        insurance_policy_no: patient.insurance_policy_no,
        branch_id: patient.branch_id,
        status: patient.status
      });
    } else {
      this.patientForm.reset({
        gender: 'male',
        status: 'active'
      });
    }
  }

  close() {
    this.visible.set(false);
    this.patient.set(null);
    this.isEditMode.set(false);
    this.error.set(null);
    this.patientForm.reset({
      gender: 'male',
      status: 'active'
    });
  }

  onSubmit() {
    if (this.patientForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.patientForm.controls).forEach(key => {
        this.patientForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formData: CreatePatientData = this.patientForm.value;

    if (this.isEditMode()) {
      this.updatePatient(formData);
    } else {
      this.createPatient(formData);
    }
  }

  private createPatient(data: CreatePatientData) {
    this.patientService.createPatient(data).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.close();
        this.onSuccess.emit({
          action: 'create',
          patient: response.data
        });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to create patient');
        this.loading.set(false);
        console.error('Error creating patient:', err);
      }
    });
  }

  private updatePatient(data: CreatePatientData) {
    if (!this.patient()) return;

    this.patientService.updatePatient(this.patient()!.id, data).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.close();
        this.onSuccess.emit({
          action: 'update',
          patient: response.data
        });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to update patient');
        this.loading.set(false);
        console.error('Error updating patient:', err);
      }
    });
  }

  onSuccess = signal<{ action: 'create' | 'update'; patient: Patient } | null>(null);
}