import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Unidade, UnidadeEstatisticas } from './unidade.model';
import { UnidadeService } from './unidade.service';
import { ToastService } from '../../services/toast.service';
import { HasPermissionDirective, HasRoleDirective } from '../../directives/permission.directive';
import { Resources, Actions } from '../../models/user.model';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [CommonModule, FormsModule, HasPermissionDirective, HasRoleDirective, DialogComponent],
  templateUrl: './unidade.component.html',
  styleUrls: ['./unidade.component.css']
})
export class UnidadeComponent implements OnInit {
  // Sistema de toast implementado
  unidades: Unidade[] = [];
  unidadeSelecionada: Unidade = this.novaUnidade();
  unidadeEditando: Unidade | null = null;
  estatisticas: UnidadeEstatisticas = { total: 0, ativas: 0, inativas: 0 };
  
  // Estados da interface
  mostrarFormulario = false;
  carregando = false;
  filtroAtivo = 'todas'; // 'todas', 'ativas', 'inativas'
  termoBusca = '';
  
  // Mensagens de feedback
  erro: string | null = null;
  sucesso: string | null = null;

  // Expor constants para o template
  Resources = Resources;
  Actions = Actions;

  constructor(
    private unidadeService: UnidadeService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.carregarUnidades();
    this.carregarEstatisticas();
  }

  /**
   * Carrega a lista de unidades baseada no filtro ativo
   */
  carregarUnidades(): void {
    this.carregando = true;

    let observable;
    if (this.filtroAtivo === 'ativas') {
      observable = this.unidadeService.listarAtivas();
    } else {
      observable = this.unidadeService.listarTodas();
    }

    observable.subscribe({
      next: (unidades) => {
        this.unidades = unidades;
        this.aplicarFiltroBusca();
        this.carregando = false;
      },
      error: (err) => {
        const errorMessage = err.error?.erro || err.message || 'Erro desconhecido';
        this.toastService.loadError('unidades', errorMessage);
        this.carregando = false;
      }
    });
  }

  /**
   * Carrega as estatísticas das unidades
   */
  carregarEstatisticas(): void {
    this.unidadeService.obterEstatisticas().subscribe({
      next: (stats) => {
        this.estatisticas = stats;
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas:', err);
      }
    });
  }

  /**
   * Aplica filtro de busca por nome ou sigla
   */
  aplicarFiltroBusca(): void {
    if (this.termoBusca.trim()) {
      this.unidadeService.buscarPorNomeSigla(this.termoBusca).subscribe({
        next: (unidades) => {
          this.unidades = unidades;
        },
        error: (err) => {
          const errorMessage = err.error?.erro || err.message || 'Erro desconhecido';
          this.toastService.error('Erro na busca', errorMessage);
        }
      });
    }
  }

  /**
   * Altera o filtro ativo e recarrega a lista
   */
  alterarFiltro(filtro: string): void {
    this.filtroAtivo = filtro;
    this.termoBusca = '';
    this.carregarUnidades();
  }

  /**
   * Executa busca por nome ou sigla
   */
  buscar(): void {
    if (this.termoBusca.trim()) {
      this.aplicarFiltroBusca();
    } else {
      this.carregarUnidades();
    }
  }

  /**
   * Abre o formulário para nova unidade
   */
  novaUnidadeFormulario(): void {
    this.unidadeSelecionada = this.novaUnidade();
    this.unidadeEditando = null;
    this.mostrarFormulario = true;
    this.limparMensagens();
  }

  /**
   * Abre o formulário para editar unidade
   */
  editarUnidade(unidade: Unidade): void {
    this.unidadeSelecionada = { ...unidade };
    this.unidadeEditando = unidade;
    this.mostrarFormulario = true;
    this.limparMensagens();
  }

  /**
   * Cancela a edição/criação
   */
  cancelar(): void {
    this.mostrarFormulario = false;
    this.unidadeSelecionada = this.novaUnidade();
    this.unidadeEditando = null;
    this.limparMensagens();
  }

  /**
   * Método chamado quando o dialog é fechado
   */
  onDialogClosed(): void {
    this.cancelar();
  }

  /**
   * Salva a unidade (criar ou atualizar)
   */
  salvar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.carregando = true;

    const observable = this.unidadeEditando
      ? this.unidadeService.atualizar(this.unidadeEditando.id!, this.unidadeSelecionada)
      : this.unidadeService.criar(this.unidadeSelecionada);

    observable.subscribe({
      next: (unidade) => {
        if (this.unidadeEditando) {
          this.toastService.saveSuccess('Unidade');
        } else {
          this.toastService.success('Unidade criada', 'Unidade foi criada com sucesso!');
        }
        this.mostrarFormulario = false;
        this.carregarUnidades();
        this.carregarEstatisticas();
        this.carregando = false;
      },
      error: (err) => {
        const errorMessage = err.error?.erro || err.message || 'Erro desconhecido';
        this.toastService.saveError('unidade', errorMessage);
        this.carregando = false;
      }
    });
  }

  /**
   * Ativa uma unidade
   */
  ativar(unidade: Unidade): void {
    if (!unidade.id) return;

    this.toastService.confirmActivate(unidade.nome, () => {
      this.unidadeService.ativar(unidade.id!).subscribe({
        next: () => {
          this.toastService.operationSuccess('Ativação da unidade');
          this.carregarUnidades();
          this.carregarEstatisticas();
        },
        error: (err) => {
          const errorMessage = err.error?.erro || err.message || 'Erro desconhecido';
          this.toastService.error('Erro ao ativar', errorMessage);
        }
      });
    });
  }

  /**
   * Inativa uma unidade
   */
  inativar(unidade: Unidade): void {
    if (!unidade.id) return;

    this.toastService.confirmDeactivate(unidade.nome, () => {
      this.unidadeService.inativar(unidade.id!).subscribe({
        next: () => {
          this.toastService.operationSuccess('Inativação da unidade');
          this.carregarUnidades();
          this.carregarEstatisticas();
        },
        error: (err) => {
          const errorMessage = err.error?.erro || err.message || 'Erro desconhecido';
          this.toastService.error('Erro ao inativar', errorMessage);
        }
      });
    });
  }

  /**
   * Remove uma unidade
   */
  remover(unidade: Unidade): void {
    if (!unidade.id) return;

    this.toastService.confirmDelete(unidade.nome, () => {
      this.unidadeService.remover(unidade.id!).subscribe({
        next: () => {
          this.toastService.deleteSuccess('Unidade');
          this.carregarUnidades();
          this.carregarEstatisticas();
        },
        error: (err) => {
          const errorMessage = err.error?.erro || err.message || 'Erro desconhecido';
          this.toastService.deleteError('unidade', errorMessage);
        }
      });
    });
  }

  /**
   * Cria um objeto unidade vazio
   */
  private novaUnidade(): Unidade {
    return {
      nome: '',
      sigla: '',
      descricao: '',
      ativo: true,
      email: '',
      telefone: '',
      responsavel: ''
    };
  }

  /**
   * Valida o formulário
   */
  private validarFormulario(): boolean {
    if (!this.unidadeSelecionada.nome.trim()) {
      this.toastService.warning('Campo obrigatório', 'Nome da unidade é obrigatório');
      return false;
    }

    if (!this.unidadeSelecionada.sigla.trim()) {
      this.toastService.warning('Campo obrigatório', 'Sigla da unidade é obrigatória');
      return false;
    }

    if (this.unidadeSelecionada.nome.length > 100) {
      this.toastService.warning('Limite excedido', 'Nome deve ter no máximo 100 caracteres');
      return false;
    }

    if (this.unidadeSelecionada.sigla.length > 20) {
      this.toastService.warning('Limite excedido', 'Sigla deve ter no máximo 20 caracteres');
      return false;
    }

    if (this.unidadeSelecionada.descricao && this.unidadeSelecionada.descricao.length > 500) {
      this.toastService.warning('Limite excedido', 'Descrição deve ter no máximo 500 caracteres');
      return false;
    }

    return true;
  }

  /**
   * Limpa mensagens de erro e sucesso
   */
  private limparMensagens(): void {
  }

  /**
   * Formata data para exibição
   */
  formatarData(data: string | undefined): string {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  /**
   * Retorna a classe CSS para o status da unidade
   */
  getStatusClass(unidade: Unidade): string {
    return unidade.ativo ? 'status-ativa' : 'status-inativa';
  }

  /**
   * Retorna o texto do status da unidade
   */
  getStatusText(unidade: Unidade): string {
    return unidade.ativo ? 'Ativa' : 'Inativa';
  }
  
  /**
   * Alterna o status da unidade entre ativo/inativo
   */
  alternarStatus(unidade: Unidade): void {
    if (!unidade.id) return;
    
    const mensagem = unidade.ativo
      ? `Tem certeza que deseja inativar a unidade "${unidade.nome}"?`
      : `Tem certeza que deseja ativar a unidade "${unidade.nome}"?`;
      
    const action = unidade.ativo ? 'desativar' : 'ativar';
    this.toastService.confirmStatusChange(unidade.nome, action, () => {
      const observable = unidade.ativo
        ? this.unidadeService.inativar(unidade.id!)
        : this.unidadeService.ativar(unidade.id!);

      observable.subscribe({
        next: () => {
          const operation = unidade.ativo ? 'Inativação' : 'Ativação';
          this.toastService.operationSuccess(`${operation} da unidade`);
          this.carregarUnidades();
          this.carregarEstatisticas();
        },
        error: (err) => {
          const errorMessage = err.error?.erro || err.message || 'Erro desconhecido';
          this.toastService.error('Erro ao alterar status', errorMessage);
        }
      });
    });
  }
}