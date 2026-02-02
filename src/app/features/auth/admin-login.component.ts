import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, LoginCredentials, LoginResponse } from '../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title class="login-title">Admin Login</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email or Mobile</mat-label>
              <input matInput formControlName="login" placeholder="Enter email or mobile">
              <mat-error *ngIf="loginForm.get('login')?.hasError('required')">
                Email or mobile is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" placeholder="Enter password">
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>

            <button 
              mat-raised-button 
              color="primary" 
              type="submit" 
              class="login-btn"
              [disabled]="loginForm.invalid || isLoading()"
            >
              <mat-spinner *ngIf="isLoading()" diameter="20"></mat-spinner>
              <span *ngIf="!isLoading()">Login</span>
            </button>
          </form>

          <div class="error-message" *ngIf="errorMessage()">
            <mat-icon color="warn">error</mat-icon>
            <span>{{ errorMessage() }}</span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }

    .login-title {
      text-align: center;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .login-btn {
      width: 100%;
      height: 48px;
      font-size: 1rem;
      margin-top: 1rem;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 0.75rem;
      background-color: #ffebee;
      border-radius: 4px;
      color: #c62828;
    }

    form {
      display: flex;
      flex-direction: column;
    }
  `]
})
export class AdminLoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({});
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials: LoginCredentials = {
      login: this.loginForm.value.login,
      password: this.loginForm.value.password
    };

    console.log('🔐 Attempting login with:', credentials);

    this.authService.login(credentials).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading.set(false);
        
        if (response.access_token && response.user) {
          console.log('✅ Login successful, redirecting...');
          
          // Check if user is admin and redirect accordingly
          if (this.authService.isAdmin()) {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        } else {
          this.errorMessage.set('Login failed: Invalid response');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        console.error('❌ Login error:', err);
        
        const message = err.error?.message || 
                       err.error?.error || 
                       'Login failed. Please check your credentials.';
        this.errorMessage.set(message);
      }
    });
  }
}