import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { InventoryService } from '../../../../core/services/inventory.service';
import { InventoryResponseDto, StockAdjustmentType } from '../../../../core/models/inventory.models';

@Component({
  selector: 'app-update-stock-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatProgressSpinnerModule, MatSelectModule, MatIconModule
  ],
  templateUrl: './update-stock-dialog.component.html',
  styleUrl: './update-stock-dialog.component.scss'
})
export class UpdateStockDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error = '';

  readonly adjustmentTypes = [
    { value: StockAdjustmentType.ManualIncrease, label: 'Manual Increase', icon: 'add_circle', increase: true },
    { value: StockAdjustmentType.ManualDecrease, label: 'Manual Decrease', icon: 'remove_circle', increase: false },
    { value: StockAdjustmentType.Purchase, label: 'Purchase', icon: 'shopping_cart', increase: true },
    { value: StockAdjustmentType.Correction, label: 'Correction', icon: 'tune', increase: true },
    { value: StockAdjustmentType.Expired, label: 'Expired', icon: 'warning', increase: false },
    { value: StockAdjustmentType.TransferIn, label: 'Transfer In', icon: 'login', increase: true },
    { value: StockAdjustmentType.TransferOut, label: 'Transfer Out', icon: 'logout', increase: false }
  ];

  readonly decreaseTypes = [
    StockAdjustmentType.ManualDecrease,
    StockAdjustmentType.Expired,
    StockAdjustmentType.TransferOut
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

  get selectedType() {
    const val = this.form.get('adjustmentType')?.value;
    return this.adjustmentTypes.find(t => t.value === val);
  }

  get projectedQty(): number | null {
    const qty = this.form.get('quantityChanged')?.value;
    const type = this.form.get('adjustmentType')?.value;
    if (!qty || !type) return null;
    const delta = this.decreaseTypes.includes(type) ? -Math.abs(qty) : Math.abs(qty);
    return this.data.quantity + delta;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    const { adjustmentType, quantityChanged, reason } = this.form.value;
    const finalQty = this.decreaseTypes.includes(adjustmentType)
      ? -Math.abs(quantityChanged)
      : Math.abs(quantityChanged);

    this.inventoryService.updateStock({
      productId: this.data.productId,
      warehouseId: (this.data as any).warehouseId,
      quantityChanged: finalQty,
      adjustmentType,
      reason
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