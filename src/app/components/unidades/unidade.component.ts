import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Unidade, UnidadeEstatisticas } from './unidade.model';
import { UnidadeService } from './unidade.service';

@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unidade.component.html',
  styleUrls: ['./unidade.component.css']
})
export class UnidadeComponent implements OnInit {
  unidades: Unidade[] = [];
  unidadeSelecionada: Unidade = this.novaUnidade();
  unidadeEditando: Unidade | null = null;
  estatisticas: UnidadeEstatisticas = { total: 0, ativas: 0, inativas: 0 };
  
  // Estados da interface
  mostrarFormulario = false;
  carregando = false;
  erro: string | null = null;
  sucesso: string | null = null;
  filtroAtivo = 'todas'; // 'todas', 'ativas', 'inativas'
  termoBusca = '';

  constructor(private unidadeService: UnidadeService) { }

  ngOnInit(): void {
    this.carregarUnidades();
    this.carregarEstatisticas();
  }

  /**
   * Carrega a lista de unidades baseada no filtro ativo
   */
  carregarUnidades(): void {
    this.carregando = true;
    this.erro = null;

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
        this.erro = 'Erro ao carregar unidades: ' + (err.error?.erro || err.message);
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
   * Salva a unidade (criar ou atualizar)
   */
  salvar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.carregando = true;
    this.erro = null;

    const observable = this.unidadeEditando
      ? this.unidadeService.atualizar(this.unidadeEditando.id!, this.unidadeSelecionada)
      : this.unidadeService.criar(this.unidadeSelecionada);

    observable.subscribe({
      next: (unidade) => {
        this.sucesso = this.unidadeEditando 
          ? 'Unidade atualizada com sucesso!' 
          : 'Unidade criada com sucesso!';
        this.mostrarFormulario = false;
        this.carregarUnidades();
        this.carregarEstatisticas();
        this.carregando = false;
      },
      error: (err) => {
        this.erro = err.error?.erro || 'Erro ao salvar unidade';
        this.carregando = false;
      }
    });
  }

  /**
   * Ativa uma unidade
   */
  ativar(unidade: Unidade): void {
    if (!unidade.id) return;

    if (confirm(`Tem certeza que deseja ativar a unidade "${unidade.nome}"?`)) {
      this.unidadeService.ativar(unidade.id).subscribe({
        next: () => {
          this.sucesso = 'Unidade ativada com sucesso!';
          this.carregarUnidades();
          this.carregarEstatisticas();
        },
        error: (err) => {
          this.erro = err.error?.erro || 'Erro ao ativar unidade';
        }
      });
    }
  }

  /**
   * Inativa uma unidade
   */
  inativar(unidade: Unidade): void {
    if (!unidade.id) return;

    if (confirm(`Tem certeza que deseja inativar a unidade "${unidade.nome}"?`)) {
      this.unidadeService.inativar(unidade.id).subscribe({
        next: () => {
          this.sucesso = 'Unidade inativada com sucesso!';
          this.carregarUnidades();
          this.carregarEstatisticas();
        },
        error: (err) => {
          this.erro = err.error?.erro || 'Erro ao inativar unidade';
        }
      });
    }
  }

  /**
   * Remove uma unidade
   */
  remover(unidade: Unidade): void {
    if (!unidade.id) return;

    if (confirm(`Tem certeza que deseja remover a unidade "${unidade.nome}"?`)) {
      this.unidadeService.remover(unidade.id).subscribe({
        next: () => {
          this.sucesso = 'Unidade removida com sucesso!';
          this.carregarUnidades();
          this.carregarEstatisticas();
        },
        error: (err) => {
          this.erro = err.error?.erro || 'Erro ao remover unidade';
        }
      });
    }
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
      this.erro = 'Nome da unidade é obrigatório';
      return false;
    }

    if (!this.unidadeSelecionada.sigla.trim()) {
      this.erro = 'Sigla da unidade é obrigatória';
      return false;
    }

    if (this.unidadeSelecionada.nome.length > 100) {
      this.erro = 'Nome deve ter no máximo 100 caracteres';
      return false;
    }

    if (this.unidadeSelecionada.sigla.length > 20) {
      this.erro = 'Sigla deve ter no máximo 20 caracteres';
      return false;
    }

    if (this.unidadeSelecionada.descricao && this.unidadeSelecionada.descricao.length > 500) {
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
      
    if (confirm(mensagem)) {
      const observable = unidade.ativo
        ? this.unidadeService.inativar(unidade.id)
        : this.unidadeService.ativar(unidade.id);
        
      observable.subscribe({
        next: () => {
          this.sucesso = unidade.ativo
            ? 'Unidade inativada com sucesso!'
            : 'Unidade ativada com sucesso!';
          this.carregarUnidades();
          this.carregarEstatisticas();
        },
        error: (err) => {
          this.erro = err.error?.erro || `Erro ao ${unidade.ativo ? 'inativar' : 'ativar'} unidade`;
        }
      });
    }
  }
}