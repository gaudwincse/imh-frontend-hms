import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabResult, LabResultService } from '../../core/services/lab-result.service';
import { PatientService } from '../../core/services/patient.service';

@Component({
  selector: 'app-lab-results-comparison',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold text-gray-900">Lab Results Comparison</h3>
        <button
          (click)="loadComparisonData()"
          [disabled]="loading()"
          class="text-sm bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50">
          {{ loading() ? 'Loading...' : 'Refresh' }}
        </button>
      </div>

      @if (loading()) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Loading comparison data...</p>
        </div>
      }

      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="text-red-800">{{ error() }}</div>
        </div>
      }

      @if (!loading() && !error()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Patient 1</label>
            <select
              (change)="onPatient1Change($event)"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select Patient</option>
              @for (patient of patients(); track patient.id) {
                <option [value]="patient.id">{{ patient.first_name }} {{ patient.last_name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Patient 2</label>
            <select
              (change)="onPatient2Change($event)"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select Patient</option>
              @for (patient of patients(); track patient.id) {
                <option [value]="patient.id">{{ patient.first_name }} {{ patient.last_name }}</option>
              }
            </select>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
          <select
            (change)="onTestChange($event)"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">All Tests</option>
            @for (test of availableTests(); track test) {
              <option [value]="test">{{ test }}</option>
            }
          </select>
        </div>

        @if (comparisonData().length > 0) {
          <div class="space-y-6">
            @for (comparison of comparisonData(); track comparison.testName) {
              <div class="border border-gray-200 rounded-lg p-6">
                <h4 class="text-lg font-medium text-gray-900 mb-4">{{ comparison.testName }}</h4>

                <div class="relative h-32 bg-gray-50 rounded-lg p-2 mb-4">
                  @if (comparison.normalMin !== null && comparison.normalMax !== null) {
                    <div class="absolute h-full bg-green-200 opacity-50"
                         [style.width.%]="getNormalRangeWidth(comparison)"
                         [style.left.%]="getNormalRangeLeft(comparison)">
                    </div>
                  }

                  <svg class="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                    @if (comparison.normalMin !== null && comparison.normalMax !== null) {
                      <line [attr.y1]="getYPosition(comparison, comparison.normalMin)"
                            [attr.y2]="getYPosition(comparison, comparison.normalMax)"
                            stroke="#10b981" stroke-width="2" stroke-dasharray="5,5" />
                    }

                    @for (patientData of comparison.patients; track patientData.patientId) {
                      <circle [attr.cx]="getPatientPosition(comparison, $index)"
                              [attr.cy]="getYPosition(comparison, patientData.value)"
                              r="6"
                              [attr.fill]="$index === 0 ? '#3b82f6' : '#ef4444'"
                              [attr.title]="patientData.patientName + ': ' + patientData.value + ' ' + comparison.unit" />
                    }
                  </svg>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  @for (patientData of comparison.patients; track patientData.patientId) {
                    <div class="bg-gray-50 rounded-lg p-4">
                      <h5 class="font-medium text-gray-900 mb-2">{{ patientData.patientName }}</h5>
                      <div class="text-2xl font-bold mb-2"
                           [ngClass]="patientData.status === 'normal' ? 'text-green-600' : patientData.status === 'abnormal' ? 'text-yellow-600' : 'text-red-600'">
                        {{ patientData.value }} {{ comparison.unit }}
                      </div>
                      <div class="text-sm text-gray-600">
                        Status:
                        <span [ngClass]="patientData.status === 'normal' ? 'text-green-600' : patientData.status === 'abnormal' ? 'text-yellow-600' : 'text-red-600'">
                          {{ patientData.status }}
                        </span>
                      </div>
                      <div class="text-sm text-gray-600 mt-1">
                        Date: {{ patientData.date }}
                      </div>
                    </div>
                  }
                </div>

                <div class="bg-blue-50 rounded-lg p-4">
                  <h5 class="font-medium text-blue-900 mb-2">Analysis</h5>
                  <p class="text-sm text-blue-800">{{ getComparisonAnalysis(comparison) }}</p>
                </div>
              </div>
            }
          </div>
        }

        @if (comparisonData().length === 0 && selectedPatient1() && selectedPatient2()) {
          <div class="text-center py-8 text-gray-600">
            <p class="text-lg font-medium">No comparable lab results found</p>
            <p class="text-sm mt-2">Both patients need to have the same tests performed</p>
          </div>
        }

        @if (!selectedPatient1() || !selectedPatient2()) {
          <div class="text-center py-8 text-gray-600">
            <p class="text-lg font-medium">Select two patients to compare their lab results</p>
            <p class="text-sm mt-2">Choose patients from the dropdowns above to see side-by-side comparisons</p>
          </div>
        }
      }
    </div>
  `
})
export class LabResultsComparisonComponent {
  loading = signal(false);
  error = signal<string | null>(null);

  patients = signal<any[]>([]);
  selectedPatient1 = signal<string>('');
  selectedPatient2 = signal<string>('');
  selectedTest = signal<string>('');

  comparisonData = signal<any[]>([]);
  availableTests = signal<string[]>([]);

  private labResultService = inject(LabResultService);
  private patientService = inject(PatientService);

  ngOnInit() {
    this.loadPatients();
  }

  private loadPatients() {
    this.patientService.getPatients({ per_page: 100 }).subscribe({
      next: (response: any) => {
        this.patients.set(response.data || []);
      },
      error: (err: any) => {
        this.error.set('Failed to load patients');
        console.error('Error loading patients:', err);
      }
    });
  }

  loadComparisonData() {
    const patient1Id = this.selectedPatient1();
    const patient2Id = this.selectedPatient2();

    if (!patient1Id || !patient2Id) {
      this.comparisonData.set([]);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const patient1Results$ = this.labResultService.getPatientLabResults(parseInt(patient1Id), { per_page: 500 });
    const patient2Results$ = this.labResultService.getPatientLabResults(parseInt(patient2Id), { per_page: 500 });

    [patient1Results$, patient2Results$].forEach((observable, index) => {
      observable.subscribe({
        next: (response: any) => {
          if (index === 1) {
            this.processComparisonData(response.data || []);
            this.loading.set(false);
          }
        },
        error: (err: any) => {
          this.error.set('Failed to load comparison data');
          this.loading.set(false);
          console.error('Error loading comparison data:', err);
        }
      });
    });
  }

  private processComparisonData(patientResults: any[]) {
    const patient1Id = parseInt(this.selectedPatient1());
    const patient2Id = parseInt(this.selectedPatient2());

    const numericResults = patientResults.filter((r: any) =>
      !isNaN(parseFloat(r.result_value || '0'))
    );

    const testGroups: { [key: string]: any[] } = {};
    numericResults.forEach((result: any) => {
      const testName = result.test_name || 'Unknown Test';
      if (!testGroups[testName]) {
        testGroups[testName] = [];
      }
      testGroups[testName].push(result);
    });

    const comparisons: any[] = [];
    Object.entries(testGroups).forEach(([testName, results]) => {
      const patient1Result = results.find((r: any) => r.patient_id === patient1Id);
      const patient2Result = results.find((r: any) => r.patient_id === patient2Id);

      if (patient1Result && patient2Result) {
        const patient1Value = parseFloat(patient1Result.result_value || '0');
        const patient2Value = parseFloat(patient2Result.result_value || '0');

        const normalRange = patient1Result.normal_range || patient2Result.normal_range || '';
        let normalMin: number | null = null;
        let normalMax: number | null = null;

        if (normalRange.includes('-')) {
          const [minStr, maxStr] = normalRange.split('-');
          normalMin = parseFloat(minStr.trim());
          normalMax = parseFloat(maxStr.trim());
        }

        const status1 = this.determineStatus(patient1Value, normalMin, normalMax);
        const status2 = this.determineStatus(patient2Value, normalMin, normalMax);

        const patient1Patient = this.patients().find(p => p.id === patient1Id);
        const patient2Patient = this.patients().find(p => p.id === patient2Id);

        comparisons.push({
          testName,
          unit: patient1Result.unit || '',
          normalMin,
          normalMax,
          patients: [
            {
              patientId: patient1Id,
              patientName: `${patient1Patient?.first_name} ${patient1Patient?.last_name}`,
              value: patient1Value,
              status: status1,
              date: new Date(patient1Result.result_date || patient1Result.created_at).toLocaleDateString()
            },
            {
              patientId: patient2Id,
              patientName: `${patient2Patient?.first_name} ${patient2Patient?.last_name}`,
              value: patient2Value,
              status: status2,
              date: new Date(patient2Result.result_date || patient2Result.created_at).toLocaleDateString()
            }
          ]
        });
      }
    });

    this.comparisonData.set(this.filterComparisonData(comparisons));
    this.extractAvailableTests(comparisons);
  }

  private filterComparisonData(comparisons: any[]): any[] {
    if (!this.selectedTest()) {
      return comparisons;
    }

    return comparisons.filter(comp => comp.testName === this.selectedTest());
  }

  private extractAvailableTests(comparisons: any[]) {
    const tests = comparisons.map(comp => comp.testName);
    this.availableTests.set([...new Set(tests)].sort());
  }

  private determineStatus(value: number, normalMin: number | null, normalMax: number | null): 'normal' | 'abnormal' | 'critical' {
    if (normalMin && normalMax) {
      if (value < normalMin * 0.5 || value > normalMax * 2) {
        return 'critical';
      } else if (value < normalMin || value > normalMax) {
        return 'abnormal';
      }
    }
    return 'normal';
  }

  public getNormalRangeWidth(comparison: any): number {
    if (comparison.normalMin === null || comparison.normalMax === null) return 0;
    const minValue = Math.min(comparison.patients[0]?.value || 0, comparison.patients[1]?.value || 0, comparison.normalMin);
    const maxValue = Math.max(comparison.patients[0]?.value || 0, comparison.patients[1]?.value || 0, comparison.normalMax);
    const range = maxValue - minValue || 1;
    return ((comparison.normalMax - comparison.normalMin) / range) * 100;
  }

  public getNormalRangeLeft(comparison: any): number {
    if (comparison.normalMin === null || comparison.normalMax === null) return 0;
    const minValue = Math.min(comparison.patients[0]?.value || 0, comparison.patients[1]?.value || 0, comparison.normalMin);
    const maxValue = Math.max(comparison.patients[0]?.value || 0, comparison.patients[1]?.value || 0, comparison.normalMax);
    const range = maxValue - minValue || 1;
    return ((comparison.normalMin - minValue) / range) * 100;
  }

  public getYPosition(comparison: any, value: number): number {
    if (comparison.patients.length <= value) return 50;
    const minValue = Math.min(comparison.patients[0]?.value || 0, comparison.patients[1]?.value || 0, comparison.normalMin);
    const maxValue = Math.max(comparison.patients[0]?.value || 0, comparison.patients[1]?.value || 0, comparison.normalMax);
    const range = maxValue - minValue || 1;
    return 80 - ((value - minValue) / range) * 80;
  }

  public getPatientPosition(comparison: any, patientIndex: number): number {
    if (comparison.patients.length <= patientIndex) return 50;
    const minValue = Math.min(comparison.patients[0]?.value || 0, comparison.patients[1]?.value || 0, comparison.normalMin);
    const maxValue = Math.max(comparison.patients[0]?.value || 0, comparison.patients[1]?.value || 0, comparison.normalMax);
    const range = maxValue - minValue || 1;
    const value = comparison.patients[patientIndex]?.value || 0;
    return ((value - minValue) / range) * 100;
  }

  public getComparisonAnalysis(comparison: any): string {
    const patient1 = comparison.patients[0];
    const patient2 = comparison.patients[1];

    if (patient1.status === patient2.status) {
      if (patient1.status === 'normal') {
        return `Both patients have normal ${comparison.testName} levels. Patient 1: ${patient1.value}, Patient 2: ${patient2.value} ${comparison.unit}`;
      } else {
        return `Both patients have ${patient1.status} ${comparison.testName} levels. Further investigation recommended.`;
      }
    } else {
      const normalPatient = patient1.status === 'normal' ? patient1 : patient2;
      const abnormalPatient = patient1.status !== 'normal' ? patient1 : patient2;
      return `${normalPatient.patientName} has normal ${comparison.testName} levels (${normalPatient.value} ${comparison.unit}), while ${abnormalPatient.patientName} has ${abnormalPatient.status} levels (${abnormalPatient.value} ${comparison.unit}).`;
    }
  }

  onPatient1Change(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedPatient1.set(selectElement.value);
    this.loadComparisonData();
  }

  onPatient2Change(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedPatient2.set(selectElement.value);
    this.loadComparisonData();
  }

  onTestChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedTest.set(selectElement.value);
    this.comparisonData.set(this.filterComparisonData(this.comparisonData()));
  }
}
