import { Component, signal, inject, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  Patient,
  PatientService,
  CreatePatientData,
} from '../../../core/services/patient.service';

@Component({
  selector: 'app-patient-modal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './patient-modal.component.html',
  styleUrl: './patient-modal.component.scss',
})
export class PatientModalComponent {
  @Output() onSuccess = new EventEmitter<{ action: 'create' | 'update'; patient: Patient }>();

  visible = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  patient = signal<Patient | null>(null);
  isEditMode = signal(false);
  patientForm!: FormGroup;

  constructor(
    private patientService: PatientService,
    private fb: FormBuilder,
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
      status: ['active', [Validators.required]],
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
        status: patient.status,
      });
    } else {
      this.patientForm.reset({
        gender: 'male',
        status: 'active',
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
      status: 'active',
    });
  }

  onSubmit() {
    if (this.patientForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.patientForm.controls).forEach((key) => {
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
          patient: response.data,
        });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to create patient');
        this.loading.set(false);
        console.error('Error creating patient:', err);
      },
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
          patient: response.data,
        });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to update patient');
        this.loading.set(false);
        console.error('Error updating patient:', err);
      },
    });
  }
}
