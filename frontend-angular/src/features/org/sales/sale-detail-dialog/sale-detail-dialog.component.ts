import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SaleResponseDto } from '../../../../core/models/sales.models';
import { ProductResponseDto } from '../../../../core/models/product.models';
import { OrganizationResponseDto } from '../../../../core/models/organization.models';
import { InvoiceService } from '../../../../core/services/invoice.service';

export interface SaleDetailDialogData {
  sale: SaleResponseDto & { warehouseName?: string };
  products: ProductResponseDto[];
  org: OrganizationResponseDto | null;
}

@Component({
  selector: 'app-sale-detail-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule,
    MatDividerModule, MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './sale-detail-dialog.component.html',
  styleUrl: './sale-detail-dialog.component.scss'
})
export class SaleDetailDialogComponent {
  loadingPdf = false;

  constructor(
    public dialogRef: MatDialogRef<SaleDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SaleDetailDialogData,
    private invoiceService: InvoiceService
  ) {}

  getProductName(productId: string): string {
    return this.data.products.find(p => p.id === productId)?.name ?? productId;
  }

  openInvoice(): void {
    if (!this.data.org) return;
    this.invoiceService.open({
      sale: this.data.sale,
      products: this.data.products,
      org: this.data.org
    });
  }

  downloadInvoice(): void {
    if (!this.data.org) return;
    this.invoiceService.download({
      sale: this.data.sale,
      products: this.data.products,
      org: this.data.org
    });
  }
}