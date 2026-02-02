import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  gender?: string;
  dob?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  dob?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);

  constructor() {}

  // POST /api/users - Create user
  createUser(userData: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>('/api/users', userData).pipe(
      catchError(this.handleError)
    );
  }

  // GET /api/users - List users
  getUsers(params?: any): Observable<ApiResponse<User[]>> {
    const httpParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<User[]>>('/api/users').pipe(
      catchError(this.handleError)
    );
  }

  // GET /api/users/:id - Get single user
  getUser(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`/api/users/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // PUT /api/users/:id - Update user
  updateUser(id: number, userData: Partial<CreateUserRequest>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`/api/users/${id}`, userData).pipe(
      catchError(this.handleError)
    );
  }

  // DELETE /api/users/:id - Delete user
  deleteUser(id: number): Observable<ApiResponse<{message: string}>> {
    return this.http.delete<ApiResponse<{message: string}>>(`/api/users/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status === 400) {
      // Validation error
      errorMessage = error.error?.message || 'Validation failed';
    } else if (error.status === 401) {
      // Unauthorized
      errorMessage = 'You are not authorized to perform this action';
    } else if (error.status === 403) {
      // Forbidden
      errorMessage = 'You do not have permission to perform this action';
    } else if (error.status === 404) {
      // Not found
      errorMessage = 'The requested resource was not found';
    } else if (error.status === 422) {
      // Validation error with details
      errorMessage = error.error?.message || 'Validation failed';
    } else if (error.status === 500) {
      // Server error
      errorMessage = 'A server error occurred. Please try again later.';
    }

    return throwError(() => errorMessage);
  }
}
