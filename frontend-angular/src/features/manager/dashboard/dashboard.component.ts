import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReportService } from '../../../core/services/report.service';
import { DashboardDto } from '../../../core/models/report.models';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, StatCardComponent, PageHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  dashboard: DashboardDto | null = null;
  loading = true;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.reportService.getDashboard().subscribe({
      next: res => { this.dashboard = res.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}