import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { 
  ExtracaoService, 
  ResultadoCompleto,
  ObrigacaoCompleta 
} from './extracao.service';
import { NormaService } from '../normas/norma.service';
import { ObrigacaoService } from '../obrigacoes/obrigacao.service';
import { Norma } from '../normas/norma.model';
import { ObrigacaoForm } from '../../models/obrigacao.model';
import { SituacaoNormaService } from '../SituacaoNorma/situacao-norma.service';
import { OrigemService } from '../origem/origem.service';
import { UnidadeService } from '../unidades/unidade.service';
import { SituacaoNorma } from '../SituacaoNorma/situacao-norma.model';
import { Origem } from '../origem/origem.model';
import { Unidade } from '../unidades/unidade.model';

interface ObrigacaoEditavel {
  id?: number;
  titulo: string;
  descricao: string;
  tipo: 'recomendacao' | 'determinacao';
  unidadesResponsaveis: number[];
  prazoConformidade: string;
  recorrencia: 'unica' | 'mensal' | 'trimestral' | 'semestral' | 'anual';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  observacoes?: string;
  // Dados originais da extração
  artigo_dispositivo_legal: string;
  obrigacao_requisito: string;
  texto_integral: string;
  area_compliance: string;
  unidades_responsaveis: any;
  // Controle de aprovação
  aprovada: boolean;
  salvando: boolean;
}

interface NormaForm {
  nome: string;
  numero: string;
  descricao?: string;
  dataNorma: string;
  dataPublicacao?: string;
  situacaoId: number;
  origemId?: number;
  categoria?: string;
  orgaoEmissor?: string;
  link?: string;
}

@Component({
  selector: 'app-extracao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './extracao.component.html',
  styleUrl: './extracao.component.css'
})
export class ExtracaoComponent implements OnInit {
  // Estado da URL
  urlNorma = '';
  
  // Estados da interface
  carregando = false;
  processando = false;
  etapaAtual = '';
  
  // Resultado da extração
  resultado: ResultadoCompleto | null = null;
  obrigacaoSelecionada: ObrigacaoCompleta | null = null;
  mostrarDetalhes = false;
  
  // Estado de aprovação
  modoAprovacao = false;
  salvando = false;
  obrigacoesEditaveis: ObrigacaoEditavel[] = [];
  
  // Dados para formulários
  normaForm: NormaForm = {
    nome: '',
    numero: '',
    descricao: '',
    dataNorma: '',
    dataPublicacao: '',
    situacaoId: 1, // Pendente por padrão
    origemId: undefined, // Não definir padrão para evitar erro
    categoria: '',
    orgaoEmissor: '',
    link: ''
  };
  
  // Controle da norma salva
  normaSalva: Norma | null = null;
  
  // Propriedades computadas para o template
  get obrigacoesAprovadas(): number {
    return this.obrigacoesEditaveis.filter(o => o.aprovada).length;
  }
  
  get progressoAprovacao(): number {
    if (this.obrigacoesEditaveis.length === 0) return 0;
    return (this.obrigacoesAprovadas / this.obrigacoesEditaveis.length) * 100;
  }
  
  // Listas de referência
  situacoesNorma: SituacaoNorma[] = [];
  origens: Origem[] = [];
  unidades: Unidade[] = [];
  
  // Busca de unidades
  buscaUnidades = '';
  
  // Mensagens de feedback
  erro: string | null = null;
  sucesso: string | null = null;

  // Estatísticas
  totalObrigacoes = 0;
  obrigacoesComResponsavel = 0;
  
  // Status da API
  apiStatus: string | null = null;

  // URLs de exemplo
  exemplosUrl = [
    'https://atos.cnj.jus.br/atos/detalhar/5163',
    'https://atos.cnj.jus.br/atos/detalhar/4444',
    'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/L13853.htm'
  ];

  constructor(
    private extracaoService: ExtracaoService,
    private normaService: NormaService,
    private obrigacaoService: ObrigacaoService,
    private situacaoNormaService: SituacaoNormaService,
    private origemService: OrigemService,
    private unidadeService: UnidadeService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.verificarStatusAPI();
    this.carregarDadosReferencia();
  }

  /**
   * Carrega dados de referência necessários para os formulários
   */
  carregarDadosReferencia(): void {
    // Carregar situações de norma
    this.situacaoNormaService.listar().subscribe({
      next: (situacoes: SituacaoNorma[]) => {
        this.situacoesNorma = situacoes;
      },
      error: (err: any) => console.error('Erro ao carregar situações:', err)
    });

    // Carregar origens
    this.origemService.listarTodas().subscribe({
      next: (origens: Origem[]) => {
        this.origens = origens;
      },
      error: (err: any) => console.error('Erro ao carregar origens:', err)
    });

    // Carregar unidades
    this.unidadeService.listarTodas().subscribe({
      next: (unidades: Unidade[]) => {
        this.unidades = unidades;
      },
      error: (err: any) => console.error('Erro ao carregar unidades:', err)
    });
  }

  /**
   * Calcula um prazo padrão (6 meses a partir de hoje)
   */
  private calcularPrazoPadrao(): string {
    const data = new Date();
    data.setMonth(data.getMonth() + 6);
    return data.toISOString().split('T')[0];
  }

  /**
   * Salva a norma
   */
  private salvarNorma(): Observable<Norma> {
    const normaParaSalvar: Norma = {
      nome: this.normaForm.nome,
      numero: this.normaForm.numero,
      descricao: this.normaForm.descricao,
      dataNorma: this.normaForm.dataNorma,
      dataPublicacao: this.normaForm.dataPublicacao,
      situacaoId: this.normaForm.situacaoId,
      origemId: this.normaForm.origemId,
      categoria: this.normaForm.categoria,
      orgaoEmissor: this.normaForm.orgaoEmissor,
      link: this.normaForm.link
    };

    return this.normaService.criarNorma(normaParaSalvar);
  }

  /**
   * Verifica se a API de extração está disponível
   */
  verificarStatusAPI(): void {
    this.extracaoService.verificarStatus().subscribe({
      next: (status) => {
        this.apiStatus = status;
        console.log('✅ API de Extração:', status);
      },
      error: (err) => {
        console.error('❌ Erro ao verificar status da API:', err);
        this.apiStatus = 'Indisponível';
      }
    });
  }

  /**
   * Usa uma URL de exemplo
   */
  usarExemplo(url: string): void {
    this.urlNorma = url;
  }

  /**
   * Valida a URL fornecida
   */
  validarUrl(): boolean {
    if (!this.urlNorma || this.urlNorma.trim() === '') {
      this.erro = 'Por favor, insira uma URL válida';
      this.toastService.error('Por favor, insira uma URL válida');
      return false;
    }

    try {
      new URL(this.urlNorma);
      return true;
    } catch {
      this.erro = 'URL inválida. Verifique o formato (ex: https://exemplo.com)';
      this.toastService.error('URL inválida');
      return false;
    }
  }

  /**
   * Inicia o processo de extração
   */
  extrair(): void {
    if (!this.validarUrl()) {
      return;
    }

    this.carregando = true;
    this.processando = true;
    this.erro = null;
    this.sucesso = null;
    this.resultado = null;
    this.etapaAtual = 'Iniciando extração...';

    console.log('🚀 Iniciando extração da URL:', this.urlNorma);

    // Simula etapas para melhor UX
    this.simularEtapas();

    this.extracaoService.extrairPorUrl(this.urlNorma).subscribe({
      next: (resultado) => {
        this.carregando = false;
        this.processando = false;
        this.resultado = resultado;
        this.etapaAtual = '';
        
        this.totalObrigacoes = resultado.obrigacoes.length;
        this.obrigacoesComResponsavel = resultado.obrigacoes.filter(
          o => o.unidades_responsaveis?.principal
        ).length;

        // Inicializar modo de aprovação
        this.inicializarModoAprovacao(resultado);

        this.sucesso = `✅ Extração concluída! ${this.totalObrigacoes} obrigações encontradas. Revise e aprove para salvar.`;
        this.toastService.success(
          'Extração concluída',
          `${this.totalObrigacoes} obrigações extraídas. Revise antes de aprovar.`
        );
        
        console.log('✅ Extração concluída:', resultado);
      },
      error: (err) => {
        this.carregando = false;
        this.processando = false;
        this.etapaAtual = '';
        
        const mensagem = err.error?.message || err.error || 'Erro ao processar a URL';
        this.erro = `❌ ${mensagem}`;
        this.toastService.error('Erro na extração', mensagem);
        
        console.error('❌ Erro na extração:', err);
      }
    });
  }

  /**
   * Simula as etapas do processamento para feedback visual
   */
  private simularEtapas(): void {
    setTimeout(() => {
      if (this.processando) {
        this.etapaAtual = '📥 Extraindo conteúdo da URL...';
      }
    }, 1000);

    setTimeout(() => {
      if (this.processando) {
        this.etapaAtual = '🤖 Processando obrigações com IA...';
      }
    }, 5000);

    setTimeout(() => {
      if (this.processando) {
        this.etapaAtual = '👥 Atribuindo unidades responsáveis...';
      }
    }, 10000);

    setTimeout(() => {
      if (this.processando) {
        this.etapaAtual = '⚙️ Finalizando processamento...';
      }
    }, 15000);
  }

  /**
   * Inicializa o modo de aprovação com os dados extraídos
   */
  inicializarModoAprovacao(resultado: ResultadoCompleto): void {
    this.modoAprovacao = true;

    // Preencher formulário da norma
    this.normaForm = {
      nome: resultado.norma,
      numero: this.extrairNumeroNorma(resultado.norma),
      descricao: resultado.ementa,
      dataNorma: resultado.data_publicacao,
      dataPublicacao: resultado.data_publicacao,
      situacaoId: 1, // Pendente
      origemId: 1, // Origem padrão
      categoria: '',
      orgaoEmissor: this.extrairOrgaoEmissor(resultado.norma),
      link: this.urlNorma
    };

    // Converter obrigações extraídas para editáveis
    this.obrigacoesEditaveis = resultado.obrigacoes.map((obrigacao, index) => ({
      titulo: obrigacao.artigo_dispositivo_legal,
      descricao: obrigacao.obrigacao_requisito,
      tipo: 'determinacao' as const,
      unidadesResponsaveis: this.extrairUnidadesResponsaveis(obrigacao),
      prazoConformidade: this.calcularPrazoPadrao(),
      recorrencia: 'unica' as const,
      prioridade: 'media' as const,
      observacoes: obrigacao.texto_integral,
      // Manter dados originais
      artigo_dispositivo_legal: obrigacao.artigo_dispositivo_legal,
      obrigacao_requisito: obrigacao.obrigacao_requisito,
      texto_integral: obrigacao.texto_integral,
      area_compliance: obrigacao.area_compliance,
      unidades_responsaveis: obrigacao.unidades_responsaveis,
      // Controle de aprovação
      aprovada: false,
      salvando: false
    }));
  }

  /**
   * Extrai o número da norma do texto
   */
  private extrairNumeroNorma(norma: string): string {
    const match = norma.match(/(\d+)/);
    return match ? match[1] : '';
  }

  /**
   * Extrai o órgão emissor da norma
   */
  private extrairOrgaoEmissor(norma: string): string {
    // Lógica simples para extrair órgão - pode ser melhorada
    if (norma.toLowerCase().includes('cnj')) return 'CNJ';
    if (norma.toLowerCase().includes('stj')) return 'STJ';
    if (norma.toLowerCase().includes('tcu')) return 'TCU';
    return '';
  }

  /**
   * Extrai IDs das unidades responsáveis da obrigação extraída
   */
  private extrairUnidadesResponsaveis(obrigacao: ObrigacaoCompleta): number[] {
    const unidades: number[] = [];
    
    if (obrigacao.unidades_responsaveis?.principal) {
      const unidade = this.unidades.find(u => u.sigla === obrigacao.unidades_responsaveis.principal.sigla);
      if (unidade && unidade.id) unidades.push(unidade.id);
    }

    if (obrigacao.unidades_responsaveis?.apoio) {
      obrigacao.unidades_responsaveis.apoio.forEach(apoio => {
        const unidade = this.unidades.find(u => u.sigla === apoio.sigla);
        if (unidade && unidade.id && !unidades.includes(unidade.id)) unidades.push(unidade.id);
      });
    }

    return unidades;
  }

  /**
   * Aprova uma obrigação individualmente
   */
  aprovarObrigacao(index: number): void {
    const obrigacao = this.obrigacoesEditaveis[index];
    
    if (!this.validarObrigacaoIndividual(obrigacao) || !this.validarNormaParaAprovacao()) {
      return;
    }

    obrigacao.salvando = true;

    // Primeiro salvar a norma se ainda não foi salva
    if (!this.normaSalva) {
      this.salvarNorma().subscribe({
        next: (normaSalva) => {
          this.normaSalva = normaSalva;
          this.salvarObrigacaoIndividual(index, normaSalva.id!);
        },
        error: (err: any) => {
          obrigacao.salvando = false;
          const mensagem = err.error?.message || 'Erro ao salvar norma';
          this.toastService.error('Erro ao salvar norma', mensagem);
        }
      });
    } else {
      this.salvarObrigacaoIndividual(index, this.normaSalva.id!);
    }
  }

  /**
   * Salva uma obrigação individual
   */
  private salvarObrigacaoIndividual(index: number, normaId: number): void {
    const obrigacao = this.obrigacoesEditaveis[index];
    
    const obrigacaoForm = {
      normaId: normaId,
      titulo: obrigacao.titulo,
      descricao: obrigacao.descricao,
      tipo: obrigacao.tipo,
      unidadesResponsaveis: obrigacao.unidadesResponsaveis,
      prazoConformidade: obrigacao.prazoConformidade,
      recorrencia: obrigacao.recorrencia,
      prioridade: obrigacao.prioridade,
      observacoes: obrigacao.observacoes,
      situacao: 'pendente' as const,
      ativo: true
    };

    this.obrigacaoService.criarObrigacao(obrigacaoForm).subscribe({
      next: (obrigacaoSalva) => {
        obrigacao.salvando = false;
        obrigacao.aprovada = true;
        obrigacao.id = obrigacaoSalva.id;
        
        this.toastService.success('Obrigação aprovada', `Obrigação "${obrigacao.titulo}" foi salva com sucesso.`);
        
        // Verificar se todas as obrigações foram aprovadas
        this.verificarNormaCompleta();
      },
      error: (err) => {
        obrigacao.salvando = false;
        const mensagem = err.error?.message || 'Erro ao salvar obrigação';
        this.toastService.error('Erro ao salvar obrigação', mensagem);
      }
    });
  }

  /**
   * Verifica se a norma pode ser marcada como completa
   */
  private verificarNormaCompleta(): void {
    const todasAprovadas = this.obrigacoesEditaveis.every(o => o.aprovada);
    if (todasAprovadas && this.normaSalva) {
      // Atualizar situação da norma para "completa" ou similar
      this.normaService.atualizarNorma(this.normaSalva.id!, { ...this.normaSalva, situacaoId: 2 }) // Assumindo 2 = Aprovada
        .subscribe({
          next: () => {
            this.toastService.success('Norma completa', 'Todas as obrigações foram aprovadas e a norma foi finalizada.');
            this.limpar();
          },
          error: (err) => console.error('Erro ao atualizar norma:', err)
        });
    }
  }

  /**
   * Valida se a norma tem dados suficientes para aprovação
   */
  private validarNormaParaAprovacao(): boolean {
    if (!this.normaForm.nome || !this.normaForm.numero || !this.normaForm.dataNorma || !this.normaForm.origemId) {
      this.toastService.error('Dados da norma incompletos', 'Preencha nome, número, data e origem da norma primeiro');
      return false;
    }
    return true;
  }

  /**
   * Valida uma obrigação individual
   */
  private validarObrigacaoIndividual(obrigacao: ObrigacaoEditavel): boolean {
    if (!obrigacao.titulo || !obrigacao.descricao || obrigacao.unidadesResponsaveis.length === 0) {
      this.toastService.error('Obrigação incompleta', 'Preencha título, descrição e pelo menos uma unidade responsável');
      return false;
    }
    return true;
  }

  /**
   * Toggle seleção de unidade responsável
   */
  toggleUnidadeResponsavel(obrigacao: ObrigacaoEditavel, unidadeId: number | undefined): void {
    if (!unidadeId) return;
    const index = obrigacao.unidadesResponsaveis.indexOf(unidadeId);
    if (index > -1) {
      obrigacao.unidadesResponsaveis.splice(index, 1);
    } else {
      obrigacao.unidadesResponsaveis.push(unidadeId);
    }
  }

  /**
   * Verifica se uma unidade está selecionada
   */
  isUnidadeSelecionada(obrigacao: ObrigacaoEditavel, unidadeId: number | undefined): boolean {
    if (!unidadeId) return false;
    return obrigacao.unidadesResponsaveis.includes(unidadeId);
  }

  /**
   * Filtrar unidades por busca
   */
  filtrarUnidades(termo: string): Unidade[] {
    if (!termo) return this.unidades;
    const termoLower = termo.toLowerCase();
    return this.unidades.filter(unidade => 
      unidade.nome.toLowerCase().includes(termoLower) ||
      unidade.sigla.toLowerCase().includes(termoLower) ||
      (unidade.descricao && unidade.descricao.toLowerCase().includes(termoLower))
    );
  }

  /**
   * Visualiza detalhes de uma obrigação
   */
  verDetalhes(obrigacao: ObrigacaoCompleta): void {
    this.obrigacaoSelecionada = obrigacao;
    this.mostrarDetalhes = true;
  }

  /**
   * Fecha o modal de detalhes
   */
  fecharDetalhes(): void {
    this.mostrarDetalhes = false;
    this.obrigacaoSelecionada = null;
  }

  /**
   * Aprova e salva a norma e obrigações
   */
  aprovarESalvar(): void {
    if (!this.validarFormularioNorma()) {
      return;
    }

    this.salvando = true;
    this.erro = null;

    // Primeiro salvar a norma
    const normaParaSalvar: Norma = {
      nome: this.normaForm.nome,
      numero: this.normaForm.numero,
      descricao: this.normaForm.descricao,
      dataNorma: this.normaForm.dataNorma,
      dataPublicacao: this.normaForm.dataPublicacao,
      situacaoId: this.normaForm.situacaoId,
      origemId: this.normaForm.origemId,
      categoria: this.normaForm.categoria,
      orgaoEmissor: this.normaForm.orgaoEmissor,
      link: this.normaForm.link
    };

    this.normaService.criarNorma(normaParaSalvar).subscribe({
      next: (normaSalva) => {
        console.log('Norma salva:', normaSalva);
        // Agora salvar as obrigações
        this.salvarObrigacoes(normaSalva.id!);
      },
      error: (err) => {
        this.salvando = false;
        const mensagem = err.error?.message || 'Erro ao salvar norma';
        this.erro = `❌ ${mensagem}`;
        this.toastService.error('Erro ao salvar norma', mensagem);
      }
    });
  }

  /**
   * Salva as obrigações após a norma ser salva
   */
  private salvarObrigacoes(normaId: number): void {
    const obrigacoesParaSalvar = this.obrigacoesEditaveis.map(obrigacao => ({
      normaId: normaId,
      titulo: obrigacao.titulo,
      descricao: obrigacao.descricao,
      tipo: obrigacao.tipo,
      unidadesResponsaveis: obrigacao.unidadesResponsaveis,
      prazoConformidade: obrigacao.prazoConformidade,
      recorrencia: obrigacao.recorrencia,
      prioridade: obrigacao.prioridade,
      observacoes: obrigacao.observacoes,
      situacao: 'pendente' as const,
      ativo: true
    }));

    // Salvar obrigações uma por uma ou em lote
    let salvos = 0;
    let erros = 0;

    obrigacoesParaSalvar.forEach((obrigacaoForm, index) => {
      this.obrigacaoService.criarObrigacao(obrigacaoForm).subscribe({
        next: (obrigacaoSalva) => {
          salvos++;
          console.log(`Obrigação ${index + 1} salva:`, obrigacaoSalva);
          this.verificarConclusaoSalvamento(salvos, erros, obrigacoesParaSalvar.length);
        },
        error: (err) => {
          erros++;
          console.error(`Erro ao salvar obrigação ${index + 1}:`, err);
          this.verificarConclusaoSalvamento(salvos, erros, obrigacoesParaSalvar.length);
        }
      });
    });
  }

  /**
   * Verifica se o salvamento foi concluído
   */
  private verificarConclusaoSalvamento(salvos: number, erros: number, total: number): void {
    if (salvos + erros === total) {
      this.salvando = false;
      
      if (erros === 0) {
        this.sucesso = `✅ Norma e ${salvos} obrigações salvas com sucesso!`;
        this.toastService.success('Salvamento concluído', `Norma e obrigações aprovadas e salvas.`);
        
        // Limpar formulários e voltar ao estado inicial
        this.limpar();
      } else {
        this.erro = `⚠️ Norma salva, mas ${erros} obrigações falharam.`;
        this.toastService.warning('Salvamento parcial', `Norma salva, mas ${erros} obrigações não puderam ser salvas.`);
      }
    }
  }

  /**
   * Valida o formulário da norma
   */
  private validarFormularioNorma(): boolean {
    if (!this.normaForm.nome || !this.normaForm.numero || !this.normaForm.dataNorma) {
      this.erro = 'Por favor, preencha os campos obrigatórios da norma (nome, número e data)';
      this.toastService.error('Campos obrigatórios', 'Preencha nome, número e data da norma');
      return false;
    }

    if (this.obrigacoesEditaveis.length === 0) {
      this.erro = 'Não há obrigações para salvar';
      this.toastService.error('Sem obrigações', 'Nenhuma obrigação foi extraída');
      return false;
    }

    // Validar obrigações
    for (let i = 0; i < this.obrigacoesEditaveis.length; i++) {
      const obrigacao = this.obrigacoesEditaveis[i];
      if (!obrigacao.titulo || !obrigacao.descricao || obrigacao.unidadesResponsaveis.length === 0) {
        this.erro = `Obrigação ${i + 1}: preencha título, descrição e pelo menos uma unidade responsável`;
        this.toastService.error('Obrigação incompleta', `Verifique os campos da obrigação ${i + 1}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Cancela o modo de aprovação
   */
  cancelarAprovacao(): void {
    this.modoAprovacao = false;
    this.obrigacoesEditaveis = [];
    this.normaForm = {
      nome: '',
      numero: '',
      descricao: '',
      dataNorma: '',
      dataPublicacao: '',
      situacaoId: 1,
      origemId: undefined,
      categoria: '',
      orgaoEmissor: '',
      link: ''
    };
    this.normaSalva = null;
  }

  /**
   * Limpa o formulário e resultado
   */
  limpar(): void {
    this.urlNorma = '';
    this.resultado = null;
    this.erro = null;
    this.sucesso = null;
    this.etapaAtual = '';
    this.totalObrigacoes = 0;
    this.obrigacoesComResponsavel = 0;
    this.modoAprovacao = false;
    this.obrigacoesEditaveis = [];
    this.normaForm = {
      nome: '',
      numero: '',
      descricao: '',
      dataNorma: '',
      dataPublicacao: '',
      situacaoId: 1,
      origemId: undefined,
      categoria: '',
      orgaoEmissor: '',
      link: ''
    };
    this.normaSalva = null;
  }

  /**
   * Exporta o resultado para JSON
   */
  exportarJSON(): void {
    if (!this.resultado) {
      this.toastService.warning('Nenhum resultado para exportar');
      return;
    }

    const dataStr = JSON.stringify(this.resultado, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `extracao_${new Date().getTime()}.json`;
    link.click();
    
    window.URL.revokeObjectURL(url);
    this.toastService.success('JSON exportado com sucesso!');
  }

  /**
   * Copia uma obrigação para a área de transferência
   */
  copiarObrigacao(obrigacao: ObrigacaoCompleta): void {
    const texto = `
${obrigacao.artigo_dispositivo_legal}
Requisito: ${obrigacao.obrigacao_requisito}
Área: ${obrigacao.area_compliance}
Responsável: ${obrigacao.unidades_responsaveis?.principal?.sigla} - ${obrigacao.unidades_responsaveis?.principal?.nome}
`.trim();

    navigator.clipboard.writeText(texto).then(() => {
      this.toastService.success('Obrigação copiada para a área de transferência!');
    });
  }

  /**
   * Retorna a classe CSS para o badge de área de compliance
   */
  getAreaBadgeClass(area: string): string {
    const areaLower = area.toLowerCase();
    if (areaLower.includes('governança')) return 'badge-governanca';
    if (areaLower.includes('auditoria')) return 'badge-auditoria';
    if (areaLower.includes('segurança')) return 'badge-seguranca';
    if (areaLower.includes('tecnologia') || areaLower.includes('ti')) return 'badge-tecnologia';
    if (areaLower.includes('dados') || areaLower.includes('lgpd')) return 'badge-dados';
    return 'badge-outros';
  }
}
