import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SituacaoNorma, SituacaoNormaDTO } from './situacao-norma.model';
import { SituacaoNormaService } from './situacao-norma.service';

@Component({
  selector: 'app-situacao-norma',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './situacao-norma.component.html',
  styleUrls: ['./situacao-norma.component.css']
})
export class SituacaoNormaComponent implements OnInit {
  situacoes: SituacaoNorma[] = [];
  situacaoSelecionada: SituacaoNorma | null = null;
  mostrarFormulario = false;
  editando = false;
  carregando = false;
  mensagemSucesso = '';
  mensagemErro = '';

  // Formulário
  formulario: SituacaoNormaDTO = {
    codigo: '',
    descricao: '',
    ativo: true
  };

  constructor(private situacaoNormaService: SituacaoNormaService) {}

  ngOnInit(): void {
    this.carregarSituacoes();
  }

  // Carregar lista de situações
  carregarSituacoes(): void {
    this.carregando = true;
    this.situacaoNormaService.listar().subscribe({
      next: (dados) => {
        this.situacoes = dados;
        this.carregando = false;
      },
      error: (erro) => {
        this.mostrarErro('Erro ao carregar situações de norma');
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
  editarSituacao(situacao: SituacaoNorma): void {
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
      this.situacaoNormaService.atualizar(this.formulario.id, this.formulario).subscribe({
        next: (situacao) => {
          this.mostrarSucesso('Situação de norma atualizada com sucesso!');
          this.carregarSituacoes();
          this.cancelarFormulario();
        },
        error: (erro) => {
          this.mostrarErro('Erro ao atualizar situação de norma');
          this.carregando = false;
          console.error('Erro:', erro);
        }
      });
    } else {
      // Criar
      this.situacaoNormaService.criar(this.formulario).subscribe({
        next: (situacao) => {
          this.mostrarSucesso('Situação de norma criada com sucesso!');
          this.carregarSituacoes();
          this.cancelarFormulario();
        },
        error: (erro) => {
          this.mostrarErro('Erro ao criar situação de norma');
          this.carregando = false;
          console.error('Erro:', erro);
        }
      });
    }
  }

  // Excluir situação
  excluirSituacao(situacao: SituacaoNorma): void {
    if (confirm(`Tem certeza que deseja excluir a situação "${situacao.descricao}"?`)) {
      this.carregando = true;
      this.situacaoNormaService.excluir(situacao.id!).subscribe({
        next: () => {
          this.mostrarSucesso('Situação de norma excluída com sucesso!');
          this.carregarSituacoes();
        },
        error: (erro) => {
          this.mostrarErro('Erro ao excluir situação de norma');
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
  alternarStatus(situacao: SituacaoNorma): void {
    const novoStatus = !situacao.ativo;
    const mensagem = novoStatus
      ? `Tem certeza que deseja ativar a situação "${situacao.descricao}"?`
      : `Tem certeza que deseja desativar a situação "${situacao.descricao}"?`;
      
    if (confirm(mensagem)) {
      const dto: SituacaoNormaDTO = {
        id: situacao.id,
        codigo: situacao.codigo,
        descricao: situacao.descricao,
        ativo: novoStatus
      };

      this.situacaoNormaService.atualizar(situacao.id!, dto).subscribe({
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
  trackBySituacao(index: number, item: SituacaoNorma): number {
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
  getStatusClass(situacao: SituacaoNorma): string {
    return situacao.ativo ? 'status-active' : 'status-inactive';
  }

  getStatusText(situacao: SituacaoNorma): string {
    return situacao.ativo ? 'Ativa' : 'Inativa';
  }

  // Ações da tabela
  ativar(situacao: SituacaoNorma): void {
    situacao.ativo = true;
    this.atualizarStatus(situacao);
  }

  inativar(situacao: SituacaoNorma): void {
    situacao.ativo = false;
    this.atualizarStatus(situacao);
  }

  atualizarStatus(situacao: SituacaoNorma): void {
    const dto: SituacaoNormaDTO = {
      codigo: situacao.codigo,
      descricao: situacao.descricao,
      ativo: situacao.ativo
    };

    this.situacaoNormaService.atualizar(situacao.id!, dto).subscribe({
      next: () => {
        this.mostrarSucesso(`Situação ${situacao.ativo ? 'ativada' : 'desativada'} com sucesso!`);
      },
      error: (erro) => {
        this.mostrarErro('Erro ao alterar status da situação');
        console.error('Erro:', erro);
      }
    });
  }

  excluir(situacao: SituacaoNorma): void {
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