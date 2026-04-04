import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import { SalesService } from '../../../core/services/sales.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { ProductService } from '../../../core/services/product.service';
import { TokenService } from '../../../core/services/token.service';

import { SaleResponseDto } from '../../../core/models/sales.models';
import { WarehouseResponseDto } from '../../../core/models/warehouse.models';
import { ProductResponseDto } from '../../../core/models/product.models';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { SaleDetailDialogComponent } from './sale-detail-dialog/sale-detail-dialog.component';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    PageHeaderComponent,
    DataTableComponent
  ],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss'
})
export class SalesComponent implements OnInit {
  warehouses: WarehouseResponseDto[] = [];
  sales: SaleResponseDto[] = [];
  products: ProductResponseDto[] = [];
  selectedWarehouseId: string | null = null;
  loading = false;

  readonly isViewer: boolean;

  columns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { key: 'warehouseName', label: 'Warehouse' },
    { key: 'totalAmount', label: 'Total', type: 'currency' },
    { key: 'taxAmount', label: 'Tax', type: 'currency' },
    { key: 'discountAmount', label: 'Discount', type: 'currency' },
    { key: 'paymentMethod', label: 'Payment' },
    { key: 'createdAt', label: 'Date', type: 'date' },
    {
      key: 'actions', label: 'Actions', type: 'actions',
      actions: [
        { icon: 'visibility', label: 'View Detail', action: 'view', color: '#1976d2' }
      ]
    }
  ];

  constructor(
    private salesService: SalesService,
    private warehouseService: WarehouseService,
    private productService: ProductService,
    private tokenService: TokenService,
    private router: Router,
    private dialog: MatDialog
  ) {
    const role = this.tokenService.getRole();
    this.isViewer = role === 'Viewer';
  }

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadProducts();
  }

  loadWarehouses(): void {
    this.warehouseService.getAll().subscribe({
      next: res => { this.warehouses = res.data; }
    });
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: res => { this.products = res.data; }
    });
  }

  onWarehouseChange(): void {
    if (!this.selectedWarehouseId) return;
    this.loadSales();
  }

  loadSales(): void {
    if (!this.selectedWarehouseId) return;
    this.loading = true;
    this.salesService.getByWarehouse(this.selectedWarehouseId).subscribe({
      next: res => {
        const warehouseName = this.warehouses.find(w => w.id === this.selectedWarehouseId)?.name ?? '';
        this.sales = res.data.map(sale => ({
          ...sale,
          warehouseName,
          items: sale.items.map(item => ({
            ...item,
            productName: this.products.find(p => p.id === item.productId)?.name ?? item.productId
          }))
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  navigateToCreate(): void {
    const role = this.tokenService.getRole();
    const base = role === 'Manager' ? '/manager' : '/org';
    this.router.navigate([`${base}/sales/create`]);
  }

  onAction(event: { action: string; row: any }): void {
    if (event.action === 'view') this.openDetailDialog(event.row);
  }

  openDetailDialog(sale: SaleResponseDto): void {
    this.dialog.open(SaleDetailDialogComponent, {
      width: '640px',
      data: { sale, products: this.products }
    });
  }
}