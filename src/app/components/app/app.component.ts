import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AuthUser, UserRole } from '../../models/user.model';
import { ToastComponent } from '../toast/toast.component';

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  route: string;
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}

interface UserProfile {
  name: string;
  unit: string;
  access: string;
  menu: MenuSection[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ToastComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  protected readonly title = signal('compliance-stj');
  currentSection: string = 'inicio';
  currentAuthUser: AuthUser | null = null;
  isAuthenticated: boolean = false;
  
  profiles: { [key: string]: UserProfile } = {
    acr: {
      name: 'João Silva',
      unit: 'Assessoria de Compliance e Riscos',
      access: 'Acesso completo ao sistema',
      menu: [
        { 
          section: 'Dashboard', 
          items: [
            { id: 'dashboard-acr', name: 'Dashboard Executivo', icon: '📊', route: 'inicio' }
          ]
        },
        { 
          section: 'Gestão', 
          items: [
            { id: 'normas', name: 'Normas', icon: '📄', route: 'normas' },
            { id: 'obrigacoes-gestao', name: 'Obrigações', icon: '💼', route: 'obrigacoes' },
            { id: 'extracao', name: 'Extração de Obrigações', icon: '🤖', route: 'extracao' },
            { id: 'origens', name: 'Origens', icon: '🏢', route: 'origens' },
            { id: 'obrigatoriedades', name: 'Obrigatoriedades', icon: '⚖️', route: 'obrigatoriedades' },
            { id: 'obrigacoes', name: 'Situações de Obrigações', icon: '✅', route: 'situacoes-obrigacoes' },
            { id: 'situacoes-norma', name: 'Situações de Norma', icon: '📋', route: 'situacoes-norma' },
            { id: 'unidades', name: 'Unidades Responsáveis', icon: '🏛️', route: 'unidades' },
            // { id: 'relatorios', name: 'Relatórios', icon: '📈', route: 'relatorios' }
          ]
        },
        { 
          section: 'Configurações', 
          items: [
            { id: 'configuracoes', name: 'Configurações', icon: '⚙️', route: 'configuracoes' },
            { id: 'usuarios', name: 'Usuários', icon: '👥', route: 'usuarios' }
          ]
        }
      ]
    },
    responsavel: {
      name: 'Maria Santos',
      unit: 'Coordenação de Gestão de Pessoas',
      access: 'Aprovação de obrigações da unidade',
      menu: [
        { 
          section: 'Minha Unidade', 
          items: [
            { id: 'responsavel', name: 'Aprovar Obrigações', icon: '✅', route: 'situacoes-obrigacoes' },
            { id: 'usuario', name: 'Minhas Obrigações', icon: '📋', route: 'situacoes-norma' }
          ]
        },
        { 
          section: 'Consultas', 
          items: [
            { id: 'normas', name: 'Consultar Normas', icon: '📄', route: 'normas' }
          ]
        }
      ]
    },
    usuario: {
      name: 'Carlos Silva',
      unit: 'Secretaria Administrativa',
      access: 'Adição de evidências e planos de ação',
      menu: [
        { 
          section: 'Minhas Atividades', 
          items: [
            { id: 'usuario', name: 'Minhas Obrigações', icon: '📋', route: 'situacoes-norma' }
          ]
        },
        { 
          section: 'Consultas', 
          items: [
            { id: 'normas', name: 'Consultar Normas', icon: '📄', route: 'normas' }
          ]
        }
      ]
    },
    consultor: {
      name: 'Ana Costa',
      unit: 'Consultoria Externa',
      access: 'Acesso somente leitura',
      menu: [
        { 
          section: 'Consultas', 
          items: [
            { id: 'dashboard-acr', name: 'Dashboard', icon: '📊', route: 'inicio' },
            { id: 'normas', name: 'Normas', icon: '📄', route: 'normas' },
            { id: 'obrigacoes', name: 'Obrigações', icon: '✅', route: 'situacoes-obrigacoes' }
          ]
        }
      ]
    }
  };

  getUserTypeDescription(): string {
    if (!this.currentAuthUser) return '';

    switch (this.currentAuthUser.user.role) {
      case UserRole.ACR: return 'Administrador ACR - Acesso completo ao sistema';
      case UserRole.GESTOR: return 'Gestor de Compliance - Gerenciamento e aprovação';
      case UserRole.RESPONSAVEL: return 'Responsável - Gerencia unidade específica';
      case UserRole.USUARIO: return 'Usuário - Acesso limitado às funcionalidades básicas';
      case UserRole.CONSULTOR: return 'Consultor - Acesso somente leitura';
      default: return 'Usuário do sistema';
    }
  }

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Inscrever-se no estado de autenticação
    this.authService.currentUser$.subscribe(user => {
      this.currentAuthUser = user;
      this.isAuthenticated = !!user;

      if (!this.isAuthenticated) {
        this.router.navigate(['/login']);
      }
    });
  }

  getCurrentMenu(): MenuSection[] {
    if (!this.currentAuthUser) return [];

    // Mapear role do usuário para perfil do menu
    const profileKey = this.mapRoleToProfile(this.currentAuthUser.user.role);
    return this.profiles[profileKey]?.menu || [];
  }

  private mapRoleToProfile(role: UserRole): string {
    switch (role) {
      case UserRole.ACR: return 'acr';
      case UserRole.GESTOR: return 'acr'; // Gestor usa mesmo menu que ACR
      case UserRole.RESPONSAVEL: return 'responsavel';
      case UserRole.USUARIO: return 'usuario';
      case UserRole.CONSULTOR: return 'consultor';
      default: return 'usuario';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToSection(route: string): void {
    console.log('Navegando para:', route);
    this.currentSection = route;
    this.router.navigate([route]);
  }
}
