import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPermission = route.data?.['requiredPermission'] as { resource: string, action: string };

  if (!requiredPermission) {
    return true; // Se não há permissão específica, permite acesso
  }

  const hasPermission = authService.hasPermission(
    requiredPermission.resource,
    requiredPermission.action
  );

  if (!hasPermission) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};