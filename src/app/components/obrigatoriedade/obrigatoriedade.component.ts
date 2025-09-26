import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ObrigatoriedadeService } from './obrigatoriedade.service';
import { Obrigatoriedade, ObrigatoriedadeEstatisticas } from './obrigatoriedade.model';

@Component({
  selector: 'app-obrigatoriedade',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  exibirFormulario = false;
  carregando = false;
  erro: string | null = null;

  // Filtros e busca
  filtroAtivo = '';
  termoBusca = '';
  filtroVigencia = '';

  constructor(private obrigatoriedadeService: ObrigatoriedadeService) {}

  ngOnInit(): void {
    this.carregarObrigatoriedades();
    this.carregarEstatisticas();
  }

  /**
   * Carrega todas as obrigatoriedades
   */
  carregarObrigatoriedades(): void {
    this.carregando = true;
    this.erro = null;

    this.obrigatoriedadeService.listarTodas().subscribe({
      next: (obrigatoriedades) => {
        this.obrigatoriedades = obrigatoriedades;
        this.aplicarFiltros();
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar obrigatoriedades:', erro);
        this.erro = 'Erro ao carregar obrigatoriedades. Tente novamente.';
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
   * Abre o formulário para nova obrigatoriedade
   */
  novaObrigatoriedadeFormulario(): void {
    this.novaObrigatoriedade = this.criarObrigatoriedadeVazia();
    this.modoEdicao = false;
    this.exibirFormulario = true;
    this.erro = null;
  }

  /**
   * Abre o formulário para editar obrigatoriedade
   */
  editarObrigatoriedade(obrigatoriedade: Obrigatoriedade): void {
    this.novaObrigatoriedade = { ...obrigatoriedade };
    this.modoEdicao = true;
    this.exibirFormulario = true;
    this.erro = null;
  }

  /**
   * Cancela a edição/criação
   */
  cancelarEdicao(): void {
    this.exibirFormulario = false;
    this.modoEdicao = false;
    this.novaObrigatoriedade = this.criarObrigatoriedadeVazia();
    this.erro = null;
  }

  /**
   * Salva a obrigatoriedade (criar ou atualizar)
   */
  salvarObrigatoriedade(): void {
    if (!this.validarObrigatoriedade()) {
      return;
    }

    this.carregando = true;
    this.erro = null;

    const operacao = this.modoEdicao 
      ? this.obrigatoriedadeService.atualizar(this.novaObrigatoriedade.id!, this.novaObrigatoriedade)
      : this.obrigatoriedadeService.criar(this.novaObrigatoriedade);

    operacao.subscribe({
      next: () => {
        this.carregarObrigatoriedades();
        this.carregarEstatisticas();
        this.cancelarEdicao();
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao salvar obrigatoriedade:', erro);
        this.erro = 'Erro ao salvar obrigatoriedade. Verifique os dados e tente novamente.';
        this.carregando = false;
      }
    });
  }

  /**
   * Exclui uma obrigatoriedade
   */
  excluirObrigatoriedade(obrigatoriedade: Obrigatoriedade): void {
    if (!confirm(`Tem certeza que deseja excluir a obrigatoriedade "${obrigatoriedade.nome}"?`)) {
      return;
    }

    this.carregando = true;
    this.erro = null;

    this.obrigatoriedadeService.excluir(obrigatoriedade.id!).subscribe({
      next: () => {
        this.carregarObrigatoriedades();
        this.carregarEstatisticas();
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao excluir obrigatoriedade:', erro);
        this.erro = 'Erro ao excluir obrigatoriedade. Ela pode estar sendo usada em outros registros.';
        this.carregando = false;
      }
    });
  }

  /**
   * Alterna o status ativo/inativo da obrigatoriedade
   */
  alternarStatus(obrigatoriedade: Obrigatoriedade): void {
    if (!obrigatoriedade.id) return;
    
    const mensagem = obrigatoriedade.ativo
      ? 'Tem certeza que deseja desativar esta obrigatoriedade?'
      : 'Tem certeza que deseja ativar esta obrigatoriedade?';
      
    if (confirm(mensagem)) {
      this.carregando = true;
      this.erro = null;

      const operacao = obrigatoriedade.ativo 
        ? this.obrigatoriedadeService.desativar(obrigatoriedade.id!)
        : this.obrigatoriedadeService.ativar(obrigatoriedade.id!);

      operacao.subscribe({
        next: () => {
          this.carregarObrigatoriedades();
          this.carregarEstatisticas();
          this.carregando = false;
        },
        error: (erro) => {
          console.error('Erro ao alterar status:', erro);
          this.erro = 'Erro ao alterar status da obrigatoriedade.';
          this.carregando = false;
        }
      });
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
      this.erro = 'Nome da obrigatoriedade é obrigatório.';
      return false;
    }

    if (this.novaObrigatoriedade.nome.length > 100) {
      this.erro = 'Nome deve ter no máximo 100 caracteres.';
      return false;
    }

    if (this.novaObrigatoriedade.descricao && this.novaObrigatoriedade.descricao.length > 1000) {
      this.erro = 'Descrição deve ter no máximo 1000 caracteres.';
      return false;
    }

    if (this.novaObrigatoriedade.dataInicio && this.novaObrigatoriedade.dataFim) {
      if (this.novaObrigatoriedade.dataInicio > this.novaObrigatoriedade.dataFim) {
        this.erro = 'Data de início não pode ser posterior à data de fim.';
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