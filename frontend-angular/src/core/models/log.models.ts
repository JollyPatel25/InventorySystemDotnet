export interface ApplicationLogDto {
  timestamp: string;
  level: string;
  message: string;
  exception?: string;
  userId?: string;
  organizationId?: string;
  requestPath?: string;
  requestMethod?: string;
  ipAddress?: string;
}

export interface LogQueryDto {
  level?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedLogsDto {
  items: ApplicationLogDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}