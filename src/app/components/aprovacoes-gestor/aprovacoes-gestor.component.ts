import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ObrigacaoResponsavelService } from '../obrigacoes/obrigacao-responsavel.service';
import { ObrigacaoService } from '../obrigacoes/obrigacao.service';
import { UnidadeService } from '../unidades/unidade.service';
import { HasPermissionDirective } from '../../directives/permission.directive';
import { ObrigacaoResponsavel, Obrigacao, Evidencia, PlanoAcao } from '../../models/obrigacao.model';

@Component({
  selector: 'app-aprovacoes-gestor',
  standalone: true,
  imports: [CommonModule, FormsModule, HasPermissionDirective],
  templateUrl: './aprovacoes-gestor.component.html',
  styleUrl: './aprovacoes-gestor.component.css'
})
export class AprovacoesGestorComponent implements OnInit {
  usuarioUnidadeId?: number;
  obrigacoesResponsavel: ObrigacaoResponsavel[] = [];
  obrigacoesDetalhes: { [key: number]: Obrigacao } = {};
  evidencias: { [key: number]: Evidencia[] } = {};
  planos: { [key: number]: PlanoAcao[] } = {};
  carregando = false;
  erro: string | null = null;
  filtroSituacao: string = '';
  filtroPrioridade: string = '';
  mostrarDetalhes = false;
  mostrarEvidencias = false;
  mostrarPlanos = false;
  mostrarFormularioEvidencia = false;
  mostrarFormularioPlano = false;
  mostrarModalAprovacao = false;
  mostrarModalRecusa = false;
  obrigacaoSelecionada: Obrigacao | null = null;
  responsavelSelecionado: ObrigacaoResponsavel | null = null;
  evidenciaSelecionada: Evidencia | null = null;
  evidenciaForm: Partial<Evidencia> = {};
  planoForm: Partial<PlanoAcao> = {};
  observacoesAprovacao: string = '';
  observacoesRecusa: string = '';

  constructor(
    private authService: AuthService,
    private obrigacaoResponsavelService: ObrigacaoResponsavelService,
    private obrigacaoService: ObrigacaoService,
    private unidadeService: UnidadeService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.usuarioUnidadeId = user?.user.unit;
    if (!this.usuarioUnidadeId) {
      this.erro = 'Não foi possível identificar sua unidade';
      return;
    }
    this.carregarObrigacoes();
  }

  carregarObrigacoes(): void {
    if (!this.usuarioUnidadeId) return;
    this.carregando = true;
    this.erro = null;
    this.obrigacaoResponsavelService.listarPorUnidade(this.usuarioUnidadeId).subscribe({
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

  private carregarDetalhesObrigacoes(responsaveis: ObrigacaoResponsavel[]): void {
    const obrigacaoIds = [...new Set(responsaveis.map(r => r.obrigacaoId))];
    obrigacaoIds.forEach(id => {
      this.obrigacaoService.buscarObrigacao(id).subscribe({
        next: (obrigacao: Obrigacao) => { this.obrigacoesDetalhes[id] = obrigacao; },
        error: (error: any) => { console.error(`Erro ao carregar obrigação ${id}:`, error); }
      });
    });
  }

  get obrigacoesFiltradas(): ObrigacaoResponsavel[] {
    let filtradas = this.obrigacoesResponsavel;
    if (this.filtroSituacao) filtradas = filtradas.filter(r => r.situacao === this.filtroSituacao);
    if (this.filtroPrioridade) filtradas = filtradas.filter(r => {
      const obrigacao = this.obrigacoesDetalhes[r.obrigacaoId];
      return obrigacao && obrigacao.prioridade === this.filtroPrioridade;
    });
    return filtradas.sort((a, b) => {
      const obrigacaoA = this.obrigacoesDetalhes[a.obrigacaoId];
      const obrigacaoB = this.obrigacoesDetalhes[b.obrigacaoId];
      if (!obrigacaoA || !obrigacaoB) return 0;
      const prioridadeOrder: { [key: string]: number } = { 'critica': 4, 'alta': 3, 'media': 2, 'baixa': 1 };
      return (prioridadeOrder[obrigacaoB.prioridade] || 0) - (prioridadeOrder[obrigacaoA.prioridade] || 0);
    });
  }

  get obrigacoesPendentesAprovacao(): ObrigacaoResponsavel[] {
    return this.obrigacoesFiltradas.filter(r => {
      const situacao = r.situacao?.toLowerCase() || '';
      return situacao.includes('aguardando') && 
             (situacao.includes('aprovacao') || situacao.includes('aprovação') || situacao.includes('analise') || situacao.includes('análise'));
    });
  }

  get obrigacoesPendentes(): ObrigacaoResponsavel[] {
    return this.obrigacoesFiltradas.filter(r => {
      const situacao = r.situacao?.toLowerCase() || '';
      
      // Considera conforme: situações finais aprovadas pela ACR
      const isConforme = situacao === 'conforme' || 
                         situacao === 'atende_integralmente' ||
                         situacao === 'atende_parcialmente' ||
                         situacao === 'nao_se_aplica';
      
      // Aguardando aprovação do gestor
      const isAguardandoAprovacao = situacao.includes('aguardando') && 
                                    (situacao.includes('aprovacao') || situacao.includes('aprovação') || situacao.includes('analise') || situacao.includes('análise'));
      
      return !isConforme && !isAguardandoAprovacao;
    });
  }

  get obrigacoesConformes(): ObrigacaoResponsavel[] {
    return this.obrigacoesFiltradas.filter(r => {
      const situacao = r.situacao?.toLowerCase() || '';
      
      // Considera conforme: situações finais aprovadas pela ACR
      return situacao === 'conforme' || 
             situacao === 'atende_integralmente' ||
             situacao === 'atende_parcialmente' ||
             situacao === 'nao_se_aplica';
    });
  }

  abrirDetalhes(responsavel: ObrigacaoResponsavel): void {
    this.responsavelSelecionado = responsavel;
    this.obrigacaoSelecionada = this.obrigacoesDetalhes[responsavel.obrigacaoId];
    this.mostrarDetalhes = true;
  }

  fecharDetalhes(): void {
    this.mostrarDetalhes = false;
    this.obrigacaoSelecionada = null;
    this.responsavelSelecionado = null;
  }

  carregarEvidencias(responsavelId: number): void {
    if (!this.evidencias[responsavelId]) {
      this.obrigacaoResponsavelService.listarEvidenciasPorResponsavel(responsavelId).subscribe({
        next: (evidencias) => { this.evidencias[responsavelId] = evidencias; },
        error: (error) => { console.error('Erro ao carregar evidências:', error); }
      });
    }
  }

  carregarPlanos(responsavelId: number): void {
    if (!this.planos[responsavelId]) {
      this.obrigacaoResponsavelService.listarPlanosPorResponsavel(responsavelId).subscribe({
        next: (planos) => { this.planos[responsavelId] = planos; },
        error: (error) => { console.error('Erro ao carregar planos:', error); }
      });
    }
  }

  abrirEvidencias(responsavel: ObrigacaoResponsavel): void {
    this.responsavelSelecionado = responsavel;
    this.carregarEvidencias(responsavel.id!);
    this.mostrarEvidencias = true;
  }

  fecharEvidencias(): void {
    this.mostrarEvidencias = false;
    this.responsavelSelecionado = null;
  }

  abrirPlanos(responsavel: ObrigacaoResponsavel): void {
    this.responsavelSelecionado = responsavel;
    this.carregarPlanos(responsavel.id!);
    this.mostrarPlanos = true;
  }

  fecharPlanos(): void {
    this.mostrarPlanos = false;
    this.responsavelSelecionado = null;
  }

  abrirFormularioEvidencia(responsavel: ObrigacaoResponsavel): void {
    this.responsavelSelecionado = responsavel;
    this.evidenciaForm = { obrigacaoResponsavelId: responsavel.id, tipo: 'texto' };
    this.mostrarFormularioEvidencia = true;
  }

  fecharFormularioEvidencia(): void {
    this.mostrarFormularioEvidencia = false;
    this.evidenciaForm = {};
    this.responsavelSelecionado = null;
  }

  salvarEvidencia(): void {
    if (!this.evidenciaForm.obrigacaoResponsavelId || !this.evidenciaForm.titulo) {
      this.toastService.error('Erro de validação', 'Preencha todos os campos obrigatórios');
      return;
    }
    this.obrigacaoResponsavelService.criarEvidencia(this.evidenciaForm).subscribe({
      next: (evidencia) => {
        this.toastService.success('Sucesso', 'Evidência cadastrada com sucesso');
        this.fecharFormularioEvidencia();
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

  abrirFormularioPlano(responsavel: ObrigacaoResponsavel): void {
    this.responsavelSelecionado = responsavel;
    this.planoForm = { obrigacaoResponsavelId: responsavel.id, status: 'planejado' };
    this.mostrarFormularioPlano = true;
  }

  fecharFormularioPlano(): void {
    this.mostrarFormularioPlano = false;
    this.planoForm = {};
    this.responsavelSelecionado = null;
  }

  salvarPlano(): void {
    if (!this.planoForm.obrigacaoResponsavelId || !this.planoForm.titulo) {
      this.toastService.error('Erro de validação', 'Preencha todos os campos obrigatórios');
      return;
    }
    this.obrigacaoResponsavelService.criarPlano(this.planoForm).subscribe({
      next: (plano) => {
        this.toastService.success('Sucesso', 'Plano de ação cadastrado com sucesso');
        this.fecharFormularioPlano();
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

  getClassePrioridade(prioridade: string): string {
    switch (prioridade) {
      case 'critica': return 'prioridade-critica';
      case 'alta': return 'prioridade-alta';
      case 'media': return 'prioridade-media';
      case 'baixa': return 'prioridade-baixa';
      default: return '';
    }
  }

  getClasseSituacao(situacao: string): string {
    switch (situacao) {
      case 'conforme': return 'situacao-conforme';
      case 'nao_conforme': return 'situacao-nao-conforme';
      case 'pendente': return 'situacao-pendente';
      case 'em_analise': return 'situacao-em-analise';
      case 'aguardando_evidencia': return 'situacao-aguardando';
      case 'aguardando_aprovacao_unidade': return 'situacao-aguardando-aprovacao';
      case 'vencida': return 'situacao-vencida';
      default: return '';
    }
  }

  /**
   * Retorna o texto formatado da situação
   * Usa a descrição que vem do backend se disponível, senão faz fallback para mapeamento local
   */
  getSituacaoDescricao(situacao: string, situacaoDescricao?: string): string {
    // Se veio a descrição do backend, usar ela
    if (situacaoDescricao) {
      return situacaoDescricao;
    }
    
    // Fallback para mapeamento local se não vier do backend
    const textoMap: { [key: string]: string } = {
      'AGUARDANDO_EVIDENCIA': 'Aguardando Evidência',
      'AGUARDANDO_APROVACAO_GESTOR': 'Aguardando Aprovação do Gestor',
      'APROVADO_GESTOR': 'Aprovado pelo Gestor',
      'ATENDE_INTEGRALMENTE': 'Atende Integralmente',
      'ATENDE_PARCIALMENTE': 'Atende Parcialmente',
      'NAO_SE_APLICA': 'Não se Aplica',
      'conforme': 'Conforme',
      'pendente': 'Pendente',
      'nao_conforme': 'Não Conforme',
      'em_analise': 'Em Análise',
      'aguardando_aprovacao': 'Aguardando Aprovação',
      'aguardando_aprovacao_unidade': 'Aguardando Aprovação Unidade',
      'aguardando_evidencia': 'Aguardando Evidência',
      'vencida': 'Vencida'
    };
    if (textoMap[situacao]) {
      return textoMap[situacao];
    }
    // Formata a string: remove underscores, capitaliza primeira letra de cada palavra
    return situacao.split('_').map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1)).join(' ');
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  getStatusAprovacaoTexto(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pendente': 'Pendente',
      'PENDENTE': 'Pendente',
      'aguardando_aprovacao_gestor': 'Aguardando Gestor',
      'AGUARDANDO_APROVACAO_GESTOR': 'Aguardando Gestor',
      'EM_ANALISE_GESTOR': 'Em Análise (Gestor)',
      'em_analise_gestor': 'Em Análise (Gestor)',
      'aprovada_gestor': 'Aprovada (Gestor)',
      'APROVADA_GESTOR': 'Aprovada (Gestor)',
      'aprovado_gestor': 'Aprovado (Gestor)',
      'APROVADO_GESTOR': 'Aprovado (Gestor)',
      'recusada_gestor': 'Recusada (Gestor)',
      'RECUSADA_GESTOR': 'Recusada (Gestor)',
      'recusado_gestor': 'Recusado (Gestor)',
      'RECUSADO_GESTOR': 'Recusado (Gestor)',
      'REVISAO_SOLICITADA': 'Revisão Solicitada',
      'revisao_solicitada': 'Revisão Solicitada',
      'aguardando_aprovacao_acr': 'Aguardando ACR',
      'AGUARDANDO_APROVACAO_ACR': 'Aguardando ACR',
      'EM_ANALISE_ACR': 'Em Análise (ACR)',
      'em_analise_acr': 'Em Análise (ACR)',
      'aprovada': 'Aprovada',
      'APROVADA': 'Aprovada',
      'aprovado': 'Aprovado',
      'APROVADO': 'Aprovado',
      'recusada': 'Recusada',
      'RECUSADA': 'Recusada',
      'recusado': 'Recusado',
      'RECUSADO': 'Recusado'
    };
    return statusMap[status] || status.split('_').map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
  }

  podeAprovarEvidencia(evidencia: Evidencia): boolean {
    const status = evidencia.statusAprovacao?.toUpperCase() || '';
    // Pode aprovar se não tem status, está pendente, ou está em análise pelo gestor
    return !status || 
           status === 'PENDENTE' || 
           status === 'AGUARDANDO_APROVACAO_GESTOR' ||
           status === 'EM_ANALISE_GESTOR' ||
           status.includes('AGUARDANDO') && status.includes('GESTOR');
  }

  foiAprovadoPeloGestor(evidencia: Evidencia): boolean {
    const status = evidencia.statusAprovacao?.toUpperCase() || '';
    return status === 'APROVADA_GESTOR' || status === 'APROVADO_GESTOR' || status === 'APROVADA' || status === 'APROVADO';
  }

  getClasseStatusBadge(status: string): string {
    const statusUpper = status?.toUpperCase() || '';
    
    // Status de sucesso (aprovado)
    if (statusUpper.includes('APROVAD')) {
      return 'badge-success';
    }
    
    // Status de erro/recusa
    if (statusUpper.includes('RECUSAD') || statusUpper.includes('REVISAO')) {
      return 'badge-danger';
    }
    
    // Status de aguardando
    if (statusUpper.includes('PENDENTE') || statusUpper.includes('AGUARDANDO_APROVACAO_GESTOR') || statusUpper.includes('EM_ANALISE_GESTOR')) {
      return 'badge-warning';
    }
    
    // Status de info (aguardando ACR)
    if (statusUpper.includes('ACR')) {
      return 'badge-info';
    }
    
    return '';
  }

  // === APROVAÇÕES ===

  abrirModalAprovacao(evidencia: Evidencia): void {
    this.evidenciaSelecionada = evidencia;
    this.observacoesAprovacao = '';
    this.mostrarModalAprovacao = true;
  }

  fecharModalAprovacao(): void {
    this.mostrarModalAprovacao = false;
    this.evidenciaSelecionada = null;
    this.observacoesAprovacao = '';
  }

  confirmarAprovacao(): void {
    if (!this.evidenciaSelecionada?.id) return;

    this.obrigacaoResponsavelService.aprovarEvidencia(
      this.evidenciaSelecionada.id,
      this.observacoesAprovacao || undefined
    ).subscribe({
      next: (evidenciaAtualizada) => {
        this.toastService.success('Sucesso', 'Evidência aprovada com sucesso');
        this.fecharModalAprovacao();
        
        // Atualizar a evidência na lista
        if (this.responsavelSelecionado?.id) {
          const lista = this.evidencias[this.responsavelSelecionado.id];
          const index = lista?.findIndex(e => e.id === evidenciaAtualizada.id);
          if (index !== undefined && index >= 0 && lista) {
            lista[index] = evidenciaAtualizada;
          }
        }
        
        // Recarregar obrigações para atualizar contadores
        this.carregarObrigacoes();
      },
      error: (error) => {
        this.toastService.error('Erro', 'Erro ao aprovar evidência');
        console.error('Erro ao aprovar evidência:', error);
      }
    });
  }

  abrirModalRecusa(evidencia: Evidencia): void {
    this.evidenciaSelecionada = evidencia;
    this.observacoesRecusa = '';
    this.mostrarModalRecusa = true;
  }

  fecharModalRecusa(): void {
    this.mostrarModalRecusa = false;
    this.evidenciaSelecionada = null;
    this.observacoesRecusa = '';
  }

  confirmarRecusa(): void {
    if (!this.evidenciaSelecionada?.id) return;
    
    if (!this.observacoesRecusa || this.observacoesRecusa.trim() === '') {
      this.toastService.error('Erro de validação', 'O motivo da recusa é obrigatório');
      return;
    }

    this.obrigacaoResponsavelService.recusarEvidencia(
      this.evidenciaSelecionada.id,
      this.observacoesRecusa
    ).subscribe({
      next: (evidenciaAtualizada) => {
        this.toastService.success('Sucesso', 'Evidência recusada');
        this.fecharModalRecusa();
        
        // Atualizar a evidência na lista
        if (this.responsavelSelecionado?.id) {
          const lista = this.evidencias[this.responsavelSelecionado.id];
          const index = lista?.findIndex(e => e.id === evidenciaAtualizada.id);
          if (index !== undefined && index >= 0 && lista) {
            lista[index] = evidenciaAtualizada;
          }
        }
        
        // Recarregar obrigações para atualizar contadores
        this.carregarObrigacoes();
      },
      error: (error) => {
        this.toastService.error('Erro', 'Erro ao recusar evidência');
        console.error('Erro ao recusar evidência:', error);
      }
    });
  }
}
