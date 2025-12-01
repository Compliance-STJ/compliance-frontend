import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ObrigacaoResponsavelService } from '../../services/obrigacao-responsavel.service';
import { ObrigacaoResponsavel } from '../../models/obrigacao-responsavel.model';
import { EvidenciaService } from '../../services/evidencia.service';
import { DialogComponent } from '../dialog/dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { EvidenciaDialogComponent, EvidenciaDialogData } from '../evidencia-dialog/evidencia-dialog';
import { PlanoAcaoDialogComponent, PlanoAcaoDialogData } from '../plano-acao-dialog/plano-acao-dialog';

@Component({
  selector: 'app-minhas-obrigacoes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    DialogComponent
  ],
  templateUrl: './minhas-obrigacoes.component.html',
  styleUrls: ['./minhas-obrigacoes.component.css']
})
export class MinhasObrigacoesComponent implements OnInit {
  obrigacoesPendentes: ObrigacaoResponsavel[] = [];
  todasObrigacoes: ObrigacaoResponsavel[] = [];
  loading = false;
  unidadeId: number | undefined;

  displayedColumns: string[] = ['titulo', 'situacao', 'prazo', 'evidencias', 'planos', 'acoes'];

  // Modal states
  mostrarModalDetalhes = false;
  responsavelSelecionado: ObrigacaoResponsavel | null = null;

  constructor(
    private obrigacaoResponsavelService: ObrigacaoResponsavelService,
    private evidenciaService: EvidenciaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obter o ID da unidade do usuário logado
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.user?.unit) {
      this.unidadeId = currentUser.user.unit;
      this.carregarObrigacoes();
    } else {
      console.error('[MINHAS OBRIGAÇÕES] Usuário não possui unidade definida');
      this.snackBar.open('Erro: Usuário não possui unidade definida', 'Fechar', { duration: 5000 });
      this.loading = false;
    }
  }

  carregarObrigacoes(): void {
    if (!this.unidadeId) {
      console.error('[MINHAS OBRIGAÇÕES] unidadeId não definido');
      return;
    }

    this.loading = true;

    // Carregar obrigacoes pendentes
    this.obrigacaoResponsavelService.obrigacoesPendentes(this.unidadeId).subscribe({
      next: (pendentes) => {
        this.obrigacoesPendentes = pendentes;
      },
      error: (error) => {
        console.error('Erro ao carregar obrigacoes pendentes:', error);
      }
    });

    // Carregar todas as obrigacoes
    this.obrigacaoResponsavelService.minhasObrigacoes(this.unidadeId).subscribe({
      next: (todas) => {
        console.log('[MINHAS OBRIGAÇÕES] Obrigações carregadas:', todas);
        this.todasObrigacoes = todas;
        this.loading = false;
      },
      error: (error) => {
        console.error('[MINHAS OBRIGAÇÕES] Erro ao carregar todas obrigacoes:', error);
        console.error('[MINHAS OBRIGAÇÕES] Status:', error.status);
        console.error('[MINHAS OBRIGAÇÕES] Message:', error.message);
        this.loading = false;
      }
    });
  }

  getSituacaoClass(situacao: string): string {
    const classMap: { [key: string]: string } = {
      'pendente': 'situacao-pendente',
      'em_analise': 'situacao-analise',
      'aguardando_evidencia': 'situacao-aguardando',
      'conforme': 'situacao-conforme',
      'nao_conforme': 'situacao-nao-conforme',
      'vencida': 'situacao-vencida'
    };
    return classMap[situacao] || '';
  }

  getSituacaoLabel(situacao: string): string {
    const labelMap: { [key: string]: string } = {
      'pendente': 'Pendente',
      'em_analise': 'Em Análise',
      'aguardando_evidencia': 'Aguardando Evidência',
      'conforme': 'Conforme',
      'nao_conforme': 'Não Conforme',
      'vencida': 'Vencida'
    };
    return labelMap[situacao] || situacao;
  }

  adicionarEvidencia(responsavel: ObrigacaoResponsavel): void {
    const dialogRef = this.dialog.open(EvidenciaDialogComponent, {
      width: '600px',
      data: {
        responsavelId: responsavel.id,
        unidadeNome: responsavel.unidadeNome || 'Unidade'
      } as EvidenciaDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Enviar automaticamente para análise do gestor
        if (result.id) {
          this.evidenciaService.enviarParaAnaliseGestor(result.id).subscribe({
            next: () => {
              this.carregarObrigacoes();
              this.snackBar.open('Evidência adicionada e enviada para aprovação do gestor!', 'OK', { duration: 4000 });
            },
            error: (error: any) => {
              console.error('Erro ao enviar para gestor:', error);
              this.carregarObrigacoes();
              this.snackBar.open('Evidência adicionada, mas erro ao enviar para aprovação', 'Fechar', { duration: 5000 });
            }
          });
        } else {
          this.carregarObrigacoes();
          this.snackBar.open('Evidência adicionada com sucesso!', 'OK', { duration: 3000 });
        }
      }
    });
  }


  adicionarPlanoAcao(responsavel: ObrigacaoResponsavel): void {
    const dialogRef = this.dialog.open(PlanoAcaoDialogComponent, {
      width: '700px',
      data: {
        responsavelId: responsavel.id,
        unidadeNome: responsavel.unidadeNome || 'Unidade'
      } as PlanoAcaoDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.carregarObrigacoes();
        this.snackBar.open('Plano de ação adicionado com sucesso!', 'OK', { duration: 3000 });
      }
    });
  }


  visualizarDetalhes(responsavel: ObrigacaoResponsavel): void {
    this.responsavelSelecionado = responsavel;
    // Carregar detalhes completos incluindo evidências e planos
    if (responsavel.id) {
      this.obrigacaoResponsavelService.buscarPorId(responsavel.id).subscribe({
        next: (detalhes) => {
          this.responsavelSelecionado = detalhes;
          this.mostrarModalDetalhes = true;
        },
        error: (error: any) => {
          console.error('Erro ao carregar detalhes:', error);
          alert('Erro ao carregar detalhes. Tente novamente.');
        }
      });
    }
  }

  fecharModalDetalhes(): void {
    this.mostrarModalDetalhes = false;
    this.responsavelSelecionado = null;
  }
}
