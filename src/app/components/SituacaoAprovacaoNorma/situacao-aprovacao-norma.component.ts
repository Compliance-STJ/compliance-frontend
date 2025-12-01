import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SituacaoAprovacaoNorma, SituacaoAprovacaoNormaDTO } from './situacao-aprovacao-norma.model';
import { SituacaoAprovacaoNormaService } from './situacao-aprovacao-norma.service';
import { ToastService } from '../../services/toast.service';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-situacao-aprovacao-norma',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogComponent],
  templateUrl: './situacao-aprovacao-norma.component.html',
  styleUrls: ['./situacao-aprovacao-norma.component.css']
})
export class SituacaoAprovacaoNormaComponent implements OnInit {
  situacoes: SituacaoAprovacaoNorma[] = [];
  situacaoSelecionada: SituacaoAprovacaoNorma | null = null;
  mostrarFormulario = false;
  editando = false;
  carregando = false;

  // Mensagens de feedback
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  // Formulário
  formulario: SituacaoAprovacaoNormaDTO = {
    codigo: '',
    descricao: '',
    ativo: true
  };

  constructor(
    private situacaoAprovacaoNormaService: SituacaoAprovacaoNormaService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.carregarSituacoes();
  }

  // Carregar lista de situações
  carregarSituacoes(): void {
    this.carregando = true;
    this.situacaoAprovacaoNormaService.listar().subscribe({
      next: (dados) => {
        this.situacoes = dados;
        this.carregando = false;
      },
      error: (erro) => {
        this.toastService.loadError('situações de aprovação de norma');
        this.carregando = false;
        console.error('Erro:', erro);
      }
    });
  }

  // Mostrar formulário para nova situação
  novaSituacao(): void {
    this.formulario = {
      codigo: '',
      descricao: '',
      ativo: true
    };
    this.editando = false;
    this.mostrarFormulario = true;
    this.situacaoSelecionada = null;
  }

  // Editar situação existente
  editarSituacao(situacao: SituacaoAprovacaoNorma): void {
    this.formulario = {
      id: situacao.id,
      codigo: situacao.codigo,
      descricao: situacao.descricao,
      ativo: situacao.ativo
    };
    this.editando = true;
    this.mostrarFormulario = true;
    this.situacaoSelecionada = situacao;
  }

  // Salvar situação (criar ou atualizar)
  salvarSituacao(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.carregando = true;

    if (this.editando && this.formulario.id) {
      // Atualizar
      this.situacaoAprovacaoNormaService.atualizar(this.formulario.id, this.formulario).subscribe({
        next: (situacao) => {
          this.toastService.saveSuccess('Situação de aprovação de norma');
          this.carregarSituacoes();
          this.cancelarFormulario();
        },
        error: (erro) => {
          const errorMessage = erro.error?.erro || erro.message || 'Erro desconhecido';
          this.toastService.saveError('situação de aprovação de norma', errorMessage);
          this.carregando = false;
          console.error('Erro:', erro);
        }
      });
    } else {
      // Criar
      this.situacaoAprovacaoNormaService.criar(this.formulario).subscribe({
        next: (situacao) => {
          this.toastService.success('Situação criada', 'Situação de aprovação de norma foi criada com sucesso!');
          this.carregarSituacoes();
          this.cancelarFormulario();
        },
        error: (erro) => {
          const errorMessage = erro.error?.erro || erro.message || 'Erro desconhecido';
          this.toastService.saveError('situação de aprovação de norma', errorMessage);
          this.carregando = false;
          console.error('Erro:', erro);
        }
      });
    }
  }

  // Excluir situação
  excluirSituacao(situacao: SituacaoAprovacaoNorma): void {
    this.toastService.confirmDelete(situacao.descricao, () => {
      this.carregando = true;
      this.situacaoAprovacaoNormaService.excluir(situacao.id!).subscribe({
        next: () => {
          this.toastService.deleteSuccess('Situação de aprovação de norma');
          this.carregarSituacoes();
        },
        error: (erro) => {
          const errorMessage = erro.error?.erro || erro.message || 'Erro desconhecido';
          this.toastService.deleteError('situação de aprovação de norma', errorMessage);
          this.carregando = false;
          console.error('Erro:', erro);
        }
      });
    });
  }

  // Cancelar formulário
  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.situacaoSelecionada = null;
    this.formulario = {
      codigo: '',
      descricao: '',
      ativo: true
    };
  }

  // Método chamado quando o dialog é fechado
  onDialogClosed(): void {
    this.cancelarFormulario();
  }

  // Validar formulário
  private validarFormulario(): boolean {
    if (!this.formulario.codigo || !this.formulario.descricao) {
      this.toastService.warning('Campos obrigatórios', 'Código e descrição são obrigatórios');
      return false;
    }
    return true;
  }

  // Mostrar mensagem de sucesso
  private mostrarSucesso(mensagem: string): void {
    this.mensagemSucesso = mensagem;
    this.mensagemErro = '';
    setTimeout(() => {
      this.mensagemSucesso = '';
    }, 5000);
  }

  // Mostrar mensagem de erro
  private mostrarErro(mensagem: string): void {
    this.mensagemErro = mensagem;
    this.mensagemSucesso = '';
    setTimeout(() => {
      this.mensagemErro = '';
    }, 5000);
  }

  // Alternar status ativo/inativo
  alternarStatus(situacao: SituacaoAprovacaoNorma): void {
    const novoStatus = !situacao.ativo;
    const action = novoStatus ? 'ativar' : 'desativar';

    const confirmMethod = novoStatus
      ? this.toastService.confirmActivate
      : this.toastService.confirmDeactivate;

    confirmMethod.call(this.toastService, situacao.descricao, () => {
      const dto: SituacaoAprovacaoNormaDTO = {
        id: situacao.id,
        codigo: situacao.codigo,
        descricao: situacao.descricao,
        ativo: novoStatus
      };

      this.situacaoAprovacaoNormaService.atualizar(situacao.id!, dto).subscribe({
        next: () => {
          situacao.ativo = novoStatus;
          this.toastService.operationSuccess(`${novoStatus ? 'Ativação' : 'Desativação'} da situação`);
        },
        error: (erro) => {
          const errorMessage = erro.error?.erro || erro.message || 'Erro desconhecido';
          this.toastService.error('Erro ao alterar status', errorMessage);
          console.error('Erro:', erro);
        }
      });
    });
  }

  // Track by function para performance da tabela
  trackBySituacao(index: number, item: SituacaoAprovacaoNorma): number {
    return item.id || index;
  }

  // Filtros e busca
  filtroAtivo = 'todas';
  termoBusca = '';

  alterarFiltro(filtro: string): void {
    this.filtroAtivo = filtro;
    this.aplicarFiltros();
  }

  buscar(): void {
    this.aplicarFiltros();
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.formulario = {
      codigo: '',
      descricao: '',
      ativo: true
    };
  }

  aplicarFiltros(): void {
    // Implementar filtros se necessário
    this.carregarSituacoes();
  }

  // Métodos para status
  getStatusClass(situacao: SituacaoAprovacaoNorma): string {
    return situacao.ativo ? 'status-active' : 'status-inactive';
  }

  getStatusText(situacao: SituacaoAprovacaoNorma): string {
    return situacao.ativo ? 'Ativa' : 'Inativa';
  }

  // Ações da tabela
  ativar(situacao: SituacaoAprovacaoNorma): void {
    situacao.ativo = true;
    this.atualizarStatus(situacao);
  }

  inativar(situacao: SituacaoAprovacaoNorma): void {
    situacao.ativo = false;
    this.atualizarStatus(situacao);
  }

  atualizarStatus(situacao: SituacaoAprovacaoNorma): void {
    const dto: SituacaoAprovacaoNormaDTO = {
      codigo: situacao.codigo,
      descricao: situacao.descricao,
      ativo: situacao.ativo
    };

    this.situacaoAprovacaoNormaService.atualizar(situacao.id!, dto).subscribe({
      next: () => {
        this.mostrarSucesso(`Situação ${situacao.ativo ? 'ativada' : 'desativada'} com sucesso!`);
      },
      error: (erro) => {
        this.mostrarErro('Erro ao alterar status da situação');
        console.error('Erro:', erro);
      }
    });
  }

  excluir(situacao: SituacaoAprovacaoNorma): void {
    this.toastService.confirmDelete(situacao.codigo, () => {
      this.excluirSituacao(situacao);
    });
  }

  // Formatação de data
  formatarData(data: string | undefined): string {
    if (!data) return '-';

    // Se a data já contém informação de hora (ISO format), usa diretamente
    if (data.includes('T')) {
      return new Date(data).toLocaleDateString('pt-BR');
    }

    // Se é apenas uma data (YYYY-MM-DD), adiciona o horário
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  }
}
