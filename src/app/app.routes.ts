import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { DentalLandingComponent } from './features/dental-landing/dental-landing.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DoctorListComponent } from './features/doctors/doctor-list.component';
import { PatientListComponent } from './features/patients/patient-list.component';
import { AppointmentListComponent } from './features/appointments/appointment-list.component';

export const routes: Routes = [
    { path: '', component: DentalLandingComponent },
    { path: 'landing', component: DentalLandingComponent },
    { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
    { path: 'general-hospital', component: LandingComponent },
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'doctors', component: DoctorListComponent },
            { path: 'departments/:id', component: DoctorListComponent }, // Demo route for departments
            { path: 'patients', component: PatientListComponent },
            { path: 'appointments', component: AppointmentListComponent },
        ]
    },
    { path: '**', redirectTo: '' } // Catch-all redirect to home
];
