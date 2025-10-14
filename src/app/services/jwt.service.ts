import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { JwtPayload, TokenValidationResponse } from '../models/jwt.model';

@Injectable({
  providedIn: 'root'
})
export class JwtService {
  private jwtHelper = new JwtHelperService();

  constructor() {}

  /**
   * Valida se um token JWT é válido
   */
  validateToken(token: string): TokenValidationResponse {
    try {
      if (!token) {
        return { valid: false, expired: false };
      }

      const isExpired = this.jwtHelper.isTokenExpired(token);
      const payload = this.jwtHelper.decodeToken<JwtPayload>(token);

      if (isExpired) {
        return { valid: false, expired: true, payload: payload || undefined };
      }

      // Validações adicionais
      if (!payload || !payload.sub || !payload.email || !payload.role) {
        return { valid: false, expired: false };
      }

      return { valid: true, expired: false, payload };
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return { valid: false, expired: false };
    }
  }

  /**
   * Decodifica um token JWT
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return this.jwtHelper.decodeToken<JwtPayload>(token);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }

  /**
   * Obtém a data de expiração do token
   */
  getTokenExpirationDate(token: string): Date | null {
    try {
      return this.jwtHelper.getTokenExpirationDate(token);
    } catch (error) {
      console.error('Erro ao obter data de expiração:', error);
      return null;
    }
  }

  /**
   * Verifica se o token está expirado
   */
  isTokenExpired(token: string): boolean {
    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('Erro ao verificar expiração:', error);
      return true;
    }
  }

  /**
   * Obtém o tempo restante do token em segundos
   */
  getTimeUntilExpiration(token: string): number {
    try {
      const expirationDate = this.getTokenExpirationDate(token);
      if (!expirationDate) return 0;
      
      const now = new Date();
      const timeLeft = expirationDate.getTime() - now.getTime();
      return Math.max(0, Math.floor(timeLeft / 1000));
    } catch (error) {
      console.error('Erro ao calcular tempo de expiração:', error);
      return 0;
    }
  }

  /**
   * Cria um token mock para desenvolvimento
   */
  createMockToken(payload: Partial<JwtPayload>): string {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (8 * 60 * 60); // 8 horas

    const fullPayload: JwtPayload = {
      sub: payload.sub || '',
      email: payload.email || '',
      name: payload.name || '',
      role: payload.role || '',
      unit: payload.unit,
      permissions: payload.permissions || [],
      iat: now,
      exp: exp,
      iss: 'stj-compliance-system'
    };

    // Em produção, isso seria gerado pelo backend
    // Para desenvolvimento, criamos um token mock
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payloadEncoded = btoa(JSON.stringify(fullPayload));
    const signature = btoa('mock-signature-for-development');
    
    return `${header}.${payloadEncoded}.${signature}`;
  }

  /**
   * Verifica se o usuário tem uma permissão específica baseada no token
   */
  hasPermissionInToken(token: string, permission: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return false;
    
    return payload.permissions.includes(permission);
  }

  /**
   * Verifica se o usuário tem um papel específico baseado no token
   */
  hasRoleInToken(token: string, role: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return false;
    
    return payload.role === role;
  }
}