import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { UserService, PlatformUserListItemDto } from '../../../../core/services/user.service';
import { OrganizationService } from '../../../../core/services/organization.service';
import { OrganizationResponseDto } from '../../../../core/models/organization.models';

@Component({
  selector: 'app-assign-org-admin-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './assign-org-admin-dialog.component.html',
  styleUrl: './assign-org-admin-dialog.component.scss'
})
export class AssignOrgAdminDialogComponent implements OnInit {
  organizations: OrganizationResponseDto[] = [];
  selectedOrgId = '';
  loading = false;
  orgsLoading = false;
  error = '';

  constructor(
    public dialogRef: MatDialogRef<AssignOrgAdminDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public user: PlatformUserListItemDto,
    private userService: UserService,
    private orgService: OrganizationService
  ) {}

  ngOnInit(): void {
    this.loadEligibleOrgs();
  }

  loadEligibleOrgs(): void {
    this.orgsLoading = true;
    this.orgService.getAllOrgs().subscribe({
      next: res => {
        // Show only orgs where user is NOT already an Admin
        const adminOrgIds = this.user.organizations
          .filter(o => o.role === 'Admin')
          .map(o => o.organizationId);

        this.organizations = res.data.filter(
          org => !adminOrgIds.includes(org.id)
        );

        this.orgsLoading = false;
      },
      error: () => { this.orgsLoading = false; }
    });
  }

  onSubmit(): void {
    if (!this.selectedOrgId) return;
    this.loading = true;
    this.error = '';

    this.userService.assignAsOrgAdmin(this.user.id, this.selectedOrgId).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: err => {
        this.loading = false;
        this.error = err?.error?.message || 'Something went wrong.';
      }
    });
  }
}