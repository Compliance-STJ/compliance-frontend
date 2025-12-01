import { Component, NO_ERRORS_SCHEMA, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { NormaService } from './norma.service'
import { Norma, NormaPage } from './norma.model'
import { SituacaoNormaService } from '../SituacaoNorma/situacao-norma.service'
import { OrigemService } from '../origem/origem.service'
import { ObrigatoriedadeService } from '../obrigatoriedade/obrigatoriedade.service'
import { SituacaoNorma } from '../SituacaoNorma/situacao-norma.model'
import { Origem } from '../origem/origem.model'
import { Obrigatoriedade } from '../obrigatoriedade/obrigatoriedade.model'
import { DialogComponent } from '../dialog/dialog.component'
import { ToastService } from '../../services/toast.service'

interface Responsavel {
  id: number
  nome: string
  email: string
  cargo: string
  departamento: string
}

interface ObrigacaoWithResponsaveis {
  id: number
  titulo: string
  descricao: string
  situacao: string
  prazo: string
  responsaveis: Responsavel[]
  evidencias: any[]
}

interface NormaWithObrigacoes {
  id: number
  nome: string
  numero: string
  situacao: string
  dataCadastro: string
  dataNorma: string
  categoria: string
  orgaoEmissor: string
  descricao: string
  obrigacoes: ObrigacaoWithResponsaveis[]
}

interface Evidencia {
  id: number
  tipo: string
  nome: string
  dataUpload: string
  responsavelId: number
  obrigacaoId: number
}

@Component({
  selector: "app-normas",
  standalone: true,
  imports: [CommonModule, FormsModule, DialogComponent],
  templateUrl: "./normas.component.html",
  styleUrl: "./normas.component.css",
  schemas: [NO_ERRORS_SCHEMA]
})
export class NormasComponent implements OnInit {
  // Listas de dados
  normasData: Norma[] = []
  situacoes: SituacaoNorma[] = []
  origens: Origem[] = []
  obrigatoriedades: Obrigatoriedade[] = []

  // Paginação
  totalElements = 0
  totalPages = 0
  currentPage = 0
  pageSize = 10

  // Estados
  loading = false
  showNormaDialog = false
  normaEditando: Norma | null = null

  // Filtros
  filtroSituacao: number | null = null
  termoBusca = ''

  // Mock data for demo - will be replaced by API data
  normasDataMock: NormaWithObrigacoes[] = [
    {
      id: 1,
      nome: "Lei Geral de Proteção de Dados (LGPD)",
      numero: "Lei nº 13.709/2018",
      situacao: "Ativa",
      dataCadastro: "2024-01-15",
      dataNorma: "2018-08-14",
      categoria: "Proteção de Dados",
      orgaoEmissor: "Congresso Nacional",
      descricao: "Dispõe sobre a proteção de dados pessoais e altera a Lei nº 12.965/2014",
      obrigacoes: [
        {
          id: 1,
          titulo: "Registro de Atividades de Tratamento",
          descricao: "Manter registro das operações de tratamento de dados pessoais",
          situacao: "Conforme",
          prazo: "2024-03-15",
          responsaveis: [
            { id: 1, nome: "João Silva", email: "joao.silva@empresa.com", cargo: "DPO", departamento: "Jurídico" },
            {
              id: 2,
              nome: "Maria Santos",
              email: "maria.santos@empresa.com",
              cargo: "Analista de Compliance",
              departamento: "Jurídico",
            },
          ],
          evidencias: [
            { id: 1, tipo: "Documento", nome: "Registro_Atividades_2024.pdf", dataUpload: "2024-01-10" },
            { id: 2, tipo: "Planilha", nome: "Mapeamento_Dados.xlsx", dataUpload: "2024-01-08" },
          ],
        },
        {
          id: 2,
          titulo: "Política de Privacidade",
          descricao: "Elaborar e manter atualizada a política de privacidade",
          situacao: "Pendente",
          prazo: "2024-02-28",
          responsaveis: [
            {
              id: 3,
              nome: "Carlos Mendes",
              email: "carlos.mendes@empresa.com",
              cargo: "Advogado",
              departamento: "Jurídico",
            },
          ],
          evidencias: [],
        },
      ],
    },
    {
      id: 2,
      nome: "Lei Sarbanes-Oxley (SOX)",
      numero: "Public Law 107-204",
      situacao: "Ativa",
      dataCadastro: "2024-01-10",
      dataNorma: "2002-07-30",
      categoria: "Controles Financeiros",
      orgaoEmissor: "SEC - Estados Unidos",
      descricao: "Estabelece controles internos para relatórios financeiros",
      obrigacoes: [
        {
          id: 3,
          titulo: "Controles Internos Financeiros",
          descricao: "Implementar e testar controles internos sobre relatórios financeiros",
          situacao: "Em Andamento",
          prazo: "2024-04-30",
          responsaveis: [
            {
              id: 4,
              nome: "Ana Costa",
              email: "ana.costa@empresa.com",
              cargo: "Controller",
              departamento: "Financeiro",
            },
            {
              id: 5,
              nome: "Pedro Lima",
              email: "pedro.lima@empresa.com",
              cargo: "Auditor Interno",
              departamento: "Auditoria",
            },
            {
              id: 6,
              nome: "Lucia Ferreira",
              email: "lucia.ferreira@empresa.com",
              cargo: "Gerente Financeiro",
              departamento: "Financeiro",
            },
          ],
          evidencias: [{ id: 3, tipo: "Relatório", nome: "Teste_Controles_Q1.pdf", dataUpload: "2024-01-20" }],
        },
      ],
    },
    {
      id: 3,
      nome: "ISO 27001:2013",
      numero: "ISO/IEC 27001:2013",
      situacao: "Em Revisão",
      dataCadastro: "2023-12-05",
      dataNorma: "2013-10-01",
      categoria: "Segurança da Informação",
      orgaoEmissor: "ISO",
      descricao: "Sistema de gestão de segurança da informação",
      obrigacoes: [
        {
          id: 4,
          titulo: "Análise de Riscos de Segurança",
          descricao: "Realizar análise de riscos de segurança da informação anualmente",
          situacao: "Não Conforme",
          prazo: "2024-01-31",
          responsaveis: [
            { id: 7, nome: "Roberto Silva", email: "roberto.silva@empresa.com", cargo: "CISO", departamento: "TI" },
            {
              id: 8,
              nome: "Fernanda Oliveira",
              email: "fernanda.oliveira@empresa.com",
              cargo: "Analista de Segurança",
              departamento: "TI",
            },
          ],
          evidencias: [],
        },
      ],
    },
  ]

  // Dialogs antigos (manter para compatibilidade com mock data)
  showObrigacaoDialog = false
  showResponsavelDialog = false
  showEvidenciaDialog = false
  expandedNormas: number[] = []
  expandedObrigacoes: number[] = []

  // Formulário
  normaForm: Norma = this.novoNormaForm()

  constructor(
    private normaService: NormaService,
    private situacaoNormaService: SituacaoNormaService,
    private origemService: OrigemService,
    private obrigatoriedadeService: ObrigatoriedadeService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.carregarSituacoes()
    this.carregarOrigens()
    this.carregarObrigatoriedades()
    this.carregarNormas()
  }

  novoNormaForm(): Norma {
    return {
      nome: "",
      numero: "",
      dataNorma: "",
      situacaoId: 1,
    }
  }

  carregarSituacoes(): void {
    this.situacaoNormaService.listar().subscribe({
      next: (situacoes) => {
        this.situacoes = situacoes
      },
      error: (error) => {
        console.error('Erro ao carregar situações:', error)
      }
    })
  }

  carregarOrigens(): void {
    this.origemService.listarAtivas().subscribe({
      next: (origens) => {
        this.origens = origens
      },
      error: (error) => {
        console.error('Erro ao carregar origens:', error)
      }
    })
  }

  carregarObrigatoriedades(): void {
    this.obrigatoriedadeService.listarAtivas().subscribe({
      next: (obrigatoriedades) => {
        this.obrigatoriedades = obrigatoriedades
      },
      error: (error) => {
        console.error('Erro ao carregar obrigatoriedades:', error)
      }
    })
  }

  carregarNormas(page: number = 0): void {
    this.loading = true
    this.normaService.listarNormas(page, this.pageSize).subscribe({
      next: (response: NormaPage) => {
        this.normasData = response.content
        this.totalElements = response.totalElements
        this.totalPages = response.totalPages
        this.currentPage = response.number
        this.loading = false
      },
      error: (error) => {
        console.error('Erro ao carregar normas:', error)
        this.loading = false
        this.toastService.loadError('normas', 'Não foi possível carregar a lista de normas.')
        // Keep mock data if API fails
        this.normasData = []
      }
    })
  }

  proximaPagina(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.carregarNormas(this.currentPage + 1)
    }
  }

  paginaAnterior(): void {
    if (this.currentPage > 0) {
      this.carregarNormas(this.currentPage - 1)
    }
  }

  obrigacaoForm = {
    titulo: "",
    descricao: "",
    situacao: "Pendente",
    prazo: "",
    normaId: 0,
  }

  responsavelForm = {
    nome: "",
    email: "",
    cargo: "",
    departamento: "",
    obrigacaoId: 0,
  }

  evidenciaForm = {
    tipo: "Documento",
    nome: "",
    responsavelId: 0,
    obrigacaoId: 0,
  }

  toggleNorma(normaId: number | undefined): void {
    if (normaId === undefined) return
    const index = this.expandedNormas.indexOf(normaId)
    if (index > -1) {
      this.expandedNormas.splice(index, 1)
    } else {
      this.expandedNormas.push(normaId)
    }
  }

  toggleObrigacao(obrigacaoId: number): void {
    const index = this.expandedObrigacoes.indexOf(obrigacaoId)
    if (index > -1) {
      this.expandedObrigacoes.splice(index, 1)
    } else {
      this.expandedObrigacoes.push(obrigacaoId)
    }
  }

  isNormaExpanded(normaId: number | undefined): boolean {
    if (normaId === undefined) return false
    return this.expandedNormas.includes(normaId)
  }

  isObrigacaoExpanded(obrigacaoId: number): boolean {
    return this.expandedObrigacoes.includes(obrigacaoId)
  }

  getSituacaoClass(situacao: string | undefined): string {
    if (!situacao) return "badge-secondary"
    switch (situacao) {
      case "Conforme":
      case "Ativa":
      case "ATIVA":
        return "badge-success"
      case "Não Conforme":
        return "badge-danger"
      case "Em Andamento":
      case "Pendente":
        return "badge-warning"
      case "Em Revisão":
      case "REVISAO":
        return "badge-info"
      default:
        return "badge-secondary"
    }
  }

  getSituacaoDescricao(norma: Norma): string {
    return norma.situacaoDescricao || norma.situacaoCodigo || 'Sem situação'
  }

  getObrigacoesCount(norma: any): number {
    // For API normas, we don't have nested obligations yet
    // For mock normas, we have the obrigacoes array
    return norma.obrigacoes?.length || 0
  }

  getSituacaoIcon(situacao: string): string {
    switch (situacao) {
      case "Conforme":
        return "✓"
      case "Não Conforme":
        return "⚠"
      case "Em Andamento":
      case "Pendente":
        return "⏱"
      default:
        return ""
    }
  }

  getInitials(nome: string): string {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  hasRequiredEvidencias(responsavel: Responsavel, obrigacao: ObrigacaoWithResponsaveis): boolean {
    return obrigacao.evidencias.some((evidencia) => evidencia.responsavelId === responsavel.id)
  }

  getResponsavelStatus(responsavel: Responsavel, obrigacao: ObrigacaoWithResponsaveis): string {
    return this.hasRequiredEvidencias(responsavel, obrigacao) ? "Conforme" : "Pendente"
  }

  adicionarNovaNorma(): void {
    this.normaEditando = null
    this.normaForm = this.novoNormaForm()
    this.showNormaDialog = true
  }

  editarNorma(norma: Norma): void {
    this.normaEditando = norma
    this.normaForm = { ...norma }
    this.showNormaDialog = true
  }

  visualizarNorma(norma: Norma): void {
    alert(`Norma: ${norma.nome}\nNúmero: ${norma.numero}\nDescrição: ${norma.descricao || 'N/A'}`)
  }

  filtrarPorSituacao(situacaoId: number | null): void {
    this.filtroSituacao = situacaoId
    this.currentPage = 0

    if (situacaoId === null) {
      this.carregarNormas(0)
    } else {
      this.loading = true
      this.normaService.buscarPorSituacao(situacaoId, 0, this.pageSize).subscribe({
        next: (response: NormaPage) => {
          this.normasData = response.content
          this.totalElements = response.totalElements
          this.totalPages = response.totalPages
          this.currentPage = response.number
          this.loading = false
        },
        error: (error) => {
          console.error('Erro ao filtrar normas:', error)
          this.loading = false
        }
      })
    }
  }

  buscar(): void {
    if (!this.termoBusca.trim()) {
      this.carregarNormas(0)
      return
    }

    this.loading = true
    this.normaService.buscarPorNome(this.termoBusca, 0, this.pageSize).subscribe({
      next: (response: NormaPage) => {
        this.normasData = response.content
        this.totalElements = response.totalElements
        this.totalPages = response.totalPages
        this.currentPage = response.number
        this.loading = false
      },
      error: (error) => {
        console.error('Erro ao buscar normas:', error)
        this.loading = false
      }
    })
  }

  formatarData(data: string | undefined): string {
    if (!data) return '-'
    const date = new Date(data)
    return date.toLocaleDateString('pt-BR')
  }

  adicionarNovaObrigacao(normaId: number): void {
    this.obrigacaoForm = {
      titulo: "",
      descricao: "",
      situacao: "Pendente",
      prazo: "",
      normaId: normaId,
    }
    this.showObrigacaoDialog = true
  }

  adicionarResponsavel(obrigacaoId: number): void {
    this.responsavelForm = {
      nome: "",
      email: "",
      cargo: "",
      departamento: "",
      obrigacaoId: obrigacaoId,
    }
    this.showResponsavelDialog = true
  }

  adicionarEvidencia(responsavelId: number, obrigacaoId: number): void {
    this.evidenciaForm = {
      tipo: "Documento",
      nome: "",
      responsavelId: responsavelId,
      obrigacaoId: obrigacaoId,
    }
    this.showEvidenciaDialog = true
  }

  salvarNorma(): void {
    this.loading = true

    if (this.normaEditando && this.normaEditando.id) {
      // Atualizar norma existente
      this.normaService.atualizarNorma(this.normaEditando.id, this.normaForm).subscribe({
        next: (norma) => {
          console.log('Norma atualizada com sucesso:', norma)
          this.toastService.saveSuccess(`Norma "${this.normaForm.nome}"`)
          this.showNormaDialog = false
          this.carregarNormas(this.currentPage)
        },
        error: (error) => {
          console.error('Erro ao atualizar norma:', error)
          this.loading = false
          this.toastService.saveError(`Norma "${this.normaForm.nome}"`, 'Verifique os dados e tente novamente.')
        }
      })
    } else {
      // Criar nova norma
      this.normaService.criarNorma(this.normaForm).subscribe({
        next: (norma) => {
          console.log('Norma criada com sucesso:', norma)
          this.toastService.saveSuccess(`Norma "${this.normaForm.nome}"`)
          this.showNormaDialog = false
          this.carregarNormas(this.currentPage)
        },
        error: (error) => {
          console.error('Erro ao criar norma:', error)
          this.loading = false
          this.toastService.saveError(`Norma "${this.normaForm.nome}"`, 'Verifique os dados e tente novamente.')
        }
      })
    }
  }

  excluirNorma(id: number): void {
    // Busca o nome da norma para mostrar no toast
    const norma = this.normasData.find(n => n.id === id);
    const nomeNorma = norma ? norma.nome : `Norma #${id}`;
    
    this.toastService.confirmDelete(nomeNorma, () => {
      this.executarExclusaoNorma(id, nomeNorma);
    });
  }
  
  private executarExclusaoNorma(id: number, nomeNorma: string): void {
    this.normaService.excluirNorma(id).subscribe({
      next: () => {
        console.log('Norma excluída com sucesso')
        this.toastService.deleteSuccess(nomeNorma);
        this.carregarNormas(this.currentPage)
      },
      error: (error) => {
        console.error('Erro ao excluir norma:', error)
        this.toastService.deleteError(nomeNorma, 'Verifique sua conexão e tente novamente.');
      }
    })
  }

  salvarObrigacao(): void {
    const norma = this.normasData.find((n) => n.id === this.obrigacaoForm.normaId)
    if (norma) {
      if (!norma.obrigacoes) {
        norma.obrigacoes = []
      }
      const novaObrigacao: ObrigacaoWithResponsaveis = {
        id: Date.now(),
        ...this.obrigacaoForm,
        responsaveis: [],
        evidencias: [],
      }
      norma.obrigacoes.push(novaObrigacao)
    }
    this.showObrigacaoDialog = false
  }

  salvarResponsavel(): void {
    for (const norma of this.normasData) {
      if (!norma.obrigacoes) continue
      const obrigacao = norma.obrigacoes.find((o) => o.id === this.responsavelForm.obrigacaoId)
      if (obrigacao) {
        const novoResponsavel: Responsavel = {
          id: Date.now(),
          nome: this.responsavelForm.nome,
          email: this.responsavelForm.email,
          cargo: this.responsavelForm.cargo,
          departamento: this.responsavelForm.departamento,
        }
        obrigacao.responsaveis.push(novoResponsavel)
        break
      }
    }
    this.showResponsavelDialog = false
  }

  salvarEvidencia(): void {
    for (const norma of this.normasData) {
      if (!norma.obrigacoes) continue
      const obrigacao = norma.obrigacoes.find((o) => o.id === this.evidenciaForm.obrigacaoId)
      if (obrigacao) {
        const novaEvidencia = {
          id: Date.now(),
          tipo: this.evidenciaForm.tipo,
          nome: this.evidenciaForm.nome,
          dataUpload: new Date().toISOString().split("T")[0],
          responsavelId: this.evidenciaForm.responsavelId,
        }
        obrigacao.evidencias.push(novaEvidencia)
        break
      }
    }
    this.showEvidenciaDialog = false
  }

  fecharDialog(): void {
    this.showNormaDialog = false
    this.showObrigacaoDialog = false
    this.showResponsavelDialog = false
    this.showEvidenciaDialog = false
    this.normaEditando = null
    this.normaForm = this.novoNormaForm()
  }

  editarResponsavel(responsavelId: number): void {
    // Implementação temporária do método editarResponsavel
    console.log('Editando responsável com ID:', responsavelId)

    // Procura o responsável em todas as obrigações de todas as normas
    for (const norma of this.normasData) {
      if (!norma.obrigacoes) continue
      for (const obrigacao of norma.obrigacoes) {
        const responsavel = obrigacao.responsaveis.find((r: Responsavel) => r.id === responsavelId)
        if (responsavel) {
          this.responsavelForm = {
            nome: responsavel.nome,
            email: responsavel.email,
            cargo: responsavel.cargo,
            departamento: responsavel.departamento,
            obrigacaoId: obrigacao.id
          }
          this.showResponsavelDialog = true
          return
        }
      }
    }
  }

  visualizarResponsavel(responsavelId: number): void {
    // Implementação temporária do método visualizarResponsavel
    console.log('Visualizando responsável com ID:', responsavelId)

    // Aqui você poderia implementar a lógica para mostrar detalhes do responsável
    // em um modal ou em uma área específica da página
    for (const norma of this.normasData) {
      if (!norma.obrigacoes) continue
      for (const obrigacao of norma.obrigacoes) {
        const responsavel = obrigacao.responsaveis.find((r: Responsavel) => r.id === responsavelId)
        if (responsavel) {
          alert(`Detalhes do Responsável:
Nome: ${responsavel.nome}
Email: ${responsavel.email}
Cargo: ${responsavel.cargo}
Departamento: ${responsavel.departamento}`)
          return
        }
      }
    }
  }
}
