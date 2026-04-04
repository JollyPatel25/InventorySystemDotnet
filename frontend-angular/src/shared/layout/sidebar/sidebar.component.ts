import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TokenService } from '../../../core/services/token.service';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;

  navItems: NavItem[] = [];

  constructor(private tokenService: TokenService) {}

  ngOnInit(): void {
    this.navItems = this.getNavItems();
  }

  private getNavItems(): NavItem[] {
    if (this.tokenService.isPlatformAdmin()) {
      return [
        { label: 'Dashboard', icon: 'dashboard', route: '/platform/dashboard' },
        { label: 'Organizations', icon: 'business', route: '/platform/organizations' },
        { label: 'System Logs', icon: 'article', route: '/platform/logs' }
      ];
    }

    const role = this.tokenService.getRole();

    switch (role) {
      case 'Admin':
        return [
          { label: 'Dashboard', icon: 'dashboard', route: '/org/dashboard' },
          { label: 'Products', icon: 'inventory_2', route: '/org/products' },
          { label: 'Warehouses', icon: 'warehouse', route: '/org/warehouses' },
          { label: 'Inventory', icon: 'category', route: '/org/inventory' },
          { label: 'Sales', icon: 'point_of_sale', route: '/org/sales' },
          { label: 'Users', icon: 'group', route: '/org/users' },
          { label: 'Tax Config', icon: 'receipt_long', route: '/org/tax' },
          { label: 'Reports', icon: 'bar_chart', route: '/org/reports' },
          { label: 'Predictions', icon: 'auto_graph', route: '/org/predictions' },
          { label: 'Profile', icon: 'domain', route: '/org/profile' }
        ];

      case 'Manager':
        return [
          { label: 'Dashboard', icon: 'dashboard', route: '/manager/dashboard' },
          { label: 'Inventory', icon: 'category', route: '/manager/inventory' },
          { label: 'Sales', icon: 'point_of_sale', route: '/manager/sales' },
          { label: 'Predictions', icon: 'auto_graph', route: '/manager/predictions' }
        ];

      case 'Viewer':
        return [
          { label: 'Dashboard', icon: 'dashboard', route: '/viewer/dashboard' },
          { label: 'Inventory', icon: 'category', route: '/viewer/inventory' },
          { label: 'Sales', icon: 'point_of_sale', route: '/viewer/sales' }
        ];

      default:
        return [];
    }
  }
}