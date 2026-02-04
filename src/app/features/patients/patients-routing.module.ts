import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientListComponent } from '../patients/patient-list/patient-list.component';
import { PatientDetailComponent } from '../patients/patient-detail/patient-detail.component';
import { PatientModalComponent } from '../patients/patient-modal/patient-modal.component';

const routes: Routes = [
  {
    path: '',
    component: PatientListComponent,
  },
  {
    path: 'new',
    component: PatientModalComponent,
  },
  {
    path: ':id',
    component: PatientDetailComponent,
  },
  {
    path: ':id/edit',
    component: PatientDetailComponent,
  },
  // {
  //   path: ':id/medical-records',
  //   loadChildren: () => import('../medical-records/medical-records.module').then(m => m.MedicalRecordsModule),
  // },
  // {
  //   path: ':id/prescriptions',
  //   loadChildren: () => import('../prescriptions/prescriptions.module').then(m => m.PrescriptionsModule),
  // },
  // {
  //   path: ':id/lab-results',
  //   loadChildren: () => import('../lab-results/lab-results.module').then(m => m.LabResultsModule),
  // },
  // {
  //   path: ':id/invoices',
  //   loadChildren: () => import('../invoices/invoices.module').then(m => m.InvoicesModule),
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class PatientsRoutingModule {}
