import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError, from, switchMap } from 'rxjs';

// Skip token for these endpoints
const SKIP_TOKEN_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password'
];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if we should skip token attachment
  const shouldSkipToken = SKIP_TOKEN_ENDPOINTS.some(endpoint => 
    req.url.includes(endpoint)
  );

  // Clone request with token if needed
  let authReq = req;
  if (!shouldSkipToken) {
    const token = authService.getToken();
    
    if (token && !authService.isTokenExpired()) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`🔐 Adding JWT token to: ${req.method} ${req.url}`);
    } else if (token && authService.isTokenExpired()) {
      // Token expired - try to refresh
      console.log('⏰ Token expired, attempting refresh...');
      return from(authService.refreshToken().toPromise()).pipe(
        switchMap((response) => {
          if (response?.access_token) {
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.access_token}`,
                'Content-Type': 'application/json'
              }
            });
            return next(newReq);
          }
          throw new Error('Token refresh failed');
        }),
        catchError((error) => {
          authService.logout('/auth/login?session=expired');
          return throwError(() => error);
        })
      );
    }
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized
      if (error.status === 401) {
        console.error('❌ 401 Unauthorized - Logging out');
        
        // Don't redirect if it's a login endpoint
        if (!shouldSkipToken) {
          authService.logout('/auth/login?session=expired');
        }
      }

      // Handle 403 Forbidden
      if (error.status === 403) {
        console.error('🚫 403 Forbidden - Insufficient permissions');
        // You could redirect to a 403 page or show a toast
      }

      return throwError(() => error);
    })
  );
};