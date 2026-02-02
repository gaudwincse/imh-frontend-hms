import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LucideAngularModule, Shield, User, LogIn } from 'lucide-angular';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  styleUrls: ['./admin-login.component.scss'],
  template: `
    <div class="login-container">
      <div class="login-wrapper">
        <!-- Header -->
        <div class="login-header">
          <div class="header-icon">
            <lucide-icon [name]="Shield"></lucide-icon>
          </div>
          <h1>Super <span>Admin</span></h1>
          <p class="subtitle">
            Sign in to access Hospital Management System
          </p>
        </div>

        <!-- Login Form -->
        <div class="login-card">
          <form [formGroup]="adminLoginForm" (ngSubmit)="onSubmit()">
            <!-- Email Input -->
            <div class="form-group">
              <label for="email">Admin Email</label>
              <div class="input-wrapper">
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  placeholder="admin@hms.com"
                  [attr.aria-invalid]="isFieldInvalid('email')"
                  [ngClass]="{'ng-invalid ng-touched': isFieldInvalid('email')}"
                >
              </div>
              @if (isFieldInvalid('email')) {
                <span class="field-error">Please enter a valid admin email</span>
              }
            </div>

            <!-- Password Input -->
            <div class="form-group">
              <label for="password">Password</label>
              <div class="input-wrapper">
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  autocomplete="current-password"
                  placeholder="Enter your password"
                  [attr.aria-invalid]="isFieldInvalid('password')"
                  [ngClass]="{'ng-invalid ng-touched': isFieldInvalid('password')}"
                >
              </div>
              @if (isFieldInvalid('password')) {
                <span class="field-error">Password is required</span>
              }
            </div>

            <!-- Error Alert -->
            @if (errorMessage()) {
              <div class="error-alert">
                <lucide-icon [name]="Shield"></lucide-icon>
                <div class="error-content">
                  <h3>Authentication Failed</h3>
                  <p>{{ errorMessage() }}</p>
                </div>
              </div>
            }

            <!-- Form Options (Remember Me & Forgot Password) -->
            <div class="form-options">
              <div class="checkbox-group">
                <input
                  id="remember-me"
                  type="checkbox"
                  formControlName="rememberMe"
                >
                <label for="remember-me">Remember me</label>
              </div>

              <div class="forgot-password">
                <a href="#">Forgot password?</a>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="isLoading()"
              class="submit-btn"
            >
              @if (!isLoading()) {
                <span>
                  <lucide-icon [name]="LogIn"></lucide-icon>
                  Sign in to Admin Panel
                </span>
              } @else {
                <span>
                  <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              }
            </button>
          </form>
        </div>

        <!-- Footer -->
        <div class="login-footer">
          <p class="footer-text">Protected Administrator Access</p>
          <div class="alt-links">
            <a href="/login">Staff Login</a>
            <a href="/">Patient Portal</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminLoginComponent implements OnInit {
  readonly Shield = Shield;
  readonly User = User;
  readonly LogIn = LogIn;

  adminLoginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.adminLoginForm = this.fb.group({
      email: ['admin@hms.com', [Validators.required, Validators.email]],
      password: ['admin123', [Validators.required]],
      rememberMe: [false]
    });
  }

  ngOnInit() {
    // Check if already logged in as admin
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onSubmit() {
    if (this.adminLoginForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.adminLoginForm.controls).forEach(key => {
        this.adminLoginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials = {
      login: this.adminLoginForm.value.email,
      password: this.adminLoginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.access_token && response.user) {
          // Redirect to admin dashboard
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMessage.set('Login failed');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Login failed. Please try again.');
        console.error('Admin login error:', err);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.adminLoginForm.get(fieldName);
    return field ? (field.invalid && field.touched) : false;
  }
}
