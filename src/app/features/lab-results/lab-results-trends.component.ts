import { Component, signal, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabResult, LabResultService } from '../../core/services/lab-result.service';

interface TrendData {
  testName: string;
  unit: string;
  points: {
    date: string;
    value: number;
    testName: string;
    unit: string;
    status: 'normal' | 'abnormal' | 'critical';
    normalMin?: number;
    normalMax?: number;
  }[];
  normalMin?: number;
  normalMax?: number;
  status: 'normal' | 'abnormal' | 'critical';
}

@Component({
  selector: 'app-lab-results-trends',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold text-gray-900">Lab Results Trends</h3>
        <div class="flex items-center space-x-4">
          <select
            (change)="onTimeRangeChange($event)"
            class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          <button
            (click)="refreshData()"
            [disabled]="loading()"
            class="text-sm bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50">
            {{ loading() ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Loading trend data...</p>
        </div>
      }

      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="text-red-800">{{ error() }}</div>
        </div>
      }

      @if (!loading() && !error()) {
        @if (trendData().length === 0) {
          <div class="text-center py-8 text-gray-600">
            <p class="text-lg font-medium">No lab trend data available for this period</p>
          </div>
        }

        @if (trendData().length > 0) {
          <div class="space-y-8">
            @for (trend of trendData(); track trend.testName) {
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-center mb-4">
                  <h4 class="font-medium text-gray-900">{{ trend.testName }}</h4>
                  <span class="px-3 py-1 text-xs font-medium rounded-full"
                        [ngClass]="trend.status === 'normal' ? 'bg-green-100 text-green-800' : trend.status === 'abnormal' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'">
                        {{ trend.status === 'normal' ? 'Normal' : trend.status === 'abnormal' ? 'Abnormal' : 'Critical' }}
                  </span>
                </div>

                <div class="relative h-32 bg-gray-50 rounded-lg p-2 mb-4">
                  @if (trend.normalMin && trend.normalMax) {
                    <div class="absolute h-full bg-green-200 opacity-50"
                         [style.width.%]="getNormalRangePercentage(trend)"
                         [style.left.%]="getNormalRangeLeft(trend)">
                    </div>
                  }

                  <svg class="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                    <polyline
                      [attr.points]="getPolylinePoints(trend)"
                      fill="none"
                      stroke="#3b82f6"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round" />

                    @for (point of trend.points; track point.date) {
                      <circle [attr.cx]="getPointX(trend, $index)"
                              [attr.cy]="getPointY(trend, point)"
                              r="3"
                              [attr.fill]="point.status === 'normal' ? '#10b981' : point.status === 'abnormal' ? '#f59e0b' : '#ef4444'"
                              [attr.title]="getPointTitle(point)" />
                    }
                  </svg>
                </div>

                <div class="mt-4 overflow-x-auto">
                  <table class="min-w-full text-sm">
                    <thead>
                      <tr class="bg-gray-50">
                        <th class="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th class="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                        <th class="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      @for (point of trend.points.slice(-5).reverse(); track point.date) {
                        <tr class="border-b border-gray-200">
                          <td class="px-2 py-1 text-gray-900">{{ point.date }}</td>
                          <td class="px-2 py-1 font-medium text-gray-900">{{ point.value }} {{ point.unit }}</td>
                          <td class="px-2 py-1">
                            <span class="px-2 py-1 text-xs font-medium rounded-full"
                                  [ngClass]="point.status === 'normal' ? 'bg-green-100 text-green-800' : point.status === 'abnormal' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'">
                                  {{ point.status === 'normal' ? 'Normal' : point.status === 'abnormal' ? 'Abnormal' : 'Critical' }}
                            </span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `
})
export class LabResultsTrendsComponent {
  patientId = input.required<number>();
  loading = signal(true);
  error = signal<string | null>(null);

  trendData = signal<TrendData[]>([]);
  normalCount = signal(0);
  abnormalCount = signal(0);
  criticalCount = signal(0);

  private timeRange = signal(30);
  private labResultService = inject(LabResultService);

  ngOnInit() {
    this.loadTrendData();
  }

  private loadTrendData() {
    const patientIdValue = this.patientId();
    if (!patientIdValue) return;

    this.loading.set(true);
    this.error.set(null);

    this.labResultService.getPatientLabResults(patientIdValue, { per_page: 500 }).subscribe({
      next: (response: any) => {
        this.loading.set(false);
        this.processTrendData(response.data || []);
      },
      error: (err: any) => {
        this.error.set('Failed to load trend data');
        this.loading.set(false);
        console.error('Error loading lab results trends:', err);
      }
    });
  }

  private processTrendData(results: any[]) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - this.timeRange());
    const filteredResults = results.filter((r: any) =>
      new Date(r.result_date || r.created_at) >= daysAgo &&
      !isNaN(parseFloat(r.result_value || '0'))
    );

    const testGroups: { [key: string]: any[] } = {};
    filteredResults.forEach((result: any) => {
      const testName = result.lab_test?.name || result.test_name || 'Unknown Test';
      if (!testGroups[testName]) {
        testGroups[testName] = [];
      }
      testGroups[testName].push(result);
    });

    const trends: TrendData[] = [];
    Object.entries(testGroups).forEach(([testName, testResults]) => {
      const points = testResults
        .sort((a: any, b: any) =>
          new Date(a.result_date || a.created_at).getTime() - new Date(b.result_date || b.created_at).getTime()
        )
        .map((result: any) => {
          const value = parseFloat(result.result_value || '0');
          const normalRange = result.normal_range || '';
          const [normalMin, normalMax] = normalRange.includes('-')
            ? normalRange.split('-').map((n: string) => parseFloat(n.trim()))
            : [null, null];

          let status: 'normal' | 'abnormal' | 'critical' = 'normal';
          if (normalMin && normalMax) {
            if (value < normalMin * 0.5 || value > normalMax * 2) {
              status = 'critical';
            } else if (value < normalMin || value > normalMax) {
              status = 'abnormal';
            }
          }

          return {
            date: new Date(result.result_date || result.created_at).toLocaleDateString(),
            value,
            testName,
            unit: result.unit || '',
            status,
            normalMin,
            normalMax
          };
        });

      const latestPoint = points[points.length - 1];
      trends.push({
        testName,
        unit: points[0]?.unit || '',
        points,
        normalMin: points[0]?.normalMin,
        normalMax: points[0]?.normalMax,
        status: latestPoint?.status || 'normal'
      });
    });

    this.trendData.set(trends);

    const allPoints = trends.flatMap((trend: TrendData) => trend.points);
    this.normalCount.set(allPoints.filter((p: any) => p.status === 'normal').length);
    this.abnormalCount.set(allPoints.filter((p: any) => p.status === 'abnormal').length);
    this.criticalCount.set(allPoints.filter((p: any) => p.status === 'critical').length);
  }

  onTimeRangeChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const days = parseInt(selectElement.value);
    this.timeRange.set(days);
    this.loadTrendData();
  }

  refreshData() {
    this.loadTrendData();
  }

  public getPointX(trend: TrendData, index: number): string {
    return index === 0 ? '0' : `${(index / (trend.points.length - 1)) * 400}`;
  }

  public getPointY(trend: TrendData, point: any): string {
    const values = trend.points.map((p: any) => p.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;
    return `${80 - ((point.value - minValue) / range) * 80}`;
  }

  public getNormalRangePercentage(trend: TrendData): number {
    if (!trend.normalMin || !trend.normalMax) return 0;
    const values = trend.points.map((p: any) => p.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;
    return ((trend.normalMax! - trend.normalMin!) / range) * 100;
  }

  public getNormalRangeLeft(trend: TrendData): number {
    if (!trend.normalMin || !trend.normalMax) return 0;
    const values = trend.points.map((p: any) => p.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;
    return ((trend.normalMin! - minValue) / range) * 100;
  }

  public getPolylinePoints(trend: TrendData): string {
    return trend.points
      .map((point: any, index: number) => {
        const x = index === 0 ? '0' : `${(index / (trend.points.length - 1)) * 400}`;
        const values = trend.points.map((p: any) => p.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const range = maxValue - minValue || 1;
        const y = `${80 - ((point.value - minValue) / range) * 80}`;
        return `${x},${y}`;
      })
      .join(' ');
  }

  public getPointTitle(point: any): string {
    return `${point.date}: ${point.value} ${point.unit}`;
  }
}
