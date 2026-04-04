import {
  Component, OnInit, AfterViewInit,
  ViewChild, ElementRef, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ReportService } from '../../../core/services/report.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

import {
  DashboardDto,
  MonthlyRevenueDto,
  TopProductDto,
  SalesTodayDto
} from '../../../core/models/report.models';

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

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    DataTableComponent,
    StatCardComponent
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit, OnDestroy {
  @ViewChild('revenueCanvas') revenueCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topProductsCanvas') topProductsCanvasRef!: ElementRef<HTMLCanvasElement>;

  dashboard: DashboardDto | null = null;
  monthlyRevenue: MonthlyRevenueDto[] = [];
  topProducts: TopProductDto[] = [];
  salesToday: SalesTodayDto[] = [];

  dashboardLoading = true;
  revenueLoading = true;
  topProductsLoading = true;
  salesTodayLoading = true;

  private revenueChart: Chart | null = null;
  private topProductsChart: Chart | null = null;

  salesTodayColumns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { key: 'totalAmount', label: 'Total', type: 'currency' },
    { key: 'createdAt', label: 'Time', type: 'date' }
  ];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadSalesToday();
    this.loadMonthlyRevenue();
    this.loadTopProducts();
  }

  ngOnDestroy(): void {
    this.revenueChart?.destroy();
    this.topProductsChart?.destroy();
  }

  // ─── Data Loading ─────────────────────────────────────────────────────────

  loadDashboard(): void {
    this.reportService.getDashboard().subscribe({
      next: res => { this.dashboard = res.data; this.dashboardLoading = false; },
      error: () => { this.dashboardLoading = false; }
    });
  }

  loadSalesToday(): void {
    this.reportService.getSalesToday().subscribe({
      next: res => { this.salesToday = res.data; this.salesTodayLoading = false; },
      error: () => { this.salesTodayLoading = false; }
    });
  }

  loadMonthlyRevenue(): void {
    this.reportService.getMonthlyRevenue().subscribe({
      next: res => {
        this.monthlyRevenue = res.data;
        this.revenueLoading = false;
        setTimeout(() => this.renderRevenueChart(), 200);
      },
      error: () => { this.revenueLoading = false; }
    });
  }

  loadTopProducts(): void {
    this.reportService.getTopProducts().subscribe({
      next: res => {
        this.topProducts = res.data;
        this.topProductsLoading = false;
      },
      error: () => { this.topProductsLoading = false; }
    });
  }

  // ─── Tab Change → render charts ──────────────────────────────────────────

  onTabChange(index: number): void {
    setTimeout(() => {
      if (index === 0 && this.monthlyRevenue.length) this.renderRevenueChart();
      if (index === 1 && this.topProducts.length) this.renderTopProductsChart();
    }, 100);
  }

  // ─── Chart Rendering ─────────────────────────────────────────────────────

  renderRevenueChart(): void {
    if (!this.revenueCanvasRef) return;
    this.revenueChart?.destroy();

    const labels = this.monthlyRevenue.map(r => MONTH_NAMES[r.month - 1]);
    const data = this.monthlyRevenue.map(r => r.revenue);

    this.revenueChart = new Chart(this.revenueCanvasRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Revenue',
          data,
          backgroundColor: 'rgba(25, 118, 210, 0.75)',
          borderColor: 'rgba(25, 118, 210, 1)',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` $${Number(ctx.raw).toLocaleString()}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: val => `$${Number(val).toLocaleString()}`
            }
          }
        }
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
          backgroundColor: 'rgba(46, 125, 50, 0.75)',
          borderColor: 'rgba(46, 125, 50, 1)',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { beginAtZero: true }
        }
      }
    });
  }
}