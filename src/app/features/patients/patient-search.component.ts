import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { PatientService, PatientSearchParams } from '../../core/services/patient.service';

@Component({
  selector: 'app-patient-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Advanced Search</h3>
        <button 
          (click)="toggleAdvanced()"
          class="text-blue-600 hover:text-blue-800 text-sm">
          {{ showAdvanced() ? 'Hide' : 'Show' }} Advanced Filters
        </button>
      </div>

      <form [formGroup]="searchForm" (ngSubmit)="performSearch()">
        <!-- Basic Search -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Search Query</label>
            <input 
              type="text" 
              formControlName="query"
              placeholder="Name, patient no, phone, email..."
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              formControlName="status"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select 
              formControlName="gender"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <!-- Advanced Filters -->
        <div *ngIf="showAdvanced()" class="border-t pt-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input 
                type="text" 
                formControlName="first_name"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input 
                type="text" 
                formControlName="last_name"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Patient Number</label>
              <input 
                type="text" 
                formControlName="patient_no"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input 
                type="tel" 
                formControlName="phone"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                formControlName="email"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <input 
                type="text" 
                formControlName="blood_group"
                placeholder="e.g., O+, A-"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Age From</label>
              <input 
                type="number" 
                formControlName="age_from"
                min="0"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Age To</label>
              <input 
                type="number" 
                formControlName="age_to"
                min="0"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Results Per Page</label>
              <select 
                formControlName="per_page"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Created From</label>
              <input 
                type="date" 
                formControlName="created_from"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Created To</label>
              <input 
                type="date" 
                formControlName="created_to"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select 
                formControlName="branch_id"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Branches</option>
                <!-- TODO: Load branches from API -->
                <option value="1">Main Hospital</option>
                <option value="2">Dental Clinic</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-between items-center mt-4">
          <div class="flex space-x-3">
            <button 
              type="submit"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Search
            </button>
            <button 
              type="button"
              (click)="clearFilters()"
              class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Clear Filters
            </button>
          </div>

          <div class="text-sm text-gray-600">
            <span *ngIf="hasActiveFilters()">
              <span class="font-medium">{{ getActiveFilterCount() }}</span> filter(s) active
            </span>
          </div>
        </div>
      </form>
    </div>

    <!-- Active Filters Display -->
    <div *ngIf="hasActiveFilters()" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-blue-900">Active Filters</h4>
        <button 
          (click)="clearFilters()"
          class="text-blue-600 hover:text-blue-800 text-sm">
          Clear All
        </button>
      </div>
      <div class="flex flex-wrap gap-2">
        <span *ngFor="let filter of getActiveFilters()" 
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {{ filter.label }}: {{ filter.value }}
        </span>
      </div>
    </div>
  `,
})
export class PatientSearchComponent {
  @Output() search = new EventEmitter<PatientSearchParams>();
  
  showAdvanced = signal(false);
  searchForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService
  ) {
    this.searchForm = this.fb.group({
      query: [''],
      first_name: [''],
      last_name: [''],
      patient_no: [''],
      phone: [''],
      email: [''],
      gender: [''],
      blood_group: [''],
      status: [''],
      branch_id: [''],
      age_from: [''],
      age_to: [''],
      created_from: [''],
      created_to: [''],
      per_page: [15]
    });
  }

  toggleAdvanced() {
    this.showAdvanced.set(!this.showAdvanced());
  }

  performSearch() {
    const formData = this.searchForm.value;
    
    // Remove empty values and convert numbers
    const searchParams: PatientSearchParams = {};
    
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      if (value !== null && value !== '' && value !== undefined) {
        if (['age_from', 'age_to', 'branch_id', 'per_page'].includes(key)) {
          searchParams[key] = Number(value);
        } else {
          searchParams[key] = value;
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
      gender: '',
      blood_group: '',
      status: '',
      branch_id: '',
      age_from: '',
      age_to: '',
      created_from: '',
      created_to: '',
      per_page: 15
    });
    
    this.search.emit({});
  }

  hasActiveFilters(): boolean {
    const formData = this.searchForm.value;
    return Object.keys(formData).some(key => {
      const value = formData[key];
      return value !== null && value !== '' && value !== undefined && value !== 15;
    });
  }

  getActiveFilterCount(): number {
    const formData = this.searchForm.value;
    return Object.keys(formData).filter(key => {
      const value = formData[key];
      return value !== null && value !== '' && value !== undefined && value !== 15;
    }).length;
  }

  getActiveFilters(): Array<{label: string, value: string}> {
    const formData = this.searchForm.value;
    const filters = [];
    
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
      per_page: 'Per Page'
    };

    // TODO: Map branch_id to branch name
    const branchMap = {
      1: 'Main Hospital',
      2: 'Dental Clinic'
    };

    Object.keys(formData).forEach(key => {
      const value = formData[key];
      if (value !== null && value !== '' && value !== undefined && value !== 15) {
        let displayValue = value;
        
        if (key === 'branch_id') {
          displayValue = branchMap[value] || `Branch ${value}`;
        }
        
        if (key === 'created_from' || key === 'created_to') {
          displayValue = new Date(value).toLocaleDateString();
        }
        
        filters.push({
          label: labelMap[key] || key,
          value: displayValue
        });
      }
    });

    return filters;
  }
}