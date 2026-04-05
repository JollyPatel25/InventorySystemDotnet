import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { UserService } from '../../../core/services/user.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-platform-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDividerModule,
    PageHeaderComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profile: any = null;
  form!: FormGroup;
  loading = false;
  saving = false;
  editMode = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.userService.getMyProfile().subscribe({
      next: res => { this.profile = res.data; this.buildForm(res.data); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  buildForm(p: any): void {
    this.form = this.fb.group({
      firstName: [p.firstName, Validators.required],
      lastName: [p.lastName, Validators.required],
      contactNumber: [p.contactNumber, Validators.required],
      line1: [p.address?.line1 ?? ''],
      line2: [p.address?.line2 ?? ''],
      city: [p.address?.city ?? ''],
      state: [p.address?.state ?? ''],
      country: [p.address?.country ?? ''],
      postalCode: [p.address?.postalCode ?? '']
    });
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    if (!this.editMode && this.profile) this.buildForm(this.profile);
  }

  onSave(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;

    const dto = {
      firstName: v.firstName,
      lastName: v.lastName,
      contactNumber: v.contactNumber,
      address: {
        line1: v.line1, line2: v.line2,
        city: v.city, state: v.state,
        country: v.country, postalCode: v.postalCode
      }
    };

    this.userService.updateMyProfile(dto).subscribe({
      next: res => {
        this.profile = res.data;
        this.saving = false;
        this.editMode = false;
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
      },
      error: err => {
        this.saving = false;
        this.snackBar.open(err?.error?.message || 'Update failed', 'Close', { duration: 3000 });
      }
    });
  }

  get fullName(): string {
    return `${this.profile?.firstName ?? ''} ${this.profile?.lastName ?? ''}`.trim();
  }
}