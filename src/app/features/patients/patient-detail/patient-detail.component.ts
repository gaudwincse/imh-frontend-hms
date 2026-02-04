import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  PatientService,
  Patient,
  CreatePatientData,
} from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-patient-detail',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DatePipe,
  ],
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.scss',
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
      branch_id: [''],
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
      },
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
      branch_id: patient.branch_id,
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

    this.patientService
      .updatePatient(this.patient()!.id, updatedData)
      .subscribe({
        next: (response) => {
          this.patient.set(response.data);
          this.isEditing.set(false);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to update patient information');
          this.loading.set(false);
          console.error('Error updating patient:', err);
        },
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
    this.router.navigate(['/appointments'], {
      queryParams: { patient_id: this.patient()!.id },
    });
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
      day: 'numeric',
    });
  }

  calculateAge(dateString: string): number {
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}
