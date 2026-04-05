import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ProductService } from '../../../core/services/product.service';
import { ProductResponseDto } from '../../../core/models/product.models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { DialogService } from '../../../shared/services/dialog.service';
import { ProductFormDialogComponent } from './product-form-dialog/product-form-dialog.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    PageHeaderComponent,
    DataTableComponent
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  allProducts: ProductResponseDto[] = [];
  products: ProductResponseDto[] = [];
  loading = false;

  // Filters
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  categoryFilter = '';
  categories: string[] = [];

  columns: TableColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price', type: 'currency' },
    { key: 'unitOfMeasure', label: 'Unit' },
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
    private productService: ProductService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: res => {
        this.allProducts = res.data;
        this.categories = [...new Set(res.data.map(p => p.category).filter(Boolean))];
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allProducts];

    if (this.statusFilter === 'active') filtered = filtered.filter(p => p.isActive);
    if (this.statusFilter === 'inactive') filtered = filtered.filter(p => !p.isActive);
    if (this.categoryFilter) filtered = filtered.filter(p => p.category === this.categoryFilter);

    this.products = filtered;
  }

  clearFilters(): void {
    this.statusFilter = 'all';
    this.categoryFilter = '';
    this.applyFilters();
  }

  openCreateDialog(): void {
    this.dialog.open(ProductFormDialogComponent, { width: '600px', data: null })
      .afterClosed().subscribe(result => {
        if (result) {
          this.snackBar.open('Product created successfully', 'Close', { duration: 3000 });
          this.loadProducts();
        }
      });
  }

  onAction(event: { action: string; row: ProductResponseDto }): void {
    if (event.action === 'edit') this.openEditDialog(event.row);
    if (event.action === 'deactivate') this.deactivate(event.row);
    if (event.action === 'reactivate') this.reactivate(event.row);
  }

  openEditDialog(product: ProductResponseDto): void {
    this.dialog.open(ProductFormDialogComponent, { width: '600px', data: product })
      .afterClosed().subscribe(result => {
        if (result) {
          this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
          this.loadProducts();
        }
      });
  }

  deactivate(product: ProductResponseDto): void {
    if (!product.isActive) return;
    this.dialogService.confirm({
      title: 'Deactivate Product',
      message: `Are you sure you want to deactivate "${product.name}"?`,
      confirmLabel: 'Deactivate',
      danger: true
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.productService.deactivate(product.id).subscribe({
        next: () => {
          this.snackBar.open('Product deactivated', 'Close', { duration: 3000 });
          this.loadProducts();
        },
        error: err => {
          this.snackBar.open(err?.error?.message || 'Failed', 'Close', { duration: 3000 });
        }
      });
    });
  }

  reactivate(product: ProductResponseDto): void {
    if (product.isActive) return;
    this.dialogService.confirm({
      title: 'Reactivate Product',
      message: `Reactivate "${product.name}"?`,
      confirmLabel: 'Reactivate',
      danger: false
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.productService.update(product.id, { isActive: true }).subscribe({
        next: () => {
          this.snackBar.open('Product reactivated', 'Close', { duration: 3000 });
          this.loadProducts();
        },
        error: err => {
          this.snackBar.open(err?.error?.message || 'Failed', 'Close', { duration: 3000 });
        }
      });
    });
  }
}