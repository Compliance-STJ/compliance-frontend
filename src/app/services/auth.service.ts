import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User, UserRole, AuthUser, Permission, DEFAULT_PERMISSIONS } from '../models/user.model';
import { LoginRequest, LoginResponse, JwtPayload } from '../models/jwt.model';
import { JwtService } from './jwt.service';
import { ToastService } from './toast.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private readonly STORAGE_KEY = 'compliance_auth_user';

  private http = inject(HttpClient);
  private router = inject(Router);
  private jwtService = inject(JwtService);
  private toastService = inject(ToastService);

  private readonly API_URL = environment.apiUrl || 'http://localhost:8080/api';

  constructor() {
    // Carregar usuário do localStorage ao inicializar o serviço
    this.loadUserFromStorage();
  }

  /**
   * Autentica usuário no backend
   */
  login(loginOrEmail: string, senha: string): Observable<AuthUser> {
    // Determinar se é email ou login
    const isEmail = loginOrEmail.includes('@');
    const loginRequest: LoginRequest = isEmail 
      ? { email: loginOrEmail, senha }
      : { login: loginOrEmail, senha };

    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, loginRequest)
      .pipe(
        tap(response => {
          const authUser = this.convertToAuthUser(response);
          this.setCurrentUser(authUser);
        }),
        catchError(error => {
          const message = error?.error?.message || 'Erro ao fazer login';
          return throwError(() => error);
        }),
        map(response => this.convertToAuthUser(response))
      );
  }

  /**
   * Logout do usuário
   */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Obtém o usuário atual
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.token) {
      return false;
    }

    // Verificar se o token não está expirado (implementação básica)
    try {
      const tokenData = JSON.parse(atob(user.token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (tokenData.exp && tokenData.exp < currentTime) {
        this.logout(); // Token expirado, fazer logout
        return false;
      }
    } catch (error) {
      // Se não conseguir decodificar o token, considerar inválido
      this.logout();
      return false;
    }

    return true;
  }

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  hasPermission(resource: string, action: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    return user.permissions.some(permission => 
      permission.resource === resource && 
      permission.actions.includes(action)
    );
  }

  /**
   * Verifica se o usuário tem um dos papéis especificados
   */
  hasRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    return roles.includes(user.user.role);
  }

  /**
   * Obtém todas as permissões do usuário atual
   */
  getUserPermissions(): Permission[] {
    const user = this.getCurrentUser();
    return user?.permissions || [];
  }

  /**
   * Define o usuário atual e salva no localStorage
   */
  private setCurrentUser(authUser: AuthUser): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authUser));
    this.currentUserSubject.next(authUser);
  }

  /**
   * Carrega o usuário do localStorage
   */
  private loadUserFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const authUser: AuthUser = JSON.parse(stored);

        // Verificar se o token é válido e não expirou
        if (authUser.token) {
          try {
            const tokenData = JSON.parse(atob(authUser.token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            if (tokenData.exp && tokenData.exp < currentTime) {
              // Token expirado
              localStorage.removeItem(this.STORAGE_KEY);
              return;
            }

            // Token válido, carregar usuário
            this.currentUserSubject.next(authUser);
          } catch (tokenError) {
            // Token inválido
            localStorage.removeItem(this.STORAGE_KEY);
          }
        } else {
          // Sem token
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuário do storage:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Obtém o token atual
   */
  getToken(): string | null {
    const user = this.getCurrentUser();
    console.log('[AuthService.getToken] User:', user ? 'EXISTS' : 'NULL');
    console.log('[AuthService.getToken] Token:', user?.token ? user.token.substring(0, 50) + '...' : 'NULL');
    return user?.token || null;
  }

  /**
   * Renova o token usando refresh token
   */
  refreshToken(): Observable<AuthUser> {
    const user = this.getCurrentUser();
    if (!user?.refreshToken) {
      return throwError(() => new Error('Nenhum refresh token disponível'));
    }

    return this.http.post<LoginResponse>(`${this.API_URL}/auth/refresh`, {
      refresh_token: user.refreshToken
    }).pipe(
      tap(response => {
        const authUser = this.convertToAuthUser(response);
        this.setCurrentUser(authUser);
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      }),
      map(response => this.convertToAuthUser(response))
    );
  }

  /**
   * Converte resposta do backend para AuthUser
   */
  private convertToAuthUser(response: LoginResponse): AuthUser {
    const userRole = this.mapBackendTypeToUserRole(response.user.tipo);

    const user: User = {
      id: response.user.id.toString(),
      name: response.user.nome,
      email: response.user.email,
      role: userRole,
      unit: response.user.unidade || undefined,
      isActive: response.user.ativo,
      createdAt: new Date(),
      lastLoginAt: response.user.dataUltimoLogin ? new Date(response.user.dataUltimoLogin) : new Date()
    };

    const permissions = this.mapBackendPermissionsToPermissions(response.user.permissoes);

    return {
      user,
      token: response.access_token,
      refreshToken: response.refresh_token,
      permissions
    };
  }

  /**
   * Mapeia tipo de usuário do backend para UserRole do frontend
   */
  private mapBackendTypeToUserRole(tipo: string): UserRole {
    switch (tipo) {
      case 'ACR': return UserRole.ACR;
      case 'RESPONSAVEL': return UserRole.RESPONSAVEL;
      case 'USUARIO': return UserRole.USUARIO;
      case 'GESTOR': return UserRole.GESTOR;
      case 'CONSULTOR': return UserRole.CONSULTOR;
      default: return UserRole.USUARIO;
    }
  }

  /**
   * Mapeia permissões do backend para Permission[] do frontend
   */
  private mapBackendPermissionsToPermissions(backendPermissions: string[]): Permission[] {
    const permissionMap = new Map<string, string[]>();

    backendPermissions.forEach(permission => {
      const [resource, action] = permission.split(':');
      if (resource && action) {
        if (!permissionMap.has(resource)) {
          permissionMap.set(resource, []);
        }
        permissionMap.get(resource)!.push(action);
      }
    });

    return Array.from(permissionMap.entries()).map(([resource, actions]) => ({
      resource,
      actions
    }));
  }
}