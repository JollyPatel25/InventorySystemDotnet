import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InventoryService } from '../../../core/services/inventory.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { InventoryResponseDto } from '../../../core/models/inventory.models';
import { WarehouseResponseDto } from '../../../core/models/warehouse.models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-viewer-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule, MatFormFieldModule, PageHeaderComponent, DataTableComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {
  warehouses: WarehouseResponseDto[] = [];
  inventory: InventoryResponseDto[] = [];
  selectedWarehouseId = '';
  loading = false;

  // No actions column — read only
  columns: TableColumn[] = [
    { key: 'productName', label: 'Product' },
    { key: 'sku', label: 'SKU' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'lowStockThreshold', label: 'Low Stock Threshold' }
  ];

  constructor(
    private inventoryService: InventoryService,
    private warehouseService: WarehouseService
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
}