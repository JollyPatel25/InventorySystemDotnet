import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.models';
import { TaxConfigurationResponseDto, CreateTaxConfigurationDto } from '../models/tax.models';

@Injectable({ providedIn: 'root' })
export class TaxService {
  private readonly base = `${environment.apiBaseUrl}/tax`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<TaxConfigurationResponseDto[]>> {
    return this.http.get<ApiResponse<TaxConfigurationResponseDto[]>>(`${this.base}/getall`);
  }

  create(dto: CreateTaxConfigurationDto): Observable<ApiResponse<TaxConfigurationResponseDto>> {
    return this.http.post<ApiResponse<TaxConfigurationResponseDto>>(`${this.base}/create`, dto);
  }

  deactivate(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/delete/${id}`);
  }
}