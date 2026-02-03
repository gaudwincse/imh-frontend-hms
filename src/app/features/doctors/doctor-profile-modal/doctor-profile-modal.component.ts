import { Component, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Doctor } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-doctor-profile-modal',
  imports: [CommonModule],
  templateUrl: './doctor-profile-modal.component.html',
  styleUrl: './doctor-profile-modal.component.scss',
})
export class DoctorProfileModalComponent {
  doctor = input<Doctor | null>(null);
  visible = signal(false);

  closeModal() {
    this.visible.set(false);
  }

  openModal(doctor: Doctor) {
    this.visible.set(true);
  }

  bookAppointment() {
    // Implementation for booking an appointment would go here
    console.log('Booking appointment for doctor:', this.doctor());
    this.closeModal();
  }
}
