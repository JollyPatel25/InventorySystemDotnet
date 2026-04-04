import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrganizationService } from '../../../core/services/organization.service';
import { OrganizationResponseDto } from '../../../core/models/organization.models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { DialogService } from '../../../shared/services/dialog.service';
import { CreateOrgDialogComponent } from './create-org-dialog/create-org-dialog.component';
import { CreateOrgAdminDialogComponent } from './create-org-admin-dialog/create-org-admin-dialog.component';

@Component({
  selector: 'app-platform-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule,
    PageHeaderComponent, StatCardComponent, DataTableComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  orgs: OrganizationResponseDto[] = [];
  loading = false;

  columns: TableColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'contactEmail', label: 'Email' },
    { key: 'contactPhone', label: 'Phone' },
    { key: 'isActive', label: 'Status', type: 'badge' },
    {
      key: 'actions', label: 'Actions', type: 'actions',
      actions: [
        { icon: 'person_add', label: 'Create Org Admin', action: 'create-admin', color: '#1976d2' },
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
      next: res => { this.orgs = res.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get activeCount(): number { return this.orgs.filter(o => o.isActive).length; }
  get inactiveCount(): number { return this.orgs.filter(o => !o.isActive).length; }

  openCreateOrg(): void {
    this.dialog.open(CreateOrgDialogComponent, { width: '680px' })
      .afterClosed().subscribe(result => {
        if (result) { this.snackBar.open('Organization created', 'Close', { duration: 3000 }); this.load(); }
      });
  }

  onAction(event: { action: string; row: OrganizationResponseDto }): void {
    if (event.action === 'create-admin') this.openCreateOrgAdmin(event.row);
    if (event.action === 'deactivate') this.deactivate(event.row);
  }

  openCreateOrgAdmin(org: OrganizationResponseDto): void {
    this.dialog.open(CreateOrgAdminDialogComponent, { width: '680px', data: org })
      .afterClosed().subscribe(result => {
        if (result) { this.snackBar.open('Org Admin created', 'Close', { duration: 3000 }); }
      });
  }

  deactivate(org: OrganizationResponseDto): void {
    this.dialogService.confirm({
      title: 'Deactivate Organization',
      message: `Are you sure you want to deactivate "${org.name}"?`,
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