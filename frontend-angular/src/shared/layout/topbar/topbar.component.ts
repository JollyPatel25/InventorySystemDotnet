import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { TokenService } from '../../../core/services/token.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

export interface UserOrganizationDto {
  organizationId: string;
  organizationName: string;
  role: string;
  isDefault: boolean;
  isActive: boolean;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule   // ✅ added
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  userName = '';
  userRole = '';
  currentOrgId = '';
  currentOrgName = '';
  organizations: UserOrganizationDto[] = [];
  switchingOrgId: string | null = null;

  readonly isPlatformAdmin: boolean;

  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar   // ✅ added
  ) {
    this.isPlatformAdmin = this.tokenService.isPlatformAdmin();
  }

  ngOnInit(): void {
    this.loadFromToken();

    if (!this.isPlatformAdmin) {
      this.loadMyOrganizations();
    }
  }

  private loadFromToken(): void {
    const payload = this.tokenService.getPayload();
    if (payload) {
      this.userName = payload.email;
      this.userRole = this.isPlatformAdmin
        ? 'Platform Admin'
        : (this.tokenService.getRole() ?? '');
      this.currentOrgId = payload.OrganizationId ?? '';
    }
  }

  loadMyOrganizations(): void {
    this.userService.getMyOrganizations().subscribe({
      next: res => {
        this.organizations = res.data;
        this.currentOrgName = this.organizations
          .find(o => o.organizationId === this.currentOrgId)
          ?.organizationName ?? '';
      },
      error: () => {}
    });
  }

  switchOrg(orgId: string): void {
    if (orgId === this.currentOrgId || this.switchingOrgId) return;

    this.switchingOrgId = orgId;

    this.authService.switchOrganization({ organizationId: orgId }).subscribe({
      next: () => {
        const orgName =
          this.organizations.find(o => o.organizationId === orgId)?.organizationName ||
          'Organization';

        this.loadFromToken();
        this.switchingOrgId = null;

        // ✅ Show message
        this.snackBar.open(`Switched to ${orgName}`, 'Close', {
          duration: 1000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });

        const redirectUrl = this.authService.getRedirectUrl();

        // ✅ Delay navigation so message is visible
        setTimeout(() => {
          this.router.navigateByUrl(redirectUrl).then(() => {
            window.location.reload();
          });
        }, 1000); // match snackbar duration
      },
      error: err => {
        this.switchingOrgId = null;

        const backendError = err?.error;

        const firstError = backendError?.Errors?.[0];

        const message =
          firstError === 'Subscription expired.'
            ? 'Organization subscription has expired. Please renew to continue.'
            : firstError ||
              backendError?.Message ||
              'Something went wrong.';

        this.snackBar.open(message, 'Close', {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
  }

  onToggle(): void {
    this.toggleSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}