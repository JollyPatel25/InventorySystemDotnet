import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { UserService, PlatformUserListItemDto } from '../../../core/services/user.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { DialogService } from '../../../shared/services/dialog.service';
import { OrganizationResponseDto } from '../../../core/models/organization.models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { PlatformUserDetailDialogComponent } from './platform-user-detail-dialog/platform-user-detail-dialog.component';
import { AssignOrgAdminDialogComponent } from './assign-org-admin-dialog/assign-org-admin-dialog.component';

@Component({
  selector: 'app-platform-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    PageHeaderComponent,
    DataTableComponent
  ],
  templateUrl: './platform-users.component.html',
  styleUrl: './platform-users.component.scss'
})
export class PlatformUsersComponent implements OnInit {
  allUsers: PlatformUserListItemDto[] = [];
  filtered: PlatformUserListItemDto[] = [];
  organizations: OrganizationResponseDto[] = [];
  loading = false;

  orgFilter = 'all';
  roleFilter = 'all';
  statusFilter = 'all';

  columns: TableColumn[] = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'orgNames', label: 'Organizations' },
    { key: 'roles', label: 'Roles' },
    { key: 'isActive', label: 'Status', type: 'badge' },
    {
      key: 'actions', label: 'Actions', type: 'actions',
      actions: [
        { icon: 'info', label: 'View Details', action: 'view', color: '#1976d2' },
        { icon: 'admin_panel_settings', label: 'Assign as Org Admin', action: 'assignOrgAdmin', color: '#6a1b9a' },
        { icon: 'block', label: 'Deactivate', action: 'deactivate', color: '#c62828' },
        { icon: 'check_circle', label: 'Reactivate', action: 'reactivate', color: '#2e7d32' }
      ]
    }
  ];

  constructor(
    private userService: UserService,
    private orgService: OrganizationService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadOrganizations();
    this.loadUsers();
  }

  loadOrganizations(): void {
    this.orgService.getAllOrgs().subscribe({
      next: res => { this.organizations = res.data; }
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: res => {
        this.allUsers = res.data.map(u => ({
          ...u,
          orgNames: u.organizations.map(o => o.organizationName).join(', ') || '—',
          roles: [...new Set(u.organizations.map(o => o.role))].join(', ') || '—'
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    let result = [...this.allUsers];

    if (this.orgFilter !== 'all')
      result = result.filter(u => u.organizations.some(o => o.organizationId === this.orgFilter));

    if (this.roleFilter !== 'all')
      result = result.filter(u => u.organizations.some(o => o.role === this.roleFilter));

    if (this.statusFilter === 'active') result = result.filter(u => u.isActive);
    if (this.statusFilter === 'inactive') result = result.filter(u => !u.isActive);

    this.filtered = result;
  }

  clearFilters(): void {
    this.orgFilter = 'all';
    this.roleFilter = 'all';
    this.statusFilter = 'all';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return this.orgFilter !== 'all' || this.roleFilter !== 'all' || this.statusFilter !== 'all';
  }

  onAction(event: { action: string; row: PlatformUserListItemDto }): void {
    switch (event.action) {
      case 'view': this.openDetail(event.row); break;
      case 'assignOrgAdmin': this.openAssignOrgAdmin(event.row); break;
      case 'deactivate': this.deactivate(event.row); break;
      case 'reactivate': this.reactivate(event.row); break;
    }
  }

  openDetail(user: PlatformUserListItemDto): void {
    this.dialog.open(PlatformUserDetailDialogComponent, { width: '560px', data: user });
  }

  openAssignOrgAdmin(user: PlatformUserListItemDto): void {
    this.dialog.open(AssignOrgAdminDialogComponent, { width: '480px', data: user })
      .afterClosed().subscribe(result => {
        if (result) {
          this.snackBar.open('User assigned as Org Admin', 'Close', { duration: 3000 });
          this.loadUsers();
        }
      });
  }

  deactivate(user: PlatformUserListItemDto): void {
    if (!user.isActive) return;
    this.dialogService.confirm({
      title: 'Deactivate User',
      message: `Deactivate "${user.firstName} ${user.lastName}"? They will no longer be able to log in.`,
      confirmLabel: 'Deactivate',
      danger: true
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.userService.deactivateUser(user.id).subscribe({
        next: () => { this.snackBar.open('User deactivated', 'Close', { duration: 3000 }); this.loadUsers(); },
        error: err => { this.snackBar.open(err?.error?.message || 'Failed', 'Close', { duration: 3000 }); }
      });
    });
  }

  reactivate(user: PlatformUserListItemDto): void {
    if (user.isActive) return;
    this.dialogService.confirm({
      title: 'Reactivate User',
      message: `Reactivate "${user.firstName} ${user.lastName}"?`,
      confirmLabel: 'Reactivate',
      danger: false
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.userService.reactivateUser(user.id).subscribe({
        next: () => { this.snackBar.open('User reactivated', 'Close', { duration: 3000 }); this.loadUsers(); },
        error: err => { this.snackBar.open(err?.error?.message || 'Failed', 'Close', { duration: 3000 }); }
      });
    });
  }
}