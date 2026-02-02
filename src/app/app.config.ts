import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { branchInterceptor } from './core/interceptors/branch.interceptor';
import { tokenInterceptor } from './core/interceptors/jwt.interceptor';
import { apiUrlInterceptor } from './core/interceptors/api-url.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([apiUrlInterceptor, tokenInterceptor, branchInterceptor])),
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)
  ]
};
