import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SituacaoObrigacao, SituacaoObrigacaoDTO } from './situacao-obrigacao.model';
import { SituacaoObrigacaoService } from './situacao-obrigacao.service';

@Component({
  selector: 'app-situacao-obrigacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  mensagemSucesso = '';
  mensagemErro = '';

  // Formulário
  formulario: SituacaoObrigacaoDTO = {
    codigo: '',
    descricao: '',
    ativo: true
  };

  constructor(private situacaoObrigacaoService: SituacaoObrigacaoService) {}

  ngOnInit(): void {
    this.carregarSituacoes();
  }

  // Carregar lista de situações
  carregarSituacoes(): void {
    this.carregando = true;
    
    const observable = this.mostrarApenasAtivas 
      ? this.situacaoObrigacaoService.listarAtivas()
      : this.situacaoObrigacaoService.listar();

    observable.subscribe({
      next: (dados) => {
        this.situacoes = dados;
        this.carregando = false;
      },
      error: (erro) => {
        this.mostrarErro('Erro ao carregar situações de obrigação');
        this.carregando = false;
        console.error('Erro:', erro);
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
          this.mostrarSucesso('Situação de obrigação atualizada com sucesso!');
          this.carregarSituacoes();
          this.cancelarFormulario();
        },
        error: (erro) => {
          this.mostrarErro('Erro ao atualizar situação de obrigação');
          this.carregando = false;
          console.error('Erro:', erro);
        }
      });
    } else {
      // Criar
      this.situacaoObrigacaoService.criar(this.formulario).subscribe({
        next: (situacao) => {
          this.mostrarSucesso('Situação de obrigação criada com sucesso!');
          this.carregarSituacoes();
          this.cancelarFormulario();
        },
        error: (erro) => {
          this.mostrarErro('Erro ao criar situação de obrigação');
          this.carregando = false;
          console.error('Erro:', erro);
        }
      });
    }
  }

  // Excluir situação
  excluirSituacao(situacao: SituacaoObrigacao): void {
    if (confirm(`Tem certeza que deseja excluir a situação "${situacao.descricao}"?`)) {
      this.carregando = true;
      this.situacaoObrigacaoService.excluir(situacao.id!).subscribe({
        next: () => {
          this.mostrarSucesso('Situação de obrigação excluída com sucesso!');
          this.carregarSituacoes();
        },
        error: (erro) => {
          this.mostrarErro('Erro ao excluir situação de obrigação');
          this.carregando = false;
          console.error('Erro:', erro);
        }
      });
    }
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

  // Validar formulário
  private validarFormulario(): boolean {
    if (!this.formulario.codigo || !this.formulario.descricao) {
      this.mostrarErro('Código e descrição são obrigatórios');
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
  alternarStatus(situacao: SituacaoObrigacao): void {
    const novoStatus = !situacao.ativo;
    const mensagem = novoStatus
      ? `Tem certeza que deseja ativar a situação "${situacao.descricao}"?`
      : `Tem certeza que deseja desativar a situação "${situacao.descricao}"?`;
      
    if (confirm(mensagem)) {
      const dto: SituacaoObrigacaoDTO = {
        id: situacao.id,
        codigo: situacao.codigo,
        descricao: situacao.descricao,
        ativo: novoStatus
      };

      this.situacaoObrigacaoService.atualizar(situacao.id!, dto).subscribe({
        next: () => {
          situacao.ativo = novoStatus;
          this.mostrarSucesso(`Situação ${novoStatus ? 'ativada' : 'desativada'} com sucesso!`);
        },
        error: (erro) => {
          this.mostrarErro('Erro ao alterar status da situação');
          console.error('Erro:', erro);
        }
      });
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
        this.mostrarSucesso(`Situação ${situacao.ativo ? 'ativada' : 'desativada'} com sucesso!`);
      },
      error: (erro) => {
        this.mostrarErro('Erro ao alterar status da situação');
        console.error('Erro:', erro);
      }
    });
  }

  excluir(situacao: SituacaoObrigacao): void {
    if (confirm(`Tem certeza que deseja excluir a situação "${situacao.codigo}"?`)) {
      this.excluirSituacao(situacao);
    }
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