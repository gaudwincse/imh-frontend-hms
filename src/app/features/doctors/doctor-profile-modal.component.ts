import { Component, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Doctor } from '../../core/services/doctor.service';

@Component({
  selector: 'app-doctor-profile-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-profile-modal.component.html'
})
export class DoctorProfileModalComponent {
  visible = signal(false);
  doctor = input<Doctor | null>(null);

  show(doctor: Doctor) {
    this.visible.set(true);
  }

  closeModal() {
    this.visible.set(false);
  }

  bookAppointment() {
    if (this.doctor()) {
      // Emit event to open appointment booking modal
      const event = new CustomEvent('bookAppointment', { 
        detail: { doctor: this.doctor() } 
      });
      document.dispatchEvent(event);
    }
  }
}