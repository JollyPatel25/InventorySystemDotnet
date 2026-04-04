import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import { UserListItemDto } from '../../../core/models/user.models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { DialogService } from '../../../shared/services/dialog.service';
import { CreateUserDialogComponent } from './create-user-dialog/create-user-dialog.component';
import { AssignWarehouseDialogComponent } from './assign-warehouse-dialog/assign-warehouse-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatSnackBarModule, PageHeaderComponent, DataTableComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  users: UserListItemDto[] = [];
  loading = false;

  columns: TableColumn[] = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'isActive', label: 'Status', type: 'badge' },
    {
      key: 'actions', label: 'Actions', type: 'actions',
      actions: [
        { icon: 'warehouse', label: 'Assign Warehouse', action: 'assign', color: '#1976d2' }
      ]
    }
  ];

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.userService.getOrgUsers().subscribe({
      next: res => { this.users = res.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreateUser(): void {
    this.dialog.open(CreateUserDialogComponent, { width: '640px' })
      .afterClosed().subscribe(result => {
        if (result) { this.snackBar.open('User created', 'Close', { duration: 3000 }); this.load(); }
      });
  }

  onAction(event: { action: string; row: UserListItemDto }): void {
    if (event.action === 'assign') this.openAssignWarehouse(event.row);
  }

  openAssignWarehouse(user: UserListItemDto): void {
    this.dialog.open(AssignWarehouseDialogComponent, { width: '440px', data: user.id })
      .afterClosed().subscribe(result => {
        if (result) { this.snackBar.open('Warehouse assigned', 'Close', { duration: 3000 }); }
      });
  }
}