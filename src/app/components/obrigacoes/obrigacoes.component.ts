import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
  import { NormaService } from '../normas/norma.service';
import { UnidadeService } from '../unidades/unidade.service';
import { ToastService } from '../../services/toast.service';
import { DialogComponent } from '../dialog/dialog.component';
import { HasPermissionDirective, HasRoleDirective } from '../../directives/permission.directive';
import { Resources, Actions } from '../../models/user.model';
import {
  Obrigacao,
  ObrigacaoForm,
  ObrigacaoFiltro,
  ObrigacaoEstatisticas,
  DesdobramentoRequest,
  Evidencia,
  PlanoAcao,
  ObrigacaoResponsavel
} from '../../models/obrigacao.model';
import { Norma } from '../normas/norma.model';
import { Unidade } from '../unidades/unidade.model';
import { ObrigacaoService } from './obrigacao.service';
import { ObrigacaoResponsavelService } from './obrigacao-responsavel.service';

@Component({
  selector: 'app-obrigacoes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogComponent,
    HasPermissionDirective,
    HasRoleDirective
  ],
  templateUrl: './obrigacoes.component.html',
  styleUrl: './obrigacoes.component.css'
})
export class ObrigacoesComponent implements OnInit {
  // Listas de dados
  obrigacoes: Obrigacao[] = [];
  normas: Norma[] = [];
  unidades: Unidade[] = [];
  obrigacoesDisponiveis: Obrigacao[] = []; // Para relacionamentos

  // Paginação
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;

  // Estados da interface
  mostrarFormulario = false;
  carregando = false;
  obrigacaoEditando: Obrigacao | null = null;
  mostrarDetalhes = false;
  obrigacaoDetalhes: Obrigacao | null = null;
  mostrarDesdobramento = false;
  obrigacaoDesdobramento: Obrigacao | null = null;
  unidadesSelecionadasDesdobramento: number[] = [];
  observacoesDesdobramento = '';
  
  // Propriedades para evidências
  evidenciasObrigacao: Evidencia[] = [];
  planosObrigacao: PlanoAcao[] = [];
  mostrarDetalhesResponsavel = false;
  responsavelDetalhes: ObrigacaoResponsavel | null = null;
  
  // Mensagens de feedback
  erro: string | null = null;
  sucesso: string | null = null;

  // Filtros
  filtros: ObrigacaoFiltro = {};
  
  // Formulário
  obrigacaoForm: ObrigacaoForm = this.novoObrigacaoForm();

  // Estatísticas
  estatisticas: ObrigacaoEstatisticas | null = null;

  // Expor constants para o template
  Resources = Resources;
  Actions = Actions;

  // Opções para selects
  tiposObrigacao = [
    { value: 'recomendacao', label: 'Recomendação' },
    { value: 'determinacao', label: 'Determinação' }
  ];

  recorrencias = [
    { value: 'unica', label: 'Única' },
    { value: 'mensal', label: 'Mensal' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' }
  ];

  prioridades = [
    { value: 'baixa', label: 'Baixa' },
    { value: 'media', label: 'Média' },
    { value: 'alta', label: 'Alta' },
    { value: 'critica', label: 'Crítica' }
  ];

  situacoes = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'conforme', label: 'Conforme' },
    { value: 'nao_conforme', label: 'Não Conforme' },
    { value: 'vencida', label: 'Vencida' }
  ];

  constructor(
    private obrigacaoService: ObrigacaoService,
    private normaService: NormaService,
    private unidadeService: UnidadeService,
    private obrigacaoResponsavelService: ObrigacaoResponsavelService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  /**
   * Carrega todos os dados necessários para o componente
   */
  carregarDados(): void {
    this.carregarObrigacoes();
    this.carregarNormas();
    this.carregarUnidades();
    this.carregarEstatisticas();
  }

  /**
   * Carrega a lista de obrigações com filtros aplicados
   */
  carregarObrigacoes(): void {
    this.carregando = true;
    this.erro = null;
    this.obrigacaoService.listarObrigacoes(this.currentPage, this.pageSize, this.filtros).subscribe({
      next: (response) => {
        this.obrigacoes = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.number;
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar obrigações:', error);
        // Verificar se é erro específico do backend
        if (error.status === 500) {
          this.erro = 'Erro interno do servidor. O endpoint de obrigações está temporariamente indisponível. ' +
                     'Entre em contato com o administrador do sistema.';
        } else {
          this.erro = 'Erro ao carregar obrigações';
        }
        this.toastService.error(this.erro);
        this.carregando = false;
      }
    });
  }

  /**
   * Carrega a lista de normas disponíveis
   */
  carregarNormas(): void {
    this.normaService.listarNormas(0, 1000).subscribe({
      next: (response) => {
        this.normas = response.content;
      },
      error: (error) => {
        console.error('Erro ao carregar normas:', error);
        this.toastService.error('Erro ao carregar normas');
      }
    });
  }

  /**
   * Carrega a lista de unidades disponíveis
   */
  carregarUnidades(): void {
    this.unidadeService.listarAtivas().subscribe({
      next: (unidades) => {
        this.unidades = unidades;
      },
      error: (error) => {
        console.error('Erro ao carregar unidades:', error);
        this.toastService.error('Erro ao carregar unidades');
      }
    });
  }

  carregarEstatisticas(): void {
    this.obrigacaoService.obterEstatisticas().subscribe({
      next: (estatisticas) => {
        this.estatisticas = estatisticas;
      },
      error: (error) => {
        console.error('Erro ao carregar estatísticas:', error);
      }
    });
  }

  carregarObrigacoesParaRelacionamento(): void {
    // Carrega todas as obrigações para permitir relacionamentos
    this.obrigacaoService.listarObrigacoes(0, 1000).subscribe({
      next: (response) => {
        this.obrigacoesDisponiveis = response.content.filter(o => 
          !this.obrigacaoEditando || o.id !== this.obrigacaoEditando.id
        );
      },
      error: (error) => {
        console.error('Erro ao carregar obrigações para relacionamento:', error);
      }
    });
  }

  // Métodos de formulário
  novoObrigacaoForm(): ObrigacaoForm {
    return {
      normaId: 0,
      titulo: '',
      descricao: '',
      tipo: 'recomendacao',
      unidadesResponsaveis: [],
      prazoConformidade: '',
      recorrencia: 'unica',
      obrigacoesAlteradas: [],
      prioridade: 'media',
      observacoes: ''
    };
  }

  abrirDialogNovaObrigacao(): void {
    this.obrigacaoEditando = null;
    this.obrigacaoForm = this.novoObrigacaoForm();
    this.carregarObrigacoesParaRelacionamento();
    this.mostrarFormulario = true;
  }

  novaObrigacao(): void {
    this.abrirDialogNovaObrigacao();
  }

  onDialogClosed(): void {
    this.mostrarFormulario = false;
    this.mostrarDetalhes = false;
    this.obrigacaoEditando = null;
    this.obrigacaoDetalhes = null;
    this.carregarObrigacoes();
  }

  editarObrigacao(obrigacao: Obrigacao): void {
    this.obrigacaoEditando = obrigacao;
    this.obrigacaoForm = {
      normaId: obrigacao.normaId,
      titulo: obrigacao.titulo,
      descricao: obrigacao.descricao,
      tipo: obrigacao.tipo,
      unidadesResponsaveis: [...(obrigacao.unidadesResponsaveis || [])],
      prazoConformidade: obrigacao.prazoConformidade,
      recorrencia: obrigacao.recorrencia,
      obrigacoesAlteradas: obrigacao.obrigacoesAlteradas ? [...obrigacao.obrigacoesAlteradas] : [],
      prioridade: obrigacao.prioridade,
      observacoes: obrigacao.observacoes || ''
    };
    this.carregarObrigacoesParaRelacionamento();
    this.mostrarFormulario = true;
  }

  /**
   * Salva a obrigação (criar nova ou atualizar existente)
   */
  salvar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.carregando = true;
    this.erro = null;

    if (this.obrigacaoEditando && this.obrigacaoEditando.id) {
      // Atualizar obrigação existente
      this.obrigacaoService.atualizarObrigacao(this.obrigacaoEditando.id, this.obrigacaoForm).subscribe({
        next: (obrigacao) => {
          console.log('Obrigação atualizada com sucesso:', obrigacao);
          this.toastService.saveSuccess(`Obrigação "${this.obrigacaoForm.titulo}"`);
          this.mostrarFormulario = false;
          this.carregarObrigacoes();
          this.carregarEstatisticas();
          this.carregando = false;
        },
        error: (error) => {
          console.error('Erro ao atualizar obrigação:', error);
          this.carregando = false;
          this.toastService.saveError(`Obrigação "${this.obrigacaoForm.titulo}"`, 'Verifique os dados e tente novamente.');
        }
      });
    } else {
      // Criar nova obrigação
      this.obrigacaoService.criarObrigacao(this.obrigacaoForm).subscribe({
        next: (obrigacao) => {
          console.log('Obrigação criada com sucesso:', obrigacao);
          this.toastService.saveSuccess(`Obrigação "${this.obrigacaoForm.titulo}"`);
          this.mostrarFormulario = false;
          this.carregarObrigacoes();
          this.carregarEstatisticas();
          this.carregando = false;
        },
        error: (error) => {
          console.error('Erro ao criar obrigação:', error);
          this.carregando = false;
          this.toastService.saveError(`Obrigação "${this.obrigacaoForm.titulo}"`, 'Verifique os dados e tente novamente.');
        }
      });
    }
  }

  excluirObrigacao(obrigacao: Obrigacao): void {
    if (!obrigacao.id) return;
    
    this.toastService.confirmDelete(obrigacao.titulo, () => {
      this.executarExclusaoObrigacao(obrigacao.id!, obrigacao.titulo);
    });
  }

  private executarExclusaoObrigacao(id: number, titulo: string): void {
    this.obrigacaoService.excluirObrigacao(id).subscribe({
      next: () => {
        console.log('Obrigação excluída com sucesso');
        this.toastService.deleteSuccess(titulo);
        this.carregarObrigacoes();
        this.carregarEstatisticas();
      },
      error: (error) => {
        console.error('Erro ao excluir obrigação:', error);
        this.toastService.deleteError(titulo, 'Verifique se não há dependências e tente novamente.');
      }
    });
  }

  // Validação
  validarFormulario(): boolean {
    if (!this.obrigacaoForm.titulo.trim()) {
      this.toastService.warning('Campo obrigatório', 'O título da obrigação é obrigatório');
      return false;
    }

    if (!this.obrigacaoForm.descricao.trim()) {
      this.toastService.warning('Campo obrigatório', 'A descrição da obrigação é obrigatória');
      return false;
    }

    if (!this.obrigacaoForm.normaId || this.obrigacaoForm.normaId === 0) {
      this.toastService.warning('Campo obrigatório', 'A norma vinculada é obrigatória');
      return false;
    }

    if (!this.obrigacaoForm.unidadesResponsaveis.length) {
      this.toastService.warning('Campo obrigatório', 'Pelo menos uma unidade responsável deve ser selecionada');
      return false;
    }

    if (!this.obrigacaoForm.prazoConformidade) {
      this.toastService.warning('Campo obrigatório', 'O prazo de conformidade é obrigatório');
      return false;
    }

    return true;
  }

  // Métodos de utilidade
  getNomaNorma(normaId: number): string {
    const norma = this.normas.find(n => n.id === normaId);
    return norma ? norma.nome : 'Norma não encontrada';
  }

  getNomeUnidade(unidadeId: number): string {
    const unidade = this.unidades.find(u => u.id === unidadeId);
    return unidade ? unidade.nome : 'Unidade não encontrada';
  }

  getNomesUnidades(unidadeIds: number[]): string {
    if (!unidadeIds || !Array.isArray(unidadeIds) || unidadeIds.length === 0) {
      return 'Nenhuma unidade responsável';
    }
    const nomes = unidadeIds.map(id => this.getNomeUnidade(id));
    return nomes.join(', ');
  }

  getTipoLabel(tipo: string): string {
    const tipoObj = this.tiposObrigacao.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }

  getPrioridadeLabel(prioridade: string): string {
    const prioridadeObj = this.prioridades.find(p => p.value === prioridade);
    return prioridadeObj ? prioridadeObj.label : prioridade;
  }

  getSituacaoLabel(situacao: string): string {
    const situacaoObj = this.situacoes.find(s => s.value === situacao);
    return situacaoObj ? situacaoObj.label : situacao;
  }

  getSituacaoClass(situacao: string): string {
    const classes = {
      'pendente': 'status-pendente',
      'em_andamento': 'status-andamento',
      'conforme': 'status-conforme',
      'nao_conforme': 'status-nao-conforme',
      'vencida': 'status-vencida'
    };
    return classes[situacao as keyof typeof classes] || '';
  }

  getPrioridadeClass(prioridade: string): string {
    const classes = {
      'baixa': 'prioridade-baixa',
      'media': 'prioridade-media',
      'alta': 'prioridade-alta',
      'critica': 'prioridade-critica'
    };
    return classes[prioridade as keyof typeof classes] || '';
  }

  // Paginação
  proximaPagina(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.carregarObrigacoes();
    }
  }

  paginaAnterior(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.carregarObrigacoes();
    }
  }

  // Filtros
  aplicarFiltros(): void {
    this.currentPage = 0;
    this.carregarObrigacoes();
  }

  limparFiltros(): void {
    this.filtros = {};
    this.currentPage = 0;
    this.carregarObrigacoes();
  }

  // Detalhes
  verDetalhes(obrigacao: Obrigacao): void {
    this.obrigacaoDetalhes = obrigacao;
    this.mostrarDetalhes = true;
    this.carregarEvidenciasObrigacao(obrigacao.id!);
  }

  /**
   * Navega para a página de detalhamento completo ACR da obrigação
   */
  verDetalhamentoACR(obrigacao: Obrigacao): void {
    this.router.navigate(['/obrigacoes', obrigacao.id, 'detalhamento']);
  }

  /**
   * Carrega todas as evidências e planos de ação dos responsáveis da obrigação
   */
  carregarEvidenciasObrigacao(obrigacaoId: number): void {
    if (!this.obrigacaoDetalhes?.responsaveis) {
      this.evidenciasObrigacao = [];
      this.planosObrigacao = [];
      return;
    }

    // Carregar evidências de todos os responsáveis
    const evidenciasPromises = this.obrigacaoDetalhes.responsaveis.map((responsavel: any) =>
      this.obrigacaoResponsavelService.listarEvidenciasPorResponsavel(responsavel.id).toPromise()
    );

    // Carregar planos de ação de todos os responsáveis
    const planosPromises = this.obrigacaoDetalhes.responsaveis.map((responsavel: any) =>
      this.obrigacaoResponsavelService.listarPlanosPorResponsavel(responsavel.id).toPromise()
    );

    Promise.all(evidenciasPromises).then(evidenciasArrays => {
      // Flatten all evidências arrays into one, filtering out undefined results
      this.evidenciasObrigacao = evidenciasArrays.filter(arr => arr !== undefined).flat();
    }).catch(error => {
      console.error('Erro ao carregar evidências:', error);
      this.evidenciasObrigacao = [];
    });

    Promise.all(planosPromises).then(planosArrays => {
      // Flatten all planos arrays into one, filtering out undefined results
      this.planosObrigacao = planosArrays.filter(arr => arr !== undefined).flat();
    }).catch(error => {
      console.error('Erro ao carregar planos de ação:', error);
      this.planosObrigacao = [];
    });
  }

  fecharDialog(): void {
    this.mostrarFormulario = false;
    this.mostrarDetalhes = false;
  }

  // Controle de seleção de unidades
  isUnidadeSelecionada(unidadeId: number): boolean {
    return this.obrigacaoForm.unidadesResponsaveis.includes(unidadeId);
  }

  toggleUnidade(unidadeId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.obrigacaoForm.unidadesResponsaveis.includes(unidadeId)) {
        this.obrigacaoForm.unidadesResponsaveis.push(unidadeId);
      }
    } else {
      this.obrigacaoForm.unidadesResponsaveis = this.obrigacaoForm.unidadesResponsaveis.filter(id => id !== unidadeId);
    }
  }

  // Controle de seleção de obrigações alteradas
  isObrigacaoAlteradaSelecionada(obrigacaoId: number): boolean {
    return this.obrigacaoForm.obrigacoesAlteradas?.includes(obrigacaoId) || false;
  }

  toggleObrigacaoAlterada(obrigacaoId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (!this.obrigacaoForm.obrigacoesAlteradas) {
      this.obrigacaoForm.obrigacoesAlteradas = [];
    }

    if (checkbox.checked) {
      if (!this.obrigacaoForm.obrigacoesAlteradas.includes(obrigacaoId)) {
        this.obrigacaoForm.obrigacoesAlteradas.push(obrigacaoId);
      }
    } else {
      this.obrigacaoForm.obrigacoesAlteradas = this.obrigacaoForm.obrigacoesAlteradas.filter(id => id !== obrigacaoId);
    }
  }

  // Desdobramento de obrigações
  abrirDialogDesdobramento(obrigacao: Obrigacao): void {
    this.obrigacaoDesdobramento = obrigacao;
    this.unidadesSelecionadasDesdobramento = [];
    this.observacoesDesdobramento = '';
    this.mostrarDesdobramento = true;
  }

  fecharDialogDesdobramento(): void {
    this.mostrarDesdobramento = false;
    this.obrigacaoDesdobramento = null;
    this.unidadesSelecionadasDesdobramento = [];
    this.observacoesDesdobramento = '';
  }

  isUnidadeSelecionadaDesdobramento(unidadeId: number): boolean {
    return this.unidadesSelecionadasDesdobramento.includes(unidadeId);
  }

  toggleUnidadeDesdobramento(unidadeId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.unidadesSelecionadasDesdobramento.includes(unidadeId)) {
        this.unidadesSelecionadasDesdobramento.push(unidadeId);
      }
    } else {
      this.unidadesSelecionadasDesdobramento = this.unidadesSelecionadasDesdobramento.filter(id => id !== unidadeId);
    }
  }

  executarDesdobramento(): void {
    if (!this.obrigacaoDesdobramento?.id) {
      this.toastService.error('Obrigação inválida');
      return;
    }

    if (this.unidadesSelecionadasDesdobramento.length === 0) {
      this.toastService.warning('Selecione pelo menos uma unidade', 'É necessário selecionar ao menos uma unidade para desdobrar a obrigação.');
      return;
    }

    this.carregando = true;
    const request: DesdobramentoRequest = {
      obrigacaoId: this.obrigacaoDesdobramento.id,
      unidadesIds: this.unidadesSelecionadasDesdobramento,
      observacoes: this.observacoesDesdobramento || undefined
    };

    this.obrigacaoService.desdobrarObrigacao(request).subscribe({
      next: (response) => {
        console.log('Obrigação desdobrada com sucesso:', response);
        this.toastService.success(
          'Desdobramento realizado com sucesso',
          `Foram criadas ${response.totalDesdobradas} obrigações filhas.`
        );
        this.fecharDialogDesdobramento();
        this.carregarObrigacoes();
        this.carregarEstatisticas();
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao desdobrar obrigação:', error);
        this.carregando = false;
        const mensagem = error.error?.erro || error.error?.message || 'Verifique os dados e tente novamente.';
        this.toastService.error('Erro ao desdobrar obrigação', mensagem);
      }
    });
  }

  verObrigacoesFilhas(obrigacao: Obrigacao): void {
    if (!obrigacao.id) return;

    this.obrigacaoService.buscarObrigacoesFilhas(obrigacao.id).subscribe({
      next: (filhas) => {
        console.log('Obrigações filhas:', filhas);
        if (filhas.length === 0) {
          this.toastService.info('Nenhuma obrigação filha', 'Esta obrigação ainda não possui obrigações filhas.');
        } else {
          // Aplicar filtro para mostrar apenas as obrigações filhas
          this.filtros = { ...this.filtros };
          this.currentPage = 0;
          this.obrigacoes = filhas;
          this.totalElements = filhas.length;
          this.totalPages = 1;
          this.toastService.info(
            'Obrigações filhas',
            `Mostrando ${filhas.length} obrigação(ões) filha(s). Limpe os filtros para ver todas as obrigações.`
          );
        }
      },
      error: (error) => {
        console.error('Erro ao buscar obrigações filhas:', error);
        this.toastService.error('Erro ao buscar obrigações filhas');
      }
    });
  }

  /**
   * Retorna a classe CSS baseada na situação do responsável
   */
  getClasseSituacao(situacao: string): string {
    switch (situacao) {
      case 'conforme': return 'responsavel-status conforme';
      case 'nao_conforme': return 'responsavel-status nao-conforme';
      case 'pendente': return 'responsavel-status pendente';
      case 'em_analise': return 'responsavel-status em-analise';
      default: return 'responsavel-status pendente';
    }
  }

  /**
   * Exibe os detalhes de um responsável específico
   */
  verDetalhesResponsavel(responsavel: ObrigacaoResponsavel): void {
    if (!responsavel.id) {
      console.error('Responsável sem ID');
      return;
    }

    // Buscar dados completos do responsável incluindo evidências e planos
    this.obrigacaoResponsavelService.buscarPorId(responsavel.id).subscribe({
      next: (detalhes) => {
        this.responsavelDetalhes = detalhes;
        this.mostrarDetalhesResponsavel = true;
      },
      error: (error) => {
        console.error('Erro ao carregar detalhes do responsável:', error);
        alert('Erro ao carregar detalhes do responsável. Tente novamente.');
      }
    });
  }

  /**
   * Fecha o modal de detalhes do responsável
   */
  fecharDetalhesResponsavel(): void {
    this.mostrarDetalhesResponsavel = false;
    this.responsavelDetalhes = null;
  }

  /**
   * Obtém o nome da unidade pelo ID do responsável
   */
  getNomeUnidadePorId(responsavelId: number): string {
    if (!this.obrigacaoDetalhes?.responsaveis) return 'Unidade não encontrada';
    
    const responsavel = this.obrigacaoDetalhes.responsaveis.find((r: any) => r.id === responsavelId);
    return responsavel?.nomeUnidade || 'Unidade não encontrada';
  }

  /**
   * Obtém as evidências de um responsável específico
   */
  getEvidenciasResponsavel(responsavelId: number): Evidencia[] {
    return this.evidenciasObrigacao.filter(e => e.obrigacaoResponsavelId === responsavelId);
  }

  /**
   * Obtém os planos de ação de um responsável específico
   */
  getPlanosResponsavel(responsavelId: number): PlanoAcao[] {
    return this.planosObrigacao.filter(p => p.obrigacaoResponsavelId === responsavelId);
  }

  /**
   * Retorna a classe CSS para o status do plano de ação
   */
  getClasseStatusPlano(status: string | undefined): string {
    switch (status) {
      case 'planejado': return 'status-planejado';
      case 'em_andamento': return 'status-andamento';
      case 'concluido': return 'status-concluido';
      case 'cancelado': return 'status-cancelado';
      default: return 'status-desconhecido';
    }
  }

}