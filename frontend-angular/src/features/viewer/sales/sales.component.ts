import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SalesService } from '../../../core/services/sales.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { SaleResponseDto } from '../../../core/models/sales.models';
import { WarehouseResponseDto } from '../../../core/models/warehouse.models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-viewer-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule, MatFormFieldModule, PageHeaderComponent, DataTableComponent],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss'
})
export class SalesComponent {
  warehouses: WarehouseResponseDto[] = [];
  sales: SaleResponseDto[] = [];
  selectedWarehouseId = '';
  loading = false;

  columns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { key: 'totalAmount', label: 'Total', type: 'currency' },
    { key: 'createdAt', label: 'Date', type: 'date' }
  ];

  constructor(private salesService: SalesService, private warehouseService: WarehouseService) {
    this.warehouseService.getAll().subscribe({
      next: res => { this.warehouses = res.data.filter(w => w.isActive); }
    });
  }

  onWarehouseChange(): void {
    if (!this.selectedWarehouseId) return;
    this.loading = true;
    this.salesService.getByWarehouse(this.selectedWarehouseId).subscribe({
      next: res => { this.sales = res.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}