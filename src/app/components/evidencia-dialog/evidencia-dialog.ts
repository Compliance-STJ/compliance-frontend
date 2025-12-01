import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EvidenciaService } from '../../services/evidencia.service';
import { CriarEvidenciaRequest } from '../../models/obrigacao-responsavel.model';

export interface EvidenciaDialogData {
  responsavelId: number;
  unidadeNome: string;
  evidenciaId?: number;
}

@Component({
  selector: 'app-evidencia-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './evidencia-dialog.html',
  styleUrls: ['./evidencia-dialog.css']
})
export class EvidenciaDialogComponent implements OnInit {
  evidencia: CriarEvidenciaRequest = {
    tipo: 'TEXTO',
    titulo: '',
    descricao: '',
    conteudoTexto: '',
    linkUrl: ''
  };

  tiposEvidencia = [
    { value: 'TEXTO', label: 'Texto' },
    { value: 'ARQUIVO', label: 'Arquivo' },
    { value: 'LINK', label: 'Link' }
  ];

  arquivoSelecionado?: File;
  carregando = false;
  erro?: string;
  isEditMode = false;
  isDragging = false;
  uploadProgress = 0;
  previewUrl?: string;

  // Limites de arquivo
  readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  readonly ALLOWED_FILE_TYPES = {
    'application/pdf': { ext: '.pdf', icon: 'picture_as_pdf', color: '#d32f2f' },
    'application/msword': { ext: '.doc', icon: 'description', color: '#1976d2' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', icon: 'description', color: '#1976d2' },
    'application/vnd.ms-excel': { ext: '.xls', icon: 'table_chart', color: '#43a047' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: '.xlsx', icon: 'table_chart', color: '#43a047' },
    'image/jpeg': { ext: '.jpg,.jpeg', icon: 'image', color: '#ff6f00' },
    'image/png': { ext: '.png', icon: 'image', color: '#ff6f00' },
    'text/plain': { ext: '.txt', icon: 'text_snippet', color: '#616161' }
  };

  constructor(
    public dialogRef: MatDialogRef<EvidenciaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EvidenciaDialogData,
    private evidenciaService: EvidenciaService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data.evidenciaId;

    if (this.isEditMode) {
      this.carregarEvidencia();
    }
  }

  carregarEvidencia(): void {
    if (!this.data.evidenciaId) return;

    this.carregando = true;
    this.evidenciaService.buscarPorId(this.data.evidenciaId).subscribe({
      next: (evidencia) => {
        this.evidencia = {
          tipo: evidencia.tipo.toUpperCase() as 'TEXTO' | 'ARQUIVO' | 'LINK',
          titulo: evidencia.titulo,
          descricao: evidencia.descricao,
          conteudoTexto: evidencia.conteudoTexto,
          linkUrl: evidencia.linkUrl
        };
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar evidência:', err);
        this.erro = 'Erro ao carregar evidência';
        this.carregando = false;
      }
    });
  }

  onTipoChange(): void {
    // Limpar campos quando o tipo muda
    this.evidencia.conteudoTexto = '';
    this.evidencia.linkUrl = '';
    this.arquivoSelecionado = undefined;
    this.previewUrl = undefined;
    this.erro = undefined;
  }

  onArquivoSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processarArquivo(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processarArquivo(event.dataTransfer.files[0]);
    }
  }

  processarArquivo(file: File): void {
    this.erro = undefined;

    // Validar tamanho
    if (file.size > this.MAX_FILE_SIZE) {
      this.erro = `Arquivo muito grande. Tamanho máximo: ${this.formatarTamanho(this.MAX_FILE_SIZE)}`;
      return;
    }

    // Validar tipo
    if (!this.ALLOWED_FILE_TYPES[file.type as keyof typeof this.ALLOWED_FILE_TYPES]) {
      this.erro = 'Tipo de arquivo não permitido. Use PDF, Word, Excel, imagens ou texto.';
      return;
    }

    this.arquivoSelecionado = file;

    // Gerar preview para imagens
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = undefined;
    }
  }

  removerArquivo(): void {
    this.arquivoSelecionado = undefined;
    this.previewUrl = undefined;
    this.erro = undefined;
  }

  formatarTamanho(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getFileIcon(): string {
    if (!this.arquivoSelecionado) return 'description';
    const fileInfo = this.ALLOWED_FILE_TYPES[this.arquivoSelecionado.type as keyof typeof this.ALLOWED_FILE_TYPES];
    return fileInfo?.icon || 'description';
  }

  getFileColor(): string {
    if (!this.arquivoSelecionado) return '#757575';
    const fileInfo = this.ALLOWED_FILE_TYPES[this.arquivoSelecionado.type as keyof typeof this.ALLOWED_FILE_TYPES];
    return fileInfo?.color || '#757575';
  }

  validarFormulario(): boolean {
    if (!this.evidencia.titulo?.trim()) {
      this.erro = 'Por favor, informe o título da evidência';
      return false;
    }

    if (this.evidencia.titulo.length > 500) {
      this.erro = 'O título deve ter no máximo 500 caracteres';
      return false;
    }

    if (this.evidencia.descricao && this.evidencia.descricao.length > 1000) {
      this.erro = 'A descrição deve ter no máximo 1000 caracteres';
      return false;
    }

    if (this.evidencia.tipo === 'TEXTO') {
      if (!this.evidencia.conteudoTexto?.trim()) {
        this.erro = 'Por favor, informe o conteúdo do texto';
        return false;
      }
    }

    if (this.evidencia.tipo === 'LINK') {
      if (!this.evidencia.linkUrl?.trim()) {
        this.erro = 'Por favor, informe a URL do link';
        return false;
      }

      // Validar formato de URL
      try {
        new URL(this.evidencia.linkUrl);
      } catch {
        this.erro = 'URL inválida. Use o formato: https://exemplo.com';
        return false;
      }
    }

    if (this.evidencia.tipo === 'ARQUIVO' && !this.isEditMode && !this.arquivoSelecionado) {
      this.erro = 'Por favor, selecione um arquivo';
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

    const request: CriarEvidenciaRequest = {
      tipo: this.evidencia.tipo,
      titulo: this.evidencia.titulo,
      descricao: this.evidencia.descricao
    };

    if (this.evidencia.tipo === 'TEXTO') {
      request.conteudoTexto = this.evidencia.conteudoTexto;
    } else if (this.evidencia.tipo === 'LINK') {
      request.linkUrl = this.evidencia.linkUrl;
    }

    const operation = this.isEditMode
      ? this.evidenciaService.atualizarEvidencia(this.data.evidenciaId!, request)
      : this.evidenciaService.adicionarEvidencia(this.data.responsavelId, request);

    operation.subscribe({
      next: (evidenciaCriada) => {
        // Se for arquivo, fazer upload
        if (this.evidencia.tipo === 'ARQUIVO' && this.arquivoSelecionado) {
          this.evidenciaService.uploadArquivo(evidenciaCriada.id, this.arquivoSelecionado).subscribe({
            next: (evidenciaComArquivo) => {
              this.carregando = false;
              this.dialogRef.close(evidenciaComArquivo);
            },
            error: (err) => {
              console.error('Erro ao fazer upload:', err);
              this.erro = 'Erro ao fazer upload do arquivo';
              this.carregando = false;
            }
          });
        } else {
          this.carregando = false;
          this.dialogRef.close(evidenciaCriada);
        }
      },
      error: (err) => {
        console.error('Erro ao salvar evidência:', err);
        this.erro = 'Erro ao salvar evidência';
        this.carregando = false;
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
