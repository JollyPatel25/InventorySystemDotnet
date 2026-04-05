import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import { InventoryService } from '../../../core/services/inventory.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { TokenService } from '../../../core/services/token.service';
import { DialogService } from '../../../shared/services/dialog.service';

import { InventoryResponseDto } from '../../../core/models/inventory.models';
import { WarehouseResponseDto } from '../../../core/models/warehouse.models';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { InitializeInventoryDialogComponent } from './initialize-inventory-dialog/initialize-inventory-dialog.component';
import { UpdateStockDialogComponent } from './update-stock-dialog/update-stock-dialog.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule, // 🔥 ADD THIS
    MatIconModule,
    PageHeaderComponent,
    DataTableComponent
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {
  warehouses: WarehouseResponseDto[] = [];
  allInventory: InventoryResponseDto[] = [];
  inventory: InventoryResponseDto[] = [];
  selectedWarehouseId: string | null = null;
  loading = false;
  warehousesLoading = false;

  // Filters
  stockFilter: 'all' | 'low' | 'ok' = 'all';

  readonly isViewer: boolean;

  columns: TableColumn[] = [];

  constructor(
    private inventoryService: InventoryService,
    private warehouseService: WarehouseService,
    private tokenService: TokenService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private snackBar: MatSnackBar
  ) {
    const role = this.tokenService.getRole();
    this.isViewer = role === 'Viewer';
  }

  ngOnInit(): void {
    this.buildColumns();
    this.loadWarehouses();
  }

  private buildColumns(): void {
    this.columns = [
      { key: 'productName', label: 'Product' },
      { key: 'sku', label: 'SKU' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'lowStockThreshold', label: 'Threshold' },
      { key: 'stockStatus', label: 'Stock Status', type: 'badge' }
    ];

    if (!this.isViewer) {
      this.columns.push({
        key: 'actions',
        label: 'Actions',
        type: 'actions',
        actions: [
          { icon: 'tune', label: 'Update Stock', action: 'updateStock', color: '#1976d2' },
        ]
      });
    }
  }

  loadWarehouses(): void {
    this.warehousesLoading = true;
    this.warehouseService.getAll().subscribe({
      next: res => {
        this.warehouses = res.data.filter(w => w.isActive);
        this.warehousesLoading = false;
      },
      error: () => { this.warehousesLoading = false; }
    });
  }

  onWarehouseChange(): void {
    if (!this.selectedWarehouseId) return;
    this.loadInventory();
  }

  loadInventory(): void {
    if (!this.selectedWarehouseId) return;
    this.loading = true;
    this.inventoryService.getByWarehouse(this.selectedWarehouseId).subscribe({
      next: res => {
        this.allInventory = res.data.map(item => ({
          ...item,
          stockStatus: item.quantity > item.lowStockThreshold
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    if (this.stockFilter === 'low') {
      this.inventory = this.allInventory.filter(i => !i['stockStatus']);
    } else if (this.stockFilter === 'ok') {
      this.inventory = this.allInventory.filter(i => i['stockStatus']);
    } else {
      this.inventory = [...this.allInventory];
    }
  }

  clearFilters(): void {
    this.stockFilter = 'all';
    this.selectedWarehouseId = null;
    this.inventory = [...this.allInventory];
  }

  openInitializeDialog(): void {
    this.dialog.open(InitializeInventoryDialogComponent, {
      width: '580px',
      data: { warehouseId: this.selectedWarehouseId }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Inventory initialized successfully', 'Close', { duration: 3000 });
        this.loadInventory();
      }
    });
  }

  onAction(event: { action: string; row: InventoryResponseDto }): void {
    if (event.action === 'updateStock') this.openUpdateStockDialog(event.row);
  
  }

  openUpdateStockDialog(item: InventoryResponseDto): void {
    this.dialog.open(UpdateStockDialogComponent, {
      width: '480px',
      data: { ...item, warehouseId: this.selectedWarehouseId }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Stock updated successfully', 'Close', { duration: 3000 });
        this.loadInventory();
      }
    });
  }
}