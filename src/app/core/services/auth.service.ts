import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly userSignal = signal<AuthUser | null>(null);

  /** readonly signal for components */
  readonly user = this.userSignal.asReadonly();

  constructor(private http: HttpClient) {}

  login(payload: { login: string; password: string }) {
    return this.http
      .post<LoginResponse>('/api/auth/login', payload)
      .pipe(
        tap((res) => {
          if (res.access_token && res.user) {
            localStorage.setItem('auth_token', res.access_token);
            this.userSignal.set(res.user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.userSignal.set(null);
  }

  /** synchronous access (guards, selectors) */
  getCurrentUser(): AuthUser | null {
    return this.userSignal();
  }

  isLoggedIn(): boolean {
    return !!this.userSignal();
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token && !!this.userSignal();
  }

  isAdmin(): boolean {
    const user = this.userSignal();
    return user?.roles?.includes('administrator') || user?.roles?.includes('super_admin') || false;
  }
}
