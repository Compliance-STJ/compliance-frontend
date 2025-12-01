import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule, MatAccordion } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ObrigacaoService } from '../obrigacoes/obrigacao.service';
import {
  ObrigacaoDetalhamentoACR,
  ResponsavelDetalhado,
  Evidencia,
  PlanoAcao
} from '../../models/obrigacao.model';
import { EvidenciaDialogComponent, EvidenciaDialogData } from '../evidencia-dialog/evidencia-dialog';
import { PlanoAcaoDialogComponent, PlanoAcaoDialogData } from '../plano-acao-dialog/plano-acao-dialog';
import { AprovacaoDialogComponent, AprovacaoDialogData, AprovacaoDialogResult } from '../aprovacao-dialog/aprovacao-dialog';
import { EvidenciaService } from '../../services/evidencia.service';
import { StatusAprovacao } from '../../models/obrigacao-responsavel.model';

@Component({
  selector: 'app-obrigacao-detalhamento',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './obrigacao-detalhamento.html',
  styleUrls: ['./obrigacao-detalhamento.css']
})
export class ObrigacaoDetalhamentoComponent implements OnInit {
  obrigacao?: ObrigacaoDetalhamentoACR;
  carregando = true;
  erro?: string;
  responsavelExpandidoId?: number;
  filtroResponsaveis: 'todos' | 'pendentes' | 'conformes' | 'analise' = 'todos';
  @ViewChild(MatAccordion) accordion?: MatAccordion;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private obrigacaoService: ObrigacaoService,
    private dialog: MatDialog,
    private evidenciaService: EvidenciaService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarDetalhamento(+id);
    } else {
      this.erro = 'ID da obrigação não fornecido';
      this.carregando = false;
    }
  }

  carregarDetalhamento(id: number): void {
    this.carregando = true;
    this.erro = undefined;

    this.obrigacaoService.buscarDetalhamentoACR(id).subscribe({
      next: (data) => {
        this.obrigacao = data;
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar detalhamento:', err);
        this.erro = 'Erro ao carregar detalhamento da obrigação';
        this.carregando = false;
      }
    });
  }

  voltarParaLista(): void {
    this.router.navigate(['/obrigacoes']);
  }

  expandirResponsavel(responsavelId: number): void {
    this.responsavelExpandidoId =
      this.responsavelExpandidoId === responsavelId ? undefined : responsavelId;
  }

  obterClasseSituacao(situacao: string): string {
    const situacaoMap: { [key: string]: string } = {
      'conforme': 'situacao-conforme',
      'pendente': 'situacao-pendente',
      'nao_conforme': 'situacao-nao-conforme',
      'em_analise': 'situacao-em-analise',
      'aguardando_aprovacao': 'situacao-aguardando',
      'vencida': 'situacao-vencida'
    };
    return situacaoMap[situacao] || 'situacao-default';
  }

  // Lista de responsáveis com filtro aplicado
  get responsaveisFiltrados(): ResponsavelDetalhado[] {
    const lista = this.obrigacao?.responsaveis || [];
    const filtro = this.filtroResponsaveis;
    return lista.filter((r) => {
      const s = (r.situacao || '').toLowerCase();
      switch (filtro) {
        case 'pendentes':
          return s.includes('aguardando') || s.includes('pendente');
        case 'conformes':
          return (
            s === 'conforme' ||
            s === 'atende_integralmente' ||
            s === 'atende_parcialmente' ||
            s === 'nao_se_aplica'
          );
        case 'analise':
          return s.includes('analise') || s.includes('análise');
        default:
          return true;
      }
    });
  }

  expandirTodos(): void {
    this.accordion?.openAll();
  }

  recolherTodos(): void {
    this.accordion?.closeAll();
  }

  obterIconeSituacao(situacao: string): string {
    const iconeMap: { [key: string]: string } = {
      'conforme': 'check_circle',
      'pendente': 'schedule',
      'nao_conforme': 'cancel',
      'em_analise': 'pending',
      'aguardando_aprovacao': 'hourglass_empty',
      'vencida': 'error'
    };
    return iconeMap[situacao] || 'help';
  }

  obterTextoSituacao(situacao: string): string {
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

  obterClassePrioridade(prioridade: string): string {
    const prioridadeMap: { [key: string]: string } = {
      'baixa': 'prioridade-baixa',
      'media': 'prioridade-media',
      'alta': 'prioridade-alta',
      'critica': 'prioridade-critica'
    };
    return prioridadeMap[prioridade] || 'prioridade-default';
  }

  obterTextoTipo(tipo: string): string {
    return tipo === 'recomendacao' ? 'Recomendação' : 'Determinação';
  }

  obterTextoRecorrencia(recorrencia: string): string {
    const recorrenciaMap: { [key: string]: string } = {
      'unica': 'Única',
      'mensal': 'Mensal',
      'trimestral': 'Trimestral',
      'semestral': 'Semestral',
      'anual': 'Anual'
    };
    return recorrenciaMap[recorrencia] || recorrencia;
  }

  formatarData(data: string | undefined): string {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  formatarTamanhoArquivo(tamanho: number | undefined): string {
    if (!tamanho) return '-';
    if (tamanho < 1024) return `${tamanho} B`;
    if (tamanho < 1048576) return `${(tamanho / 1024).toFixed(2)} KB`;
    return `${(tamanho / 1048576).toFixed(2)} MB`;
  }

  obterIconeTipoEvidencia(tipo: string): string {
    const iconeMap: { [key: string]: string } = {
      'texto': 'description',
      'arquivo': 'attach_file',
      'link': 'link'
    };
    return iconeMap[tipo] || 'help';
  }

  obterClasseStatusPlano(status?: string): string {
    if (!status) return 'status-default';
    const statusMap: { [key: string]: string } = {
      'planejado': 'status-planejado',
      'em_andamento': 'status-em-andamento',
      'concluido': 'status-concluido',
      'cancelado': 'status-cancelado'
    };
    return statusMap[status] || 'status-default';
  }

  obterTextoStatusPlano(status: string | undefined): string {
    if (!status) return 'Não definido';
    const statusMap: { [key: string]: string } = {
      'planejado': 'Planejado',
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  adicionarEvidencia(responsavel: ResponsavelDetalhado): void {
    const dialogRef = this.dialog.open(EvidenciaDialogComponent, {
      width: '600px',
      data: {
        responsavelId: responsavel.id,
        unidadeNome: responsavel.unidadeNome
      } as EvidenciaDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Recarregar os dados da obrigação para exibir a nova evidência
        if (this.obrigacao?.id) {
          this.carregarDetalhamento(this.obrigacao.id);
        }
      }
    });
  }

  adicionarPlanoAcao(responsavel: ResponsavelDetalhado): void {
    const dialogRef = this.dialog.open(PlanoAcaoDialogComponent, {
      width: '800px',
      data: {
        responsavelId: responsavel.id,
        unidadeNome: responsavel.unidadeNome
      } as PlanoAcaoDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Recarregar os dados da obrigação para exibir o novo plano de ação
        if (this.obrigacao?.id) {
          this.carregarDetalhamento(this.obrigacao.id);
        }
      }
    });
  }

  visualizarEvidencia(evidencia: Evidencia): void {
    console.log('Visualizar evidência:', evidencia);
    // TODO: Implementar visualização de evidência
  }

  editarEvidencia(evidencia: Evidencia): void {
    const dialogRef = this.dialog.open(EvidenciaDialogComponent, {
      width: '600px',
      data: {
        responsavelId: evidencia.obrigacaoResponsavelId,
        unidadeNome: this.obrigacao?.responsaveis.find(r => r.id === evidencia.obrigacaoResponsavelId)?.unidadeNome || '',
        evidenciaId: evidencia.id
      } as EvidenciaDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.obrigacao?.id) {
          this.carregarDetalhamento(this.obrigacao.id);
        }
      }
    });
  }

  excluirEvidencia(evidencia: Evidencia): void {
    console.log('Excluir evidência:', evidencia);
    // TODO: Implementar exclusão de evidência
  }

  visualizarPlanoAcao(plano: PlanoAcao): void {
    console.log('Visualizar plano:', plano);
    // TODO: Implementar visualização de plano
  }

  editarPlanoAcao(plano: PlanoAcao): void {
    const dialogRef = this.dialog.open(PlanoAcaoDialogComponent, {
      width: '800px',
      data: {
        responsavelId: plano.obrigacaoResponsavelId,
        unidadeNome: this.obrigacao?.responsaveis.find(r => r.id === plano.obrigacaoResponsavelId)?.unidadeNome || '',
        planoId: plano.id
      } as PlanoAcaoDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.obrigacao?.id) {
          this.carregarDetalhamento(this.obrigacao.id);
        }
      }
    });
  }

  excluirPlanoAcao(plano: PlanoAcao): void {
    console.log('Excluir plano:', plano);
    // TODO: Implementar exclusão de plano
  }

  baixarArquivo(evidencia: Evidencia): void {
    if (evidencia.arquivoCaminho) {
      // TODO: Implementar download de arquivo
      console.log('Download arquivo:', evidencia.arquivoCaminho);
    }
  }

  abrirLink(evidencia: Evidencia): void {
    if (evidencia.linkUrl) {
      window.open(evidencia.linkUrl, '_blank');
    }
  }

  // Métodos de Aprovação

  enviarEvidenciaParaAnalise(evidencia: Evidencia): void {
    if (!evidencia.id) return;

    this.evidenciaService.enviarParaAnaliseGestor(evidencia.id).subscribe({
      next: () => {
        this.snackBar.open('Evidência enviada para análise do gestor', 'OK', { duration: 3000 });
        if (this.obrigacao?.id) {
          this.carregarDetalhamento(this.obrigacao.id);
        }
      },
      error: (err) => {
        console.error('Erro ao enviar evidência:', err);
        this.snackBar.open('Erro ao enviar evidência para análise', 'Fechar', { duration: 5000 });
      }
    });
  }

  aprovarEvidencia(evidencia: Evidencia, isGestor: boolean): void {
    if (!evidencia.id) return;

    const dialogRef = this.dialog.open(AprovacaoDialogComponent, {
      width: '600px',
      data: {
        tipo: 'evidencia',
        titulo: evidencia.titulo,
        descricao: evidencia.descricao,
        isGestor: isGestor
      } as AprovacaoDialogData
    });

    dialogRef.afterClosed().subscribe((result: AprovacaoDialogResult) => {
      if (result && evidencia.id) {
        const request: any = {
          aprovado: result.aprovado,
          observacoes: result.observacoes
        };

        // Incluir situação final se ACR aprovando
        if (!isGestor && result.situacaoFinal) {
          request.situacaoFinal = result.situacaoFinal;
        }

        const operacao = isGestor
          ? this.evidenciaService.aprovacaoGestor(evidencia.id, request)
          : this.evidenciaService.aprovacaoAcr(evidencia.id, request);

        operacao.subscribe({
          next: () => {
            const acao = result.aprovado ? 'aprovada' : 'enviada para revisão';
            this.snackBar.open(`Evidência ${acao} com sucesso`, 'OK', { duration: 3000 });
            if (this.obrigacao?.id) {
              this.carregarDetalhamento(this.obrigacao.id);
            }
          },
          error: (err) => {
            console.error('Erro na aprovação:', err);
            this.snackBar.open('Erro ao processar aprovação', 'Fechar', { duration: 5000 });
          }
        });
      }
    });
  }

  // Métodos auxiliares para status de aprovação

  obterClasseStatusAprovacao(status?: string): string {
    if (!status) return 'status-default';
    const statusMap: { [key: string]: string } = {
      'RASCUNHO': 'status-rascunho',
      'EM_ANALISE_GESTOR': 'status-analise',
      'APROVADO_GESTOR': 'status-aprovado-parcial',
      'REVISAO_SOLICITADA_GESTOR': 'status-revisao',
      'EM_ANALISE_ACR': 'status-analise-acr',
      'APROVADO_ACR': 'status-aprovado-final',
      'REVISAO_SOLICITADA_ACR': 'status-revisao',
      'REJEITADO': 'status-rejeitado'
    };
    return statusMap[status] || 'status-default';
  }

  obterIconeStatusAprovacao(status?: string): string {
    if (!status) return 'help_outline';
    const iconeMap: { [key: string]: string } = {
      'RASCUNHO': 'edit',
      'EM_ANALISE_GESTOR': 'hourglass_empty',
      'APROVADO_GESTOR': 'how_to_reg',
      'REVISAO_SOLICITADA_GESTOR': 'edit_note',
      'EM_ANALISE_ACR': 'pending',
      'APROVADO_ACR': 'verified',
      'REVISAO_SOLICITADA_ACR': 'edit_note',
      'REJEITADO': 'cancel'
    };
    return iconeMap[status] || 'help';
  }

  obterTextoStatusAprovacao(status?: string): string {
    if (!status) return 'Sem status';
    const textoMap: { [key: string]: string } = {
      'RASCUNHO': 'Rascunho',
      'EM_ANALISE_GESTOR': 'Em Análise - Gestor',
      'APROVADO_GESTOR': 'Aprovado - Gestor',
      'REVISAO_SOLICITADA_GESTOR': 'Revisão Solicitada',
      'EM_ANALISE_ACR': 'Em Análise - ACR',
      'APROVADO_ACR': 'Aprovado',
      'REVISAO_SOLICITADA_ACR': 'Revisão Solicitada',
      'REJEITADO': 'Rejeitado'
    };
    return textoMap[status] || status;
  }
}
