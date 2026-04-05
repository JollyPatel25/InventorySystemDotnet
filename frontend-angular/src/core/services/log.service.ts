import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.models';
import { LogQueryDto, PagedLogsDto } from '../models/log.models';

@Injectable({ providedIn: 'root' })
export class LogService {
  private readonly base = `${environment.apiBaseUrl}/logs`;

  constructor(private http: HttpClient) {}

  getLogs(query: LogQueryDto): Observable<ApiResponse<PagedLogsDto>> {
    let params = new HttpParams();
    if (query.level) params = params.set('level', query.level);
    if (query.search) params = params.set('search', query.search);
    if (query.from) params = params.set('from', query.from);
    if (query.to) params = params.set('to', query.to);
    if (query.page) params = params.set('page', query.page.toString());
    if (query.pageSize) params = params.set('pageSize', query.pageSize.toString());

    return this.http.get<ApiResponse<PagedLogsDto>>(this.base, { params });
  }
}