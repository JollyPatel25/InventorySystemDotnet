import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { SaleResponseDto } from '../../../../core/models/sales.models';
import { ProductResponseDto } from '../../../../core/models/product.models';

export interface SaleDetailDialogData {
  sale: SaleResponseDto & { warehouseName?: string };
  products: ProductResponseDto[];
}

@Component({
  selector: 'app-sale-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule
  ],
  templateUrl: './sale-detail-dialog.component.html',
  styleUrl: './sale-detail-dialog.component.scss'
})
export class SaleDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SaleDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SaleDetailDialogData
  ) {}

  getProductName(productId: string): string {
    return this.data.products.find(p => p.id === productId)?.name ?? productId;
  }
}