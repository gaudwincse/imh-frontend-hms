import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BranchContextService {
  private branchSignal = signal<number | null>(null);

  activeBranchId = this.branchSignal.asReadonly();

  initFromUser(user: any) {
    const defaultBranch = user.branches.find((b: any) => b.is_default);

    if (user.branches.length === 1) {
      this.branchSignal.set(user.branches[0].id);
    } else if (defaultBranch) {
      this.branchSignal.set(defaultBranch.id);
    }
  }

  setBranch(branchId: number) {
    this.branchSignal.set(branchId);
  }

  clear() {
    this.branchSignal.set(null);
  }
}
