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
  token: string;
  user: AuthUser;
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
          localStorage.setItem('auth_token', res.token);
          this.userSignal.set(res.user);
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
}
