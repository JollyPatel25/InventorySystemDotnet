import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { ReportService } from '../../../core/services/report.service';
import { DashboardDto, SalesTodayDto, TopProductDto, MonthlyRevenueDto } from '../../../core/models/report.models';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    StatCardComponent,
    PageHeaderComponent,
    DataTableComponent,
    CurrencyPipe,
    MatTabsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {

  selectedTabIndex = 0;

@ViewChild('revenueCanvas') revenueCanvasRef!: ElementRef<HTMLCanvasElement>;
@ViewChild('topProductsCanvas') topProductsCanvasRef!: ElementRef<HTMLCanvasElement>;

private revenueChart: Chart | null = null;
private topProductsChart: Chart | null = null;

  dashboard: DashboardDto | null = null;
  salesToday: SalesTodayDto[] = [];
  topProducts: TopProductDto[] = [];
  monthlyRevenue: MonthlyRevenueDto[] = [];

  loading = true;
  salesLoading = true;
  topProductsLoading = true;
  revenueLoading = true;

  salesTodayColumns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { key: 'totalAmount', label: 'Total', type: 'currency' },
    { key: 'createdAt', label: 'Time', type: 'date' }
  ];

  topProductsColumns: TableColumn[] = [
    { key: 'productName', label: 'Product' },
    { key: 'quantitySold', label: 'Units Sold' }
  ];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadSalesToday();
    this.loadTopProducts();
    this.loadMonthlyRevenue();
  }

  loadDashboard(): void {
    this.reportService.getDashboard().subscribe({
      next: res => { this.dashboard = res.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {

      if (this.selectedTabIndex === 0 && this.topProducts.length) {
        this.renderTopProductsChart();
      }

      if (this.selectedTabIndex === 1 && this.monthlyRevenue.length) {
        this.renderRevenueChart();
      }

    }, 300);
  }

  loadSalesToday(): void {
    this.reportService.getSalesToday().subscribe({
      next: res => { this.salesToday = res.data; this.salesLoading = false; },
      error: () => { this.salesLoading = false; }
    });
  }

  loadTopProducts(): void {
    this.reportService.getTopProducts().subscribe({
      next: res => { this.topProducts = res.data; this.topProductsLoading = false; },
      error: () => { this.topProductsLoading = false; }
    });
  }

  loadMonthlyRevenue(): void {
    this.reportService.getMonthlyRevenue().subscribe({
      next: res => { this.monthlyRevenue = res.data; this.revenueLoading = false; },
      error: () => { this.revenueLoading = false; }
    });
  }

  get currentMonthRevenue(): number {
    const month = new Date().getMonth() + 1;
    return this.monthlyRevenue.find(r => r.month === month)?.revenue ?? 0;
  }

  get avgMonthlySales(): number {
    if (!this.monthlyRevenue.length) return 0;
    return this.monthlyRevenue.reduce((s, r) => s + r.revenue, 0) / this.monthlyRevenue.length;
  }

  onTabChange(index: number): void {
  setTimeout(() => {
    if (index === 0 && this.topProducts.length) {
      this.renderTopProductsChart();
    }

    if (index === 1 && this.monthlyRevenue.length) {
      this.renderRevenueChart();
    }
  }, 100);
}

renderRevenueChart(): void {
  if (!this.revenueCanvasRef) return;
  this.revenueChart?.destroy();

  const labels = this.monthlyRevenue.map(r =>
    ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][r.month - 1]
  );
  const data = this.monthlyRevenue.map(r => r.revenue);

  this.revenueChart = new Chart(this.revenueCanvasRef.nativeElement, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Revenue',
        data,
        backgroundColor: 'rgba(25,118,210,0.7)',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

renderTopProductsChart(): void {
  if (!this.topProductsCanvasRef) return;
  this.topProductsChart?.destroy();

  const labels = this.topProducts.map(p => p.productName);
  const data = this.topProducts.map(p => p.quantitySold);

  this.topProductsChart = new Chart(this.topProductsCanvasRef.nativeElement, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Units Sold',
        data,
        backgroundColor: 'rgba(46,125,50,0.7)',
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

ngOnDestroy(): void {
  this.revenueChart?.destroy();
  this.topProductsChart?.destroy();
}



}