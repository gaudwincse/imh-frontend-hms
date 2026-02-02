import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

import { AuthService } from '../core/services/auth.service';
import { BranchContextService } from '../core/services/branch-context.service';


@Component({
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatListModule
  ],
  template: `
    <mat-card>
      <h2>Select Branch</h2>

      <mat-list>
        @for (branch of branches; track branch.id) {
          <mat-list-item>
            <button mat-button (click)="select(branch.id)">
              {{ branch.name }}
            </button>
          </mat-list-item>
        }
      </mat-list>
    </mat-card>
  `,
})
export class SelectBranchComponent {
  private auth = inject(AuthService);
  private branchContext = inject(BranchContextService);
  private router = inject(Router);

  branches = this.auth.user()?.branches ?? [];

  select(branchId: number) {
    this.branchContext.setBranch(branchId);
    this.router.navigate(['/dashboard']);
  }
}
