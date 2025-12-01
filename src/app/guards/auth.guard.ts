import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();

  console.log('[AUTH GUARD] Verificando acesso a:', state.url);
  console.log('[AUTH GUARD] Autenticado?', isAuthenticated);

  if (!isAuthenticated) {
    console.log('[AUTH GUARD] Não autenticado, redirecionando para /login');
    router.navigate(['/login']);
    return false;
  }

  console.log('[AUTH GUARD] Acesso permitido');
  return true;
};