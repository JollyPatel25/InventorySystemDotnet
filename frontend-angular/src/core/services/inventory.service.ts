import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.models';
import { InventoryResponseDto, InitializeInventoryDto, UpdateStockDto } from '../models/inventory.models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly base = `${environment.apiBaseUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getByWarehouse(warehouseId: string): Observable<ApiResponse<InventoryResponseDto[]>> {
    return this.http.get<ApiResponse<InventoryResponseDto[]>>(`${this.base}/warehouse/${warehouseId}`);
  }

  getLowStock(warehouseId: string): Observable<ApiResponse<InventoryResponseDto[]>> {
    return this.http.get<ApiResponse<InventoryResponseDto[]>>(`${this.base}/low-stock/${warehouseId}`);
  }

  initialize(dto: InitializeInventoryDto): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.base}/initialize`, dto);
  }

  updateStock(dto: UpdateStockDto): Observable<ApiResponse<InventoryResponseDto>> {
    return this.http.post<ApiResponse<InventoryResponseDto>>(`${this.base}/adjust`, dto);
  }
}