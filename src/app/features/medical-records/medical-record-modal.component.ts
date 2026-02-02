import { Component, signal, inject, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Patient, MedicalRecord, CreateMedicalRecordData } from '../../core/services/patient.service';
import { MedicalRecordService } from '../../core/services/medical-record.service';
import { DoctorService, Doctor } from '../../core/services/doctor.service';

@Component({
  selector: 'app-medical-record-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" *ngIf="visible()">
      <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">
            {{ isEditMode() ? 'Edit Medical Record' : 'Add Medical Record' }}
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
          <p class="mt-2 text-gray-600">{{ isEditMode() ? 'Updating...' : 'Creating...' }} medical record</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="text-red-800">{{ error() }}</div>
        </div>

        <!-- Form -->
        <form [formGroup]="recordForm" (ngSubmit)="onSubmit()" *ngIf="!loading()">
          <!-- Patient Info -->
          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <div class="text-sm text-gray-900 font-medium">
                  {{ patient()?.first_name }} {{ patient()?.last_name }}
                </div>
                <div class="text-xs text-gray-500">ID: {{ patient()?.patient_no }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <div class="text-sm text-gray-900 font-medium">
                  {{ calculateAge(patient()?.date_of_birth) }} years
                </div>
              </div>
            </div>
          </div>

          <!-- Record Information -->
          <div class="space-y-6">
            <!-- Basic Information -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Record Type *</label>
                  <select 
                    formControlName="record_type"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Type</option>
                    <option value="initial_consultation">Initial Consultation</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="emergency">Emergency</option>
                    <option value="pre_op">Pre-operative</option>
                    <option value="post_op">Post-operative</option>
                    <option value="discharge_summary">Discharge Summary</option>
                    <option value="consultation">Consultation</option>
                    <option value="progress_note">Progress Note</option>
                    <option value="other">Other</option>
                  </select>
                  <div *ngIf="recordForm.get('record_type')?.invalid && recordForm.get('record_type')?.touched" class="text-red-600 text-sm mt-1">
                    Record type is required
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input 
                    type="date" 
                    formControlName="record_date"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <div *ngIf="recordForm.get('record_date')?.invalid && recordForm.get('record_date')?.touched" class="text-red-600 text-sm mt-1">
                    Date is required
                  </div>
                </div>
              </div>
            </div>

            <!-- Chief Complaint -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Chief Complaint</h3>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Chief Complaint *</label>
                <textarea 
                  formControlName="chief_complaint"
                  rows="3"
                  placeholder="Describe the patient's main complaint..."
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </textarea>
                <div *ngIf="recordForm.get('chief_complaint')?.invalid && recordForm.get('chief_complaint')?.touched" class="text-red-600 text-sm mt-1">
                  Chief complaint is required
                </div>
              </div>
            </div>

            <!-- Medical History -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Medical History</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">History of Present Illness</label>
                  <textarea 
                    formControlName="history_of_present_illness"
                    rows="3"
                    placeholder="Describe the current illness..."
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  </textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Past Medical History</label>
                  <textarea 
                    formControlName="past_medical_history"
                    rows="3"
                    placeholder="Previous medical conditions..."
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  </textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Past Surgical History</label>
                  <textarea 
                    formControlName="past_surgical_history"
                    rows="3"
                    placeholder="Previous surgeries..."
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  </textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Family History</label>
                  <textarea 
                    formControlName="family_history"
                    rows="3"
                    placeholder="Family medical conditions..."
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  </textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Social History</label>
                  <textarea 
                    formControlName="social_history"
                    rows="3"
                    placeholder="Social habits, lifestyle..."
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  </textarea>
                </div>
              </div>
            </div>

            <!-- Examination -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Physical Examination</h3>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Physical Examination</label>
                <textarea 
                  formControlName="physical_examination"
                  rows="4"
                  placeholder="Physical examination findings..."
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </textarea>
              </div>
            </div>

            <!-- Assessment -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Assessment</h3>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Assessment</label>
                <textarea 
                  formControlName="assessment"
                  rows="3"
                  placeholder="Clinical assessment..."
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </textarea>
              </div>
            </div>

            <!-- Plan -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Treatment Plan</h3>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <textarea 
                  formControlName="plan"
                  rows="3"
                  placeholder="Treatment plan and recommendations..."
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </textarea>
              </div>
            </div>

            <!-- Additional Information -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                  <input 
                    type="text" 
                    formControlName="allergies"
                    placeholder="Known allergies..."
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Medications</label>
                  <input 
                    type="text" 
                    formControlName="medications"
                    placeholder="Current medications..."
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea 
                    formControlName="notes"
                    rows="2"
                    placeholder="Additional notes..."
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  </textarea>
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
              [disabled]="recordForm.invalid || loading()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {{ isEditMode() ? 'Update Record' : 'Create Record' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class MedicalRecordModalComponent {
  visible = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  record = signal<MedicalRecord | null>(null);
  patient = signal<Patient | null>(null);
  doctors = signal<Doctor[]>([]);
  isEditMode = signal(false);

  @Input() record: MedicalRecord | null = null;
  @Input() patient: Patient | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<{ action: 'create' | 'update'; record: MedicalRecord }>();

  constructor(
    private medicalRecordService: MedicalRecordService,
    private doctorService: DoctorService,
    private fb: FormBuilder
  ) {
    this.recordForm = this.fb.group({
      record_type: ['', [Validators.required]],
      record_date: ['', [Validators.required]],
      chief_complaint: ['', [Validators.required]],
      history_of_present_illness: [''],
      past_medical_history: [''],
      past_surgical_history: [''],
      family_history: [''],
      social_history: [''],
      physical_examination: [''],
      assessment: [''],
      plan: [''],
      allergies: [''],
      medications: [''],
      notes: [''],
      doctor_id: [''],
      patient_id: ['']
    });
  }

  show(record?: MedicalRecord, patient?: Patient) {
    this.visible.set(true);
    this.error.set(null);
    this.record.set(record || null);
    this.patient.set(patient || null);
    this.isEditMode.set(!!record);
    
    if (record) {
      this.recordForm.patchValue({
        record_type: record.record_type,
        record_date: record.record_date,
        chief_complaint: record.chief_complaint,
        history_of_present_illness: record.history_of_present_illness,
        past_medical_history: record.past_medical_history,
        past_surgical_history: record.past_surgical_history,
        family_history: record.family_history,
        social_history: record.social_history,
        physical_examination: record.physical_examination,
        assessment: record.assessment,
        plan: record.plan,
        allergies: record.allergies,
        medications: record.medications,
        notes: record.notes,
        doctor_id: record.doctor_id,
        patient_id: record.patient_id
      });
    } else if (patient) {
      this.recordForm.patchValue({
        patient_id: patient.id,
        record_date: new Date().toISOString().split('T')[0]
      });
    }
    
    this.loadDoctors();
  }

  close() {
    this.visible.set(false);
    this.record.set(null);
    this.patient.set(null);
    this.isEditMode.set(false);
    this.error.set(null);
    this.recordForm.reset({
      record_type: '',
      record_date: '',
      chief_complaint: '',
      history_of_present_illness: '',
      past_medical_history: '',
      past_surgical_history: '',
      family_history: '',
      social_history: '',
      physical_examination: '',
      assessment: '',
      plan: '',
      allergies: '',
      medications: '',
      notes: '',
      doctor_id: '',
      patient_id: ''
    });
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

  onSubmit() {
    if (this.recordForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.recordForm.controls).forEach(key => {
        this.recordForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formData = this.recordForm.value;

    if (this.isEditMode()) {
      this.updateRecord(formData);
    } else {
      this.createRecord(formData);
    }
  }

  private createRecord(data: CreateMedicalRecordData) {
    this.medicalRecordService.createMedicalRecord(data).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.close();
        this.success.emit({
          action: 'create',
          record: response.data
        });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to create medical record');
        this.loading.set(false);
        console.error('Error creating medical record:', err);
      }
    });
  }

  private updateRecord(data: CreateMedicalRecordData) {
    if (!this.record()) return;

    this.medicalRecordService.updateMedicalRecord(this.record()!.id, data).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.close();
        this.success.emit({
          action: 'update',
          record: response.data
        });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to update medical record');
        this.loading.set(false);
        console.error('Error updating medical record:', err);
      }
    });
  }

  // Helper methods
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
}