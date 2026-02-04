import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // SSR-safe check
  if (typeof window === 'undefined') {
    return router.createUrlTree(['/']);
  }

  // If not logged in → redirect to login
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/']);
  }

  // Authenticated
  return true;
};