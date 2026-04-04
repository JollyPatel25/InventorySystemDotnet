import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.models';
import { PredictionResponseDto } from '../models/prediction.models';

@Injectable({ providedIn: 'root' })
export class PredictionService {
  private readonly base = `${environment.apiBaseUrl}/predictions`;

  constructor(private http: HttpClient) {}

  predict(productId: string, warehouseId: string): Observable<ApiResponse<PredictionResponseDto>> {
    return this.http.post<ApiResponse<PredictionResponseDto>>(
      `${this.base}/${productId}?warehouseId=${warehouseId}`,
      {}
    );
  }
}