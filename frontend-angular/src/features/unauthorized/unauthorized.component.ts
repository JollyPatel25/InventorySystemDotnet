import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:16px;">
      <h1>403 - Unauthorized</h1>
      <p>You don't have permission to access this page.</p>
      <button mat-raised-button color="primary" (click)="goBack()">Go Back</button>
    </div>
  `
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}
  goBack(): void { this.router.navigate(['/auth/login']); }
}