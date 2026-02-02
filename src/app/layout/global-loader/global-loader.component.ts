import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../core/services/loader.service';
import { LucideAngularModule, Plus } from 'lucide-angular';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (loaderService.loading$ | async) {
    <div class="loader-overlay">
      <div class="loader-container">
        <div class="pulsing-circle"></div>
        <lucide-icon [name]="Plus" class="loader-icon"></lucide-icon>
      </div>
    </div>
    }
  `,
  styleUrls: ['./global-loader.component.scss']
})
export class GlobalLoaderComponent {
  readonly Plus = Plus;
  constructor(public loaderService: LoaderService) { }
}
