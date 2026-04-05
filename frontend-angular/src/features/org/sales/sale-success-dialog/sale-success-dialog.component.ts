import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SaleResponseDto } from '../../../../core/models/sales.models';
import { ProductResponseDto } from '../../../../core/models/product.models';
import { OrganizationResponseDto } from '../../../../core/models/organization.models';

export interface SaleSuccessDialogData {
  invoiceNumber: string;
  sale: SaleResponseDto & { warehouseName?: string };
  products: ProductResponseDto[];
  org: OrganizationResponseDto | null;
}

@Component({
  selector: 'app-sale-success-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './sale-success-dialog.component.html',
  styleUrl: './sale-success-dialog.component.scss'
})
export class SaleSuccessDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SaleSuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SaleSuccessDialogData,
  ) {}
}