import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  PatientService,
  PatientSearchParams,
} from '../../../core/services/patient.service';

@Component({
  selector: 'app-patient-search',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './patient-search.component.html',
  styleUrl: './patient-search.component.scss',
})
export class PatientSearchComponent {
  @Output() search = new EventEmitter<PatientSearchParams>();

  showAdvanced = signal(false);
  searchForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
  ) {
    this.searchForm = this.fb.group({
      query: [''],
      first_name: [''],
      last_name: [''],
      patient_no: [''],
      phone: [''],
      email: [''],
      gender: [null],
      blood_group: [''],
      status: [null],
      branch_id: [null],
      age_from: [null],
      age_to: [null],
      created_from: [null],
      created_to: [null],
      per_page: [15],
    });
  }

  toggleAdvanced() {
    this.showAdvanced.set(!this.showAdvanced());
  }

  performSearch() {
    const formData = this.searchForm.value;

    // Remove empty values and convert numbers
    const searchParams: PatientSearchParams = {
      query: '',
      first_name: '',
      last_name: '',
      patient_no: '',
      phone: '',
      email: '',
      gender: undefined,
      blood_group: '',
      status: undefined,
      branch_id: undefined,
      age_from: undefined,
      age_to: undefined,
      created_from: undefined,
      created_to: undefined,
      per_page: 15,
    };

    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (value !== null && value !== '' && value !== undefined) {
        if (['age_from', 'age_to', 'branch_id', 'per_page'].includes(key)) {
          (searchParams as any)[key] = Number(value);
        } else {
          (searchParams as any)[key] = value;
        }
      }
    });

    this.search.emit(searchParams);
  }

  clearFilters() {
    this.searchForm.reset({
      query: '',
      first_name: '',
      last_name: '',
      patient_no: '',
      phone: '',
      email: '',
      gender: [null],
      blood_group: [''],
      status: [null],
      branch_id: [null],
      age_from: [null],
      age_to: [null],
      created_from: [null],
      created_to: [null],
      per_page: 15,
    });

    this.search.emit({});
  }

  hasActiveFilters(): boolean {
    const formData = this.searchForm.value;
    return Object.keys(formData).some((key) => {
      const value = formData[key];
      return (
        value !== null && value !== '' && value !== undefined && value !== 15
      );
    });
  }

  getActiveFilterCount(): number {
    const formData = this.searchForm.value;
    return Object.keys(formData).filter((key) => {
      const value = formData[key];
      return (
        value !== null && value !== '' && value !== undefined && value !== 15
      );
    }).length;
  }

  getActiveFilters(): Array<{ label: string; value: string }> {
    const formData = this.searchForm.value;
    const filters: Array<{ label: string; value: string }> = [];

    const labelMap = {
      query: 'Search',
      first_name: 'First Name',
      last_name: 'Last Name',
      patient_no: 'Patient No',
      phone: 'Phone',
      email: 'Email',
      gender: 'Gender',
      blood_group: 'Blood Group',
      status: 'Status',
      branch_id: 'Branch',
      age_from: 'Age From',
      age_to: 'Age To',
      created_from: 'Created From',
      created_to: 'Created To',
      per_page: 'Per Page',
    };

    // TODO: Map branch_id to branch name
    const branchMap: Record<number, string> = {
      1: 'Main Hospital',
      2: 'Dental Clinic',
    };

    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (
        value !== null &&
        value !== '' &&
        value !== undefined &&
        value !== 15
      ) {
        let displayValue: string = value;

        if (key === 'branch_id' && typeof value === 'number') {
          displayValue = branchMap[value] || `Branch ${value}`;
        }

        if ((key === 'created_from' || key === 'created_to') && typeof value === 'string') {
          displayValue = new Date(value).toLocaleDateString();
        }

        filters.push({
          label: (labelMap as Record<string, string>)[key] || key,
          value: displayValue,
        });
      }
    });
    return filters;
  }
}
