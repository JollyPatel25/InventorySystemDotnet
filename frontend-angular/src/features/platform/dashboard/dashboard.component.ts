import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrganizationService } from '../../../core/services/organization.service';
import { OrganizationResponseDto } from '../../../core/models/organization.models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { CreateOrgDialogComponent } from './create-org-dialog/create-org-dialog.component';

const THRESHOLD_KEY = 'platform_expiry_threshold_days';

@Component({
  selector: 'app-platform-dashboard',
  standalone: true,
  imports: [
    CommonModule, DatePipe, FormsModule,
    MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule,
    MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatTooltipModule,
    PageHeaderComponent, StatCardComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  orgs: OrganizationResponseDto[] = [];
  loading = false;

  // Expiry threshold
  thresholdDays: number = parseInt(localStorage.getItem(THRESHOLD_KEY) ?? '30');
  editingThreshold = false;
  tempThreshold: number = this.thresholdDays;

  // Expiry table pagination
  expiryPage = 0;
  expiryPageSize = 5;

  expiryColumns = ['name', 'plan', 'expiry', 'daysLeft', 'status'];

  constructor(
    private orgService: OrganizationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.orgService.getAllOrgs().subscribe({
      next: res => { this.orgs = res.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get totalOrgs(): number { return this.orgs.length; }
  get activeOrgs(): number { return this.orgs.filter(o => o.isActive).length; }
  get inactiveOrgs(): number { return this.orgs.filter(o => !o.isActive).length; }

  get planCounts(): { plan: string; count: number }[] {
    const map = new Map<string, number>();
    this.orgs.forEach(o => map.set(o.planType, (map.get(o.planType) ?? 0) + 1));
    return Array.from(map.entries()).map(([plan, count]) => ({ plan, count }));
  }

  get expiringOrgs(): OrganizationResponseDto[] {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + this.thresholdDays);
    return this.orgs
      .filter(o => new Date(o.subscriptionEndDate) <= threshold)
      .sort((a, b) => new Date(a.subscriptionEndDate).getTime() - new Date(b.subscriptionEndDate).getTime());
  }

  get pagedExpiringOrgs(): OrganizationResponseDto[] {
    const start = this.expiryPage * this.expiryPageSize;
    return this.expiringOrgs.slice(start, start + this.expiryPageSize);
  }

  onExpiryPageChange(event: PageEvent): void {
    this.expiryPage = event.pageIndex;
    this.expiryPageSize = event.pageSize;
  }

  daysLeft(endDate: string): number {
    return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  daysLeftClass(endDate: string): string {
    const d = this.daysLeft(endDate);
    if (d < 0) return 'expired';
    if (d <= 7) return 'critical';
    if (d <= 14) return 'warning';
    return 'ok';
  }

  saveThreshold(): void {
    if (this.tempThreshold < 1) return;
    this.thresholdDays = this.tempThreshold;
    localStorage.setItem(THRESHOLD_KEY, this.thresholdDays.toString());
    this.editingThreshold = false;
    this.expiryPage = 0;
    this.snackBar.open(`Threshold set to ${this.thresholdDays} days`, 'Close', { duration: 2000 });
  }

  openCreateOrg(): void {
    this.dialog.open(CreateOrgDialogComponent, { width: '680px' })
      .afterClosed().subscribe(result => {
        if (result) { this.snackBar.open('Organization created', 'Close', { duration: 3000 }); this.load(); }
      });
  }
}