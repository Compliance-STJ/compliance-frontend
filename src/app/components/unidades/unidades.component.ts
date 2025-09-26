import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Unidade } from './unidade.model';
import { UnidadeService } from './unidade.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './unidades.component.html',
  styleUrls: ['./unidades.component.css']
})
export class UnidadesComponent implements OnInit {
  unidades: Unidade[] = [];
  displayedColumns: string[] = ['id', 'nome', 'sigla', 'responsavel', 'ativo', 'acoes'];
  loading = true;
  termoBusca = '';
  estatisticas = { total: 0, ativas: 0, inativas: 0 };

  constructor(
    private unidadeService: UnidadeService
  ) { }

  ngOnInit(): void {
    this.carregarUnidades();
    this.carregarEstatisticas();
  }

  carregarUnidades(): void {
    this.loading = true;
    this.unidadeService.listarTodas().subscribe({
      next: (data: Unidade[]) => {
        this.unidades = data;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar unidades', error);
        this.loading = false;
        console.log('Erro ao carregar unidades');
      }
    });
  }

  carregarEstatisticas(): void {
    this.unidadeService.obterEstatisticas().subscribe({
      next: (data: any) => {
        this.estatisticas = data;
      },
      error: (error: any) => {
        console.error('Erro ao carregar estatísticas', error);
      }
    });
  }

  buscarUnidades(): void {
    if (this.termoBusca.trim()) {
      this.loading = true;
      this.unidadeService.buscarPorNomeSigla(this.termoBusca).subscribe({
        next: (data: Unidade[]) => {
          this.unidades = data;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Erro na busca de unidades', error);
          this.loading = false;
        }
      });
    } else {
      this.carregarUnidades();
    }
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.carregarUnidades();
  }

  abrirDialogConfirmacao(unidade: Unidade, acao: 'ativar' | 'inativar'): void {
    // Implementar dialog de confirmação
    const confirmacao = window.confirm(
      `Deseja ${acao} a unidade ${unidade.nome}?`
    );
    
    if (confirmacao) {
      this.alterarStatus(unidade, acao);
    }
  }

  alterarStatus(unidade: Unidade, acao: 'ativar' | 'inativar'): void {
    const operacao: Observable<Unidade> = acao === 'ativar'
      ? this.unidadeService.ativar(unidade.id!)
      : this.unidadeService.inativar(unidade.id!);

    operacao.subscribe({
      next: () => {
        // Atualiza diretamente no array
        const index = this.unidades.findIndex(u => u.id === unidade.id);
        if (index !== -1) {
          this.unidades[index].ativo = (acao === 'ativar');
        }
        
        console.log(
          `Unidade ${unidade.nome} foi ${acao === 'ativar' ? 'ativada' : 'inativada'} com sucesso!`
        );
        this.carregarEstatisticas();
      },
      error: (error: any) => {
        console.error(`Erro ao ${acao} unidade`, error);
        console.log(
          `Erro ao ${acao} unidade`
        );
      }
    });
  }
}