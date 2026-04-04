import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.models';
import { CreateSaleDto, SaleResponseDto } from '../models/sales.models';

@Injectable({ providedIn: 'root' })
export class SalesService {
  private readonly base = `${environment.apiBaseUrl}/sales`;

  constructor(private http: HttpClient) {}

  create(dto: CreateSaleDto): Observable<ApiResponse<SaleResponseDto>> {
    return this.http.post<ApiResponse<SaleResponseDto>>(this.base, dto);
  }

  getById(id: string): Observable<ApiResponse<SaleResponseDto>> {
    return this.http.get<ApiResponse<SaleResponseDto>>(`${this.base}/${id}`);
  }

  getByWarehouse(warehouseId: string): Observable<ApiResponse<SaleResponseDto[]>> {
    return this.http.get<ApiResponse<SaleResponseDto[]>>(`${this.base}/warehouse/${warehouseId}`);
  }
}