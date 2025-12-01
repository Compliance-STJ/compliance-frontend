import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { ObrigacaoResponsavelService } from '../obrigacoes/obrigacao-responsavel.service';
import { ObrigacaoService } from '../obrigacoes/obrigacao.service';
import { UnidadeService } from '../unidades/unidade.service';
import { HasPermissionDirective } from '../../directives/permission.directive';
import {
  ObrigacaoResponsavel,
  Obrigacao,
  Evidencia,
  PlanoAcao
} from '../../models/obrigacao.model';
import { Unidade } from '../unidades/unidade.model';

@Component({
  selector: 'app-obrigacoes-usuario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HasPermissionDirective
  ],
  templateUrl: './obrigacoes-usuario.component.html',
  styleUrl: './obrigacoes-usuario.component.css'
})
export class ObrigacoesUsuarioComponent implements OnInit {

  // Dados do usuário atual (simulado - em produção viria do serviço de auth)
  usuarioUnidadeId = 1; // TODO: Obter da autenticação

  // Listas de dados
  obrigacoesResponsavel: ObrigacaoResponsavel[] = [];
  obrigacoesDetalhes: { [key: number]: Obrigacao } = {};
  evidencias: { [key: number]: Evidencia[] } = {};
  planos: { [key: number]: PlanoAcao[] } = {};

  // Estados da interface
  carregando = false;
  erro: string | null = null;

  // Filtros
  filtroSituacao: string = '';
  filtroPrioridade: string = '';

  // Modais
  mostrarDetalhes = false;
  mostrarEvidencias = false;
  mostrarPlanos = false;
  mostrarFormularioEvidencia = false;
  mostrarFormularioPlano = false;

  // Dados dos modais
  obrigacaoSelecionada: Obrigacao | null = null;
  responsavelSelecionado: ObrigacaoResponsavel | null = null;

  // Formulários
  evidenciaForm: Partial<Evidencia> = {};
  planoForm: Partial<PlanoAcao> = {};

  constructor(
    private route: ActivatedRoute,
    private obrigacaoResponsavelService: ObrigacaoResponsavelService,
    private obrigacaoService: ObrigacaoService,
    private unidadeService: UnidadeService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.carregarObrigacoes();
  }

  /**
   * Carrega as obrigações atribuídas ao usuário
   */
  carregarObrigacoes(): void {
    this.carregando = true;
    this.erro = null;

    this.obrigacaoResponsavelService.listarPorUnidade(this.usuarioUnidadeId)
      .subscribe({
        next: (responsaveis) => {
          this.obrigacoesResponsavel = responsaveis;
          this.carregarDetalhesObrigacoes(responsaveis);
          this.carregando = false;
        },
        error: (error) => {
          this.erro = 'Erro ao carregar obrigações';
          this.toastService.error('Erro ao carregar obrigações');
          this.carregando = false;
          console.error('Erro ao carregar obrigações:', error);
        }
      });
  }

  /**
   * Carrega os detalhes das obrigações
   */
  private carregarDetalhesObrigacoes(responsaveis: ObrigacaoResponsavel[]): void {
    const obrigacaoIds = [...new Set(responsaveis.map(r => r.obrigacaoId))];

    obrigacaoIds.forEach(id => {
      this.obrigacaoService.buscarObrigacao(id).subscribe({
        next: (obrigacao: Obrigacao) => {
          this.obrigacoesDetalhes[id] = obrigacao;
        },
        error: (error: any) => {
          console.error(`Erro ao carregar obrigação ${id}:`, error);
        }
      });
    });
  }

  /**
   * Retorna as obrigações filtradas
   */
  get obrigacoesFiltradas(): ObrigacaoResponsavel[] {
    let filtradas = this.obrigacoesResponsavel;

    if (this.filtroSituacao) {
      filtradas = filtradas.filter(r => r.situacao === this.filtroSituacao);
    }

    if (this.filtroPrioridade) {
      filtradas = filtradas.filter(responsavel => {
        const obrigacao = this.obrigacoesDetalhes[responsavel.obrigacaoId];
        return obrigacao && obrigacao.prioridade === this.filtroPrioridade;
      });
    }

    // Ordenar por prioridade (crítica > alta > média > baixa)
    return filtradas.sort((a, b) => {
      const obrigacaoA = this.obrigacoesDetalhes[a.obrigacaoId];
      const obrigacaoB = this.obrigacoesDetalhes[b.obrigacaoId];

      if (!obrigacaoA || !obrigacaoB) return 0;

      const prioridadeOrder = { 'critica': 4, 'alta': 3, 'media': 2, 'baixa': 1 };
      return prioridadeOrder[obrigacaoB.prioridade] - prioridadeOrder[obrigacaoA.prioridade];
    });
  }

  /**
   * Retorna obrigações pendentes (situação diferente de conforme)
   */
  get obrigacoesPendentes(): ObrigacaoResponsavel[] {
    return this.obrigacoesFiltradas.filter(r => r.situacao !== 'conforme');
  }

  /**
   * Retorna obrigações conformes
   */
  get obrigacoesConformes(): ObrigacaoResponsavel[] {
    return this.obrigacoesFiltradas.filter(r => r.situacao === 'conforme');
  }

  /**
   * Abre modal de detalhes da obrigação
   */
  abrirDetalhes(responsavel: ObrigacaoResponsavel): void {
    this.responsavelSelecionado = responsavel;
    this.obrigacaoSelecionada = this.obrigacoesDetalhes[responsavel.obrigacaoId];
    this.mostrarDetalhes = true;
  }

  /**
   * Fecha modal de detalhes
   */
  fecharDetalhes(): void {
    this.mostrarDetalhes = false;
    this.obrigacaoSelecionada = null;
    this.responsavelSelecionado = null;
  }

  /**
   * Carrega evidências de um responsável
   */
  carregarEvidencias(responsavelId: number): void {
    if (!this.evidencias[responsavelId]) {
      this.obrigacaoResponsavelService.listarEvidenciasPorResponsavel(responsavelId)
        .subscribe({
          next: (evidencias) => {
            this.evidencias[responsavelId] = evidencias;
          },
          error: (error) => {
            console.error('Erro ao carregar evidências:', error);
          }
        });
    }
  }

  /**
   * Carrega planos de ação de um responsável
   */
  carregarPlanos(responsavelId: number): void {
    if (!this.planos[responsavelId]) {
      this.obrigacaoResponsavelService.listarPlanosPorResponsavel(responsavelId)
        .subscribe({
          next: (planos) => {
            this.planos[responsavelId] = planos;
          },
          error: (error) => {
            console.error('Erro ao carregar planos:', error);
          }
        });
    }
  }

  /**
   * Abre modal de evidências
   */
  abrirEvidencias(responsavel: ObrigacaoResponsavel): void {
    this.responsavelSelecionado = responsavel;
    this.carregarEvidencias(responsavel.id!);
    this.mostrarEvidencias = true;
  }

  /**
   * Fecha modal de evidências
   */
  fecharEvidencias(): void {
    this.mostrarEvidencias = false;
    this.responsavelSelecionado = null;
  }

  /**
   * Abre modal de planos de ação
   */
  abrirPlanos(responsavel: ObrigacaoResponsavel): void {
    this.responsavelSelecionado = responsavel;
    this.carregarPlanos(responsavel.id!);
    this.mostrarPlanos = true;
  }

  /**
   * Fecha modal de planos
   */
  fecharPlanos(): void {
    this.mostrarPlanos = false;
    this.responsavelSelecionado = null;
  }

  /**
   * Abre formulário para adicionar evidência
   */
  abrirFormularioEvidencia(responsavel: ObrigacaoResponsavel): void {
    this.responsavelSelecionado = responsavel;
    this.evidenciaForm = {
      obrigacaoResponsavelId: responsavel.id,
      tipo: 'texto'
    };
    this.mostrarFormularioEvidencia = true;
  }

  /**
   * Fecha formulário de evidência
   */
  fecharFormularioEvidencia(): void {
    this.mostrarFormularioEvidencia = false;
    this.evidenciaForm = {};
    this.responsavelSelecionado = null;
  }

  /**
   * Salva nova evidência
   */
  salvarEvidencia(): void {
    if (!this.evidenciaForm.obrigacaoResponsavelId || !this.evidenciaForm.titulo) {
      this.toastService.error('Erro de validação', 'Preencha todos os campos obrigatórios');
      return;
    }

    this.obrigacaoResponsavelService.criarEvidencia(this.evidenciaForm)
      .subscribe({
        next: (evidencia) => {
          this.toastService.success('Sucesso', 'Evidência cadastrada com sucesso');
          this.fecharFormularioEvidencia();

          // Recarregar evidências
          const responsavelId = this.evidenciaForm.obrigacaoResponsavelId!;
          delete this.evidencias[responsavelId];
          this.carregarEvidencias(responsavelId);
        },
        error: (error) => {
          this.toastService.error('Erro', 'Erro ao cadastrar evidência');
          console.error('Erro ao cadastrar evidência:', error);
        }
      });
  }

  /**
   * Abre formulário para adicionar plano de ação
   */
  abrirFormularioPlano(responsavel: ObrigacaoResponsavel): void {
    this.responsavelSelecionado = responsavel;
    this.planoForm = {
      obrigacaoResponsavelId: responsavel.id,
      status: 'planejado'
    };
    this.mostrarFormularioPlano = true;
  }

  /**
   * Fecha formulário de plano
   */
  fecharFormularioPlano(): void {
    this.mostrarFormularioPlano = false;
    this.planoForm = {};
    this.responsavelSelecionado = null;
  }

  /**
   * Salva novo plano de ação
   */
  salvarPlano(): void {
    if (!this.planoForm.obrigacaoResponsavelId || !this.planoForm.titulo) {
      this.toastService.error('Erro de validação', 'Preencha todos os campos obrigatórios');
      return;
    }

    this.obrigacaoResponsavelService.criarPlano(this.planoForm)
      .subscribe({
        next: (plano) => {
          this.toastService.success('Sucesso', 'Plano de ação cadastrado com sucesso');
          this.fecharFormularioPlano();

          // Recarregar planos
          const responsavelId = this.planoForm.obrigacaoResponsavelId!;
          delete this.planos[responsavelId];
          this.carregarPlanos(responsavelId);
        },
        error: (error) => {
          this.toastService.error('Erro', 'Erro ao cadastrar plano de ação');
          console.error('Erro ao cadastrar plano:', error);
        }
      });
  }

  /**
   * Retorna a classe CSS baseada na prioridade
   */
  getClassePrioridade(prioridade: string): string {
    switch (prioridade) {
      case 'critica': return 'prioridade-critica';
      case 'alta': return 'prioridade-alta';
      case 'media': return 'prioridade-media';
      case 'baixa': return 'prioridade-baixa';
      default: return '';
    }
  }

  /**
   * Retorna a classe CSS baseada na situação
   */
  getClasseSituacao(situacao: string): string {
    switch (situacao) {
      case 'conforme': return 'situacao-conforme';
      case 'nao_conforme': return 'situacao-nao-conforme';
      case 'pendente': return 'situacao-pendente';
      case 'em_analise': return 'situacao-em-analise';
      case 'aguardando_evidencia': return 'situacao-aguardando';
      case 'vencida': return 'situacao-vencida';
      default: return '';
    }
  }

  /**
   * Retorna o texto formatado da situação
   */
  getSituacaoDescricao(situacao: string): string {
    const textoMap: { [key: string]: string } = {
      'conforme': 'Conforme',
      'pendente': 'Pendente',
      'nao_conforme': 'Não Conforme',
      'em_analise': 'Em Análise',
      'aguardando_aprovacao': 'Aguardando Aprovação',
      'aguardando_evidencia': 'Aguardando Evidência',
      'vencida': 'Vencida'
    };
    // Se não encontrar no mapa, formata a string: remove underscores, capitaliza primeira letra de cada palavra
    if (textoMap[situacao]) {
      return textoMap[situacao];
    }
    return situacao
      .split('_')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  }

  /**
   * Formata data para exibição
   */
  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }
}