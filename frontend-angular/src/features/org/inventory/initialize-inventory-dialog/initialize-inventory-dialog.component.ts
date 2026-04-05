import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { InventoryService } from '../../../../core/services/inventory.service';
import { ProductService } from '../../../../core/services/product.service';
import { ProductResponseDto } from '../../../../core/models/product.models';

export interface InitializeDialogData {
  warehouseId: string;
}

@Component({
  selector: 'app-initialize-inventory-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatProgressSpinnerModule, MatSelectModule
  ],
  templateUrl: './initialize-inventory-dialog.component.html',
  styleUrl: './initialize-inventory-dialog.component.scss'
})
export class InitializeInventoryDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  productsLoading = false;
  error = '';
  products: ProductResponseDto[] = [];

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private productService: ProductService,
    public dialogRef: MatDialogRef<InitializeInventoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InitializeDialogData
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      productId: ['', Validators.required],
      initialQuantity: [0, [Validators.required, Validators.min(0)]],
      lowStockThreshold: [5, [Validators.required, Validators.min(1)]]
    });
    this.loadProducts();
  }

  loadProducts(): void {
    this.productsLoading = true;
    this.productService.getAll().subscribe({
      next: res => { this.products = res.data.filter(p => p.isActive); this.productsLoading = false; },
      error: () => { this.productsLoading = false; }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.inventoryService.initialize({
      ...this.form.value,
      warehouseId: this.data.warehouseId
    }).subscribe({
      next: () => { this.loading = false; this.dialogRef.close(true); },
      error: err => {
      this.loading = false;

      const backendError = err?.error;

      this.error =
        backendError?.Errors?.[0] ||   // ✅ always take first error
        backendError?.Message ||       // fallback
        backendError?.message ||
        'Something went wrong.';
      }
    });
  }
}