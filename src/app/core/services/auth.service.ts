import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError, BehaviorSubject, timer, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserBranch {
  id: number;
  name: string;
  is_default: boolean;
}

export interface AuthUser {
  id: number;
  name: string;
  roles: string[];
  permissions: string[];
  branches: UserBranch[];
}

export interface LoginResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: AuthUser;
}

export interface LoginCredentials {
  login: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly userSignal = signal<AuthUser | null>(null);
  private readonly tokenSignal = signal<string | null>(null);
  private readonly tokenExpirySignal = signal<number | null>(null);

  // Expose readonly signals
  readonly user = this.userSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.tokenSignal() && !!this.userSignal());
  readonly isAdmin = computed(() => {
    const user = this.userSignal();
    return user?.roles?.includes('SuperAdmin') ||
           user?.roles?.includes('administrator') ||
           user?.roles?.includes('super_admin') || false;
  });

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    const expiry = localStorage.getItem('auth_expiry');

    if (token && userStr && expiry) {
      const expiryTime = parseInt(expiry);
      const now = Date.now();

      if (now < expiryTime) {
        this.tokenSignal.set(token);
        this.userSignal.set(JSON.parse(userStr));
        this.tokenExpirySignal.set(expiryTime);

        // Set up auto-logout before expiry
        const timeUntilExpiry = expiryTime - now;
        if (timeUntilExpiry > 0) {
          timer(timeUntilExpiry).subscribe(() => this.logout());
        }
      } else {
        this.logout();
      }
    }
  }

  login(credentials: LoginCredentials) {
    return this.http.post<LoginResponse>('/api/auth/login', credentials).pipe(
      tap((response) => {
        if (response.access_token && response.user) {
          const expiryTime = Date.now() + ((response.expires_in || 3600) * 1000);

          // Update signals
          this.tokenSignal.set(response.access_token);
          this.userSignal.set(response.user);
          this.tokenExpirySignal.set(expiryTime);

          // Store in localStorage
          localStorage.setItem('auth_token', response.access_token);
          localStorage.setItem('auth_user', JSON.stringify(response.user));
          localStorage.setItem('auth_expiry', expiryTime.toString());

          console.log('✅ Login successful - Token stored');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  logout(redirectUrl: string = '/auth/login'): void {
    console.log('🚪 Logging out...');

    // Clear signals
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.tokenExpirySignal.set(null);

    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_expiry');

    // Redirect to login
    this.router.navigate([redirectUrl]);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  isTokenExpired(): boolean {
    const expiry = this.tokenExpirySignal();
    if (!expiry) return true;
    return Date.now() >= expiry;
  }

  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/refresh', {}).pipe(
      tap((response) => {
        if (response.access_token) {
          const expiryTime = Date.now() + ((response.expires_in || 3600) * 1000);

          this.tokenSignal.set(response.access_token);
          this.tokenExpirySignal.set(expiryTime);

          localStorage.setItem('auth_token', response.access_token);
          localStorage.setItem('auth_expiry', expiryTime.toString());
        }
      }),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): AuthUser | null {
    return this.userSignal();
  }

  hasPermission(permission: string): boolean {
    const user = this.userSignal();
    return user?.permissions?.includes(permission) || false;
  }

  hasRole(role: string): boolean {
    const user = this.userSignal();
    return user?.roles?.includes(role) || false;
  }
}
