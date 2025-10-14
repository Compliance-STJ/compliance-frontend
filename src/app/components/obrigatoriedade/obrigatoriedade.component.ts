import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ObrigatoriedadeService } from './obrigatoriedade.service';
import { Obrigatoriedade, ObrigatoriedadeEstatisticas } from './obrigatoriedade.model';
import { ToastService } from '../../services/toast.service';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-obrigatoriedade',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogComponent],
  templateUrl: './obrigatoriedade.component.html',
  styleUrls: ['./obrigatoriedade.component.css']
})
export class ObrigatoriedadeComponent implements OnInit {
  obrigatoriedades: Obrigatoriedade[] = [];
  obrigatoriedadesFiltradas: Obrigatoriedade[] = [];
  obrigatoriedadeSelecionada: Obrigatoriedade | null = null;
  novaObrigatoriedade: Obrigatoriedade = this.criarObrigatoriedadeVazia();
  estatisticas: ObrigatoriedadeEstatisticas | null = null;

  // Estado da aplicação
  modoEdicao = false;
  mostrarFormulario = false;
  obrigatoriedadeEditando: Obrigatoriedade | null = null;
  carregando = false;

  // Filtros e busca
  filtroAtivo = '';
  termoBusca = '';
  filtroVigencia = '';

  constructor(
    private obrigatoriedadeService: ObrigatoriedadeService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.carregarObrigatoriedades();
    this.carregarEstatisticas();
  }

  /**
   * Carrega todas as obrigatoriedades
   */
  carregarObrigatoriedades(): void {
    this.carregando = true;

    this.obrigatoriedadeService.listarTodas().subscribe({
      next: (obrigatoriedades) => {
        this.obrigatoriedades = obrigatoriedades;
        this.aplicarFiltros();
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar obrigatoriedades:', erro);
        this.toastService.loadError('obrigatoriedades');
        this.carregando = false;
      }
    });
  }

  /**
   * Carrega estatísticas das obrigatoriedades
   */
  carregarEstatisticas(): void {
    this.obrigatoriedadeService.obterEstatisticas().subscribe({
      next: (estatisticas) => {
        this.estatisticas = estatisticas;
      },
      error: (erro) => {
        console.error('Erro ao carregar estatísticas:', erro);
      }
    });
  }

  /**
   * Aplica filtros na lista de obrigatoriedades
   */
  aplicarFiltros(): void {
    let obrigatoriedadesFiltradas = [...this.obrigatoriedades];

    // Filtro por status ativo
    if (this.filtroAtivo === 'true') {
      obrigatoriedadesFiltradas = obrigatoriedadesFiltradas.filter(o => o.ativo);
    } else if (this.filtroAtivo === 'false') {
      obrigatoriedadesFiltradas = obrigatoriedadesFiltradas.filter(o => !o.ativo);
    }

    // Filtro por vigência
    if (this.filtroVigencia === 'vigentes') {
      const hoje = new Date().toISOString().split('T')[0];
      obrigatoriedadesFiltradas = obrigatoriedadesFiltradas.filter(o => {
        const inicioValido = !o.dataInicio || o.dataInicio <= hoje;
        const fimValido = !o.dataFim || o.dataFim >= hoje;
        return o.ativo && inicioValido && fimValido;
      });
    }

    // Filtro por termo de busca
    if (this.termoBusca.trim()) {
      const termo = this.termoBusca.toLowerCase().trim();
      obrigatoriedadesFiltradas = obrigatoriedadesFiltradas.filter(o =>
        o.nome.toLowerCase().includes(termo) ||
        (o.descricao && o.descricao.toLowerCase().includes(termo))
      );
    }

    this.obrigatoriedadesFiltradas = obrigatoriedadesFiltradas;
  }

  /**
   * Limpa todos os filtros
   */
  limparFiltros(): void {
    this.filtroAtivo = '';
    this.termoBusca = '';
    this.filtroVigencia = '';
    this.aplicarFiltros();
  }

  /**
   * Abre o dialog para nova obrigatoriedade
   */
  novaObrigatoriedadeFormulario(): void {
    this.novaObrigatoriedade = this.criarObrigatoriedadeVazia();
    this.obrigatoriedadeEditando = null;
    this.mostrarFormulario = true;
  }

  /**
   * Abre o dialog para editar obrigatoriedade
   */
  editarObrigatoriedade(obrigatoriedade: Obrigatoriedade): void {
    this.novaObrigatoriedade = { ...obrigatoriedade };
    this.obrigatoriedadeEditando = obrigatoriedade;
    this.mostrarFormulario = true;
  }

  /**
   * Cancela a edição/criação e fecha o dialog
   */
  cancelarEdicao(): void {
    this.mostrarFormulario = false;
    this.obrigatoriedadeEditando = null;
    this.novaObrigatoriedade = this.criarObrigatoriedadeVazia();
  }

  /**
   * Método chamado quando o dialog é fechado
   */
  onDialogClosed(): void {
    this.cancelarEdicao();
  }

  /**
   * Salva a obrigatoriedade (criar ou atualizar)
   */
  salvarObrigatoriedade(): void {
    if (!this.validarObrigatoriedade()) {
      return;
    }

    this.carregando = true;

    const operacao = this.obrigatoriedadeEditando
      ? this.obrigatoriedadeService.atualizar(this.novaObrigatoriedade.id!, this.novaObrigatoriedade)
      : this.obrigatoriedadeService.criar(this.novaObrigatoriedade);

    operacao.subscribe({
      next: () => {
        this.toastService.saveSuccess('Obrigatoriedade');
        this.carregarObrigatoriedades();
        this.carregarEstatisticas();
        this.cancelarEdicao();
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao salvar obrigatoriedade:', erro);
        this.toastService.saveError('obrigatoriedade', 'Verifique os dados e tente novamente');
        this.carregando = false;
      }
    });
  }

  /**
   * Exclui uma obrigatoriedade
   */
  excluirObrigatoriedade(obrigatoriedade: Obrigatoriedade): void {
    this.toastService.confirmDelete(obrigatoriedade.nome, () => {
      this.carregando = true;
  
      this.obrigatoriedadeService.excluir(obrigatoriedade.id!).subscribe({
        next: () => {
          this.toastService.deleteSuccess('Obrigatoriedade');
          this.carregarObrigatoriedades();
          this.carregarEstatisticas();
          this.carregando = false;
        },
        error: (erro) => {
          console.error('Erro ao excluir obrigatoriedade:', erro);
          this.toastService.deleteError('obrigatoriedade', 'Ela pode estar sendo usada em outros registros');
          this.carregando = false;
        }
      });
    });
  }

  /**
   * Alterna o status ativo/inativo da obrigatoriedade
   */
  alternarStatus(obrigatoriedade: Obrigatoriedade): void {
    if (!obrigatoriedade.id) return;

    const executarAlteracao = () => {
      this.carregando = true;

      const operacao = obrigatoriedade.ativo
        ? this.obrigatoriedadeService.desativar(obrigatoriedade.id!)
        : this.obrigatoriedadeService.ativar(obrigatoriedade.id!);

      operacao.subscribe({
        next: () => {
          this.toastService.operationSuccess(`${obrigatoriedade.ativo ? 'Desativação' : 'Ativação'} da obrigatoriedade`);
          this.carregarObrigatoriedades();
          this.carregarEstatisticas();
          this.carregando = false;
        },
        error: (erro) => {
          console.error('Erro ao alterar status:', erro);
          const errorMessage = erro.error?.erro || erro.message || 'Erro desconhecido';
          this.toastService.error('Erro ao alterar status', errorMessage);
          this.carregando = false;
        }
      });
    };

    if (obrigatoriedade.ativo) {
      this.toastService.confirmDeactivate(obrigatoriedade.nome, executarAlteracao);
    } else {
      this.toastService.confirmActivate(obrigatoriedade.nome, executarAlteracao);
    }
  }

  /**
   * Seleciona uma obrigatoriedade para visualizar detalhes
   */
  selecionarObrigatoriedade(obrigatoriedade: Obrigatoriedade): void {
    this.obrigatoriedadeSelecionada = obrigatoriedade;
  }

  /**
   * Valida os dados da obrigatoriedade
   */
  private validarObrigatoriedade(): boolean {
    if (!this.novaObrigatoriedade.nome?.trim()) {
      this.toastService.warning('Campo obrigatório', 'Nome da obrigatoriedade é obrigatório');
      return false;
    }

    if (this.novaObrigatoriedade.nome.length > 100) {
      this.toastService.warning('Limite excedido', 'Nome deve ter no máximo 100 caracteres');
      return false;
    }

    if (this.novaObrigatoriedade.descricao && this.novaObrigatoriedade.descricao.length > 1000) {
      this.toastService.warning('Limite excedido', 'Descrição deve ter no máximo 1000 caracteres');
      return false;
    }

    if (this.novaObrigatoriedade.dataInicio && this.novaObrigatoriedade.dataFim) {
      if (this.novaObrigatoriedade.dataInicio > this.novaObrigatoriedade.dataFim) {
        this.toastService.warning('Datas inválidas', 'Data de início não pode ser posterior à data de fim');
        return false;
      }
    }

    return true;
  }

  /**
   * Cria uma obrigatoriedade vazia
   */
  private criarObrigatoriedadeVazia(): Obrigatoriedade {
    return {
      nome: '',
      descricao: '',
      ativo: true,
      dataInicio: '',
      dataFim: '',
      ordem: undefined
    };
  }

  /**
   * Verifica se uma obrigatoriedade está vigente
   */
  isVigente(obrigatoriedade: Obrigatoriedade): boolean {
    if (!obrigatoriedade.ativo) return false;
    
    const hoje = new Date().toISOString().split('T')[0];
    const inicioValido = !obrigatoriedade.dataInicio || obrigatoriedade.dataInicio <= hoje;
    const fimValido = !obrigatoriedade.dataFim || obrigatoriedade.dataFim >= hoje;
    
    return inicioValido && fimValido;
  }

  /**
   * Formata data para exibição
   */
  formatarData(data: string | undefined): string {
    if (!data) return '-';
    
    // Se a data já contém informação de hora (ISO format), usa diretamente
    if (data.includes('T')) {
      return new Date(data).toLocaleDateString('pt-BR');
    }
    
    // Se é apenas uma data (YYYY-MM-DD), adiciona o horário
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  }
}