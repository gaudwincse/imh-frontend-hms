import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { branchInterceptor } from './core/interceptors/branch.interceptor';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { apiUrlInterceptor } from './core/interceptors/api-url.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        apiUrlInterceptor,    // 1st: Set correct backend URL
        jwtInterceptor,       // 2nd: Add JWT token and handle auth
        branchInterceptor     // 3rd: Add branch context
      ])
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync()
  ]
};