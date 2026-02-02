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
  const branchId = branchContext.activeBranchId();

  if (!branchId) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: {
      'X-Branch-ID': branchId.toString(),
    },
  });

  return next(cloned);
};
