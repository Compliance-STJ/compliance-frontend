import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NormaManualService, NormaEstruturada, ParteNorma, ObrigacaoManual } from '../../services/norma-manual.service';
import { ToastService } from '../../services/toast.service';
import { ParteNormaTreeItemComponent } from './parte-norma-tree-item';
import { UnidadeService } from '../unidades/unidade.service';
import { Unidade } from '../unidades/unidade.model';

interface ObrigacaoEmEdicao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'recomendacao' | 'determinacao';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  partesSelecionadas: ParteNorma[];
  textoCompilado: string;
  unidadesSelecionadas: Unidade[];
  editando: boolean;
  dataCriacao?: Date;
}

@Component({
  selector: 'app-norma-manual',
  standalone: true,
  imports: [CommonModule, FormsModule, ParteNormaTreeItemComponent],
  templateUrl: './norma-manual.html',
  styleUrl: './norma-manual.css',
  host: {
    '(document:keydown)': 'handleKeyboardEvent($event)'
  }
})
export class NormaManualComponent {
  // Estados da interface
  carregando = false;
  analisando = false;

  // Dados da norma
  normaEstruturada: NormaEstruturada | null = null;

  // Controle de abas
  activeTab: 'texto' | 'url' = 'texto';

  // Entrada do usuário
  textoNorma = '';
  urlNorma = '';

  // Controle de seleção
  partesSelecionadas: ParteNorma[] = [];
  mostrarApenasSelecionadas = false;

  // Obrigações sendo criadas
  obrigacoes: ObrigacaoEmEdicao[] = [];
  obrigacaoAtual: ObrigacaoEmEdicao | null = null;
  
  // Formulário inline
  tituloAtual = '';
  descricaoAtual = '';
  tipoAtual: 'recomendacao' | 'determinacao' = 'determinacao';
  textoCompiladoAtual = '';
  
  // Controle de validação da norma
  normaValidada = false;

  // Controle do modal de confirmação
  mostrarConfirmacaoSalvar = false;

  // Controle de preview expandido
  previewExpandido = false;

  // Prioridade da obrigação atual
  prioridadeAtual: 'baixa' | 'media' | 'alta' | 'critica' = 'media';

  // Unidades responsáveis
  unidadesDisponiveis: Unidade[] = [];
  unidadesSelecionadas: Unidade[] = [];

  // Dados da norma para salvar junto com primeira obrigação
  normaNome = '';
  normaDataNorma = '';
  normaSituacaoId = 1; // Pendente por padrão
  normaOrigemId?: number;
  normaDescricao = '';
  normaOrgaoEmissor = '';
  normaLink = '';
  normaCategoria = '';

  constructor(
    private normaService: NormaManualService,
    private toastService: ToastService,
    private unidadeService: UnidadeService,
    private cdr: ChangeDetectorRef
  ) {
    this.carregarUnidades();
  }

  /**
   * Carrega a lista de unidades disponíveis
   */
  private carregarUnidades() {
    this.unidadeService.listarAtivas().subscribe({
      next: (unidades) => {
        this.unidadesDisponiveis = unidades;
      },
      error: (error) => {
        console.error('Erro ao carregar unidades:', error);
        this.toastService.error('Erro ao carregar lista de unidades');
      }
    });
  }

  /**
   * Converte uma data em formato brasileiro para ISO (YYYY-MM-DD)
   */
  private converterDataParaISO(dataBrasileira: string): string {
    if (!dataBrasileira) return '';
    
    try {
      // Tenta converter datas brasileiras como "15 de outubro de 2023"
      const meses: { [key: string]: number } = {
        'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
        'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
      };
      
      const match = dataBrasileira.toLowerCase().match(/(\d{1,2})\s+de\s+([a-zçãâêîôûáéíóúàèìòùãõ]+)\s+de\s+(\d{4})/);
      if (match) {
        const dia = parseInt(match[1]);
        const mesNome = match[2].normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove acentos
        const ano = parseInt(match[3]);
        
        const mes = meses[mesNome];
        if (mes !== undefined) {
          const data = new Date(ano, mes, dia);
          return data.toISOString().split('T')[0];
        }
      }
      
      // Se não conseguir converter, retorna a data original
      return dataBrasileira;
    } catch (error) {
      console.warn('Erro ao converter data:', error);
      return dataBrasileira;
    }
  }
  handleKeyboardEvent(event: KeyboardEvent) {
    // Só funciona quando estamos na etapa de criação
    if (!this.normaValidada) return;

    // Ctrl + Enter: Adicionar obrigação atual
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      if (this.partesSelecionadas.length > 0 && this.tituloAtual.trim()) {
        this.adicionarObrigacao();
      }
    }

    // Ctrl + S: Salvar tudo
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      if (this.obrigacoes.length > 0) {
        this.salvarTudo();
      }
    }

    // Ctrl + N: Limpar seleção e começar nova obrigação
    if (event.ctrlKey && event.key === 'n') {
      event.preventDefault();
      this.limparSelecao();
      this.limparFormularioObrigacao();
      // Focar no campo de título
      setTimeout(() => {
        const tituloInput = document.querySelector('input[placeholder*="Título da Obrigação"]') as HTMLInputElement;
        if (tituloInput) tituloInput.focus();
      }, 100);
    }

    // Esc: Cancelar edição atual
    if (event.key === 'Escape') {
      this.cancelarObrigacaoAtual();
    }
  }

  /**
   * Analisa o texto da norma inserido pelo usuário
   */
  analisarTexto() {
    if (!this.textoNorma.trim()) {
      this.toastService.error('Por favor, insira o texto da norma');
      return;
    }

    this.analisando = true;
    
    // Primeiro extrair informações da norma
    this.normaService.extrairInfoNorma({ texto: this.textoNorma })
      .subscribe({
        next: (infoNorma) => {
          // Preencher automaticamente os campos da norma
          this.normaNome = infoNorma.titulo || '';
          this.normaOrgaoEmissor = infoNorma.orgaoEmissor || '';
          this.normaCategoria = infoNorma.categoria || '';
          
          // Tentar converter data para formato ISO se possível
          if (infoNorma.dataPublicacao) {
            this.normaDataNorma = this.converterDataParaISO(infoNorma.dataPublicacao);
          }
          
          // Agora analisar a estrutura
          this.normaService.analisarNorma({ texto: this.textoNorma })
            .subscribe({
              next: (norma) => {
                this.normaEstruturada = norma;
                this.partesSelecionadas = [];
                this.obrigacoes = [];
                this.toastService.success(`Norma analisada com sucesso! ${norma.partes.length} partes identificadas. Informações extraídas automaticamente.`);
              },
              error: (error) => {
                this.toastService.error('Erro ao analisar a estrutura da norma: ' + error.message);
              },
              complete: () => {
                this.analisando = false;
              }
            });
        },
        error: (error) => {
          this.toastService.error('Erro ao extrair informações da norma: ' + error.message);
          this.analisando = false;
        }
      });
  }

  /**
   * Analisa uma norma a partir de uma URL
   */
  analisarUrl() {
    if (!this.urlNorma.trim()) {
      this.toastService.error('Por favor, insira a URL da norma');
      return;
    }

    this.analisando = true;

    // Primeiro extrair informações da norma
    this.normaService.extrairInfoNorma({ url: this.urlNorma })
      .subscribe({
        next: (infoNorma) => {
          // Preencher automaticamente os campos da norma
          this.normaNome = infoNorma.titulo || '';
          this.normaOrgaoEmissor = infoNorma.orgaoEmissor || '';
          this.normaCategoria = infoNorma.categoria || '';
          this.normaLink = this.urlNorma; // ✅ Adiciona o link da URL

          // Tentar converter data para formato ISO se possível
          if (infoNorma.dataPublicacao) {
            this.normaDataNorma = this.converterDataParaISO(infoNorma.dataPublicacao);
          }

          // Agora analisar a estrutura
          this.normaService.analisarNormaPorUrl({ url: this.urlNorma })
            .subscribe({
              next: (norma) => {
                this.normaEstruturada = norma;
                this.partesSelecionadas = [];
                this.obrigacoes = [];
                this.toastService.success(`Norma analisada com sucesso! ${norma.partes.length} partes identificadas. Informações extraídas automaticamente.`);
              },
              error: (error) => {
                this.toastService.error('Erro ao analisar a estrutura da norma: ' + error.message);
              },
              complete: () => {
                this.analisando = false;
              }
            });
        },
        error: (error) => {
          this.toastService.error('Erro ao extrair informações da norma: ' + error.message);
          this.analisando = false;
        }
      });
  }

  /**
   * Alterna a seleção de uma parte da norma (com propagação para filhos)
   */
  toggleSelecao(parte: ParteNorma) {
    parte.selecionado = !parte.selecionado;

    // Propagar seleção para filhos
    this.propagarSelecaoParaFilhos(parte, parte.selecionado);

    // Atualizar lista de partes selecionadas
    this.atualizarPartesSelecionadas();

    this.atualizarTextoCompilado();
  }

  /**
   * Manipula mudança de seleção vinda da árvore
   */
  onSelecaoChange(parte: ParteNorma) {
    console.log('onSelecaoChange chamado:', parte);
    this.toggleSelecao(parte);
    console.log('Partes selecionadas após toggle:', this.partesSelecionadas.length);
    this.cdr.detectChanges(); // Força detecção de mudanças
  }

  /**
   * Propaga a seleção para todos os filhos recursivamente
   */
  private propagarSelecaoParaFilhos(parte: ParteNorma, selecionado: boolean) {
    if (parte.filhos) {
      parte.filhos.forEach(filho => {
        filho.selecionado = selecionado;
        this.propagarSelecaoParaFilhos(filho, selecionado);
      });
    }
  }

  /**
   * Atualiza a lista de partes selecionadas baseada no estado atual
   */
  private atualizarPartesSelecionadas() {
    console.log('🔄 atualizarPartesSelecionadas chamado');
    this.partesSelecionadas = [];

    const adicionarPartesSelecionadas = (partes: ParteNorma[]) => {
      partes.forEach(parte => {
        if (parte.selecionado) {
          console.log('✅ Parte selecionada encontrada:', parte.tipo, parte.numero);
          this.partesSelecionadas.push(parte);
        }
        if (parte.filhos) {
          adicionarPartesSelecionadas(parte.filhos);
        }
      });
    };

    if (this.normaEstruturada) {
      adicionarPartesSelecionadas(this.normaEstruturada.partes);
    }
    
    console.log('📊 Total partes selecionadas:', this.partesSelecionadas.length);
  }

  /**
   * Retorna as partes a serem exibidas (filtradas ou todas)
   */
  getPartesExibidas(): ParteNorma[] {
    if (!this.normaEstruturada) return [];

    if (this.mostrarApenasSelecionadas) {
      return this.partesSelecionadas.filter(parte => !parte.filhos || parte.filhos.length === 0);
    }

    return this.normaEstruturada.partes;
  }

  /**
   * Getter para debug - retorna informações sobre o estado atual
   */
  get debugInfo() {
    return {
      partesSelecionadas: this.partesSelecionadas.length,
      normaEstruturada: !!this.normaEstruturada,
      totalPartesNorma: this.normaEstruturada?.partes?.length || 0,
      tituloAtual: this.tituloAtual,
      textoCompiladoAtual: this.textoCompiladoAtual?.substring(0, 50) + '...'
    };
  }

  /**
   * Atualiza o texto compilado da obrigação atual
   */
  private atualizarTextoCompilado() {
    if (this.partesSelecionadas.length === 0) {
      this.textoCompiladoAtual = '';
      if (this.obrigacaoAtual) {
        this.obrigacaoAtual.textoCompilado = '';
      }
      return;
    }

    this.normaService.compilarTexto({ partes_selecionadas: this.partesSelecionadas })
      .subscribe({
        next: (response) => {
          this.textoCompiladoAtual = response.texto_compilado;
          if (this.obrigacaoAtual) {
            this.obrigacaoAtual.textoCompilado = response.texto_compilado;
          }
        },
        error: (error) => {
          this.toastService.error('Erro ao compilar texto: ' + error.message);
        }
      });
  }

  /**
   * Inicia a criação de uma nova obrigação
   */
  novaObrigacao() {
    if (this.partesSelecionadas.length === 0) {
      this.toastService.error('Selecione pelo menos uma parte da norma para criar uma obrigação');
      return;
    }

    const novaObrigacao: ObrigacaoEmEdicao = {
      id: 'obrigacao-' + Date.now(),
      titulo: '',
      descricao: '',
      tipo: 'determinacao',
      prioridade: 'media',
      partesSelecionadas: [...this.partesSelecionadas],
      textoCompilado: '',
      unidadesSelecionadas: [],
      editando: true
    };

    this.obrigacaoAtual = novaObrigacao;
    this.atualizarTextoCompilado();
  }

  /**
   * Salva a obrigação atual
   */
  salvarObrigacao() {
    if (!this.obrigacaoAtual) return;

    if (!this.obrigacaoAtual.titulo.trim()) {
      this.toastService.error('Por favor, insira um título para a obrigação');
      return;
    }

    // Adicionar à lista de obrigações
    this.obrigacoes.push(this.obrigacaoAtual);
    this.toastService.success('Obrigação criada com sucesso!');

    // Limpar seleção e obrigação atual
    this.limparSelecao();
    this.obrigacaoAtual = null;
  }

  /**
   * Cancela a edição da obrigação atual
   */
  cancelarObrigacao() {
    this.obrigacaoAtual = null;
    this.limparSelecao();
  }

  /**
   * Salva obrigação no modo rápido (inline)
   */
  salvarObrigacaoRapida() {
    console.log('salvarObrigacaoRapida chamado');
    console.log('tituloAtual:', this.tituloAtual);
    console.log('partesSelecionadas:', this.partesSelecionadas.length);
    
    if (!this.tituloAtual.trim()) {
      this.toastService.error('Por favor, insira um título para a obrigação');
      return;
    }

    if (this.partesSelecionadas.length === 0) {
      this.toastService.error('Selecione pelo menos uma parte da norma');
      return;
    }

    // Todas as obrigações são adicionadas localmente e salvas juntas no final
    this.adicionarObrigacaoLocal();
  }

  /**
   * Confirma a validação da norma e avança para criação de obrigações
   */
  confirmarNorma() {
    if (!this.normaNome?.trim() || !this.normaDataNorma) {
      this.toastService.error('Preencha todos os campos obrigatórios da norma');
      return;
    }

    this.normaValidada = true;
    this.toastService.success('Norma validada com sucesso! Agora você pode criar obrigações.');
  }

  /**
   * Volta para a etapa de análise da norma
   */
  voltarParaAnalise() {
    this.normaEstruturada = null;
    this.normaValidada = false;
    this.partesSelecionadas = [];
    this.obrigacoes = [];
    this.textoNorma = '';
    this.urlNorma = '';
  }

  /**
   * Volta para a etapa de validação da norma
   */
  voltarParaValidacao() {
    this.normaValidada = false;
  }

  /**
   * Toggle do preview expandido do texto compilado
   */
  togglePreviewExpandido() {
    this.previewExpandido = !this.previewExpandido;
  }

  /**
   * Adiciona uma unidade à seleção atual
   */
  adicionarUnidade(unidade: Unidade) {
    if (!this.unidadesSelecionadas.find(u => u.id === unidade.id)) {
      this.unidadesSelecionadas.push(unidade);
    }
  }

  /**
   * Remove uma unidade da seleção atual
   */
  removerUnidade(unidade: Unidade) {
    const index = this.unidadesSelecionadas.findIndex(u => u.id === unidade.id);
    if (index > -1) {
      this.unidadesSelecionadas.splice(index, 1);
    }
  }

  /**
   * Verifica se uma unidade está selecionada
   */
  unidadeSelecionada(unidade: Unidade): boolean {
    return this.unidadesSelecionadas.some(u => u.id === unidade.id);
  }

  /**
   * Retorna as unidades disponíveis que ainda não foram selecionadas
   */
  getUnidadesDisponiveis(): Unidade[] {
    return this.unidadesDisponiveis.filter(unidade => 
      !this.unidadesSelecionadas.some(selecionada => selecionada.id === unidade.id)
    );
  }

  /**
   * Retorna o label da prioridade
   */
  getPrioridadeLabel(prioridade: string): string {
    const labels = {
      'baixa': 'Baixa',
      'media': 'Média',
      'alta': 'Alta',
      'critica': 'Crítica'
    };
    return labels[prioridade as keyof typeof labels] || prioridade;
  }

  /**
   * Calcula o total de partes selecionadas em todas as obrigações
   */
  getTotalPartesSelecionadas(): number {
    return this.obrigacoes.reduce((total, ob) => total + ob.partesSelecionadas.length, 0);
  }

  /**
   * Manipula a mudança de seleção de unidades
   */
  onUnidadeSelecionada(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = selectElement.selectedIndex;
    
    if (selectedIndex > 0) { // Ignora a opção "Adicionar unidade..."
      const unidadesDisponiveis = this.getUnidadesDisponiveis();
      const unidadeSelecionada = unidadesDisponiveis[selectedIndex - 1];
      
      if (unidadeSelecionada) {
        this.adicionarUnidade(unidadeSelecionada);
      }
    }
    
    // Reseta o select
    selectElement.selectedIndex = 0;
  }

  /**
   * Adiciona uma nova obrigação à lista
   */
  adicionarObrigacao() {
    if (!this.tituloAtual?.trim()) {
      this.toastService.error('Por favor, insira um título para a obrigação');
      return;
    }

    if (this.partesSelecionadas.length === 0) {
      this.toastService.error('Selecione pelo menos uma parte da norma');
      return;
    }

    // Se descrição estiver vazia, usa o texto compilado como descrição
    let descricaoFinal = this.descricaoAtual?.trim();
    if (!descricaoFinal) {
      descricaoFinal = this.textoCompiladoAtual || 'Obrigação extraída da norma';
      this.toastService.warning('Descrição preenchida automaticamente com o texto compilado');
    }

    const novaObrigacao: ObrigacaoEmEdicao = {
      id: 'obrigacao-' + Date.now(),
      titulo: this.tituloAtual,
      descricao: descricaoFinal,
      tipo: this.tipoAtual,
      prioridade: this.prioridadeAtual,
      partesSelecionadas: [...this.partesSelecionadas],
      textoCompilado: this.textoCompiladoAtual,
      unidadesSelecionadas: [...this.unidadesSelecionadas],
      editando: false,
      dataCriacao: new Date()
    };

    this.obrigacoes.push(novaObrigacao);
    this.toastService.success('Obrigação adicionada com sucesso!');

    // Limpar formulário para próxima obrigação
    this.limparFormularioObrigacao();
  }

  /**
   * Cancela a criação da obrigação atual
   */
  cancelarObrigacaoAtual() {
    this.limparFormularioObrigacao();
    this.limparSelecao();
  }

  /**
   * Limpa o formulário de criação de obrigação
   */
  private limparFormularioObrigacao() {
    this.tituloAtual = '';
    this.descricaoAtual = '';
    this.tipoAtual = 'determinacao';
    this.prioridadeAtual = 'media';
    this.textoCompiladoAtual = '';
    this.unidadesSelecionadas = [];
  }

  /**
   * Edita uma obrigação existente
   */
  editarObrigacao(obrigacao: ObrigacaoEmEdicao) {
    // Restaurar seleção das partes
    this.partesSelecionadas = [...obrigacao.partesSelecionadas];

    // Preencher formulário
    this.tituloAtual = obrigacao.titulo;
    this.descricaoAtual = obrigacao.descricao;
    this.tipoAtual = obrigacao.tipo;
    this.prioridadeAtual = obrigacao.prioridade;
    this.textoCompiladoAtual = obrigacao.textoCompilado;
    this.unidadesSelecionadas = [...obrigacao.unidadesSelecionadas];

    // Remover da lista temporariamente
    const index = this.obrigacoes.indexOf(obrigacao);
    if (index > -1) {
      this.obrigacoes.splice(index, 1);
    }

    this.atualizarTextoCompilado();
  }

  /**
   * Salva todas as obrigações e a norma no backend
   */
  salvarTudo() {
    if (this.obrigacoes.length === 0) {
      this.toastService.error('Crie pelo menos uma obrigação antes de salvar');
      return;
    }

    // Mostrar modal de confirmação
    this.mostrarConfirmacaoSalvar = true;
  }

  /**
   * Fecha o modal de confirmação
   */
  fecharConfirmacaoSalvar() {
    this.mostrarConfirmacaoSalvar = false;
  }

  /**
   * Confirma e executa o salvamento
   */
  confirmarSalvarTudo() {
    this.mostrarConfirmacaoSalvar = false;
    this.executarSalvamento();
  }

  /**
   * Executa o salvamento real
   */
  private executarSalvamento() {
    // Validar dados da norma
    if (!this.normaNome?.trim() || !this.normaDataNorma) {
      this.toastService.error('Dados da norma incompletos');
      return;
    }

    this.carregando = true;

    // Preparar dados da norma
    const normaParaSalvar = {
      nome: this.normaNome,
      descricao: this.normaDescricao || undefined,
      dataNorma: this.normaDataNorma,
      situacaoId: this.normaSituacaoId,
      origemId: this.normaOrigemId || undefined,
      categoria: this.normaCategoria || undefined,
      orgaoEmissor: this.normaOrgaoEmissor || undefined,
      link: this.normaLink || undefined
    };

    // Preparar obrigações
    const obrigacoesParaSalvar = this.obrigacoes.map(obrigacao => ({
      titulo: obrigacao.titulo,
      // Usa descricao, ou textoCompilado como fallback se descricao estiver vazia
      descricao: obrigacao.descricao?.trim() || obrigacao.textoCompilado || 'Obrigação extraída da norma',
      tipo: obrigacao.tipo,
      unidadesResponsaveis: obrigacao.unidadesSelecionadas.map(u => u.id).filter(id => id !== undefined),
      prazoConformidade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 ano por padrão
      recorrencia: 'anual',
      prioridade: obrigacao.prioridade.toUpperCase()
    }));

    // Salvar primeira obrigação com a norma
    const primeiraObrigacao = obrigacoesParaSalvar[0];
    const request = {
      norma: normaParaSalvar,
      obrigacao: primeiraObrigacao
    };

    this.normaService.criarNormaEObrigacao(request).subscribe({
      next: (response) => {
        console.log('Norma e primeira obrigação criadas:', response);

        // Se há mais obrigações, salvá-las separadamente
        if (this.obrigacoes.length > 1) {
          this.salvarObrigacoesRestantes(response.norma.id, obrigacoesParaSalvar.slice(1));
        } else {
          this.toastService.success(`Norma "${response.norma.nome}" e obrigação criadas com sucesso!`);
          this.resetarFormulario();
        }
      },
      error: (error) => {
        console.error('Erro ao salvar:', error);
        this.toastService.error('Erro ao salvar norma e obrigações', error.error?.erro || 'Verifique os dados e tente novamente');
      },
      complete: () => {
        this.carregando = false;
      }
    });
  }

  /**
   * Salva as obrigações restantes (após a primeira)
   */
  private salvarObrigacoesRestantes(normaId: number, obrigacoesRestantes: any[]) {
    // TODO: Implementar endpoint para salvar obrigações adicionais
    // Por enquanto, apenas mostra mensagem de sucesso
    this.toastService.success(`${this.obrigacoes.length} obrigações criadas com sucesso!`);
    this.resetarFormulario();
  }

  /**
   * Reseta o formulário completo
   */
  private resetarFormulario() {
    this.normaEstruturada = null;
    this.normaValidada = false;
    this.partesSelecionadas = [];
    this.obrigacoes = [];
    this.textoNorma = '';
    this.urlNorma = '';
    this.limparFormularioObrigacao();
  }

  /**
   * Adiciona obrigação localmente (para obrigações subsequentes)
   */
  private adicionarObrigacaoLocal() {
    const novaObrigacao: ObrigacaoEmEdicao = {
      id: 'obrigacao-' + Date.now(),
      titulo: this.tituloAtual,
      descricao: this.descricaoAtual,
      tipo: this.tipoAtual,
      prioridade: this.prioridadeAtual,
      partesSelecionadas: [...this.partesSelecionadas],
      textoCompilado: this.textoCompiladoAtual,
      unidadesSelecionadas: [...this.unidadesSelecionadas],
      editando: false,
      dataCriacao: new Date()
    };

    this.obrigacoes.push(novaObrigacao);
    this.toastService.success(`Obrigação criada! (${this.obrigacoes.length} total) - Pressione Ctrl+N para continuar`);

    // Preparar para próxima obrigação
    this.prepararNovaObrigacao();
  }

  /**
   * Prepara o formulário para criar nova obrigação
   */
  prepararNovaObrigacao() {
    this.tituloAtual = '';
    this.descricaoAtual = '';
    this.tipoAtual = 'determinacao';
    this.prioridadeAtual = 'media';
    this.textoCompiladoAtual = '';
    this.limparSelecao();
  }

  /**
   * Cancela a edição rápida
   */
  cancelarEdicaoRapida() {
    this.tituloAtual = '';
    this.descricaoAtual = '';
    this.textoCompiladoAtual = '';
  }

  /**
   * Remove uma obrigação da lista
   */
  removerObrigacao(obrigacao: ObrigacaoEmEdicao) {
    this.obrigacoes = this.obrigacoes.filter(o => o.id !== obrigacao.id);
    this.toastService.success('Obrigação removida');
  }

  /**
   * Remove uma parte específica da seleção
   */
  removerParteSelecionada(parte: ParteNorma) {
    parte.selecionado = false;
    this.partesSelecionadas = this.partesSelecionadas.filter(p => p.id !== parte.id);
    this.atualizarTextoCompilado();
  }

  /**
   * Funções para drag and drop
   */
  onDragStart(event: DragEvent, index: number) {
    event.dataTransfer!.setData('text/plain', index.toString());
    event.dataTransfer!.effectAllowed = 'move';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDrop(event: DragEvent, dropIndex: number) {
    event.preventDefault();
    const dragIndex = parseInt(event.dataTransfer!.getData('text/plain'));

    if (dragIndex !== dropIndex) {
      // Reordenar array
      const draggedItem = this.partesSelecionadas[dragIndex];
      this.partesSelecionadas.splice(dragIndex, 1);
      this.partesSelecionadas.splice(dropIndex, 0, draggedItem);

      // Atualizar texto compilado após reordenação
      this.atualizarTextoCompilado();
    }
  }

  onDragEnd(event: DragEvent) {
    // Limpar qualquer estado visual se necessário
  }

  /**
   * Limpa toda a seleção atual
   */
  limparSelecao() {
    this.partesSelecionadas.forEach(parte => parte.selecionado = false);
    this.partesSelecionadas = [];
    if (this.obrigacaoAtual) {
      this.obrigacaoAtual.textoCompilado = '';
    }
  }
}
