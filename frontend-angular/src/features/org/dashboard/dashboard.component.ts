import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReportService } from '../../../core/services/report.service';
import { DashboardDto, SalesTodayDto } from '../../../core/models/report.models';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    StatCardComponent,
    PageHeaderComponent,
    DataTableComponent,
    CurrencyPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  dashboard: DashboardDto | null = null;
  salesToday: SalesTodayDto[] = [];
  loading = true;
  salesLoading = true;

  salesTodayColumns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { key: 'totalAmount', label: 'Total', type: 'currency' },
    { key: 'createdAt', label: 'Time', type: 'date' }
  ];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadSalesToday();
  }

  loadDashboard(): void {
    this.loading = true;
    this.reportService.getDashboard().subscribe({
      next: res => {
        this.dashboard = res.data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadSalesToday(): void {
    this.salesLoading = true;
    this.reportService.getSalesToday().subscribe({
      next: res => {
        this.salesToday = res.data;
        this.salesLoading = false;
      },
      error: () => { this.salesLoading = false; }
    });
  }
}