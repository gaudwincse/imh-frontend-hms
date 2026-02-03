import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn
} from '@angular/common/http';

import { BranchContextService } from '../services/branch-context.service';

export const branchInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const branchContext = inject(BranchContextService);
  let branchId = branchContext.activeBranchId();

  // If no branch context set, try to get default from user data
  if (!branchId) {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const defaultBranch = user.branches?.find((b: any) => b.is_default);
      if (defaultBranch) {
        branchId = defaultBranch.id;
      }
    }

    // Fallback to branch 1 if still no branch
    if (!branchId) {
      branchId = 1;
    }
  }

  // Skip branch header for auth endpoints
  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: {
      'X-Branch-ID': branchId.toString(),
    },
  });

  return next(cloned);
};
