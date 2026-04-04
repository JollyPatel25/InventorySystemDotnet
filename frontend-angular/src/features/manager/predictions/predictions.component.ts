import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { PredictionService } from '../../../core/services/prediction.service';
import { ProductService } from '../../../core/services/product.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { ProductResponseDto } from '../../../core/models/product.models';
import { WarehouseResponseDto } from '../../../core/models/warehouse.models';
import { PredictionResponseDto } from '../../../core/models/prediction.models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule,
    MatSelectModule, MatButtonModule, MatProgressSpinnerModule,
    MatIconModule, MatCardModule, PageHeaderComponent
  ],
  templateUrl: '../../../features/org/predictions/predictions.component.html',
  styleUrl: '../../../features/org/predictions/predictions.component.scss'
})
export class PredictionsComponent {
  form!: FormGroup;
  products: ProductResponseDto[] = [];
  warehouses: WarehouseResponseDto[] = [];
  result: PredictionResponseDto | null = null;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private predictionService: PredictionService,
    private productService: ProductService,
    private warehouseService: WarehouseService
  ) {
    this.form = this.fb.group({
      productId: ['', Validators.required],
      warehouseId: ['', Validators.required]
    });
    this.productService.getAll().subscribe({ next: res => { this.products = res.data.filter(p => p.isActive); } });
    this.warehouseService.getAll().subscribe({ next: res => { this.warehouses = res.data.filter(w => w.isActive); } });
  }

  onPredict(): void {
    if (this.form.invalid) return;
    this.loading = true; this.error = ''; this.result = null;
    const { productId, warehouseId } = this.form.value;
    this.predictionService.predict(productId, warehouseId).subscribe({
      next: res => { this.result = res.data; this.loading = false; },
      error: err => { this.error = err?.error?.message || 'Prediction failed.'; this.loading = false; }
    });
  }

  get confidencePercent(): number { return Math.round((this.result?.confidence ?? 0) * 100); }
  get confidenceColor(): string {
    const p = this.confidencePercent;
    return p >= 75 ? '#2e7d32' : p >= 50 ? '#f57f17' : '#c62828';
  }
}