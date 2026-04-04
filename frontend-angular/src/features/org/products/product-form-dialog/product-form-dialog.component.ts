import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ProductService } from '../../../../core/services/product.service';
import { ProductResponseDto } from '../../../../core/models/product.models';

@Component({
  selector: 'app-product-form-dialog',
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
  templateUrl: './product-form-dialog.component.html'
})
export class ProductFormDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error = '';
  isEdit = false;

  readonly units = ['Piece', 'Kg', 'Litre', 'Box', 'Carton', 'Dozen'];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    public dialogRef: MatDialogRef<ProductFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductResponseDto | null
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data;
    this.form = this.fb.group({
      name: [this.data?.name ?? '', Validators.required],
      sku: [this.data?.sku ?? '', Validators.required],
      category: [this.data?.category ?? '', Validators.required],
      price: [this.data?.price ?? '', [Validators.required, Validators.min(0)]],
      unitOfMeasure: [this.data?.unitOfMeasure ?? '', Validators.required],
      barcode: [this.data?.barcode ?? ''],
      description: [this.data?.description ?? '']
    });

    if (this.isEdit) {
      this.form.get('sku')?.disable();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    const value = this.form.getRawValue();

    const request$ = this.isEdit
      ? this.productService.update(this.data!.id, value)
      : this.productService.create(value);

    request$.subscribe({
      next: res => {
        this.loading = false;
        this.dialogRef.close(res.data);
      },
      error: err => {
        this.loading = false;
        this.error = err?.error?.message || 'Something went wrong.';
      }
    });
  }
}