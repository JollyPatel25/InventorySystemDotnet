import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';
import { ApiResponse } from '../models/api-response.models';
import {
  LoginRequestDto,
  LoginResponseDto,
  CreateOrganizationDto,
  CreateOrgAdminDto,
  CreateUserWithRoleDto,
  SwitchOrganizationDto,
  UserResponseDto
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {}

  login(dto: LoginRequestDto): Observable<ApiResponse<LoginResponseDto>> {
    return this.http.post<ApiResponse<LoginResponseDto>>(`${this.base}/auth/login`, dto).pipe(
      tap(res => {
        if (res.success) {
          this.tokenService.setToken(res.data.accessToken);
        }
      })
    );
  }

  logout(): void {
    this.tokenService.removeToken();
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return this.tokenService.isTokenValid();
  }

  getRedirectUrl(): string {
    if (this.tokenService.isPlatformAdmin()) return '/platform/dashboard';
    const role = this.tokenService.getRole();
    switch (role) {
      case 'Admin': return '/org/dashboard';
      case 'Manager': return '/manager/dashboard';
      case 'Viewer': return '/viewer/dashboard';
      default: return '/auth/login';
    }
  }

  // Platform Admin APIs
  createOrganization(dto: CreateOrganizationDto): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.base}/auth/platform/create-organization`, dto);
  }

  createOrgAdmin(dto: CreateOrgAdminDto): Observable<ApiResponse<UserResponseDto>> {
    return this.http.post<ApiResponse<UserResponseDto>>(`${this.base}/auth/platform/create-org-admin`, dto);
  }

  // Org Admin / Manager APIs
  createUserWithRole(dto: CreateUserWithRoleDto): Observable<ApiResponse<UserResponseDto>> {
    return this.http.post<ApiResponse<UserResponseDto>>(`${this.base}/auth/org/create-user`, dto);
  }

  switchOrganization(dto: SwitchOrganizationDto): Observable<ApiResponse<LoginResponseDto>> {
    return this.http.post<ApiResponse<LoginResponseDto>>(`${this.base}/auth/switch-organization`, dto).pipe(
      tap(res => {
        if (res.success) {
          this.tokenService.setToken(res.data.accessToken);
        }
      })
    );
  }

  setDefaultOrganization(dto: SwitchOrganizationDto): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.base}/auth/set-default-organization`, dto);
  }
}