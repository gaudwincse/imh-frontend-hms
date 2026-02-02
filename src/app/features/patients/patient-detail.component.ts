import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientService, Patient, CreatePatientData } from '../../core/services/patient.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, DatePipe],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center">
          <button (click)="goBack()" class="mr-4 text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Patient Details</h1>
            <p class="text-gray-600" *ngIf="patient()">{{ patient().patient_no }}</p>
          </div>
        </div>
        <div class="flex space-x-3">
          <button 
            *ngIf="!isEditing()"
            (click)="startEditing()"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Edit Patient
          </button>
          <button 
            *ngIf="isEditing()"
            (click)="cancelEditing()"
            class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button 
            *ngIf="isEditing()"
            (click)="saveChanges()"
            [disabled]="patientForm.invalid || loading()"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
            <span *ngIf="!loading()">Save Changes</span>
            <span *ngIf="loading()">Saving...</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading patient information...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ error() }}</p>
      </div>

      <!-- Patient Content -->
      <div *ngIf="!loading() && !error() && patient()" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Information -->
        <div class="lg:col-span-2">
          <!-- Personal Information -->
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            
            <div *ngIf="!isEditing()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600">Full Name</p>
                <p class="font-medium">{{ patient().first_name }} {{ patient().last_name }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Date of Birth</p>
                <p class="font-medium">{{ formatDate(patient().date_of_birth) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Gender</p>
                <p class="font-medium capitalize">{{ patient().gender }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Blood Group</p>
                <p class="font-medium">{{ patient().blood_group || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Phone</p>
                <p class="font-medium">{{ patient().phone || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Email</p>
                <p class="font-medium">{{ patient().email || '-' }}</p>
              </div>
              <div class="md:col-span-2">
                <p class="text-sm text-gray-600">Address</p>
                <p class="font-medium">{{ patient().address || '-' }}</p>
              </div>
            </div>

            <form *ngIf="isEditing()" [formGroup]="patientForm">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input 
                    type="text" 
                    formControlName="first_name"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                  <div *ngIf="patientForm.get('first_name')?.invalid" class="text-red-600 text-sm mt-1">
                    First name is required
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input 
                    type="text" 
                    formControlName="last_name"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                  <div *ngIf="patientForm.get('last_name')?.invalid" class="text-red-600 text-sm mt-1">
                    Last name is required
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input 
                    type="date" 
                    formControlName="date_of_birth"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                  <div *ngIf="patientForm.get('date_of_birth')?.invalid" class="text-red-600 text-sm mt-1">
                    Date of birth is required
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select 
                    formControlName="gender"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <input 
                    type="text" 
                    formControlName="blood_group"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    formControlName="phone"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    formControlName="email"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                  <select 
                    formControlName="branch_id"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Branch</option>
                    <!-- TODO: Load branches from API -->
                    <option value="1">Main Hospital</option>
                    <option value="2">Dental Clinic</option>
                  </select>
                </div>

                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea 
                    formControlName="address"
                    rows="3"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
              </div>
            </form>
          </div>

          <!-- Emergency Contact -->
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h2>
            
            <div *ngIf="!isEditing()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600">Contact Name</p>
                <p class="font-medium">{{ patient().emergency_contact_name || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Contact Phone</p>
                <p class="font-medium">{{ patient().emergency_contact_phone || '-' }}</p>
              </div>
            </div>

            <div *ngIf="isEditing()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input 
                  type="text" 
                  formControlName="emergency_contact_name"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input 
                  type="tel" 
                  formControlName="emergency_contact_phone"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
              </div>
            </div>
          </div>

          <!-- Insurance Information -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h2>
            
            <div *ngIf="!isEditing()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600">Insurance Provider</p>
                <p class="font-medium">{{ patient().insurance_provider || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Policy Number</p>
                <p class="font-medium">{{ patient().insurance_policy_no || '-' }}</p>
              </div>
            </div>

            <div *ngIf="isEditing()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                <input 
                  type="text" 
                  formControlName="insurance_provider"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                <input 
                  type="text" 
                  formControlName="insurance_policy_no"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <!-- Status Card -->
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Status</h2>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-gray-600">Current Status</p>
                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="{
                        'bg-green-100 text-green-800': patient().status === 'active',
                        'bg-yellow-100 text-yellow-800': patient().status === 'inactive',
                        'bg-red-100 text-red-800': patient().status === 'deceased'
                      }">
                  {{ patient().status }}
                </span>
              </div>
              <div>
                <p class="text-sm text-gray-600">Branch</p>
                <p class="font-medium">{{ patient().branch?.name || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Age</p>
                <p class="font-medium">{{ calculateAge(patient().date_of_birth) }} years</p>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div class="space-y-2">
              <button 
                (click)="viewMedicalRecords()"
                class="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                📋 View Medical History
              </button>
              <button 
                (click)="viewPrescriptions()"
                class="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                💊 Manage Prescriptions
              </button>
              <button 
                (click)="scheduleAppointment()"
                class="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                📅 Schedule Appointment
              </button>
              <button 
                (click)="viewLabResults()"
                class="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                🧪 View Lab Results
              </button>
              <button 
                (click)="viewInvoices()"
                class="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                💳 Billing History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PatientDetailComponent implements OnInit {
  patient = signal<Patient | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  isEditing = signal(false);
  patientForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private authService: AuthService,
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
      branch_id: ['']
    });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadPatient(id);
    } else {
      this.error.set('Invalid patient ID');
    }
  }

  loadPatient(id: number) {
    this.loading.set(true);
    this.error.set(null);

    this.patientService.getPatient(id).subscribe({
      next: (response) => {
        this.patient.set(response.data);
        this.updateForm(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load patient information');
        this.loading.set(false);
        console.error('Error loading patient:', err);
      }
    });
  }

  updateForm(patient: Patient) {
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
      branch_id: patient.branch_id
    });
  }

  startEditing() {
    this.isEditing.set(true);
  }

  cancelEditing() {
    this.isEditing.set(false);
    if (this.patient()) {
      this.updateForm(this.patient()!);
    }
  }

  saveChanges() {
    if (this.patientForm.invalid || !this.patient()) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const updatedData = this.patientForm.value;

    this.patientService.updatePatient(this.patient()!.id, updatedData).subscribe({
      next: (response) => {
        this.patient.set(response.data);
        this.isEditing.set(false);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to update patient information');
        this.loading.set(false);
        console.error('Error updating patient:', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/patients']);
  }

  viewMedicalRecords() {
    this.router.navigate(['/patients', this.patient()!.id, 'medical-records']);
  }

  viewPrescriptions() {
    this.router.navigate(['/patients', this.patient()!.id, 'prescriptions']);
  }

  scheduleAppointment() {
    this.router.navigate(['/appointments'], { queryParams: { patient_id: this.patient()!.id } });
  }

  viewLabResults() {
    this.router.navigate(['/patients', this.patient()!.id, 'lab-results']);
  }

  viewInvoices() {
    this.router.navigate(['/patients', this.patient()!.id, 'invoices']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  calculateAge(dateString: string): number {
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}