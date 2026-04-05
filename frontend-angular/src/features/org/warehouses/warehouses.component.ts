import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button'; // ✅ ADD THIS

import { WarehouseService } from '../../../core/services/warehouse.service';
import { WarehouseResponseDto } from '../../../core/models/warehouse.models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { DialogService } from '../../../shared/services/dialog.service';
import { WarehouseFormDialogComponent } from './warehouse-form-dialog/warehouse-form-dialog.component';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule, // ✅ ADD THIS
    PageHeaderComponent,
    DataTableComponent
  ],
  templateUrl: './warehouses.component.html',
  styleUrl: './warehouses.component.scss'
})
export class WarehousesComponent implements OnInit {
  allWarehouses: WarehouseResponseDto[] = [];
  warehouses: WarehouseResponseDto[] = [];
  loading = false;

  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  columns: TableColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    { key: 'location', label: 'Location' },
    { key: 'isActive', label: 'Status', type: 'badge' },
    {
      key: 'actions', label: 'Actions', type: 'actions',
      actions: [
        { icon: 'edit', label: 'Edit', action: 'edit', color: '#1976d2' },
        { icon: 'block', label: 'Deactivate', action: 'deactivate', color: '#c62828' },
        { icon: 'check_circle', label: 'Reactivate', action: 'reactivate', color: '#2e7d32' }
      ]
    }
  ];

  constructor(
    private warehouseService: WarehouseService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.warehouseService.getAll().subscribe({
      next: res => {
        this.allWarehouses = res.data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    if (this.statusFilter === 'active') {
      this.warehouses = this.allWarehouses.filter(w => w.isActive);
    } else if (this.statusFilter === 'inactive') {
      this.warehouses = this.allWarehouses.filter(w => !w.isActive);
    } else {
      this.warehouses = [...this.allWarehouses];
    }
  }

  clearFilters(): void {
    this.statusFilter = 'all';
    this.applyFilters();
  }

  openCreate(): void {
    this.dialog.open(WarehouseFormDialogComponent, { width: '640px', data: null })
      .afterClosed().subscribe(result => {
        if (result) {
          this.snackBar.open('Warehouse created', 'Close', { duration: 3000 });
          this.load();
        }
      });
  }

  onAction(event: { action: string; row: WarehouseResponseDto }): void {
    if (event.action === 'edit') this.openEdit(event.row);
    if (event.action === 'deactivate') this.deactivate(event.row);
    if (event.action === 'reactivate') this.reactivate(event.row);
  }

  openEdit(warehouse: WarehouseResponseDto): void {
    this.dialog.open(WarehouseFormDialogComponent, { width: '640px', data: warehouse })
      .afterClosed().subscribe(result => {
        if (result) {
          this.snackBar.open('Warehouse updated', 'Close', { duration: 3000 });
          this.load();
        }
      });
  }

  deactivate(warehouse: WarehouseResponseDto): void {
    if (!warehouse.isActive) return;
    this.dialogService.confirm({
      title: 'Deactivate Warehouse',
      message: `Deactivate "${warehouse.name}"?`,
      confirmLabel: 'Deactivate',
      danger: true
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.warehouseService.deactivate(warehouse.id).subscribe({
        next: () => {
          this.snackBar.open('Warehouse deactivated', 'Close', { duration: 3000 });
          this.load();
        },
        error: err => {
          this.snackBar.open(err?.error?.message || 'Failed', 'Close', { duration: 3000 });
        }
      });
    });
  }

  reactivate(warehouse: WarehouseResponseDto): void {
    if (warehouse.isActive) return;
    this.dialogService.confirm({
      title: 'Reactivate Warehouse',
      message: `Reactivate "${warehouse.name}"?`,
      confirmLabel: 'Reactivate'
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.warehouseService.reactivate(warehouse.id).subscribe({
        next: () => {
          this.snackBar.open('Warehouse reactivated', 'Close', { duration: 3000 });
          this.load();
        },
        error: err => {
          this.snackBar.open(err?.error?.message || 'Failed', 'Close', { duration: 3000 });
        }
      });
    });
  }
}