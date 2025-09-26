import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  protected readonly title = signal('compliance-stj');
  currentProfile: string = 'acr';
  currentSection: string = 'inicio';
  
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
            { id: 'origens', name: 'Origens', icon: '🏢', route: 'origens' },
            { id: 'obrigatoriedades', name: 'Obrigatoriedades', icon: '⚖️', route: 'obrigatoriedades' },
            { id: 'obrigacoes', name: 'Situações de Obrigações', icon: '✅', route: 'situacoes-obrigacao' },
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
            { id: 'responsavel', name: 'Aprovar Obrigações', icon: '✅', route: 'situacoes-obrigacao' },
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
            { id: 'obrigacoes', name: 'Obrigações', icon: '✅', route: 'situacoes-obrigacao' }
          ]
        }
      ]
    }
  };

  get currentUser(): UserProfile {
    return this.profiles[this.currentProfile];
  }

  get currentMenu(): MenuSection[] {
    return this.currentUser.menu;
  }

  constructor(private router: Router) {
    this.switchProfile();
  }

  switchProfile(): void {
    const profileSelector = document.getElementById('profileSelector') as HTMLSelectElement;
    if (profileSelector) {
      this.currentProfile = profileSelector.value;
    }
    
    // Navigate to first available route for the profile
    const firstRoute = this.currentUser.menu[0]?.items[0]?.route;
    if (firstRoute) {
      this.navigateToSection(firstRoute);
    }
  }

  navigateToSection(route: string): void {
    this.currentSection = route;
    this.router.navigate([route]);
  }
}
