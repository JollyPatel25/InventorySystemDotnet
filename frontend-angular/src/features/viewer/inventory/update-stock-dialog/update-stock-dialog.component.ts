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
import { InventoryResponseDto, StockAdjustmentType } from '../../../../core/models/inventory.models';

@Component({
  selector: 'app-update-stock-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './update-stock-dialog.component.html'
})
export class UpdateStockDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error = '';

  readonly adjustmentTypes = [
    { value: StockAdjustmentType.ManualIncrease, label: 'Manual Increase' },
    { value: StockAdjustmentType.ManualDecrease, label: 'Manual Decrease' },
    { value: StockAdjustmentType.Purchase, label: 'Purchase' },
    { value: StockAdjustmentType.Correction, label: 'Correction' },
    { value: StockAdjustmentType.Expired, label: 'Expired' },
    { value: StockAdjustmentType.TransferIn, label: 'Transfer In' },
    { value: StockAdjustmentType.TransferOut, label: 'Transfer Out' }
  ];

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    public dialogRef: MatDialogRef<UpdateStockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InventoryResponseDto
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      adjustmentType: ['', Validators.required],
      quantityChanged: [null, [Validators.required, Validators.min(1)]],
      reason: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    const { adjustmentType, quantityChanged, reason } = this.form.value;

    // Decrease types should send negative quantityChanged
    const decreaseTypes = [
      StockAdjustmentType.ManualDecrease,
      StockAdjustmentType.Expired,
      StockAdjustmentType.TransferOut
    ];

    const finalQty = decreaseTypes.includes(adjustmentType)
      ? -Math.abs(quantityChanged)
      : Math.abs(quantityChanged);

    this.inventoryService.updateStock({
      productId: this.data.productId,
      warehouseId: (this.data as any).warehouseId,
      quantityChanged: finalQty,
      adjustmentType,
      reason
    }).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: err => {
        this.loading = false;
        this.error = err?.error?.message || 'Something went wrong.';
      }
    });
  }
}