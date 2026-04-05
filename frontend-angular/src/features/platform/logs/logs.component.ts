import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LogService } from '../../../core/services/log.service';
import { ApplicationLogDto, LogQueryDto } from '../../../core/models/log.models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatTableModule,
    MatPaginatorModule, MatTooltipModule, MatProgressSpinnerModule,
    PageHeaderComponent
  ],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.scss'
})
export class LogsComponent implements OnInit {
  logs: ApplicationLogDto[] = [];
  totalCount = 0;
  loading = false;

  query: LogQueryDto = { page: 1, pageSize: 50 };
  searchText = '';
  selectedLevel = '';
  levels = ['Information', 'Warning', 'Error', 'Fatal'];
  displayedColumns = ['timestamp', 'level', 'method', 'path', 'message', 'ip'];

  constructor(private logService: LogService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.query.search = this.searchText || undefined;
    this.query.level = this.selectedLevel || undefined;
    this.logService.getLogs(this.query).subscribe({
      next: res => { this.logs = res.data.items; this.totalCount = res.data.totalCount; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onSearch(): void { this.query.page = 1; this.load(); }
  onLevelChange(): void { this.query.page = 1; this.load(); }
  onReset(): void { this.searchText = ''; this.selectedLevel = ''; this.query = { page: 1, pageSize: 50 }; this.load(); }

  onPageChange(event: PageEvent): void {
    this.query.page = event.pageIndex + 1;
    this.query.pageSize = event.pageSize;
    this.load();
  }

  levelClass(level: string): string {
    switch (level) {
      case 'Error': case 'Fatal': return 'level-error';
      case 'Warning': return 'level-warning';
      default: return 'level-info';
    }
  }
}