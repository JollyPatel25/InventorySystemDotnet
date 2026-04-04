import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WarehouseService } from '../../../../core/services/warehouse.service';
import { WarehouseResponseDto } from '../../../../core/models/warehouse.models';

@Component({
  selector: 'app-warehouse-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './warehouse-form-dialog.component.html',
  styleUrl: './warehouse-form-dialog.component.scss'
})
export class WarehouseFormDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error = '';
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private warehouseService: WarehouseService,
    public dialogRef: MatDialogRef<WarehouseFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WarehouseResponseDto | null
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data;
    this.form = this.fb.group({
      name: [this.data?.name ?? '', Validators.required],
      code: [this.data?.code ?? '', Validators.required],
      location: [this.data?.location ?? ''],
      line1: [this.data?.address?.line1 ?? '', Validators.required],
      line2: [this.data?.address?.line2 ?? ''],
      city: [this.data?.address?.city ?? '', Validators.required],
      state: [this.data?.address?.state ?? '', Validators.required],
      country: [this.data?.address?.country ?? '', Validators.required],
      postalCode: [this.data?.address?.postalCode ?? '', Validators.required]
    });

    if (this.isEdit) this.form.get('code')?.disable();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    const v = this.form.getRawValue();
    const payload = {
      name: v.name,
      code: v.code,
      location: v.location,
      address: {
        line1: v.line1,
        line2: v.line2,
        city: v.city,
        state: v.state,
        country: v.country,
        postalCode: v.postalCode
      }
    };

    const request$ = this.isEdit
      ? this.warehouseService.update(this.data!.id, payload)
      : this.warehouseService.create(payload);

    request$.subscribe({
      next: res => { this.loading = false; this.dialogRef.close(res.data); },
      error: err => { this.loading = false; this.error = err?.error?.message || 'Something went wrong.'; }
    });
  }
}