import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ObrigacaoService } from '../obrigacoes/obrigacao.service';
import { EvidenciaService } from '../../services/evidencia.service';
import { ObrigacaoResponsavelService } from '../../services/obrigacao-responsavel.service';
import { ObrigacaoDetalhamentoACR } from '../../models/obrigacao.model';
import { ObrigacaoResponsavel } from '../../models/obrigacao-responsavel.model';
import { AprovacaoDialogComponent, AprovacaoDialogData, AprovacaoDialogResult } from '../aprovacao-dialog/aprovacao-dialog';
import { Evidencia } from '../../models/obrigacao.model';

interface EvidenciaPendente {
  evidencia: Evidencia;
  obrigacaoId: number;
  obrigacaoTitulo: string;
  unidadeNome: string;
  responsavelId: number;
}

@Component({
  selector: 'app-aprovacoes-acr',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatTableModule,
    MatBadgeModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './aprovacoes-acr.component.html',
  styleUrls: ['./aprovacoes-acr.component.css']
})
export class AprovacoesAcrComponent implements OnInit {
  carregando = true;
  erro?: string;

  evidenciasPendentes: EvidenciaPendente[] = [];
  evidenciasAprovadas: EvidenciaPendente[] = [];
  obrigacoesPendentes: ObrigacaoResponsavel[] = [];

  displayedColumns: string[] = ['obrigacao', 'unidade', 'evidencia', 'status', 'data', 'acoes'];

  constructor(
    private obrigacaoService: ObrigacaoService,
    private evidenciaService: EvidenciaService,
    private obrigacaoResponsavelService: ObrigacaoResponsavelService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.erro = undefined;

    // Carregar obrigações aguardando aprovação do ACR
    this.obrigacaoResponsavelService.obrigacoesAguardandoAprovacaoACR().subscribe({
      next: (obrigacoes) => {
        console.log('[ACR] Obrigações aguardando aprovação:', obrigacoes);
        this.obrigacoesPendentes = obrigacoes;
        this.carregarEvidencias();
      },
      error: (err) => {
        console.error('[ACR] Erro ao carregar obrigações aguardando aprovação:', err);
        this.erro = 'Erro ao carregar dados de aprovação';
        this.carregando = false;
      }
    });
  }

  carregarEvidencias(): void {
    // Buscar todas as obrigações (com paginação grande para pegar todas)
    this.obrigacaoService.listarObrigacoes(0, 1000).subscribe({
      next: (response) => {
        const obrigacoes = response.content || [];
        this.processarObrigacoes(obrigacoes);
      },
      error: (err) => {
        console.error('Erro ao carregar obrigações:', err);
        this.erro = 'Erro ao carregar dados de aprovação';
        this.carregando = false;
      }
    });
  }

  private processarObrigacoes(obrigacoes: any[]): void {
    const promises = obrigacoes.map(obrigacao =>
      this.obrigacaoService.buscarDetalhamentoACR(obrigacao.id).toPromise()
    );

    Promise.all(promises).then(detalhamentos => {
      this.evidenciasPendentes = [];
      this.evidenciasAprovadas = [];

      detalhamentos.forEach(detalhamento => {
        if (detalhamento) {
          this.processarDetalhamento(detalhamento);
        }
      });

      this.carregando = false;
    }).catch(err => {
      console.error('Erro ao processar obrigações:', err);
      this.erro = 'Erro ao processar dados';
      this.carregando = false;
    });
  }

  private processarDetalhamento(detalhamento: ObrigacaoDetalhamentoACR): void {
    detalhamento.responsaveis.forEach(responsavel => {
      responsavel.evidencias.forEach(evidencia => {
        const item: EvidenciaPendente = {
          evidencia,
          obrigacaoId: detalhamento.id,
          obrigacaoTitulo: detalhamento.titulo,
          unidadeNome: responsavel.unidadeNome || 'N/A',
          responsavelId: responsavel.id
        };

        // Filtrar evidências que aguardam aprovação do ACR
        // Somente evidências aprovadas pelo gestor devem aparecer para o ACR
        if (evidencia.statusAprovacao === 'APROVADO_GESTOR') {
          this.evidenciasPendentes.push(item);
        } else if (evidencia.statusAprovacao === 'APROVADO_ACR') {
          this.evidenciasAprovadas.push(item);
        }
      });
    });
  }

  visualizarObrigacao(obrigacaoId: number): void {
    this.router.navigate(['/obrigacoes', obrigacaoId, 'detalhamento']);
  }

  visualizarObrigacaoResponsavel(responsavel: ObrigacaoResponsavel): void {
    if (responsavel.obrigacaoId) {
      this.router.navigate(['/obrigacoes', responsavel.obrigacaoId, 'detalhamento']);
    }
  }

  getSituacaoClass(codigo?: string): string {
    if (!codigo) return '';
    const map: { [key: string]: string } = {
      'PENDENTE': 'situacao-pendente',
      'EM_ANALISE': 'situacao-analise',
      'AGUARDANDO_APROVACAO': 'situacao-aguardando',
      'CONFORME': 'situacao-conforme',
      'NAO_CONFORME': 'situacao-nao-conforme',
      'VENCIDA': 'situacao-vencida'
    };
    return map[codigo] || '';
  }

  aprovarEvidencia(item: EvidenciaPendente): void {
    if (!item.evidencia.id) return;

    const dialogRef = this.dialog.open(AprovacaoDialogComponent, {
      width: '600px',
      data: {
        tipo: 'evidencia',
        titulo: item.evidencia.titulo,
        descricao: item.evidencia.descricao,
        isGestor: false // ACR
      } as AprovacaoDialogData
    });

    dialogRef.afterClosed().subscribe((result: AprovacaoDialogResult) => {
      console.log('[ACR] Dialog closed with result:', result);

      if (result && item.evidencia.id) {
        // Se aprovando, validar que a situação final foi informada
        if (result.aprovado && !result.situacaoFinal) {
          console.error('[ACR] Situação final não informada!', result);
          this.snackBar.open('Erro: Situação final deve ser informada ao aprovar', 'Fechar', { duration: 5000 });
          return;
        }

        const request: any = {
          aprovado: result.aprovado,
          observacoes: result.observacoes
        };

        // Incluir situação final se ACR aprovando
        if (result.aprovado && result.situacaoFinal) {
          request.situacaoFinal = result.situacaoFinal;
        }

        console.log('[ACR] Enviando request:', request);
        this.evidenciaService.aprovacaoAcr(item.evidencia.id, request).subscribe({
          next: () => {
            const acao = result.aprovado ? 'aprovada' : 'enviada para revisão';
            this.snackBar.open(`Evidência ${acao} com sucesso`, 'OK', { duration: 3000 });
            this.carregarDados(); // Recarregar lista
          },
          error: (err) => {
            console.error('Erro na aprovação:', err);
            this.snackBar.open('Erro ao processar aprovação', 'Fechar', { duration: 5000 });
          }
        });
      }
    });
  }

  obterClasseStatusAprovacao(status: string): string {
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

  obterTextoStatusAprovacao(status: string): string {
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

  obterIconeTipoEvidencia(tipo: string): string {
    const iconeMap: { [key: string]: string } = {
      'texto': 'description',
      'arquivo': 'attach_file',
      'link': 'link'
    };
    return iconeMap[tipo] || 'help';
  }

  formatarData(data: string | undefined): string {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  }
}
