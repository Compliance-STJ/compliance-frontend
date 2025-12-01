import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { DialogComponent } from '../dialog/dialog.component';
import { HasPermissionDirective, HasRoleDirective } from '../../directives/permission.directive';
import { Resources, Actions, User, UserRole, CreateUserRequest, UpdateUserRequest } from '../../models/user.model';
import { Unidade } from '../unidades/unidade.model';
import { UnidadeService } from '../unidades/unidade.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogComponent,
    HasPermissionDirective,
    HasRoleDirective
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  // Listas de dados
  usuarios: User[] = [];
  unidades: Unidade[] = [];

  // Estados da interface
  mostrarFormulario = false;
  carregando = false;
  modoEdicao = false;
  usuarioEditando: User | null = null;

  // Recursos para template
  protected readonly Resources = Resources;
  protected readonly Actions = Actions;

  // Formulário
  usuarioForm: CreateUserRequest = {
    nome: '',
    login: '',
    email: '',
    senha: '',
    tipo: UserRole.USUARIO,
    unidade: undefined,
    ativo: true,
    confirmarSenha: ''
  };

  // Opções para os selects
  roles = [
    { value: UserRole.ACR, label: 'ACR' },
    { value: UserRole.GESTOR_UNIDADE, label: 'Gestor Unidade' },
    { value: UserRole.USUARIO, label: 'Usuário' }
  ];

  constructor(
    private authService: AuthService,
    private unidadeService: UnidadeService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Carregar dados simultaneamente
    this.carregarDados();
  }

  /**
   * Carrega todos os dados necessários
   */
  private carregarDados(): void {
    this.carregarUsuarios();
    // Carregar unidades após um pequeno delay para não interferir com a renderização dos usuários
    setTimeout(() => {
      this.carregarUnidades();
    }, 100);
  }

  /**
   * Carrega a lista de usuários
   */
  carregarUsuarios(): void {
    this.carregando = true;
    this.authService.getUsers().subscribe({
      next: (usuarios: User[]) => {
        // Usar ngZone.run para garantir que as mudanças sejam detectadas
        this.ngZone.run(() => {
          this.usuarios = [...usuarios]; // Criar nova referência para garantir Change Detection
          this.carregando = false;
          this.cdr.detectChanges(); // Forçar detecção de mudanças
        });
      },
      error: (error: any) => {
        this.ngZone.run(() => {
          this.toastService.error('Erro', 'Não foi possível carregar os usuários');
          this.carregando = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  /**
   * Carrega a lista de unidades
   */
  carregarUnidades(): void {
    this.unidadeService.listarTodas().subscribe({
      next: (unidades: Unidade[]) => {
        this.unidades = [...unidades];
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.toastService.error('Erro', 'Não foi possível carregar as unidades');
      }
    });
  }

  /**
   * Abre o formulário para criar novo usuário
   */
  novoUsuario(): void {
    this.modoEdicao = false;
    this.usuarioEditando = null;
    this.usuarioForm = {
      nome: '',
      login: '',
      email: '',
      senha: '',
      tipo: UserRole.USUARIO,
      unidade: undefined,
      ativo: true,
      confirmarSenha: ''
    };
    this.mostrarFormulario = true;
  }

  /**
   * Fecha o formulário
   */
  fecharFormulario(): void {
    this.mostrarFormulario = false;
    this.modoEdicao = false;
    this.usuarioEditando = null;
    this.usuarioForm = {
      nome: '',
      login: '',
      email: '',
      senha: '',
      tipo: UserRole.USUARIO,
      unidade: undefined,
      ativo: true,
      confirmarSenha: ''
    };
  }

  /**
   * Salva o usuário
   */
  salvar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.carregando = true;

    if (this.modoEdicao && this.usuarioEditando) {
      // Modo edição
      const updateData: UpdateUserRequest = {
        nome: this.usuarioForm.nome,
        login: this.usuarioForm.login,
        email: this.usuarioForm.email,
        tipo: this.usuarioForm.tipo,
        unidade: this.usuarioForm.unidade,
        ativo: this.usuarioForm.ativo
      };

      this.authService.updateUser(this.usuarioEditando.id, updateData).subscribe({
        next: (usuario) => {
          this.carregando = false;
          this.fecharFormulario();
          this.carregarUsuarios(); // Recarregar lista
        },
        error: (error) => {
          this.carregando = false;
          console.error('Erro ao atualizar usuário:', error);
        }
      });
    } else {
      // Modo criação
      this.authService.createUser(this.usuarioForm).subscribe({
        next: (usuario) => {
          this.carregando = false;
          this.fecharFormulario();
          this.carregarUsuarios(); // Recarregar lista
        },
        error: (error) => {
          this.carregando = false;
          console.error('Erro ao criar usuário:', error);
        }
      });
    }
  }

  /**
   * Valida o formulário antes de enviar
   */
  private validarFormulario(): boolean {
    // Validação básica
    if (!this.usuarioForm.nome.trim()) {
      this.toastService.error('Erro de validação', 'Nome é obrigatório');
      return false;
    }

    if (!this.usuarioForm.login.trim()) {
      this.toastService.error('Erro de validação', 'Login é obrigatório');
      return false;
    }

    if (!this.usuarioForm.email.trim()) {
      this.toastService.error('Erro de validação', 'Email é obrigatório');
      return false;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.usuarioForm.email)) {
      this.toastService.error('Erro de validação', 'Email inválido');
      return false;
    }

    // Validação de senha apenas no modo criação
    if (!this.modoEdicao) {
      if (!this.usuarioForm.senha) {
        this.toastService.error('Erro de validação', 'Senha é obrigatória');
        return false;
      }

      if (this.usuarioForm.senha.length < 6) {
        this.toastService.error('Erro de validação', 'A senha deve ter pelo menos 6 caracteres');
        return false;
      }

      if (this.usuarioForm.senha !== this.usuarioForm.confirmarSenha) {
        this.toastService.error('Erro de validação', 'As senhas não coincidem');
        return false;
      }
    }

    return true;
  }

  /**
   * Retorna o rótulo do papel do usuário
   */
  getRoleLabel(role: UserRole): string {
    const roleOption = this.roles.find(r => r.value === role);
    return roleOption ? roleOption.label : role;
  }

  /**
   * Retorna o nome da unidade
   */
  getUnidadeNome(unitId?: number): string {
    if (!unitId || !this.unidades || this.unidades.length === 0) return '-';
    const unidade = this.unidades.find(u => u.id === unitId);
    return unidade ? unidade.nome : '-';
  }

  /**
   * Ver detalhes do usuário
   */
  verDetalhes(usuario: User): void {
    // TODO: Implementar modal de detalhes
    this.toastService.info('Funcionalidade em desenvolvimento', 'Detalhes do usuário em breve');
  }

  /**
   * Editar usuário
   */
  editarUsuario(usuario: User): void {
    this.modoEdicao = true;
    this.usuarioEditando = usuario;
    this.usuarioForm = {
      nome: usuario.name,
      login: usuario.email, // Usando email como login já que não temos campo separado
      email: usuario.email,
      senha: '', // Não preencher senha na edição
      tipo: usuario.role,
      unidade: usuario.unit,
      ativo: usuario.isActive,
      confirmarSenha: ''
    };
    this.mostrarFormulario = true;
  }

  /**
   * Excluir usuário
   */
  excluirUsuario(usuario: User): void {
    // TODO: Implementar exclusão de usuário
    this.toastService.info('Funcionalidade em desenvolvimento', 'Exclusão de usuário em breve');
  }

  /**
   * Função trackBy para otimizar o *ngFor
   */
  trackByUsuarioId(index: number, usuario: User): string {
    return usuario.id;
  }

  /**
   * Verifica se o usuário tem uma permissão específica (para uso no template)
   */
  hasPermission(resource: string, action: string): boolean {
    return this.authService.hasPermission(resource, action);
  }

  /**
   * Verifica se uma data é válida
   */
  isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }
}