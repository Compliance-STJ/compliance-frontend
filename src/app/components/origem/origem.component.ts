import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Origem, OrigemEstatisticas } from './origem.model';
import { OrigemService } from './origem.service';
import { ToastService } from '../../services/toast.service';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-origem',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogComponent],
  templateUrl: './origem.component.html',
  styleUrls: ['./origem.component.css']
})
export class OrigemComponent implements OnInit {
  origens: Origem[] = [];
  origemSelecionada: Origem = this.novaOrigem();
  origemEditando: Origem | null = null;
  estatisticas: OrigemEstatisticas = { total: 0, ativas: 0, inativas: 0 };
  
  // Estados da interface
  mostrarFormulario = false;
  carregando = false;
  erro: string | null = null;
  sucesso: string | null = null;
  filtroAtivo = 'todas'; // 'todas', 'ativas', 'inativas', 'vigentes'
  termoBusca = '';

  constructor(
    private origemService: OrigemService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.carregarOrigens();
    this.carregarEstatisticas();
  }

  /**
   * Carrega a lista de origens baseada no filtro ativo
   */
  carregarOrigens(): void {
    this.carregando = true;
    this.erro = null;

    let observable;
    switch (this.filtroAtivo) {
      case 'ativas':
        observable = this.origemService.listarAtivas();
        break;
      case 'vigentes':
        observable = this.origemService.listarVigentes();
        break;
      default:
        observable = this.origemService.listarTodas();
    }

    observable.subscribe({
      next: (origens) => {
        this.origens = origens;
        this.aplicarFiltroBusca();
        this.carregando = false;
      },
      error: (err) => {
        this.erro = 'Erro ao carregar origens: ' + (err.error?.erro || err.message);
        this.carregando = false;
      }
    });
  }

  /**
   * Carrega as estatísticas das origens
   */
  carregarEstatisticas(): void {
    this.origemService.obterEstatisticas().subscribe({
      next: (stats) => {
        this.estatisticas = stats;
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas:', err);
      }
    });
  }

  /**
   * Aplica filtro de busca por nome
   */
  aplicarFiltroBusca(): void {
    if (this.termoBusca.trim()) {
      this.origemService.buscarPorNome(this.termoBusca).subscribe({
        next: (origens) => {
          this.origens = origens;
        },
        error: (err) => {
          this.erro = 'Erro na busca: ' + (err.error?.erro || err.message);
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
    this.carregarOrigens();
  }

  /**
   * Executa busca por nome
   */
  buscar(): void {
    if (this.termoBusca.trim()) {
      this.aplicarFiltroBusca();
    } else {
      this.carregarOrigens();
    }
  }

  /**
   * Abre o dialog para nova origem
   */
  novaOrigemFormulario(): void {
    this.origemSelecionada = this.novaOrigem();
    this.origemEditando = null;
    this.mostrarFormulario = true;
    this.limparMensagens();
  }

  /**
   * Abre o dialog para editar origem
   */
  editarOrigem(origem: Origem): void {
    this.origemSelecionada = { ...origem };
    this.origemEditando = origem;
    this.mostrarFormulario = true;
    this.limparMensagens();
  }

  /**
   * Cancela a edição/criação e fecha o dialog
   */
  cancelar(): void {
    this.mostrarFormulario = false;
    this.origemSelecionada = this.novaOrigem();
    this.origemEditando = null;
    this.limparMensagens();
  }

  /**
   * Método chamado quando o dialog é fechado
   */
  onDialogClosed(): void {
    this.cancelar();
  }

  /**
   * Salva a origem (criar ou atualizar)
   */
  salvar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.carregando = true;
    this.erro = null;

    const observable = this.origemEditando
      ? this.origemService.atualizar(this.origemEditando.id!, this.origemSelecionada)
      : this.origemService.criar(this.origemSelecionada);

    observable.subscribe({
      next: (origem) => {
        const operacao = this.origemEditando ? 'atualizada' : 'criada';
        this.toastService.saveSuccess(`Origem ${operacao}`);
        this.mostrarFormulario = false;
        this.carregarOrigens();
        this.carregarEstatisticas();
        this.carregando = false;
      },
      error: (err) => {
        this.toastService.saveError('origem', err.error?.erro || 'Erro ao salvar origem');
        this.carregando = false;
      }
    });
  }

  /**
   * Ativa uma origem
   */
  ativar(origem: Origem): void {
    if (!origem.id) return;

    this.toastService.confirmActivate(origem.nome, () => {
      this.origemService.ativar(origem.id!).subscribe({
        next: () => {
          this.toastService.operationSuccess('Ativação da origem');
          this.carregarOrigens();
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
   * Inativa uma origem
   */
  inativar(origem: Origem): void {
    if (!origem.id) return;

    this.toastService.confirmDeactivate(origem.nome, () => {
      this.origemService.inativar(origem.id!).subscribe({
        next: () => {
          this.toastService.operationSuccess('Desativação da origem');
          this.carregarOrigens();
          this.carregarEstatisticas();
        },
        error: (err) => {
          const errorMessage = err.error?.erro || err.message || 'Erro desconhecido';
          this.toastService.error('Erro ao desativar', errorMessage);
        }
      });
    });
  }

  /**
   * Remove uma origem
   */
  remover(origem: Origem): void {
    if (!origem.id) return;

    this.toastService.confirmDelete(origem.nome, () => {
      this.origemService.deletar(origem.id!).subscribe({
        next: () => {
          this.toastService.deleteSuccess('Origem');
          this.carregarOrigens();
          this.carregarEstatisticas();
        },
        error: (err) => {
          const errorMessage = err.error?.erro || err.message || 'Erro desconhecido';
          this.toastService.deleteError('origem', errorMessage);
        }
      });
    });
  }

  /**
   * Cria um objeto origem vazio
   */
  private novaOrigem(): Origem {
    return {
      nome: '',
      descricao: '',
      ativo: true
    };
  }

  /**
   * Valida o formulário
   */
  private validarFormulario(): boolean {
    if (!this.origemSelecionada.nome.trim()) {
      this.erro = 'Nome da origem é obrigatório';
      return false;
    }

    if (this.origemSelecionada.nome.length > 100) {
      this.erro = 'Nome deve ter no máximo 100 caracteres';
      return false;
    }

    if (this.origemSelecionada.descricao && this.origemSelecionada.descricao.length > 500) {
      this.erro = 'Descrição deve ter no máximo 500 caracteres';
      return false;
    }

    return true;
  }

  /**
   * Limpa mensagens de erro e sucesso
   */
  private limparMensagens(): void {
    this.erro = null;
    this.sucesso = null;
  }

  /**
   * Formata data para exibição
   */
  formatarData(data: string | undefined): string {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  /**
   * Retorna a classe CSS para o status da origem
   */
  getStatusClass(origem: Origem): string {
    return origem.ativo ? 'status-ativa' : 'status-inativa';
  }

  /**
   * Retorna o texto do status da origem
   */
  getStatusText(origem: Origem): string {
    return origem.ativo ? 'Ativa' : 'Inativa';
  }
  
  /**
   * Alterna o status da origem entre ativo/inativo
   */
  alternarStatus(origem: Origem): void {
    if (!origem.id) return;
    
    const action = origem.ativo ? 'desativar' : 'ativar';
    this.toastService.confirmStatusChange(origem.nome, action, () => {
      const observable = origem.ativo
        ? this.origemService.inativar(origem.id!)
        : this.origemService.ativar(origem.id!);

      observable.subscribe({
        next: () => {
          const operation = origem.ativo ? 'Desativação' : 'Ativação';
          this.toastService.operationSuccess(`${operation} da origem`);
          this.carregarOrigens();
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