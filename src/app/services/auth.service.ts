import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User, UserRole, AuthUser, Permission, DEFAULT_PERMISSIONS, CreateUserRequest, UpdateUserRequest } from '../models/user.model';
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
      unit: response.user.unidade ? Number(response.user.unidade) : undefined,
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
      case 'RESPONSAVEL': return UserRole.GESTOR_UNIDADE;
      case 'GESTOR_UNIDADE': return UserRole.GESTOR_UNIDADE;
      case 'USUARIO': return UserRole.USUARIO;
      default: return UserRole.USUARIO;
    }
  }

  /**
   * Mapeia UserRole do frontend para tipo do backend
   */
  private mapUserRoleToBackendType(role: UserRole): string {
    switch (role) {
      case UserRole.ACR: return 'ACR';
      case UserRole.GESTOR_UNIDADE: return 'GESTOR_UNIDADE';
      case UserRole.USUARIO: return 'USUARIO';
      default: return 'USUARIO';
    }
  }

  /**
   * Mapeia usuário do backend para User do frontend
   */
  private mapBackendUserToFrontendUser(backendUser: any): User {
    const userRole = this.mapBackendTypeToUserRole(backendUser.tipo);

    // Função auxiliar para criar data válida
    const createValidDate = (dateValue: any): Date => {
      if (!dateValue) return new Date(); // Data atual como fallback

      const date = new Date(dateValue);
      // Verificar se a data é válida
      return isNaN(date.getTime()) ? new Date() : date;
    };

    return {
      id: backendUser.id.toString(),
      name: backendUser.nome,
      email: backendUser.email,
      role: userRole,
      unit: backendUser.unidade ? Number(backendUser.unidade) : undefined,
      isActive: backendUser.ativo,
      createdAt: createValidDate(backendUser.dataCriacao || backendUser.createdAt),
      lastLoginAt: backendUser.dataUltimoLogin ? createValidDate(backendUser.dataUltimoLogin) : undefined
    };
  }

  /**
   * Listar todos os usuários
   */
  getUsers(): Observable<User[]> {
    // Verificar se usuário está autenticado
    if (!this.isAuthenticated()) {
      console.warn('Tentativa de carregar usuários sem autenticação');
      this.toastService.error('Erro de autenticação', 'Você precisa estar logado para acessar esta funcionalidade');
      return throwError(() => new Error('Usuário não autenticado'));
    }

    return this.http.get<any>(`${this.API_URL}/usuarios`)
      .pipe(
        tap(response => {
          console.log('Resposta da API de usuários:', response);
        }),
        map(response => {
          // Extrair o array de usuários do campo 'content' da resposta paginada
          const users = response.content || [];
          return users.map((user: any) => this.mapBackendUserToFrontendUser(user));
        }),
        tap(users => {
          console.log('Usuários mapeados:', users);
        }),
        catchError(error => {
          console.error('Erro na API de usuários:', error);
          const message = error?.error?.message || 'Erro ao carregar usuários';
          this.toastService.error('Erro ao carregar usuários', message);
          return throwError(() => error);
        })
      );
  }

  /**
   * Criar novo usuário
   */
  createUser(userData: CreateUserRequest): Observable<User> {
    // Mapear campos do frontend para o formato esperado pelo backend
    const backendPayload = {
      nome: userData.nome,
      login: userData.login,
      email: userData.email,
      senha: userData.senha,
      tipo: this.mapUserRoleToBackendType(userData.tipo),
      unidade: userData.unidade,
      ativo: userData.ativo
    };

    return this.http.post<User>(`${this.API_URL}/usuarios`, backendPayload)
      .pipe(
        tap(user => {
          this.toastService.success('Usuário criado com sucesso!');
        }),
        catchError(error => {
          const message = error?.error?.message || 'Erro ao criar usuário';
          this.toastService.error('Erro ao criar usuário', message);
          return throwError(() => error);
        })
      );
  }

  /**
   * Atualizar usuário existente
   */
  updateUser(userId: string, userData: UpdateUserRequest): Observable<User> {
    // Mapear campos do frontend para o formato esperado pelo backend
    const backendPayload = {
      nome: userData.nome,
      login: userData.login,
      email: userData.email,
      tipo: this.mapUserRoleToBackendType(userData.tipo),
      unidade: userData.unidade,
      ativo: userData.ativo
    };

    return this.http.put<User>(`${this.API_URL}/usuarios/${userId}`, backendPayload)
      .pipe(
        tap(user => {
          this.toastService.success('Usuário atualizado com sucesso!');
        }),
        catchError(error => {
          const message = error?.error?.message || 'Erro ao atualizar usuário';
          this.toastService.error('Erro ao atualizar usuário', message);
          return throwError(() => error);
        })
      );
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