import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LucideAngularModule, LogIn, User, Stethoscope } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="icon-circle">
            <lucide-icon [name]="loginType() === 'staff' ? Stethoscope : User" [class]="'header-icon ' + loginType()"></lucide-icon>
          </div>
          <h2>{{ loginType() === 'staff' ? 'Staff Login' : 'Patient Portal' }}</h2>
          <p>Welcome back! Please enter your details.</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email or Username</label>
            <input type="text" id="email" formControlName="email" placeholder="Enter your email" [class.error]="isFieldInvalid('email')">
            @if (isFieldInvalid('email')) {
            <span class="error-msg">Email is required</span>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" formControlName="password" placeholder="Enter your password" [class.error]="isFieldInvalid('password')">
            @if (isFieldInvalid('password')) {
            <span class="error-msg">Password is required</span>
            }
          </div>

          <div class="form-options">
             <label class="checkbox">
               <input type="checkbox"> Remember me
             </label>
             <a href="#" class="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" class="btn-login" [disabled]="isLoading()">
            @if (!isLoading()) {
            <span>Sign In</span>
            }
            @if (isLoading()) {
            <span class="loader"></span>
            }
          </button>
        </form>

        <div class="switch-login">
            @if (loginType() === 'patient') {
            <p>Are you a staff member? <a (click)="switchType('staff')">Staff Login</a></p>
            }
            @if (loginType() === 'staff') {
            <p>Are you a patient? <a (click)="switchType('patient')">Patient Login</a></p>
            }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #fdfdfd; 
    }
    .login-card {
      background: white;
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      width: 100%;
      max-width: 420px;
      text-align: center;
      border: 1px solid rgba(0,0,0,0.05);
    }
    .login-header { margin-bottom: 2rem; }
    .icon-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }
    .header-icon { width: 32px; height: 32px; color: #6b7280; }
    .header-icon.staff { color: #0ea5e9; } /* Sky Blue for Staff */
    .header-icon.patient { color: #10b981; } /* Emerald Green for Patient */
    
    h2 { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem; }
    p { color: #6b7280; font-size: 0.95rem; margin: 0; }

    .form-group { margin-bottom: 1.25rem; text-align: left; }
    label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem; }
    input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: all 0.2s;
    }
    input:focus { outline: none; border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1); }
    input.error { border-color: #ef4444; }
    .error-msg { font-size: 0.8rem; color: #ef4444; margin-top: 0.25rem; display: block; }

    .form-options { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; font-size: 0.875rem; }
    .checkbox { display: flex; align-items: center; gap: 0.5rem; color: #4b5563; cursor: pointer; }
    .forgot-password { color: #0ea5e9; text-decoration: none; font-weight: 500; }
    .forgot-password:hover { text-decoration: underline; }

    .btn-login {
      width: 100%;
      padding: 0.875rem;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.1s;
    }
    .btn-login:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-login:active { transform: scale(0.98); }

    .switch-login { margin-top: 1.5rem; font-size: 0.9rem; color: #6b7280; }
    .switch-login a { color: #0ea5e9; font-weight: 600; cursor: pointer; text-decoration: none; margin-left: 0.25rem; }
    .switch-login a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = signal(false);
  loginType = signal<'staff' | 'patient'>('patient');

  // Icons
  readonly Stethoscope = Stethoscope;
  readonly User = User;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]], // Using 'email' as field name for login
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const type = params['type'];
      if (type === 'staff' || type === 'patient') {
        this.loginType.set(type);
      }
    });
  }

  switchType(type: 'staff' | 'patient') {
    this.loginType.set(type);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { type: type },
      queryParamsHandling: 'merge',
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { email, password } = this.loginForm.value;

    this.authService.login({ login: email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login failed', err);
        this.isLoading.set(false);
        // Add error handling logic/toast here
        alert('Login failed. Please check your credentials.');
      }
    });
  }
}
