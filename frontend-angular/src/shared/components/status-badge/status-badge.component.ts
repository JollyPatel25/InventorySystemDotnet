import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, MatChipsModule],
  template: `
    <span class="badge" [ngClass]="active ? 'active' : 'inactive'">
      {{ active ? 'Active' : 'Inactive' }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;

      &.active {
        background: #e8f5e9;
        color: #2e7d32;
      }

      &.inactive {
        background: #fce4ec;
        color: #c62828;
      }
    }
  `]
})
export class StatusBadgeComponent {
  @Input() active = false;
}