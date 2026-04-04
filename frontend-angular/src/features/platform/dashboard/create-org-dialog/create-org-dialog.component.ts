import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthService } from '../../../../core/services/auth.service';
import { PlanType } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-create-org-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatProgressSpinnerModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './create-org-dialog.component.html',
  styleUrl: './create-org-dialog.component.scss'
})
export class CreateOrgDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error = '';
  planTypes = Object.values(PlanType);
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public dialogRef: MatDialogRef<CreateOrgDialogComponent>
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      registrationNumber: ['', Validators.required],
      taxIdentificationNumber: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', Validators.required],
      planType: ['', Validators.required],
      subscriptionEndDate: ['', Validators.required],
      line1: ['', Validators.required],
      line2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      postalCode: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    const v = this.form.value;
    const payload = {
      name: v.name,
      registrationNumber: v.registrationNumber,
      taxIdentificationNumber: v.taxIdentificationNumber,
      contactEmail: v.contactEmail,
      contactPhone: v.contactPhone,
      planType: v.planType,
      subscriptionEndDate: v.subscriptionEndDate,
      address: {
        line1: v.line1, line2: v.line2,
        city: v.city, state: v.state,
        country: v.country, postalCode: v.postalCode
      }
    };

    this.authService.createOrganization(payload).subscribe({
      next: res => { this.loading = false; this.dialogRef.close(res.data); },
      error: err => { this.loading = false; this.error = err?.error?.message || 'Something went wrong.'; }
    });
  }
}