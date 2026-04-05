import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('../features/auth/login/login.component').then(m => m.LoginComponent)
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('../shared/layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      // Platform Admin
      {
        path: 'platform',
        canActivate: [roleGuard(['PlatformAdmin'])],
        children: [
          { path: 'dashboard', loadComponent: () => import('../features/platform/dashboard/dashboard.component').then(m => m.DashboardComponent) },
          { path: 'organizations', loadComponent: () => import('../features/platform/organizations/organizations.component').then(m => m.OrganizationsComponent) },
          { path: 'logs', loadComponent: () => import('../features/platform/logs/logs.component').then(m => m.LogsComponent) },
          { path: 'users', loadComponent: () => import('../features/platform/users/platform-users.component').then(m => m.PlatformUsersComponent) },
          { path: 'profile', loadComponent: () => import('../features/platform/profile/profile.component').then(m => m.ProfileComponent) },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      },
      // Org Admin
      {
        path: 'org',
        canActivate: [roleGuard(['Admin'])],
        children: [
          { path: 'dashboard', loadComponent: () => import('../features/org/dashboard/dashboard.component').then(m => m.DashboardComponent) },
          { path: 'products', loadComponent: () => import('../features/org/products/products.component').then(m => m.ProductsComponent) },
          { path: 'warehouses', loadComponent: () => import('../features/org/warehouses/warehouses.component').then(m => m.WarehousesComponent) },
          { path: 'inventory', loadComponent: () => import('../features/org/inventory/inventory.component').then(m => m.InventoryComponent) },
          { path: 'sales', loadComponent: () => import('../features/org/sales/sales.component').then(m => m.SalesComponent) },
          { path: 'sales/create', loadComponent: () => import('../features/org/sales/create-sale/create-sale.component').then(m => m.CreateSaleComponent) },
          { path: 'users', loadComponent: () => import('../features/org/users/users.component').then(m => m.UsersComponent) },
          { path: 'predictions', loadComponent: () => import('../features/org/predictions/predictions.component').then(m => m.PredictionsComponent) },
          { path: 'profile', loadComponent: () => import('../features/org/profile/profile.component').then(m => m.ProfileComponent) },
          { path: 'my-profile', loadComponent: () => import('../features/org/my-profile/my-profile.component').then(m => m.MyProfileComponent) },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      },
      // Manager
      {
        path: 'manager',
        canActivate: [roleGuard(['Manager'])],
        children: [
          { path: 'dashboard', loadComponent: () => import('../features/manager/dashboard/dashboard.component').then(m => m.DashboardComponent) },
          { path: 'inventory', loadComponent: () => import('../features/manager/inventory/inventory.component').then(m => m.InventoryComponent) },
          { path: 'sales', loadComponent: () => import('../features/manager/sales/sales.component').then(m => m.SalesComponent) },
          { path: 'sales/create', loadComponent: () => import('../features/org/sales/create-sale/create-sale.component').then(m => m.CreateSaleComponent) },
          { path: 'predictions', loadComponent: () => import('../features/manager/predictions/predictions.component').then(m => m.PredictionsComponent) },
          { path: 'my-profile', loadComponent: () => import('../features/org/my-profile/my-profile.component').then(m => m.MyProfileComponent) },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      },
      // Viewer
      {
        path: 'viewer',
        canActivate: [roleGuard(['Viewer'])],
        children: [
          { path: 'dashboard', loadComponent: () => import('../features/viewer/dashboard/dashboard.component').then(m => m.DashboardComponent) },
          { path: 'inventory', loadComponent: () => import('../features/viewer/inventory/inventory.component').then(m => m.InventoryComponent) },
          { path: 'sales', loadComponent: () => import('../features/viewer/sales/sales.component').then(m => m.SalesComponent) },
          { path: 'my-profile', loadComponent: () => import('../features/org/my-profile/my-profile.component').then(m => m.MyProfileComponent) },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      }
    ]
  },
  { path: 'unauthorized', loadComponent: () => import('../features/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent) },
  { path: '**', redirectTo: 'auth/login' }
];