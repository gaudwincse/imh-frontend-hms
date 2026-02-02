import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorService, Doctor, DoctorAvailability } from '../../core/services/doctor.service';

@Component({
  selector: 'app-doctor-profile-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" *ngIf="visible()">
      <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Doctor Profile</h2>
          <button (click)="close()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div *ngIf="loading()" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Loading doctor information...</p>
        </div>

        <div *ngIf="!loading() && doctor()" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Information -->
          <div class="lg:col-span-2">
            <!-- Personal Information -->
            <div class="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-center space-x-4">
                  <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-blue-600 font-bold text-xl">
                      {{ doctor().user?.name?.charAt(0).toUpperCase() || 'D' }}
                    </span>
                  </div>
                  <div>
                    <p class="text-lg font-semibold text-gray-900">{{ doctor().user?.name || 'Unknown' }}</p>
                    <p class="text-sm text-gray-600">{{ doctor().employee_no }}</p>
                    <p class="text-sm text-gray-600">{{ doctor().user?.email || '-' }}</p>
                  </div>
                </div>

                <div class="space-y-3">
                  <div>
                    <p class="text-sm text-gray-600">Specialization</p>
                    <p class="font-medium text-gray-900">{{ doctor().specialization }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Qualification</p>
                    <p class="font-medium text-gray-900">{{ doctor().qualification }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Experience</p>
                    <p class="font-medium text-gray-900">{{ doctor().experience_years }} years</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Professional Information -->
            <div class="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Consultation Fee</p>
                  <p class="font-medium text-gray-900">${{ doctor().consultation_fee }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Slot Duration</p>
                  <p class="font-medium text-gray-900">{{ doctor().slot_duration_minutes }} minutes</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Branch</p>
                  <p class="font-medium text-gray-900">{{ doctor().branch?.name || '-' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Status</p>
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [ngClass]="{
                          'bg-green-100 text-green-800': doctor().status === 'active',
                          'bg-yellow-100 text-yellow-800': doctor().status === 'on_leave',
                          'bg-red-100 text-red-800': doctor().status === 'resigned'
                        }">
                    {{ doctor().status.replace('_', ' ') }}
                  </span>
                </div>
              </div>

              <!-- Available Days -->
              <div *ngIf="doctor().available_days && doctor().available_days.length > 0" class="mt-4">
                <p class="text-sm text-gray-600 mb-2">Available Days</p>
                <div class="flex flex-wrap gap-2">
                  <span *ngFor="let day of doctor().available_days" 
                        class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {{ day.charAt(0).toUpperCase() + day.slice(1) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Today's Availability -->
            <div *ngIf="availability()" class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Today's Availability</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Available Days</p>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <span *ngFor="let day of availability().available_days" 
                          class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {{ day.charAt(0).toUpperCase() + day.slice(1, 3) }}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p class="text-sm text-gray-600">Consultation Details</p>
                  <p class="text-sm font-medium">Fee: ${{ availability().consultation_fee }}</p>
                  <p class="text-sm font-medium">Slot Duration: {{ availability().slot_duration_minutes }} mins</p>
                </div>
              </div>

              <!-- Today's Appointments -->
              <div *ngIf="availability().today_appointments && availability().today_appointments.length > 0" class="mt-4">
                <p class="text-sm text-gray-600 mb-2">Today's Appointments</p>
                <div class="space-y-2">
                  <div *ngFor="let appointment of availability().today_appointments" 
                       class="flex items-center space-x-2 text-sm">
                    <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span class="font-medium">{{ appointment.start_time }}</span>
                    <span class="text-gray-500">-</span>
                    <span class="font-medium">{{ appointment.end_time }}</span>
                    <span class="text-gray-600">Busy</span>
                  </div>
                </div>
              </div>

              <div *ngIf="!availability().today_appointments || availability().today_appointments.length === 0" class="mt-4">
                <p class="text-sm text-green-600">✓ No appointments scheduled for today</p>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <!-- Quick Actions -->
            <div class="bg-white border rounded-lg p-4 mb-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div class="space-y-2">
                <button class="w-full text-left px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                  📅 Schedule Appointment
                </button>
                <button class="w-full text-left px-4 py-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-sm">
                  📋 View Schedule
                </button>
                <button class="w-full text-left px-4 py-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-sm">
                  📊 Performance Report
                </button>
                <button class="w-full text-left px-4 py-2 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-sm">
                  👥 View Patients
                </button>
              </div>
            </div>

            <!-- Statistics -->
            <div class="bg-white border rounded-lg p-4 mb-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Statistics</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Experience</span>
                  <span class="text-sm font-medium">{{ doctor().experience_years }} years</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Specialization</span>
                  <span class="text-sm font-medium">{{ doctor().specialization }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Consultation Fee</span>
                  <span class="text-sm font-medium">${{ doctor().consultation_fee }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Slot Duration</span>
                  <span class="text-sm font-medium">{{ doctor().slot_duration_minutes }} min</span>
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="bg-white border rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div class="space-y-2">
                <div>
                  <p class="text-sm text-gray-600">Email</p>
                  <p class="text-sm font-medium">{{ doctor().user?.email || '-' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Branch</p>
                  <p class="text-sm font-medium">{{ doctor().branch?.name || '-' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Employee ID</p>
                  <p class="text-sm font-medium">{{ doctor().employee_no }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="error()" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-red-800 text-sm">{{ error() }}</p>
        </div>
      </div>
    </div>
  `,
})
export class DoctorProfileModalComponent {
  @Input() doctor: Doctor | null = null;
  @Output() close = new EventEmitter<void>();
  
  visible = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  availability = signal<DoctorAvailability | null>(null);

  constructor(private doctorService: DoctorService) {}

  show(doctor: Doctor) {
    this.doctor = doctor;
    this.visible.set(true);
    this.error.set(null);
    this.loadAvailability(doctor.id);
  }

  close() {
    this.visible.set(false);
    this.error.set(null);
    this.availability.set(null);
  }

  loadAvailability(doctorId: number) {
    this.loading.set(true);
    
    this.doctorService.getDoctorAvailability(doctorId).subscribe({
      next: (response) => {
        this.availability.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load doctor availability');
        this.loading.set(false);
        console.error('Error loading availability:', err);
      }
    });
  }
}