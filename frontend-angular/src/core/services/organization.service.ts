import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.models';
import { OrganizationResponseDto, UpdateOrganizationDto } from '../models/organization.models';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly base = `${environment.apiBaseUrl}/organizations`;

  constructor(private http: HttpClient) {}

  getMyOrg(): Observable<ApiResponse<OrganizationResponseDto>> {
    return this.http.get<ApiResponse<OrganizationResponseDto>>(`${this.base}/my`);
  }

  getAllOrgs(): Observable<ApiResponse<OrganizationResponseDto[]>> {
    return this.http.get<ApiResponse<OrganizationResponseDto[]>>(`${this.base}/getall`);
  }

  updateOrg(dto: UpdateOrganizationDto): Observable<ApiResponse<OrganizationResponseDto>> {
    return this.http.patch<ApiResponse<OrganizationResponseDto>>(`${this.base}/update`, dto);
  }

  deactivateOrg(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/deactivate/${id}`);
  }
}