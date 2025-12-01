import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { ObrigacaoResponsavelService } from '../obrigacoes/obrigacao-responsavel.service';
import { ObrigacaoService } from '../obrigacoes/obrigacao.service';
import { AuthService } from '../../services/auth.service';
import {
  ObrigacaoResponsavel,
  Obrigacao,
  Evidencia,
  PlanoAcao
} from '../../models/obrigacao.model';

@Component({
  selector: 'app-obrigacoes-unidade',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './obrigacoes-unidade.component.html',
  styleUrl: './obrigacoes-unidade.component.css'
})
export class ObrigacoesUnidadeComponent implements OnInit {

  // ID da unidade do gestor logado
  unidadeId?: number;

  // Listas de dados
  obrigacoesResponsavel: ObrigacaoResponsavel[] = [];
  obrigacoesDetalhes: { [key: number]: Obrigacao } = {};
  
  // Estados da interface
  carregando = false;
  erro: string | null = null;

  // Filtros
  filtroSituacao: string = '';
  filtroPrioridade: string = '';

  constructor(
    private obrigacaoResponsavelService: ObrigacaoResponsavelService,
    private obrigacaoService: ObrigacaoService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Obter unidade do gestor logado
    const user = this.authService.getCurrentUser();
    this.unidadeId = user?.user.unit;

    if (!this.unidadeId) {
      this.erro = 'Não foi possível identificar sua unidade';
      return;
    }

    this.carregarObrigacoes();
  }

  /**
   * Carrega as obrigações atribuídas à unidade
   */
  carregarObrigacoes(): void {
    if (!this.unidadeId) return;

    this.carregando = true;
    this.erro = null;

    this.obrigacaoResponsavelService.listarPorUnidade(this.unidadeId)
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

      const prioridadeOrder: { [key: string]: number } = { 'critica': 4, 'alta': 3, 'media': 2, 'baixa': 1 };
      return (prioridadeOrder[obrigacaoB.prioridade] || 0) - (prioridadeOrder[obrigacaoA.prioridade] || 0);
    });
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
      'aguardando_aprovacao_unidade': 'Aguardando Aprovação Unidade',
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
      case 'aguardando_aprovacao_unidade': return 'situacao-aguardando-aprovacao';
      case 'vencida': return 'situacao-vencida';
      default: return '';
    }
  }

  /**
   * Navega para detalhes da obrigação
   */
  verDetalhes(obrigacaoId: number): void {
    this.router.navigate(['/obrigacao-detalhamento', obrigacaoId]);
  }

  /**
   * Formata data para exibição
   */
  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }
}
