import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BranchContextService } from "../services/branch-context.service";


@Injectable({ providedIn: 'root' })
export class BranchGuard {
  constructor(
    private branchContext: BranchContextService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.branchContext.activeBranchId()) {
      this.router.navigate(['/select-branch']);
      return false;
    }
    return true;
  }
}
