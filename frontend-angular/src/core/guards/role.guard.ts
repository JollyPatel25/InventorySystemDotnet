import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const tokenService = inject(TokenService);
    const router = inject(Router);

    if (tokenService.isPlatformAdmin() && allowedRoles.includes('PlatformAdmin')) return true;

    const role = tokenService.getRole();
    if (role && allowedRoles.includes(role)) return true;

    router.navigate(['/unauthorized']);
    return false;
  };
};