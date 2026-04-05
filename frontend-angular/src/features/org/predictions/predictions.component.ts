import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

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
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatChipsModule,
    PageHeaderComponent,
  ],
  templateUrl: './predictions.component.html',
  styleUrl: './predictions.component.scss',
})
export class PredictionsComponent implements OnInit {
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
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      productId: ['', Validators.required],
      warehouseId: ['', Validators.required],
    });

    this.productService.getAll().subscribe({
      next: (res) => { this.products = res.data.filter((p) => p.isActive); },
    });

    this.warehouseService.getAll().subscribe({
      next: (res) => { this.warehouses = res.data.filter((w) => w.isActive); },
    });
  }

  onPredict(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.result = null;

    const { productId, warehouseId } = this.form.value;

    this.predictionService.predict(productId, warehouseId).subscribe({
      next: (res) => {
  const r: any = res.data;
  this.result = {
    predictedQuantity: r.predicted_quantity,
    confidence: r.confidence,
    trend: r.trend,
    trendPercent: r.trend_percent,

    forecast7Days: r.forecast_7_days.map((x: any) => ({
      date: x.date,
      predictedQuantity: x.predicted_quantity
    })),

    stockoutRiskDays: r.stockout_risk_days,
    recommendedReorderQty: r.recommended_reorder_qty,
    anomalyDetected: r.anomaly_detected,
    anomalyDescription: r.anomaly_description,
    insightMessage: r.insight_message,
    modelUsed: r.model_used
  };

  this.loading = false;
},
      error: (err) => {
        this.error =
          err?.error?.message || 'Prediction failed. Ensure enough sales data exists.';
        this.loading = false;
      },
    });
  }

  // ── Confidence ────────────────────────────────────────────────────────────

  get confidencePercent(): number {
    return Math.round((this.result?.confidence ?? 0) * 100);
  }

  get confidenceLabel(): string {
    const p = this.confidencePercent;
    if (p >= 75) return 'High';
    if (p >= 50) return 'Medium';
    return 'Low';
  }

 get confidenceColor(): string {
  const p = this.confidencePercent;
  if (p >= 75) return '#0ea5a4';   // teal instead of green
  if (p >= 50) return '#f59e0b';   // amber
  return '#ef4444';                // soft red
}

get confidenceTrackColor(): string {
  const p = this.confidencePercent;
  if (p >= 75) return 'rgba(14,165,164,0.15)';
  if (p >= 50) return 'rgba(245,158,11,0.15)';
  return 'rgba(239,68,68,0.15)';
}

  get circumference(): number {
    return 2 * Math.PI * 44;
  }

  get dashOffset(): number {
    return this.circumference * (1 - this.confidencePercent / 100);
  }

  // ── Trend ─────────────────────────────────────────────────────────────────

  get trendIcon(): string {
    switch (this.result?.trend) {
      case 'rising':  return 'trending_up';
      case 'falling': return 'trending_down';
      default:        return 'trending_flat';
    }
  }

  /** Returns the CSS modifier class e.g. "trend-rising" — used with [ngClass] */
  get trendClass(): string {
    return 'trend-' + String(this.result?.trend ?? 'stable');
  }

  get trendLabel(): string {
    const t = this.result?.trend ?? 'stable';
    const pct = Math.abs(this.result?.trendPercent ?? 0).toFixed(1);
    if (t === 'rising')  return `+${pct}% Rising`;
    if (t === 'falling') return `−${pct}% Falling`;
    return 'Stable';
  }

  // ── Stockout ──────────────────────────────────────────────────────────────

  get stockoutUrgency(): 'critical' | 'warning' | 'safe' | null {
    const d = this.result?.stockoutRiskDays;
    if (d == null) return null;
    if (d <= 3) return 'critical';
    if (d <= 7) return 'warning';
    return 'safe';
  }

  /** Returns the CSS modifier class e.g. "stockout-critical" — used with [ngClass] */
  get stockoutUrgencyClass(): string {
    return 'stockout-' + (this.stockoutUrgency ?? 'none');
  }

  // ── Forecast chart ────────────────────────────────────────────────────────

  get chartBars(): { date: string; qty: number; height: number }[] {
    const days = this.result?.forecast7Days ?? [];
    if (!days.length) return [];
    const max = Math.max(...days.map((d) => d.predictedQuantity), 1);
    return days.map((d) => ({
      date: new Date(d.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      qty: d.predictedQuantity,
      height: Math.max(4, (d.predictedQuantity / max) * 100),
    }));
  }
}