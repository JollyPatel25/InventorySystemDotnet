import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.models';
import { DashboardDto, MonthlyRevenueDto, TopProductDto, SalesTodayDto } from '../models/report.models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly base = `${environment.apiBaseUrl}/reports`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ApiResponse<DashboardDto>> {
    return this.http.get<ApiResponse<DashboardDto>>(`${this.base}/dashboard`);
  }

  getSalesToday(): Observable<ApiResponse<SalesTodayDto[]>> {
    return this.http.get<ApiResponse<SalesTodayDto[]>>(`${this.base}/sales/today`);
  }

  getMonthlyRevenue(): Observable<ApiResponse<MonthlyRevenueDto[]>> {
    return this.http.get<ApiResponse<MonthlyRevenueDto[]>>(`${this.base}/revenue/monthly`);
  }

  getTopProducts(): Observable<ApiResponse<TopProductDto[]>> {
    return this.http.get<ApiResponse<TopProductDto[]>>(`${this.base}/top-products`);
  }
}