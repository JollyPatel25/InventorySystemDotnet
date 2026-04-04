import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.models';
import { UserResponseDto } from '../models/auth.models';
import { CreateUserWithRoleDto, UserListItemDto, AssignWarehouseDto, UserWarehouseAssignmentResponseDto } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly authBase = `${environment.apiBaseUrl}/auth`;
  private readonly userBase = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  createUser(dto: CreateUserWithRoleDto): Observable<ApiResponse<UserResponseDto>> {
    return this.http.post<ApiResponse<UserResponseDto>>(`${this.authBase}/org/create-user`, dto);
  }

  getOrgUsers(): Observable<ApiResponse<UserListItemDto[]>> {
    return this.http.get<ApiResponse<UserListItemDto[]>>(`${this.userBase}/getall`);
  }

  getUserWarehouseAssignments(userId: string): Observable<ApiResponse<UserWarehouseAssignmentResponseDto[]>> {
    return this.http.get<ApiResponse<UserWarehouseAssignmentResponseDto[]>>(`${this.userBase}/${userId}/warehouse-assignments`);
  }

  assignWarehouse(dto: AssignWarehouseDto): Observable<ApiResponse<UserWarehouseAssignmentResponseDto>> {
    return this.http.post<ApiResponse<UserWarehouseAssignmentResponseDto>>(`${this.userBase}/assign-warehouse`, dto);
  }

  removeWarehouseAssignment(assignmentId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.userBase}/remove-warehouse/${assignmentId}`);
  }
}