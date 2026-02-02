import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService, CreateAppointmentData, AppointmentAvailability } from '../../core/services/appointment.service';
import { DoctorService, Doctor } from '../../core/services/doctor.service';
import { PatientService, Patient } from '../../core/services/patient.service';

@Component({
  selector: 'app-appointment-booking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" *ngIf="visible()">
      <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Book Appointment</h2>
          <button (click)="hideModal()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left Column -->
            <div class="space-y-4">
              <!-- Patient Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                <select
                  formControlName="patient_id"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Patient</option>
                  @for (patient of patients(); track patient.id) {
                    <option [value]="patient.id">
                      {{ patient.first_name }} {{ patient.last_name }} ({{ patient.patient_no }})
                    </option>
                  }
                </select>
                <div *ngIf="bookingForm.get('patient_id')?.invalid" class="text-red-600 text-sm mt-1">
                  Patient is required
                </div>
              </div>

              <!-- Doctor Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
                <select
                  formControlName="doctor_id"
                  (change)="onDoctorChange()"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Doctor</option>
                  @for (doctor of doctors(); track doctor.id) {
                    <option [value]="doctor.id">
                      {{ doctor.user.name }} - {{ doctor.specialization }}
                    </option>
                  }
                </select>
                <div *ngIf="bookingForm.get('doctor_id')?.invalid" class="text-red-600 text-sm mt-1">
                  Doctor is required
                </div>
              </div>

              <!-- Branch Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
                <select
                  formControlName="branch_id"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Branch</option>
                  <option value="1">Main Hospital</option>
                  <option value="2">Dental Clinic</option>
                </select>
                <div *ngIf="bookingForm.get('branch_id')?.invalid" class="text-red-600 text-sm mt-1">
                  Branch is required
                </div>
              </div>

              <!-- Appointment Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Appointment Type *</label>
                <select
                  formControlName="type"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Type</option>
                  <option value="consultation">Consultation</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="procedure">Procedure</option>
                </select>
                <div *ngIf="bookingForm.get('type')?.invalid" class="text-red-600 text-sm mt-1">
                  Type is required
                </div>
              </div>

              <!-- Symptoms -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
                <textarea
                  formControlName="symptoms"
                  rows="3"
                  placeholder="Describe patient's symptoms..."
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"></textarea>
              </div>

              <!-- Notes -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  formControlName="notes"
                  rows="2"
                  placeholder="Any additional information..."
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-4">
              <!-- Appointment Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Appointment Date *</label>
                <input
                  type="date"
                  formControlName="appointment_date"
                  (change)="onDateChange()"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                <div *ngIf="bookingForm.get('appointment_date')?.invalid" class="text-red-600 text-sm mt-1">
                  Date is required
                </div>
              </div>

              <!-- Time Slot Selection -->
              @if (availability()) {
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Available Time Slots</label>
                  @if (availability()?.available && (availability()?.slots?.length ?? 0) > 0) {
                    <div class="space-y-2">
                      <div class="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                        @for (slot of availability()?.slots || []; track slot.start) {
                          <div
                            class="p-2 border rounded cursor-pointer hover:bg-blue-50 mb-1"
                            [ngClass]="{'bg-blue-100 border-blue-500': selectedSlot() === slot.start}"
                            (click)="selectTimeSlot(slot)">
                            {{ slot.display }}
                          </div>
                        }
                      </div>
                    </div>
                  }

                  @if (availability()?.available && (availability()?.slots?.length ?? 0) === 0) {
                    <div class="text-yellow-600 text-sm">
                      ⚠️ No available slots for this date
                    </div>
                  }

                  @if (!availability()?.available) {
                    <div class="text-red-600 text-sm">
                      ❌ Doctor is not available on this date
                    </div>
                  }
                </div>
              }

              <!-- Selected Time Display -->
              @if (selectedSlot()) {
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Selected Time</label>
                  <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p class="text-green-800 font-medium">✓ {{ selectedSlot() }}</p>
                  </div>
                </div>
              }

              <!-- Doctor's Schedule -->
              @if (availability()?.schedule) {
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Doctor's Schedule</label>
                  <div class="bg-gray-50 p-3 rounded-lg">
                    <div class="text-sm space-y-1">
                    <div><strong>Day:</strong> {{ availability()?.schedule?.day }}</div>
                    <div><strong>Hours:</strong> {{ availability()?.schedule?.working_hours }}</div>
                    <div><strong>Break:</strong> {{ availability()?.schedule?.break_time }}</div>
                    </div>
                  </div>
                </div>
              }

              @if (loadingAvailability()) {
                <div class="text-gray-600 text-sm">
                  <div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Checking availability...
                </div>
              }
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              type="button"
              (click)="hideModal()"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="bookingForm.invalid || loading()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {{ loading() ? 'Booking...' : 'Book Appointment' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Success Message -->
    @if (successMessage()) {
      <div class="fixed bottom-4 right-4 z-50">
        <div class="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
          <div class="text-white font-medium">{{ successMessage() }}</div>
        </div>
      </div>
    }

    <!-- Error Message -->
    @if (errorMessage()) {
      <div class="fixed bottom-4 right-4 z-50">
        <div class="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
          <div class="text-white font-medium">{{ errorMessage() }}</div>
        </div>
      </div>
    }
  `
})
export class AppointmentBookingModalComponent {
  visible = signal(false);
  loading = signal(false);
  loadingAvailability = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  patients = signal<Patient[]>([]);
  doctors = signal<Doctor[]>([]);
  availability = signal<AppointmentAvailability | null>(null);
  selectedSlot = signal<string | null>(null);

  bookingForm: FormGroup;
  close = output<void>();
  success = output<{ message: string; appointment?: any }>();

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private patientService: PatientService,
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      patient_id: ['', Validators.required],
      doctor_id: ['', Validators.required],
      branch_id: ['', Validators.required],
      appointment_date: ['', Validators.required],
      appointment_time: ['', Validators.required],
      type: ['', Validators.required],
      symptoms: [''],
      notes: ['']
    });
  }

  showModal() {
    this.visible.set(true);
    this.loadPatients();
    this.loadDoctors();
  }

  hideModal() {
    this.visible.set(false);
    this.resetForm();
  }

  private resetForm() {
    this.bookingForm.reset();
    this.availability.set(null);
    this.selectedSlot.set(null);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  loadPatients() {
    this.patientService.getPatients({ per_page: 100 }).subscribe({
      next: (response) => {
        this.patients.set(response.data);
      },
      error: (err) => {
        console.error('Error loading patients:', err);
      }
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

  onDoctorChange() {
    const doctorId = this.bookingForm.get('doctor_id')?.value;
    const date = this.bookingForm.get('appointment_date')?.value;

    if (doctorId && date) {
      this.checkAvailability(doctorId, date);
    } else {
      this.availability.set(null);
      this.selectedSlot.set(null);
    }
  }

  onDateChange() {
    const doctorId = this.bookingForm.get('doctor_id')?.value;
    const date = this.bookingForm.get('appointment_date')?.value;

    if (doctorId && date) {
      this.checkAvailability(doctorId, date);
    } else {
      this.availability.set(null);
      this.selectedSlot.set(null);
    }
  }

  checkAvailability(doctorId: number, date: string) {
    this.loadingAvailability.set(true);

    this.appointmentService.getAvailability({ doctor_id: doctorId, date }).subscribe({
      next: (response: any) => {
        this.availability.set(response.data);
        this.loadingAvailability.set(false);
      },
      error: (err: any) => {
        this.errorMessage.set('Failed to check availability');
        this.loadingAvailability.set(false);
        console.error('Error checking availability:', err);
      }
    });
  }

  selectTimeSlot(slot: any) {
    this.selectedSlot.set(slot.display);
    this.bookingForm.patchValue({
      appointment_time: slot.start
    });
  }

  onSubmit() {
    if (this.bookingForm.invalid || !this.selectedSlot()) {
      this.errorMessage.set('Please select a time slot');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const appointmentData: CreateAppointmentData = this.bookingForm.value;

    this.appointmentService.createAppointment(appointmentData).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.successMessage.set('Appointment booked successfully!');
        this.success.emit({
          message: 'Appointment booked successfully!',
          appointment: response.data
        });
        setTimeout(() => {
          this.hideModal();
          this.close.emit();
        }, 2000);
      },
      error: (err: any) => {
        this.errorMessage.set(err.error?.message || 'Failed to book appointment');
        this.loading.set(false);
        console.error('Error booking appointment:', err);
      }
    });
  }

  trackBySlotStart(index: number, slot: any) {
    return slot.start;
  }
}
