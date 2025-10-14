import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Pular interceptor para endpoints de autenticação
  if (req.url.includes('/api/auth/')) {
    console.log('[Auth Interceptor] Pulando autenticação para:', req.url);
    return next(req);
  }

  // Obter token do AuthService
  const token = authService.getToken();
  
  console.log('[Auth Interceptor] ======================');
  console.log('[Auth Interceptor] URL:', req.url);
  console.log('[Auth Interceptor] Método:', req.method);
  console.log('[Auth Interceptor] Token existe?', !!token);
  if (token) {
    console.log('[Auth Interceptor] Token (primeiros 50 chars):', token.substring(0, 50) + '...');
  } else {
    console.log('[Auth Interceptor] ⚠️ NENHUM TOKEN ENCONTRADO!');
    console.log('[Auth Interceptor] localStorage:', localStorage.getItem('compliance_auth_user') ? 'TEM DADOS' : 'VAZIO');
  }
  
  if (token) {
    // Clonar requisição e adicionar header Authorization com Bearer
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('[Auth Interceptor] ✅ Token adicionado ao header');
    console.log('[Auth Interceptor] ======================');

    return next(authReq);
  }

  console.log('[Auth Interceptor] ❌ Requisição SEM autenticação');
  console.log('[Auth Interceptor] ======================');
  return next(req);
};