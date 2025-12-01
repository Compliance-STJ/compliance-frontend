import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';

export interface AprovacaoDialogData {
  tipo: 'evidencia' | 'plano';
  titulo: string;
  descricao?: string;
  isGestor: boolean; // true = gestor, false = ACR
}

export interface AprovacaoDialogResult {
  aprovado: boolean;
  observacoes?: string;
  situacaoFinal?: string; // Para ACR escolher: ATENDE_INTEGRALMENTE, ATENDE_PARCIALMENTE, NAO_SE_APLICA
}

@Component({
  selector: 'app-aprovacao-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatRadioModule
  ],
  templateUrl: './aprovacao-dialog.html',
  styleUrls: ['./aprovacao-dialog.css']
})
export class AprovacaoDialogComponent {
  decisao: 'aprovar' | 'revisar' = 'aprovar';
  observacoes = '';
  situacaoFinal = 'ATENDE_INTEGRALMENTE'; // Default para ACR

  situacoesFinais = [
    { codigo: 'ATENDE_INTEGRALMENTE', descricao: 'Atende Integralmente' },
    { codigo: 'ATENDE_PARCIALMENTE', descricao: 'Atende Parcialmente' },
    { codigo: 'NAO_SE_APLICA', descricao: 'Não se Aplica' }
  ];

  constructor(
    public dialogRef: MatDialogRef<AprovacaoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AprovacaoDialogData
  ) {}

  cancelar(): void {
    this.dialogRef.close();
  }

  confirmar(): void {
    const aprovado = this.decisao === 'aprovar';
    const result: AprovacaoDialogResult = {
      aprovado: aprovado,
      observacoes: this.observacoes.trim() || undefined
    };

    // Se for ACR aprovando, incluir a situação final escolhida
    if (!this.data.isGestor && aprovado) {
      result.situacaoFinal = this.situacaoFinal;
      console.log('[AprovacaoDialog] ACR aprovando com situação final:', this.situacaoFinal);
    }

    console.log('[AprovacaoDialog] Result:', result);
    this.dialogRef.close(result);
  }

  get tituloDialog(): string {
    const papel = this.data.isGestor ? 'Gestor' : 'ACR';
    return `Aprovação ${papel}`;
  }

  get mensagemConfirmacao(): string {
    if (this.decisao === 'aprovar') {
      if (this.data.isGestor) {
        return 'Ao aprovar, a evidência será enviada para análise do ACR.';
      } else {
        const situacaoDescricao = this.situacoesFinais.find(s => s.codigo === this.situacaoFinal)?.descricao || '';
        return `Ao aprovar, a obrigação será marcada como "${situacaoDescricao}".`;
      }
    } else {
      return 'Ao solicitar revisão, a evidência retornará para a unidade responsável corrigir.';
    }
  }
}
