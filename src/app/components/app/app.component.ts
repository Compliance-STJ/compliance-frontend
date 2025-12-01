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
          section: 'Aprovações',
          items: [
            { id: 'aprovacoes-acr', name: 'Aprovar Evidências', icon: '✅', route: 'aprovacoes-acr' }
          ]
        },
        {
          section: 'Gestão',
          items: [
            { id: 'normas', name: 'Normas', icon: '📄', route: 'normas' },
            { id: 'obrigacoes-gestao', name: 'Obrigações', icon: '💼', route: 'obrigacoes' },
            { id: 'norma-manual', name: 'Criação Manual de Norma', icon: '✏️', route: 'norma-manual' },
            { id: 'extracao', name: 'Extração de Obrigações', icon: '🤖', route: 'extracao' },
            // { id: 'relatorios', name: 'Relatórios', icon: '📈', route: 'relatorios' }
          ]
        },
        {
          section: 'Tabelas Auxiliares',
          items: [
            { id: 'obrigatoriedades', name: 'Obrigatoriedades', icon: '⚖️', route: 'obrigatoriedades' },
            { id: 'origens', name: 'Origens', icon: '🏢', route: 'origens' },
            { id: 'situacoes-norma', name: 'Situações de Norma', icon: '📋', route: 'situacoes-norma' },
            { id: 'situacoes-aprovacao-norma', name: 'Situações de Aprovação de Norma', icon: '✔️', route: 'situacoes-aprovacao-norma' },
            { id: 'situacoes-obrigacao', name: 'Situações de Obrigações', icon: '✅', route: 'situacoes-obrigacoes' },
            { id: 'unidades', name: 'Unidades Responsáveis', icon: '🏛️', route: 'unidades' }
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
    gestor_unidade: {
      name: 'Maria Santos',
      unit: 'Coordenação de Gestão de Pessoas',
      access: 'Gestor de Unidade - Aprovação de obrigações da unidade',
      menu: [
        {
          section: 'Minha Unidade',
          items: [
            { id: 'obrigacoes-unidade', name: 'Obrigações da Unidade', icon: '📋', route: 'obrigacoes-unidade' },
            { id: 'aprovacoes-gestor', name: 'Pendentes de Aprovação', icon: '✅', route: 'aprovacoes-gestor' }
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
            { id: 'usuario', name: 'Minhas Obrigações', icon: '📋', route: 'minhas-obrigacoes' }
          ]
        },
        { 
          section: 'Consultas', 
          items: [
            { id: 'normas', name: 'Consultar Normas', icon: '📄', route: 'normas' }
          ]
        }
      ]
    }
  };

  getUserTypeDescription(): string {
    if (!this.currentAuthUser) return '';

    switch (this.currentAuthUser.user.role) {
      case UserRole.ACR: return 'Administrador ACR - Acesso completo ao sistema';
      case UserRole.GESTOR_UNIDADE: return 'Gestor de Unidade - Gerencia unidade específica';
      case UserRole.USUARIO: return 'Usuário - Acesso limitado às funcionalidades básicas';
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
      case UserRole.GESTOR_UNIDADE: return 'gestor_unidade';
      case UserRole.USUARIO: return 'usuario';
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
