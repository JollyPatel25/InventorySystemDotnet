import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { WarehouseResponseDto } from '../../../core/models/warehouse.models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { DialogService } from '../../../shared/services/dialog.service';
import { WarehouseFormDialogComponent } from './warehouse-form-dialog/warehouse-form-dialog.component';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatSnackBarModule, PageHeaderComponent, DataTableComponent],
  templateUrl: './warehouses.component.html',
  styleUrl: './warehouses.component.scss'
})
export class WarehousesComponent implements OnInit {
  warehouses: WarehouseResponseDto[] = [];
  loading = false;

  columns: TableColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    { key: 'location', label: 'Location' },
    { key: 'isActive', label: 'Status', type: 'badge' },
    {
      key: 'actions', label: 'Actions', type: 'actions',
      actions: [
        { icon: 'edit', label: 'Edit', action: 'edit', color: '#1976d2' },
        { icon: 'delete', label: 'Delete', action: 'delete', color: '#c62828' }
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
      next: res => { this.warehouses = res.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreate(): void {
    this.dialog.open(WarehouseFormDialogComponent, { width: '640px', data: null })
      .afterClosed().subscribe(result => {
        if (result) { this.snackBar.open('Warehouse created', 'Close', { duration: 3000 }); this.load(); }
      });
  }

  onAction(event: { action: string; row: WarehouseResponseDto }): void {
    if (event.action === 'edit') this.openEdit(event.row);
    if (event.action === 'delete') this.delete(event.row);
  }

  openEdit(warehouse: WarehouseResponseDto): void {
    this.dialog.open(WarehouseFormDialogComponent, { width: '640px', data: warehouse })
      .afterClosed().subscribe(result => {
        if (result) { this.snackBar.open('Warehouse updated', 'Close', { duration: 3000 }); this.load(); }
      });
  }

  delete(warehouse: WarehouseResponseDto): void {
    this.dialogService.confirm({
      title: 'Delete Warehouse',
      message: `Are you sure you want to delete "${warehouse.name}"?`,
      confirmLabel: 'Delete',
      danger: true
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.warehouseService.delete(warehouse.id).subscribe({
        next: () => { this.snackBar.open('Warehouse deleted', 'Close', { duration: 3000 }); this.load(); },
        error: err => { this.snackBar.open(err?.error?.message || 'Failed to delete', 'Close', { duration: 3000 }); }
      });
    });
  }
}