import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SituacaoObrigacao, SituacaoObrigacaoDTO } from './situacao-obrigacao.model';
import { SituacaoObrigacaoService } from './situacao-obrigacao.service';
import { ToastService } from '../../services/toast.service';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-situacao-obrigacao',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogComponent],
  templateUrl: './situacao-obrigacao.component.html',
  styleUrls: ['./situacao-obrigacao.component.css']
})
export class SituacaoObrigacaoComponent implements OnInit {
  situacoes: SituacaoObrigacao[] = [];
  situacaoSelecionada: SituacaoObrigacao | null = null;
  mostrarFormulario = false;
  mostrarApenasAtivas = false;
  editando = false;
  carregando = false;

  // Formulário
  formulario: SituacaoObrigacaoDTO = {
    codigo: '',
    descricao: '',
    ativo: true
  };

  constructor(
    private situacaoObrigacaoService: SituacaoObrigacaoService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    console.log('SituacaoObrigacaoComponent carregado!');
    this.carregarSituacoes();
  }

  // Carregar lista de situações
  carregarSituacoes(): void {
    console.log('carregarSituacoes chamado!');
    this.carregando = true;

    const observable = this.mostrarApenasAtivas
      ? this.situacaoObrigacaoService.listarAtivas()
      : this.situacaoObrigacaoService.listar();

    observable.subscribe({
      next: (dados) => {
        console.log('Situações carregadas:', dados.length, 'itens');
        this.situacoes = dados;
        this.carregando = false;
      },
      error: (erro) => {
        console.error('ERRO ao carregar situações:', erro);
        // Não bloquear o componente por causa do erro da API
        this.situacoes = []; // Array vazio para mostrar que não há dados
        this.carregando = false;
        this.toastService.loadError('situações de obrigação');
      }
    });
  }

  // Alternar filtro ativo/todos
  alternarFiltro(): void {
    this.mostrarApenasAtivas = !this.mostrarApenasAtivas;
    this.carregarSituacoes();
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
  editarSituacao(situacao: SituacaoObrigacao): void {
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
      this.situacaoObrigacaoService.atualizar(this.formulario.id, this.formulario).subscribe({
        next: (situacao) => {
          this.toastService.saveSuccess('Situação de obrigação');
          this.carregarSituacoes();
          this.cancelarFormulario();
        },
        error: (erro) => {
          const errorMessage = erro.error?.erro || erro.message || 'Erro desconhecido';
          this.toastService.saveError('situação de obrigação', errorMessage);
          this.carregando = false;
          console.error('Erro:', erro);
        }
      });
    } else {
      // Criar
      this.situacaoObrigacaoService.criar(this.formulario).subscribe({
        next: (situacao) => {
          this.toastService.saveSuccess('Situação de obrigação');
          this.carregarSituacoes();
          this.cancelarFormulario();
        },
        error: (erro) => {
          const errorMessage = erro.error?.erro || erro.message || 'Erro desconhecido';
          this.toastService.saveError('situação de obrigação', errorMessage);
          this.carregando = false;
          console.error('Erro:', erro);
        }
      });
    }
  }

  // Excluir situação
  excluirSituacao(situacao: SituacaoObrigacao): void {
    console.log('Chamando confirmDelete para:', situacao.descricao);
    this.toastService.confirmDelete(situacao.descricao, () => {
      this.carregando = true;
      this.situacaoObrigacaoService.excluir(situacao.id!).subscribe({
        next: () => {
          this.toastService.deleteSuccess('Situação de obrigação');
          this.carregarSituacoes();
        },
        error: (erro) => {
          const errorMessage = erro.error?.erro || erro.message || 'Erro desconhecido';
          this.toastService.deleteError('situação de obrigação', errorMessage);
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


  // Alternar status ativo/inativo
  alternarStatus(situacao: SituacaoObrigacao): void {
    console.log('Chamando alternarStatus para:', situacao.descricao);
    const novoStatus = !situacao.ativo;

    const atualizarStatus = () => {
      const dto: SituacaoObrigacaoDTO = {
        id: situacao.id,
        codigo: situacao.codigo,
        descricao: situacao.descricao,
        ativo: novoStatus
      };

      this.situacaoObrigacaoService.atualizar(situacao.id!, dto).subscribe({
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
    };

    if (novoStatus) {
      this.toastService.confirmActivate(situacao.descricao, atualizarStatus);
    } else {
      this.toastService.confirmDeactivate(situacao.descricao, atualizarStatus);
    }
  }

  // Track by function para performance da tabela
  trackBySituacao(index: number, item: SituacaoObrigacao): number {
    return item.id || index;
  }

  // Filtros e busca
  filtroAtivo = 'todas';
  termoBusca = '';

  alterarFiltro(filtro: string): void {
    this.filtroAtivo = filtro;
    if (filtro === 'ativas') {
      this.mostrarApenasAtivas = true;
    } else {
      this.mostrarApenasAtivas = false;
    }
    this.carregarSituacoes();
  }

  buscar(): void {
    this.carregarSituacoes();
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

  // Métodos para status
  getStatusClass(situacao: SituacaoObrigacao): string {
    return situacao.ativo ? 'status-active' : 'status-inactive';
  }

  getStatusText(situacao: SituacaoObrigacao): string {
    return situacao.ativo ? 'Ativa' : 'Inativa';
  }

  // Ações da tabela
  ativar(situacao: SituacaoObrigacao): void {
    situacao.ativo = true;
    this.atualizarStatus(situacao);
  }

  inativar(situacao: SituacaoObrigacao): void {
    situacao.ativo = false;
    this.atualizarStatus(situacao);
  }

  atualizarStatus(situacao: SituacaoObrigacao): void {
    const dto: SituacaoObrigacaoDTO = {
      codigo: situacao.codigo,
      descricao: situacao.descricao,
      ativo: situacao.ativo
    };

    this.situacaoObrigacaoService.atualizar(situacao.id!, dto).subscribe({
      next: () => {
        this.toastService.operationSuccess(`${situacao.ativo ? 'Ativação' : 'Desativação'} da situação`);
      },
      error: (erro) => {
        const errorMessage = erro.error?.erro || erro.message || 'Erro desconhecido';
        this.toastService.error('Erro ao alterar status', errorMessage);
        console.error('Erro:', erro);
      }
    });
  }

  excluir(situacao: SituacaoObrigacao): void {
    this.toastService.confirmDelete(situacao.codigo, () => {
      this.excluirSituacao(situacao);
    });
  }

  // Método de teste para verificar se toast funciona
  testarToast(): void {
    console.log('Testando toast...');
    this.toastService.confirmDelete('Item de Teste', () => {
      console.log('Confirmação do teste executada!');
      this.toastService.success('Teste', 'Toast funcionando!');
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