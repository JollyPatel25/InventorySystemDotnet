import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder, FormGroup, FormArray,
  Validators, ReactiveFormsModule, AbstractControl
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { SalesService } from '../../../../core/services/sales.service';
import { WarehouseService } from '../../../../core/services/warehouse.service';
import { ProductService } from '../../../../core/services/product.service';
import { OrganizationService } from '../../../../core/services/organization.service';
import { TokenService } from '../../../../core/services/token.service';

import { WarehouseResponseDto } from '../../../../core/models/warehouse.models';
import { ProductResponseDto } from '../../../../core/models/product.models';
import { OrganizationResponseDto } from '../../../../core/models/organization.models';
import { PaymentMethod } from '../../../../core/models/sales.models';

import { SaleSuccessDialogComponent } from '../sale-success-dialog/sale-success-dialog.component';

@Component({
  selector: 'app-create-sale',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDividerModule,
    MatProgressSpinnerModule, MatDialogModule
  ],
  templateUrl: './create-sale.component.html',
  styleUrl: './create-sale.component.scss'
})
export class CreateSaleComponent implements OnInit {
  form!: FormGroup;
  warehouses: WarehouseResponseDto[] = [];
  products: ProductResponseDto[] = [];
  org: OrganizationResponseDto | null = null;
  loading = false;
  error = '';

  readonly paymentMethods = Object.values(PaymentMethod);

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private warehouseService: WarehouseService,
    private productService: ProductService,
    private orgService: OrganizationService,
    private tokenService: TokenService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      warehouseId: ['', Validators.required],
      items: this.fb.array([this.createItemRow()]),
      taxAmount: [0, [Validators.required, Validators.min(0)]],
      discountAmount: [0, [Validators.required, Validators.min(0)]],
      paymentMethod: ['', Validators.required]
    });

    this.loadWarehouses();
    this.loadProducts();
    this.loadOrg();
  }

  loadOrg(): void {
    this.orgService.getMyOrg().subscribe({
      next: res => { this.org = res.data; }
    });
  }

  get items(): FormArray { return this.form.get('items') as FormArray; }

  createItemRow(): FormGroup {
    const row = this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    row.valueChanges.subscribe(() => this.recalculate());
    return row;
  }

  addItem(): void { this.items.push(this.createItemRow()); }

  removeItem(index: number): void {
    if (this.items.length === 1) return;
    this.items.removeAt(index);
    this.recalculate();
  }

  getItemSubtotal(index: number): number {
    const row = this.items.at(index);
    const price = this.products.find(p => p.id === row.get('productId')?.value)?.price ?? 0;
    return price * (row.get('quantity')?.value ?? 0);
  }

  get subTotal(): number {
    return this.items.controls.reduce((sum, _, i) => sum + this.getItemSubtotal(i), 0);
  }

  get grandTotal(): number {
    const tax = this.form.get('taxAmount')?.value ?? 0;
    const discount = this.form.get('discountAmount')?.value ?? 0;
    return this.subTotal + Number(tax) - Number(discount);
  }

  recalculate(): void {}

  loadWarehouses(): void {
    this.warehouseService.getAll().subscribe({
      next: res => { this.warehouses = res.data.filter(w => w.isActive); }
    });
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: res => { this.products = res.data.filter(p => p.isActive); }
    });
  }

  getProductPrice(productId: string): number {
    return this.products.find(p => p.id === productId)?.price ?? 0;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.salesService.create(this.form.value).subscribe({
      next: res => {
        this.loading = false;
        const warehouseName = this.warehouses.find(w => w.id === this.form.value.warehouseId)?.name ?? '';

        // Enrich items with product names and unitPrice for PDF
        const enrichedSale = {
          ...res.data,
          warehouseName,
          items: res.data.items.map(item => ({
            ...item,
            productName: this.products.find(p => p.id === item.productId)?.name ?? item.productId,
            unitPrice: item.unitPrice ?? this.products.find(p => p.id === item.productId)?.price ?? 0
          }))
        };

        this.dialog.open(SaleSuccessDialogComponent, {
          width: '440px',
          disableClose: true,
          data: {
            invoiceNumber: res.data.invoiceNumber,
            sale: enrichedSale,
            products: this.products,
            org: this.org
          }
        }).afterClosed().subscribe(() => {
          const base = this.tokenService.getRole() === 'Manager' ? '/manager' : '/org';
          this.router.navigate([`${base}/sales`]);
        });
      },
      error: err => {
        this.loading = false;
        this.error = err?.error?.message || 'Something went wrong.';
      }
    });
  }

  cancel(): void {
    const base = this.tokenService.getRole() === 'Manager' ? '/manager' : '/org';
    this.router.navigate([`${base}/sales`]);
  }

  asFormGroup(ctrl: AbstractControl): FormGroup { return ctrl as FormGroup; }

  getAvailableProducts(currentIndex: number): ProductResponseDto[] {
    const selectedIds = this.items.controls
      .map((c, i) => i !== currentIndex ? c.get('productId')?.value : null)
      .filter(Boolean);
    return this.products.filter(p => !selectedIds.includes(p.id));
  }
}