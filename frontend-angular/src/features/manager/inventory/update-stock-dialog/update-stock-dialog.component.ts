import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InventoryService } from '../../../../core/services/inventory.service';
import { InventoryResponseDto, StockAdjustmentType } from '../../../../core/models/inventory.models';

@Component({
  selector: 'app-update-stock-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Update Stock — {{ data.item.productName }}</h2>
    <mat-dialog-content>
      <div class="current-qty">Current Quantity: <strong>{{ data.item.quantity }}</strong></div>
      <form [formGroup]="form" class="form-col">
        <mat-form-field appearance="outline">
          <mat-label>Quantity Change (+ or -)</mat-label>
          <input matInput type="number" formControlName="quantityChanged" />
          <mat-error *ngIf="form.get('quantityChanged')?.hasError('required')">Required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Adjustment Type</mat-label>
          <mat-select formControlName="adjustmentType">
            <mat-option *ngFor="let t of adjustmentTypes" [value]="t">{{ t }}</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('adjustmentType')?.hasError('required')">Required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Reason</mat-label>
          <textarea matInput formControlName="reason" rows="2"></textarea>
          <mat-error *ngIf="form.get('reason')?.hasError('required')">Required</mat-error>
        </mat-form-field>
      </form>
      <p class="error-msg" *ngIf="error">{{ error }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="loading">
        <mat-spinner diameter="18" *ngIf="loading"></mat-spinner>
        <span *ngIf="!loading">Update</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.form-col { display:flex; flex-direction:column; gap:4px; min-width:360px; } mat-form-field { width:100%; } .current-qty { margin-bottom:16px; font-size:0.9rem; color:var(--mat-sys-on-surface-variant); } .error-msg { color:var(--mat-sys-error); font-size:0.875rem; }`]
})
export class UpdateStockDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error = '';
  adjustmentTypes = Object.values(StockAdjustmentType).filter(t => t !== StockAdjustmentType.Sale);

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    public dialogRef: MatDialogRef<UpdateStockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: InventoryResponseDto; warehouseId: string }
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      quantityChanged: ['', [Validators.required]],
      adjustmentType: ['', Validators.required],
      reason: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.inventoryService.updateStock({
      productId: this.data.item.productId,
      warehouseId: this.data.warehouseId,
      quantityChanged: this.form.value.quantityChanged,
      adjustmentType: this.form.value.adjustmentType,
      reason: this.form.value.reason
    }).subscribe({
      next: res => { this.loading = false; this.dialogRef.close(res.data); },
      error: err => { this.loading = false; this.error = err?.error?.message || 'Update failed.'; }
    });
  }
}