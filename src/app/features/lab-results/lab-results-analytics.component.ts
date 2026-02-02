import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabResult, LabResultService } from '../../core/services/lab-result.service';
import { PatientService } from '../../core/services/patient.service';

interface TestSummary {
  category: string;
  totalTests: number;
  normalResults: number;
  abnormalResults: number;
  criticalResults: number;
}

@Component({
  selector: 'app-lab-results-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-6">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Lab Results Analytics</h1>
        <p class="text-gray-600 mt-2">Comprehensive analysis and insights from laboratory test results</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-2xl font-bold text-blue-600">{{ totalTests() }}</div>
          <div class="text-sm text-gray-600 mt-1">Total Tests</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-2xl font-bold text-green-600">{{ normalResults() }}</div>
          <div class="text-sm text-gray-600 mt-1">Normal Results</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-2xl font-bold text-yellow-600">{{ abnormalResults() }}</div>
          <div class="text-sm text-gray-600 mt-1">Abnormal Results</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-2xl font-bold text-red-600">{{ criticalResults() }}</div>
          <div class="text-sm text-gray-600 mt-1">Critical Results</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              (change)="onDateRangeChange($event)"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="7">Last 7 days</option>
              <option value="30" selected>Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Test Category</label>
            <select
              (change)="onCategoryChange($event)"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Categories</option>
              @for (category of categories(); track category) {
                <option [value]="category">{{ category }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Patient</label>
            <select
              (change)="onPatientChange($event)"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Patients</option>
              @for (patient of patients(); track patient.id) {
                <option [value]="patient.id">{{ patient.first_name }} {{ patient.last_name }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      @if (criticalResultsList().length > 0) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h2 class="text-lg font-semibold text-red-900 mb-4">⚠️ Critical Results Alert</h2>
          <div class="space-y-2">
            @for (result of criticalResultsList(); track result.id) {
              <div class="bg-white rounded-lg p-4 border border-red-200">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="font-medium text-gray-900">{{ result.patient?.first_name }} {{ result.patient?.last_name }}</div>
                    <div class="text-sm text-gray-600">{{ result.test_name }}</div>
                    <div class="text-sm text-gray-600">{{ result.result_date }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-red-600">{{ result.result_value }} {{ result.unit }}</div>
                    <div class="text-sm text-gray-600">{{ result.result_date | date:'mediumDate' }}</div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Category Summary</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (summary of categorySummaries(); track summary.category) {
            <div class="border border-gray-200 rounded-lg p-4">
              <h3 class="font-medium text-gray-900 mb-2">{{ summary.category }}</h3>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span>Total Tests:</span>
                  <span class="font-medium">{{ summary.totalTests }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-green-600">Normal:</span>
                  <span class="font-medium text-green-600">{{ summary.normalResults }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-yellow-600">Abnormal:</span>
                  <span class="font-medium text-yellow-600">{{ summary.abnormalResults }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-red-600">Critical:</span>
                  <span class="font-medium text-red-600">{{ summary.criticalResults }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Lab Results</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (result of recentResults(); track result.id) {
                <tr class="border-b border-gray-200">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ result.patient?.first_name }} {{ result.patient?.last_name }}</div>
                      <div class="text-sm text-gray-500">{{ result.patient?.patient_no }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ result.test_name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ result.result_value }} {{ result.unit }}
                    </div>
                    @if (result.normal_range) {
                      <div class="text-sm text-gray-600">
                        Range: {{ result.normal_range }}
                      </div>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-medium rounded-full"
                          [ngClass]="result.status === 'normal' ? 'bg-green-100 text-green-800' : result.status === 'abnormal' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'">
                          {{ result.status === 'normal' ? 'Normal' : result.status === 'abnormal' ? 'Abnormal' : 'Critical' }}
                        </span>
                    </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class LabResultsAnalyticsComponent {
  loading = signal(true);
  error = signal<string | null>(null);

  labResults = signal<LabResult[]>([]);
  patients = signal<any[]>([]);
  categories = signal<string[]>([]);

  selectedDateRange = signal<number>(30);
  selectedCategory = signal<string>('');
  selectedPatient = signal<string>('');

  totalTests = signal<number>(0);
  normalResults = signal<number>(0);
  abnormalResults = signal<number>(0);
  criticalResults = signal<number>(0);

  recentResults = signal<LabResult[]>([]);
  criticalResultsList = signal<LabResult[]>([]);
  categorySummaries = signal<TestSummary[]>([]);

  private labResultService = inject(LabResultService);
  private patientService = inject(PatientService);

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.loading.set(true);
    this.error.set(null);

    this.loadLabResults();
    this.loadPatients();
  }

  private loadLabResults() {
    this.labResultService.getLabResults({ per_page: 1000 }).subscribe({
      next: (response: any) => {
        const results = response.data || [];
        this.labResults.set(results);
        this.processAnalyticsData(results);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Failed to load lab results data');
        this.loading.set(false);
        console.error('Error loading lab results:', err);
      }
    });
  }

  private loadPatients() {
    this.patientService.getPatients({ per_page: 100 }).subscribe({
      next: (response: any) => {
        this.patients.set(response.data || []);
      },
      error: (err: any) => {
        console.error('Error loading patients:', err);
      }
    });
  }

  private processAnalyticsData(results: LabResult[]) {
    const uniqueCategories: string[] = [];
    results.forEach((result: LabResult) => {
      if (result.test_category) {
        if (!uniqueCategories.includes(result.test_category)) {
          uniqueCategories.push(result.test_category);
        }
      }
    });
    this.categories.set(uniqueCategories);

    this.applyFilters();
    this.generateTrendData(results);
  }

  private applyFilters() {
    const filtered = this.getFilteredResults();

    this.recentResults.set(filtered.slice(0, 20));
    this.criticalResultsList.set(filtered.filter((r: LabResult) => r.status === 'critical').slice(0, 10));

    this.totalTests.set(filtered.length);
    this.normalResults.set(filtered.filter((r: LabResult) => r.status === 'normal').length);
    this.abnormalResults.set(filtered.filter((r: LabResult) => r.status === 'abnormal').length);
    this.criticalResults.set(filtered.filter((r: LabResult) => r.status === 'critical').length);

    this.generateSummary();
  }

  private getFilteredResults(): LabResult[] {
    const results = this.labResults();
    const days = this.selectedDateRange();
    const category = this.selectedCategory();
    const patientId = this.selectedPatient();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return results.filter(result => {
      if (!result.result_date) return false;
      const resultDate = new Date(result.result_date);
      const isDateMatch = resultDate >= cutoffDate;
      const isCategoryMatch = !category || result.test_category === category;
      const isPatientMatch = !patientId || (result.patient && result.patient.id?.toString() === patientId);

      return isDateMatch && isCategoryMatch && isPatientMatch;
    });
  }

  private generateTrendData(results: LabResult[]) {
    // Implementation placeholder based on component needs
    // This method was referenced but missing
  }

  private generateSummary() {
    const filtered = this.getFilteredResults();
    const uniqueCategories: string[] = [];

    filtered.forEach(result => {
      if (result.test_category && !uniqueCategories.includes(result.test_category)) {
        uniqueCategories.push(result.test_category);
      }
    });

    const summaries: TestSummary[] = [];
    uniqueCategories.forEach(category => {
      const categoryResults = filtered.filter((r: LabResult) => r.test_category === category);
      const normalResults = categoryResults.filter((r: LabResult) => r.status === 'normal').length;
      const abnormalResults = categoryResults.filter((r: LabResult) => r.status === 'abnormal').length;
      const criticalResults = categoryResults.filter((r: LabResult) => r.status === 'critical').length;

      summaries.push({
        category,
        totalTests: categoryResults.length,
        normalResults,
        abnormalResults,
        criticalResults
      });
    });

    this.categorySummaries.set(summaries);
  }

  onDateRangeChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement) {
      const days = parseInt(selectElement.value);
      this.selectedDateRange.set(days);
      this.applyFilters();
    }
  }

  onCategoryChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement) {
      const category = selectElement.value;
      this.selectedCategory.set(category);
      this.applyFilters();
    }
  }

  onPatientChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement) {
      const patientId = selectElement.value;
      this.selectedPatient.set(patientId || '');
      this.applyFilters();
    }
  }
}
