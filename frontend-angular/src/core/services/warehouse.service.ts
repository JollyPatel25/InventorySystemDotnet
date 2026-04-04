import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.models';
import { WarehouseResponseDto, CreateWarehouseDto, UpdateWarehouseDto } from '../models/warehouse.models';

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private readonly base = `${environment.apiBaseUrl}/warehouses`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<WarehouseResponseDto[]>> {
    return this.http.get<ApiResponse<WarehouseResponseDto[]>>(`${this.base}/getall`);
  }

  getById(id: string): Observable<ApiResponse<WarehouseResponseDto>> {
    return this.http.get<ApiResponse<WarehouseResponseDto>>(`${this.base}/getbyid/${id}`);
  }

  create(dto: CreateWarehouseDto): Observable<ApiResponse<WarehouseResponseDto>> {
    return this.http.post<ApiResponse<WarehouseResponseDto>>(`${this.base}/create`, dto);
  }

  update(id: string, dto: UpdateWarehouseDto): Observable<ApiResponse<WarehouseResponseDto>> {
    return this.http.patch<ApiResponse<WarehouseResponseDto>>(`${this.base}/update/${id}`, dto);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/delete/${id}`);
  }
}