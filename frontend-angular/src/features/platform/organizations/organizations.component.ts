import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrganizationService } from '../../../core/services/organization.service';
import { OrganizationResponseDto } from '../../../core/models/organization.models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { DialogService } from '../../../shared/services/dialog.service';
import { CreateOrgDialogComponent } from '../dashboard/create-org-dialog/create-org-dialog.component';
import { CreateOrgAdminDialogComponent } from '../dashboard/create-org-admin-dialog/create-org-admin-dialog.component';

const THRESHOLD_KEY = 'platform_expiry_threshold_days';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [
    CommonModule, DatePipe, FormsModule,
    MatDialogModule, MatSnackBarModule,
    MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule,
    MatInputModule, MatTooltipModule,
    PageHeaderComponent, DataTableComponent
  ],
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.scss'
})
export class OrganizationsComponent implements OnInit {
  allOrgs: OrganizationResponseDto[] = [];
  filtered: OrganizationResponseDto[] = [];
  loading = false;

  // Filters
  statusFilter = 'all';
  planFilter = 'all';
  expiryFilter = 'all';
  thresholdDays: number = parseInt(localStorage.getItem(THRESHOLD_KEY) ?? '30');
  editingThreshold = false;
  tempThreshold: number = this.thresholdDays;

  planOptions: string[] = [];

  columns: TableColumn[] = [
    { key: 'name', label: 'Organization' },
    { key: 'contactEmail', label: 'Email' },
    { key: 'planType', label: 'Plan' },
    { key: 'subscriptionEndDate', label: 'Expires', type: 'date' },
    { key: 'isActive', label: 'Status', type: 'badge' },
    {
      key: 'actions', label: 'Actions', type: 'actions',
      actions: [
        { icon: 'person_add', label: 'Create Admin', action: 'create-admin', color: '#1976d2' },
        { icon: 'check_circle', label: 'Reactivate', action: 'reactivate', color: '#2e7d32' },
        { icon: 'block', label: 'Deactivate', action: 'deactivate', color: '#c62828' }
      ]
    }
  ];

  constructor(
    private orgService: OrganizationService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.orgService.getAllOrgs().subscribe({
      next: res => {
        this.allOrgs = res.data;
        this.planOptions = [...new Set(this.allOrgs.map(o => o.planType))];
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    let result = [...this.allOrgs];

    if (this.statusFilter !== 'all')
      result = result.filter(o => this.statusFilter === 'active' ? o.isActive : !o.isActive);

    if (this.planFilter !== 'all')
      result = result.filter(o => o.planType === this.planFilter);

    if (this.expiryFilter === 'expiring') {
      const threshold = new Date();
      threshold.setDate(threshold.getDate() + this.thresholdDays);
      result = result.filter(o => new Date(o.subscriptionEndDate) <= threshold);
    } else if (this.expiryFilter === 'expired') {
      result = result.filter(o => new Date(o.subscriptionEndDate) < new Date());
    } else if (this.expiryFilter === 'valid') {
      const threshold = new Date();
      threshold.setDate(threshold.getDate() + this.thresholdDays);
      result = result.filter(o => new Date(o.subscriptionEndDate) > threshold);
    }

    this.filtered = result;
  }

  resetFilters(): void {
    this.statusFilter = 'all';
    this.planFilter = 'all';
    this.expiryFilter = 'all';
    this.applyFilters();
  }

  saveThreshold(): void {
    if (this.tempThreshold < 1) return;
    this.thresholdDays = this.tempThreshold;
    localStorage.setItem(THRESHOLD_KEY, this.thresholdDays.toString());
    this.editingThreshold = false;
    this.applyFilters();
    this.snackBar.open(`Threshold set to ${this.thresholdDays} days`, 'Close', { duration: 2000 });
  }

  openCreate(): void {
    this.dialog.open(CreateOrgDialogComponent, { width: '680px' })
      .afterClosed().subscribe(result => {
        if (result) { this.snackBar.open('Organization created', 'Close', { duration: 3000 }); this.load(); }
      });
  }

  onAction(event: { action: string; row: OrganizationResponseDto }): void {
    if (event.action === 'create-admin') {
      this.dialog.open(CreateOrgAdminDialogComponent, { width: '680px', data: event.row })
        .afterClosed().subscribe(result => {
          if (result) this.snackBar.open('Org Admin created', 'Close', { duration: 3000 });
        });
    }
    if (event.action === 'reactivate') this.reactivate(event.row);
    if (event.action === 'deactivate') this.deactivate(event.row);
  }

  reactivate(org: OrganizationResponseDto): void {
    this.dialogService.confirm({
      title: 'Reactivate Organization',
      message: `Reactivate "${org.name}"?`,
      confirmLabel: 'Reactivate'
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.orgService.reactivateOrg(org.id).subscribe({
        next: () => { this.snackBar.open('Organization reactivated', 'Close', { duration: 3000 }); this.load(); },
        error: err => { this.snackBar.open(err?.error?.message || 'Failed', 'Close', { duration: 3000 }); }
      });
    });
  }

  deactivate(org: OrganizationResponseDto): void {
    this.dialogService.confirm({
      title: 'Deactivate Organization',
      message: `Deactivate "${org.name}"?`,
      confirmLabel: 'Deactivate',
      danger: true
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.orgService.deactivateOrg(org.id).subscribe({
        next: () => { this.snackBar.open('Organization deactivated', 'Close', { duration: 3000 }); this.load(); },
        error: err => { this.snackBar.open(err?.error?.message || 'Failed', 'Close', { duration: 3000 }); }
      });
    });
  }
}