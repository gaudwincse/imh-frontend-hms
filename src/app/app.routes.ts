import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { DentalLandingComponent } from './features/dental-landing/dental-landing.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DoctorListComponent } from './features/doctors/doctor-list/doctor-list.component';
import { PatientListComponent } from './features/patients/patient-list/patient-list.component';
import { AppointmentListComponent } from './features/appointments/appointment-list.component';
import { LoginComponent } from './features/auth/login/login.component';
import { AddDoctorComponent } from './features/doctors/add-doctor/add-doctor.component';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: DentalLandingComponent },
  { path: 'landing', component: LandingComponent },
  { path: 'general-hospital', component: LandingComponent },

  // Public routes
  { 
    path: 'login',
    loadComponent: () => 
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'super-admin',
    loadComponent: () =>
      import('./features/auth/admin-login/admin-login.component').then(
        (m) => m.AdminLoginComponent,
      ),
  },

  // Protected routes with admin layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'doctors', component: DoctorListComponent },
      { path: 'doctors/add', component: AddDoctorComponent },
      { path: 'departments/:id', component: DoctorListComponent }, // Demo route for departments
      { path: 'patients', component: PatientListComponent },
      { path: 'appointments', component: AppointmentListComponent },
    ],
  },

  // Admin routes (super administrator)
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'doctors', component: DoctorListComponent },
      { path: 'doctors/add', component: AddDoctorComponent },
      { path: 'patients', component: PatientListComponent },
      { path: 'appointments', component: AppointmentListComponent },
      {
        path: 'lab-analytics',
        loadComponent: () =>
          import('./features/lab-results/lab-results-analytics.component').then(
            (m) => m.LabResultsAnalyticsComponent,
          ),
      },
      {
        path: 'lab-trends',
        loadComponent: () =>
          import('./features/lab-results/lab-results-trends.component').then(
            (m) => m.LabResultsTrendsComponent,
          ),
      },
      {
        path: 'lab-comparison',
        loadComponent: () =>
          import('./features/lab-results/lab-results-comparison.component').then(
            (m) => m.LabResultsComparisonComponent,
          ),
      },
    ],
  },

  { path: '**', redirectTo: '' }, // Catch-all redirect to home
];
