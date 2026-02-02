import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Users, UserRound, Calendar, FileText, Settings, HelpCircle, ChevronRight } from 'lucide-angular';

export interface MenuItem {
  name: string;
  icon: any;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() isCollapsed = false;

  readonly LayoutDashboard = LayoutDashboard;
  readonly Users = Users;
  readonly UserRound = UserRound;
  readonly Calendar = Calendar;
  readonly FileText = FileText;
  readonly Settings = Settings;
  readonly HelpCircle = HelpCircle;
  readonly ChevronRight = ChevronRight;

  menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
    { name: 'Doctors', icon: UserRound, route: '/doctors' },
    {
      name: 'Departments',
      icon: Users,
      children: [
        { name: 'Cardiology', icon: FileText, route: '/departments/cardiology' },
        { name: 'Neurology', icon: FileText, route: '/departments/neurology' },
        { name: 'Orthopedics', icon: FileText, route: '/departments/orthopedics' }
      ]
    },
    { name: 'Patients', icon: Users, route: '/patients' },
    { name: 'Appointments', icon: Calendar, route: '/appointments' },
    { name: 'Reports', icon: FileText, route: '/reports' },
  ];

  bottomMenuItems: MenuItem[] = [
    { name: 'Settings', icon: Settings, route: '/settings' },
    { name: 'Help', icon: HelpCircle, route: '/help' },
  ];

  toggleSubmenu(item: MenuItem) {
    if (this.isCollapsed) {
      this.isCollapsed = false; // Auto expand sidebar if clicking a submenu
    }
    item.expanded = !item.expanded;
  }
}
