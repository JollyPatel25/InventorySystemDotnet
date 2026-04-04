import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { OrganizationService } from '../../../core/services/organization.service';
import { OrganizationResponseDto } from '../../../core/models/organization.models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    MatIconModule,
    PageHeaderComponent,
    StatusBadgeComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  org: OrganizationResponseDto | null = null;
  form!: FormGroup;
  loading = false;
  saving = false;
  editMode = false;

  constructor(
    private fb: FormBuilder,
    private orgService: OrganizationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.orgService.getMyOrg().subscribe({
      next: res => {
        this.org = res.data;
        this.buildForm(res.data);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  buildForm(org: OrganizationResponseDto): void {
    this.form = this.fb.group({
      name: [org.name, Validators.required],
      contactEmail: [org.contactEmail, [Validators.required, Validators.email]],
      contactPhone: [org.contactPhone, Validators.required]
    });
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    if (!this.editMode && this.org) this.buildForm(this.org);
  }

  onSave(): void {
    if (this.form.invalid) return;
    this.saving = true;

    this.orgService.updateOrg(this.form.value).subscribe({
      next: res => {
        this.org = res.data;
        this.saving = false;
        this.editMode = false;
        this.snackBar.open('Organization updated successfully', 'Close', { duration: 3000 });
      },
      error: err => {
        this.saving = false;
        this.snackBar.open(err?.error?.message || 'Update failed', 'Close', { duration: 3000 });
      }
    });
  }
}