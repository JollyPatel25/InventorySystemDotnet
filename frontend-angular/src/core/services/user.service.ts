import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.models';
import { UserOrganizationDto } from '../../shared/layout/topbar/topbar.component';

 
export interface PlatformUserListItemDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  isActive: boolean;
  isPlatformAdmin: boolean;
  organizations: UserOrgRoleDto[];
  // computed on frontend
  orgNames?: string;
  roles?: string;
}

export interface UserOrgRoleDto {
  organizationId: string;
  organizationName: string;
  role: string;
  isDefault: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly base = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.base}/getall`);
  }

  getWarehouseAssignments(userId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.base}/${userId}/warehouse-assignments`);
  }

  assignWarehouse(dto: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.base}/assign-warehouse`, dto);
  }

  removeWarehouseAssignment(assignmentId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/remove-warehouse/${assignmentId}`);
  }

  getMyOrganizations(): Observable<ApiResponse<UserOrganizationDto[]>> {
    return this.http.get<ApiResponse<UserOrganizationDto[]>>(`${this.base}/my-organizations`);
  }

  // Platform Admin
  getAllUsers(): Observable<ApiResponse<PlatformUserListItemDto[]>> {
    return this.http.get<ApiResponse<PlatformUserListItemDto[]>>(`${this.base}/platform/getall`);
  }

  deactivateUser(userId: string): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(`${this.base}/platform/deactivate/${userId}`, {});
  }

  reactivateUser(userId: string): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(`${this.base}/platform/reactivate/${userId}`, {});
  }

    assignAsOrgAdmin(userId: string, organizationId: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.base}/platform/assign-org-admin`, {
      userId,
      organizationId
    });
  }
 
  getMyProfile(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.base}/me`);
  }
 
  updateMyProfile(dto: any): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.base}/me`, dto);
  }
}