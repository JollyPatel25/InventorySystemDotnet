import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.models';
import { ProductResponseDto, CreateProductDto, UpdateProductDto } from '../models/product.models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly base = `${environment.apiBaseUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<ProductResponseDto[]>> {
    return this.http.get<ApiResponse<ProductResponseDto[]>>(`${this.base}/getall`);
  }

  getById(id: string): Observable<ApiResponse<ProductResponseDto>> {
    return this.http.get<ApiResponse<ProductResponseDto>>(`${this.base}/getbyid/${id}`);
  }

  create(dto: CreateProductDto): Observable<ApiResponse<ProductResponseDto>> {
    return this.http.post<ApiResponse<ProductResponseDto>>(`${this.base}/create`, dto);
  }

  update(id: string, dto: UpdateProductDto): Observable<ApiResponse<ProductResponseDto>> {
    return this.http.patch<ApiResponse<ProductResponseDto>>(`${this.base}/update/${id}`, dto);
  }

  deactivate(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/delete/${id}`);
  }
}