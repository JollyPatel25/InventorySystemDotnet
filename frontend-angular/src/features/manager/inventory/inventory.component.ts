import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InventoryService } from '../../../core/services/inventory.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { InventoryResponseDto } from '../../../core/models/inventory.models';
import { WarehouseResponseDto } from '../../../core/models/warehouse.models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { UpdateStockDialogComponent } from './update-stock-dialog/update-stock-dialog.component';

@Component({
  selector: 'app-manager-inventory',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatSelectModule, MatFormFieldModule,
    MatButtonModule, MatDialogModule, MatSnackBarModule,
    PageHeaderComponent, DataTableComponent
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {
  warehouses: WarehouseResponseDto[] = [];
  inventory: InventoryResponseDto[] = [];
  selectedWarehouseId = '';
  loading = false;

  columns: TableColumn[] = [
    { key: 'productName', label: 'Product' },
    { key: 'sku', label: 'SKU' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'lowStockThreshold', label: 'Threshold' },
    {
      key: 'actions', label: 'Actions', type: 'actions',
      actions: [{ icon: 'tune', label: 'Update Stock', action: 'update', color: '#1976d2' }]
    }
  ];

  constructor(
    private inventoryService: InventoryService,
    private warehouseService: WarehouseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.warehouseService.getAll().subscribe({
      next: res => { this.warehouses = res.data.filter(w => w.isActive); }
    });
  }

  onWarehouseChange(): void {
    if (!this.selectedWarehouseId) return;
    this.loading = true;
    this.inventoryService.getByWarehouse(this.selectedWarehouseId).subscribe({
      next: res => { this.inventory = res.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onAction(event: { action: string; row: InventoryResponseDto }): void {
    if (event.action === 'update') {
      this.dialog.open(UpdateStockDialogComponent, {
        width: '440px',
        data: { item: event.row, warehouseId: this.selectedWarehouseId }
      }).afterClosed().subscribe(result => {
        if (result) { this.snackBar.open('Stock updated', 'Close', { duration: 3000 }); this.onWarehouseChange(); }
      });
    }
  }
}