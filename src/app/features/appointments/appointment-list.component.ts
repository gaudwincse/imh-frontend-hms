import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService, Appointment, AppointmentSearchParams } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';
import { AppointmentBookingModalComponent } from './appointment-booking-modal.component';

@Component({
    selector: 'app-appointment-list',
    standalone: true,
    imports: [CommonModule, FormsModule, AppointmentBookingModalComponent],
    template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Appointment Management</h1>
        <button 
          *ngIf="canManageAppointments()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          (click)="showBookingModal()">
          Book Appointment
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow mb-6 p-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input 
            type="text" 
            placeholder="Search appointments..." 
            class="border rounded-lg px-3 py-2"
            [(ngModel)]="searchQuery"
            (keyup.enter)="search()">
          
          <select 
            class="border rounded-lg px-3 py-2"
            [(ngModel)]="filters.status"
            (change)="search()">
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>

          <select 
            class="border rounded-lg px-3 py-2"
            [(ngModel)]="filters.type"
            (change)="search()">
            <option value="">All Types</option>
            <option value="consultation">Consultation</option>
            <option value="follow_up">Follow-up</option>
            <option value="emergency">Emergency</option>
            <option value="procedure">Procedure</option>
          </select>

          <select 
            class="border rounded-lg px-3 py-2"
            [(ngModel)]="filters.filter"
            (change)="search()">
            <option value="">All Periods</option>
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>

          <input 
            type="date" 
            class="border rounded-lg px-3 py-2"
            [(ngModel)]="filters.date_from"
            (change)="search()">
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading appointments...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ error() }}</p>
      </div>

      <!-- Appointments Table -->
      <div *ngIf="!loading() && !error()" class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment No</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let appointment of appointments(); trackBy: trackByAppointmentId">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ appointment.appointment_no }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>
                  <div class="font-medium">{{ appointment.patient?.first_name }} {{ appointment.patient?.last_name }}</div>
                  <div class="text-gray-500">{{ appointment.patient?.patient_no }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>
                  <div class="font-medium">{{ appointment.doctor?.user?.name }}</div>
                  <div class="text-gray-500">{{ appointment.doctor?.specialization }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>
                  <div class="font-medium">{{ formatDate(appointment.appointment_date) }}</div>
                  <div class="text-gray-500">{{ formatTime(appointment.start_time) }} - {{ formatTime(appointment.end_time) }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ formatType(appointment.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="getStatusClass(appointment.status)">
                  {{ formatStatus(appointment.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3" (click)="viewAppointment(appointment.id)">View</button>
                <button *ngIf="appointment.status === 'scheduled' || appointment.status === 'confirmed'" 
                        class="text-green-600 hover:text-green-900 mr-3" 
                        (click)="confirmAppointment(appointment)">Confirm</button>
                <button *ngIf="canCancel(appointment)" 
                        class="text-red-600 hover:text-red-900" 
                        (click)="cancelAppointment(appointment)">Cancel</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div *ngIf="appointments().length === 0" class="text-center py-8">
          <p class="text-gray-500">No appointments found.</p>
        </div>

        <!-- Pagination -->
        <div *ngIf="meta().total > 0" class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div class="text-sm text-gray-700">
            Showing <span class="font-medium">{{ (meta().current_page - 1) * meta().per_page + 1 }}</span> to 
            <span class="font-medium">{{ Math.min(meta().current_page * meta().per_page, meta().total) }}</span> of 
            <span class="font-medium">{{ meta().total }}</span> appointments
          </div>
          <div class="flex space-x-2">
            <button 
              class="px-3 py-1 border rounded text-sm disabled:opacity-50"
              [disabled]="meta().current_page === 1"
              (click)="previousPage()">
              Previous
            </button>
            <button 
              class="px-3 py-1 border rounded text-sm disabled:opacity-50"
              [disabled]="meta().current_page === meta().last_page"
              (click)="nextPage()">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment Booking Modal -->
    <app-appointment-booking-modal (appointmentBooked)="onAppointmentBooked($event)" (close)="onBookingModalClosed()"></app-appointment-booking-modal>
  `,
})
export class AppointmentListComponent implements OnInit {
  appointments = signal<Appointment[]>([]);
  meta = signal<any>({ current_page: 1, last_page: 1, per_page: 15, total: 0 });
  loading = signal(false);
  error = signal<string | null>(null);
  searchQuery = '';
  filters: AppointmentSearchParams = {
    per_page: 15,
    status: '',
    type: '',
    filter: '',
    date_from: ''
  };

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments(page = 1) {
    this.loading.set(true);
    this.error.set(null);

    const params: AppointmentSearchParams = {
      ...this.filters,
      page,
      per_page: this.filters.per_page
    };

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    this.appointmentService.getAppointments(params).subscribe({
      next: (response) => {
        this.appointments.set(response.data);
        this.meta.set(response.meta);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load appointments. Please try again.');
        this.loading.set(false);
        console.error('Error loading appointments:', err);
      }
    });
  }

  search() {
    this.loadAppointments(1);
  }

  nextPage() {
    if (this.meta().current_page < this.meta().last_page) {
      this.loadAppointments(this.meta().current_page + 1);
    }
  }

  previousPage() {
    if (this.meta().current_page > 1) {
      this.loadAppointments(this.meta().current_page - 1);
    }
  }

  viewAppointment(id: number) {
    // TODO: Navigate to appointment detail view
    console.log('View appointment:', id);
  }

  confirmAppointment(appointment: Appointment) {
    // TODO: Implement confirmation logic
    console.log('Confirm appointment:', appointment);
  }

  cancelAppointment(appointment: Appointment) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(appointment.id).subscribe({
        next: () => {
          this.loadAppointments(this.meta().current_page);
        },
        error: (err) => {
          alert('Failed to cancel appointment: ' + err.error?.message || 'Unknown error');
        }
      });
    }
  }

  showBookingModal() {
    // TODO: Open booking modal
    console.log('Show booking modal');
  }

  canManageAppointments() {
    const user = this.authService.getCurrentUser();
    return user?.permissions?.includes('create_appointments') || 
           user?.permissions?.includes('manage_appointments');
  }

  canCancel(appointment: Appointment) {
    return ['scheduled', 'confirmed'].includes(appointment.status);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    const date = new Date('2023-01-01T' + timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatType(type: string): string {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  formatStatus(status: string): string {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getStatusClass(status: string): object {
    const statusClasses = {
      'scheduled': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'no_show': 'bg-gray-100 text-gray-800'
    };
    
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  trackByAppointmentId(index: number, appointment: Appointment) {
    return appointment.id;
  }

  onAppointmentBooked(appointment: Appointment) {
    this.loadAppointments(1);
  }

  onBookingModalClosed() {
    // Modal closed, no action needed
  }
}
