import { Component, signal, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Patient, PatientService } from '../../core/services/patient.service';
import { Doctor, DoctorService } from '../../core/services/doctor.service';
import { MedicalRecordService } from '../../core/services/medical-record.service';
import { PrescriptionService, CreatePrescriptionData, PrescriptionItem, Prescription } from '../../core/services/prescription.service';

interface PrescriptionWithDetails extends Prescription {
  patient_name?: string;
  doctor_name?: string;
  items?: PrescriptionItem[];
  created_by_user?: any;
  formatted_issue_date?: string;
  formatted_expiry_date?: string;
  patient?: {
    first_name: string;
    last_name: string;
    patient_no: string;
  };
  doctor?: {
    user?: {
      name: string;
      email: string;
    };
  };
  formatted_expires_at?: string;
}

interface CreatePrescriptionItem {
  medicine_id?: number;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  quantity: number;
  instructions?: string;
  unit_price: number;
}

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
  selector: 'app-prescription-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" *ngIf="visible()">
      <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">
            {{ isEditMode() ? 'Edit Prescription' : 'New Prescription' }}
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
          <p class="mt-2 text-gray-600">{{ isEditMode() ? 'Updating...' : 'Creating...' }} prescription</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="text-red-800">{{ error() }}</div>
        </div>

        <!-- Form -->
        <form [formGroup]="prescriptionForm" (ngSubmit)="onSubmit()" *ngIf="!loading()">
          <!-- Patient Info -->
          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
            
            <div class="text-sm text-gray-600 mb-2">{{ patient()?.first_name }} {{ patient()?.last_name }}</div>
            <div class="text-sm text-gray-600">ID: {{ patient()?.patient_no }}</div>
            <div class="text-sm text-gray-600">Age: {{ calculateAge(patient()?.date_of_birth) }} years</div>
            </div>

          <!-- Doctor Selection -->
          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Doctor Information</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Select Doctor *</label>
                <select 
                  formControlName="doctor_id"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  (change)="onDoctorChange()"
                  class="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Doctor</option>
                  @for="let doctor of doctors(); track doctor.id" [value]="doctor.id">
                    <option [value]="doctor.id">{{ doctor.user?.name }} - {{ doctor.specialization }}</option>
                  </option>
                </select>
                <div *ngIf="prescriptionForm.get('doctor_id')?.invalid && prescriptionForm.get('doctor_id')?.touched" class="text-red-600 text-sm mt-1">
                  Doctor is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Consultation Fee</label>
                <div class="text-gray-900">${ selectedDoctor()?.consultation_fee || 'N/A' }}</div>
              </div>
            </div>
          </div>

          <!-- Prescription Details -->
          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Prescription Details</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
                <input 
                  type="date" 
                  formControlName="issue_date"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <div *ngIf="prescriptionForm.get('issue_date')?.invalid && prescriptionForm.get('issue_date')?.touched" class="text-red-600 text-sm mt-1">
                    Issue date is required
                  </div>
                </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                <input 
                  type="date" 
                  formControlName="expiry_date"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <div *ngIf="prescriptionForm.get('expiry_date')?.invalid && prescriptionForm.get('expiry_date')?.touched" class="text-red-600 text-sm mt-1">
                    Expiry date is required
                  </div>
                </div>
              </div>
            </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Diagnosis *</label>
                <textarea 
                  formControlName="diagnosis"
                  rows="4"
                  placeholder="Clinical diagnosis and findings..."
                  class="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </textarea>
                <div *ngIf="prescriptionForm.get('diagnosis')?.invalid && prescriptionForm.get('diagnosis')?.touched" class="text-red-600 text-sm mt-1">
                  Diagnosis is required
                  </div>
                </div>
              </div>
            </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea 
                  formControlName="notes"
                  rows="3"
                  placeholder="Additional notes..."
                  class="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </textarea>
              </div>
            </div>
          </div>

          <!-- Prescription Items -->
          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Prescription Items</h3>
              <button 
                type="button"
                (click)="addPrescriptionItem()"
                class="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                + Add Medication
              </button>
            </div>

            <div *ngFor="let item of prescriptionForm.value.items; let i = index" class="space-y-4">
              <div class="bg-white rounded-lg p-4 border border-gray-200">
                <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Medication *</label>
                    <input 
                      type="text" 
                      formControlName="items." + i + ".medicine_name"
                      formControlName="items." + i + ".dosage"
                      class="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      (input 
                        formControlName="items." + i + ".medicine_id"
                        type="hidden"
                        class="w-full border-gray-300 rounded-lg px-3 py-2">
                        class="text-sm text-gray-600"
                        *ngIf="item.medicine_id" 
                              [ngValue]="getMedicineName(item.medicine_id)"
                              class="text-gray-900">{{ getMedicineName(item.medicine_id) }}</div>
                      </input>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                    <input 
                      type="text" 
                      formControlName="items." + i + ".dosage"
                      class="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </input>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select 
                      formControlName="items." + i + ".frequency"
                      class="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="once_daily">Once daily</option>
                      <option value="twice_daily">Twice daily</option>
                      <option value="three_times_daily">Three times daily</option>
                      <option value="four_times_daily">Four times daily</option>
                      <option value="every_4_hours">Every 4 hours</option>
                      <option value="every_6_hours">Every 6 hours</option>
                      <option value="every_8_hours">Every 8 hours</option>
                      <option value="every_12_hours">Every 12 hours</option>
                      <option value="as_needed">As needed</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                    <input 
                      type="number" 
                      formControlName="items." + i + ".duration_days"
                      class="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      class="w-full border-gray-300 rounded-lg px-3 py-2">
                    </input>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input 
                      type="number" 
                      formControlName="items." + i + ".quantity"
                      class="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      class="w-full border-gray-300 rounded-lg px-3 py-2">
                    </input>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Unit Price ($)</label>
                    <input 
                      type="number" 
                      formControlName="items." + i + ".unit_price"
                      class="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      class="w-full border-gray-300 rounded-lg px-3 py-2"
                    </input>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Total</label>
                    <div class="text-sm font-medium text-gray-900">${ (parseFloat(item.unit_price || 0) * (parseFloat(item.quantity || 1) | 0).toFixed(2) }}</div>
                  </div>
                </div>

                <div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                    <textarea 
                      formControlName="items." + i + ".instructions"
                      rows="2"
                      placeholder="Dosage instructions..."
                      class="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </textarea>
                  </div>

                <div class="flex justify-end space-x-2">
                  <button 
                    (click)="removePrescriptionItem(i)"
                    class="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>

            <div *ngIf="prescriptionForm.value.items.length === 0" class="text-center py-8 text-gray-600">
              <p class="text-lg font-medium">No prescription items added yet. Click "Add Medication" to get started.</p>
            </div>
          </div>

          <!-- Totals -->
          <div class="bg-gray-100 p-4 rounded-lg mb-6">
            <div class="flex justify-between items-center">
              <span class="text-lg font-semibold">Total Items:</span>
              <span class="text-lg font-bold text-blue-600">{{ getTotalCost() }}</span>
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
              [disabled]="prescriptionForm.invalid || loading()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {{ isEditMode() ? 'Update' : 'Create' }} Prescription
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div 
      *ngIf="successMessage()" 
      class="fixed bottom-4 right-4 z-50">
      <div class="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
        <div class="text-white font-medium">{{ successMessage() }}</div>
      </div>
    </div>

    <div 
      *ngIf="errorMessage()" 
      class="fixed bottom-4 right-4 z-50">
      <div class="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
        <div class="text-white font-medium">{{ errorMessage() }}</div>
      </div>
    </div>
  </div>
  `
})
export class PrescriptionModalComponent {
  visible = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  patient = signal<Patient | null>(null);
  selectedPrescription = signal<PrescriptionWithDetails | null>(null);
  doctors = signal<Doctor[]>([]);
  selectedDoctor = signal<Doctor | null>(null);
  isEditMode = signal(false);

  prescriptionForm: FormGroup;
  formArray = this.fb.array([]);

  @Input() patient: Patient | null = null;
  close = output<void>();
  success = output<{ message: string; prescription?: Prescription }>();

  constructor(
    private prescriptionService: PrescriptionService,
    private doctorService: DoctorService,
    private patientService: PatientService,
    private medicalRecordService: MedicalRecordService,
    private fb: FormBuilder
  ) {
    this.prescriptionForm = this.fb.group({
      patient_id: ['', [Validators.required]],
      doctor_id: ['', [Validators.required]],
      issue_date: ['', [Validators.required]],
      expiry_date: ['', Validators.required],
      diagnosis: ['', [Validators.required]],
      notes: [''],
      items: this.fb.array([])
    });
  }

  show(prescription?: Prescription = null, patient?: Patient | null = null) {
    this.visible.set(true);
    this.error.set(null);
    this.prescription.set(prescription || null);
    this.patient.set(patient || null);
    this.isEditMode.set(!!prescription);
    
    if (prescription) {
      if (prescription.items) {
      prescription.items.forEach(item => {
        this.formArray.push(this.fb.group({
          medicine_id: [item.medicine_id || ''],
          medicine_name: [item.medicine_name || '', Validators.required],
          dosage: [item.dosage || ''],
          frequency: [item.frequency || 'once_daily'],
          duration_days: [item.duration_days || 7, [Validators.min(1)]],
          quantity: [item.quantity || 1, [Validators.min(1)]],
          instructions: [item.instructions || ''],
          unit_price: [item.unit_price || 0, [Validators.min(0)]]
        }));
      });
    }
    } else if (patient) {
      this.prescriptionForm.patchValue({
        patient_id: patient.id,
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now()).toISOString().split('T')[0],
        diagnosis: '',
        notes: '',
        items: []
      });
    }
    
    this.loadDoctors();
  }

  loadDoctors() {
    this.doctorService.getDoctors({ per_page: 100 }).subscribe({
      next: (response) => {
        this.doctors.set(response.data);
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
      }
    });
  }

  close() {
    this.visible.set(false);
    this.error.set(null);
    this.prescription.set(null);
    this.patient.set(null);
    this.isEditMode.set(false);
    this.successMessage.set(null);
    this.prescriptionForm.reset({
      patient_id: '',
      doctor_id: '',
      issue_date: '',
      expiry_date: '',
      diagnosis: '',
      notes: '',
      items: []
    });
  }

  onDoctorChange() {
    const doctorId = this.prescriptionForm.get('doctor_id').value;
    if (doctorId) {
      this.selectedDoctor.set(this.doctors().find(d => d.id === doctorId));
    }
  }

  onDateChange() {
    const issueDate = this.prescriptionForm.get('issue_date').value;
    if (issueDate) {
      // Auto-update expiry date if not set
      const expiryDate = new Date(issueDate);
      expiryDate.setDate(expiryDate.getDate() + 30); // 30 days default
      this.prescriptionForm.get('expiry_date').setValue(expiryDate.toISOString().split('T')[0]);
    }
  }

  addPrescriptionItem() {
    const itemGroup = this.fb.group({
      medicine_id: [''],
      medicine_name: ['', Validators.required],
      dosage: [''],
      frequency: ['once_daily'],
      duration_days: [7, [Validators.min(1)]],
      quantity: [1, [Validators.min(1)]],
      instructions: [''],
      unit_price: [0, [Validators.min(0)]]
    });

    this.formArray.push(itemGroup);
  }

  removePrescriptionItem(index: number) {
    this.formArray.removeAt(index);
  }

  onSubmit() {
    if (this.prescriptionForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.prescriptionForm.controls).forEach(key => {
        this.prescriptionForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formData = this.prescriptionForm.value;

    if (this.isEditMode()) {
      this.updatePrescription(formData);
    } else {
      this.createPrescription(formData);
    }
  }

  private createPrescription(formData: any) {
    this.prescriptionService.createPrescription(formData).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.successMessage.set('Prescription created successfully!');
        this.close();
        this.success.emit({
          message: 'Prescription created successfully!',
          prescription: response.data
        });
      },
      error: (err) => {
        this.errorMessage(err.error?.message || 'Failed to create prescription');
        this.loading.set(false);
        console.error('Error creating prescription:', err);
      }
    });
  }

  private updatePrescription(formData: any) {
    if (!this.selectedPrescription()) return;

    this.prescriptionService.updatePrescription(this.selectedPrescription()!.id, formData).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.successMessage.set('Prescription updated successfully!');
        this.close();
        this.success.emit({
          message: 'Prescription updated successfully!',
          prescription: response.data
        });
      },
      error: (err) => {
        this.errorMessage(err.error?.message || 'Failed to update prescription');
        this.loading.set(false);
        console.error('Error updating prescription:', err);
      }
    });
  }

  getTotalCost(): number {
    return this.formArray.controls.reduce((total, control) => {
      const item = control.value;
      return total + (parseFloat(item.unit_price || 0) * parseInt(item.quantity || 0));
    }, 0);
  }

  calculateAge(dateOfBirth?: string): number {
    if (!dateOfBirth) return 0;
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  getMedicineName(medicineId?: number): string {
    if (!medicineId) return '';
    return `Medicine ID: ${medicineId}`;
  }
}
}