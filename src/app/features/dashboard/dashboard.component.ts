import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { LucideAngularModule, Users, UserRound, Calendar, TrendingUp, MoreVertical, Star } from 'lucide-angular';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, NgApexchartsModule, LucideAngularModule, MatCardModule, MatButtonModule, MatMenuModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
    readonly Users = Users;
    readonly UserRound = UserRound;
    readonly Calendar = Calendar;
    readonly TrendingUp = TrendingUp;
    readonly MoreVertical = MoreVertical;
    readonly Star = Star;

    statsCards = [
        { title: 'Total Patients', value: '1,284', trend: '+12%', icon: Users, color: '#3b82f6' },
        { title: 'Available Doctors', value: '42', trend: '+2', icon: UserRound, color: '#10b981' },
        { title: 'Appointments Today', value: '18', trend: '-5%', icon: Calendar, color: '#f59e0b' },
        { title: 'Monthly Revenue', value: '$45,200', trend: '+8.4%', icon: TrendingUp, color: '#8b5cf6' },
    ];

    public admissionChartOptions: any = {
        series: [
            { name: 'Emergencies', data: [44, 55, 41, 67, 22, 43, 21] },
            { name: 'Regular', data: [13, 23, 20, 8, 13, 27, 33] }
        ],
        chart: { type: 'bar', height: 350, stacked: true, toolbar: { show: false } },
        colors: ['#3b82f6', '#e2e8f0'],
        plotOptions: { bar: { horizontal: false, borderRadius: 10, columnWidth: '60%' } },
        xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], labels: { style: { fontSize: '12px' } } },
        legend: { position: 'top', horizontalAlign: 'right' },
        fill: { opacity: 1 },
        responsive: [{
            breakpoint: 768,
            options: {
                plotOptions: { bar: { borderRadius: 6, columnWidth: '80%' } },
                xaxis: { labels: { style: { fontSize: '10px' } } },
                legend: { position: 'bottom', horizontalAlign: 'center' }
            }
        }]
    };

    public patientChartOptions: any = {
        series: [44, 55, 13, 43, 22],
        chart: { type: 'donut', height: 350 },
        labels: ['Cardiology', 'Neurology', 'Orthopedic', 'Pediatrics', 'General'],
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'],
        legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '14px' },
        responsive: [
            {
                breakpoint: 480,
                options: {
                    chart: { height: 300 },
                    legend: { position: 'bottom', fontSize: '11px' }
                }
            }
        ]
    };

    upcomingAppointments = [
        { patient: 'Alice Freeman', time: '09:00 AM', type: 'Checkup', doctor: 'Dr. Smith' },
        { patient: 'Robert Fox', time: '10:30 AM', type: 'Consultation', doctor: 'Dr. Sarah' },
        { patient: 'Cody Fisher', time: '11:45 AM', type: 'Emergency', doctor: 'Dr. White' },
        { patient: 'Jenny Wilson', time: '02:00 PM', type: 'Report', doctor: 'Dr. James' },
    ];
}
