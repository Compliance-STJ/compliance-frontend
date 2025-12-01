import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { PlanoAcaoService } from '../../services/plano-acao.service';
import { CriarPlanoAcaoRequest } from '../../models/obrigacao-responsavel.model';

export interface PlanoAcaoDialogData {
  responsavelId: number;
  unidadeNome: string;
  planoId?: number;
}

@Component({
  selector: 'app-plano-acao-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './plano-acao-dialog.html',
  styleUrls: ['./plano-acao-dialog.css']
})
export class PlanoAcaoDialogComponent implements OnInit {
  planoAcao: CriarPlanoAcaoRequest = {
    titulo: '',
    whatOQue: '',
    whyPorQue: '',
    whereOnde: '',
    whenQuando: undefined,
    whoQuem: '',
    howComo: '',
    howMuchQuantoCusta: ''
  };

  carregando = false;
  erro?: string;
  isEditMode = false;

  constructor(
    public dialogRef: MatDialogRef<PlanoAcaoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PlanoAcaoDialogData,
    private planoAcaoService: PlanoAcaoService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data.planoId;

    if (this.isEditMode) {
      this.carregarPlanoAcao();
    }
  }

  carregarPlanoAcao(): void {
    if (!this.data.planoId) return;

    this.carregando = true;
    this.planoAcaoService.buscarPorId(this.data.planoId).subscribe({
      next: (plano) => {
        this.planoAcao = {
          titulo: plano.titulo,
          whatOQue: plano.whatOQue,
          whyPorQue: plano.whyPorQue,
          whereOnde: plano.whereOnde,
          whenQuando: plano.whenQuando ? new Date(plano.whenQuando) : undefined,
          whoQuem: plano.whoQuem,
          howComo: plano.howComo,
          howMuchQuantoCusta: plano.howMuchQuantoCusta
        };
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar plano de ação:', err);
        this.erro = 'Erro ao carregar plano de ação';
        this.carregando = false;
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.planoAcao.titulo?.trim()) {
      this.erro = 'Título é obrigatório';
      return false;
    }

    if (!this.planoAcao.whatOQue?.trim()) {
      this.erro = 'O campo "O que fazer?" é obrigatório';
      return false;
    }

    return true;
  }

  salvar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.carregando = true;
    this.erro = undefined;

    const request: CriarPlanoAcaoRequest = {
      titulo: this.planoAcao.titulo,
      whatOQue: this.planoAcao.whatOQue,
      whyPorQue: this.planoAcao.whyPorQue,
      whereOnde: this.planoAcao.whereOnde,
      whenQuando: this.planoAcao.whenQuando,
      whoQuem: this.planoAcao.whoQuem,
      howComo: this.planoAcao.howComo,
      howMuchQuantoCusta: this.planoAcao.howMuchQuantoCusta
    };

    const operation = this.isEditMode
      ? this.planoAcaoService.atualizarPlanoAcao(this.data.planoId!, request)
      : this.planoAcaoService.criarPlanoAcao(this.data.responsavelId, request);

    operation.subscribe({
      next: (planoCriado) => {
        this.carregando = false;
        this.dialogRef.close(planoCriado);
      },
      error: (err) => {
        console.error('Erro ao salvar plano de ação:', err);
        this.erro = 'Erro ao salvar plano de ação';
        this.carregando = false;
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
