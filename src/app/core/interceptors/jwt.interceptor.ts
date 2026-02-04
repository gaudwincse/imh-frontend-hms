import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import {
  catchError,
  switchMap,
  throwError,
  filter,
  take,
  BehaviorSubject
} from 'rxjs';

const SKIP_TOKEN_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/refresh' // 🔴 MUST skip refresh
];

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const shouldSkip = SKIP_TOKEN_ENDPOINTS.some(e => req.url.includes(e));

  if (shouldSkip) return next(req);

  const token = authService.getToken();

  let authReq = req;
  if (token && !authService.isTokenExpired()) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 401 && token) {

        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap(res => {
              isRefreshing = false;
              const newToken = res.access_token;

              authService.storeToken(newToken);
              refreshTokenSubject.next(newToken);

              return next(
                req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` }
                })
              );
            }),
            catchError(err => {
              isRefreshing = false;
              authService.logout('/auth/login?session=expired');
              return throwError(() => err);
            })
          );
        }

        return refreshTokenSubject.pipe(
          filter(t => t !== null),
          take(1),
          switchMap(t =>
            next(
              req.clone({
                setHeaders: { Authorization: `Bearer ${t}` }
              })
            )
          )
        );
      }

      if (error.status === 403) {
        console.warn('403 Forbidden');
      }

      return throwError(() => error);
    })
  );
};
