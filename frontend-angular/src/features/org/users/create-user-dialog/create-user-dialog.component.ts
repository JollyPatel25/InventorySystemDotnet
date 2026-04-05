import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatProgressSpinnerModule
  ],
  templateUrl: './create-user-dialog.component.html',
  styleUrl: './create-user-dialog.component.scss'
})
export class CreateUserDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error = '';
  roles = [UserRole.Manager, UserRole.Viewer];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<CreateUserDialogComponent>
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      contactNumber: ['', Validators.required],
      role: ['', Validators.required],
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
      role: v.role,
      address: {
        line1: v.line1, line2: v.line2,
        city: v.city, state: v.state,
        country: v.country, postalCode: v.postalCode
      }
    };

    this.authService.createUserWithRole(payload).subscribe({
      next: res => { this.loading = false; this.dialogRef.close(res.data); },
      error: err => { this.loading = false; this.error = err?.error?.message || 'Something went wrong.'; }
    });
  }
}