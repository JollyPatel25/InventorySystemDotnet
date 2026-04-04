import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TaxService } from '../../../../core/services/tax.service';

@Component({
  selector: 'app-tax-form-dialog',
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
  templateUrl: './tax-form-dialog.component.html'
})
export class TaxFormDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private taxService: TaxService,
    public dialogRef: MatDialogRef<TaxFormDialogComponent>
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      taxName: ['', Validators.required],
      taxPercentage: [null, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.taxService.create(this.form.value).subscribe({
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