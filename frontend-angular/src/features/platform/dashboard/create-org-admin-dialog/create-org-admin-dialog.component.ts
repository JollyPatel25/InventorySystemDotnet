import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/services/auth.service';
import { OrganizationResponseDto } from '../../../../core/models/organization.models';

@Component({
  selector: 'app-create-org-admin-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule
  ],
  templateUrl: './create-org-admin-dialog.component.html',
  styleUrl: './create-org-admin-dialog.component.scss'
})
export class CreateOrgAdminDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public dialogRef: MatDialogRef<CreateOrgAdminDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public org: OrganizationResponseDto
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      contactNumber: ['', Validators.required],
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
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      password: v.password,
      contactNumber: v.contactNumber,
      organizationId: this.org.id,
      address: {
        line1: v.line1, line2: v.line2,
        city: v.city, state: v.state,
        country: v.country, postalCode: v.postalCode
      }
    };

    this.authService.createOrgAdmin(payload).subscribe({
      next: res => { this.loading = false; this.dialogRef.close(res.data); },
      error: err => { this.loading = false; this.error = err?.error?.message || 'Something went wrong.'; }
    });
  }
}