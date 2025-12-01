export interface ObrigacaoResponsavel {
  id: number;
  obrigacaoId: number;
  obrigacaoTitulo?: string;
  obrigacaoDescricao?: string;
  prazoConformidade?: Date;
  unidadeId: number;
  unidadeNome?: string;
  unidadeSigla?: string;
  situacao: string;
  observacoes?: string;
  dataCadastro: Date;
  dataAtualizacao?: Date;
  quantidadeEvidencias?: number;
  quantidadePlanos?: number;
  evidencias?: Evidencia[];
  planosAcao?: PlanoAcao[];
}

export interface Evidencia {
  id: number;
  obrigacaoResponsavelId: number;
  tipo: 'texto' | 'arquivo' | 'link';
  titulo: string;
  descricao?: string;
  conteudoTexto?: string;
  arquivoNome?: string;
  arquivoCaminho?: string;
  arquivoTipo?: string;
  arquivoTamanho?: number;
  linkUrl?: string;
  dataCadastro: Date;
  cadastradoPor: string;

  // Campos de aprovação
  statusAprovacao?: string;
  dataEnvioGestor?: Date;
  dataAprovacaoGestor?: Date;
  aprovadoGestorPor?: string;
  observacoesGestor?: string;
  dataEnvioAcr?: Date;
  dataAprovacaoAcr?: Date;
  aprovadoAcrPor?: string;
  observacoesAcr?: string;
}

export interface PlanoAcao {
  id: number;
  obrigacaoResponsavelId: number;
  titulo: string;
  whatOQue?: string;
  whyPorQue?: string;
  whereOnde?: string;
  whenQuando?: Date;
  whoQuem?: string;
  howComo?: string;
  howMuchQuantoCusta?: string;
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
  dataInicio?: Date;
  dataConclusao?: Date;
  dataCadastro: Date;
  cadastradoPor: string;

  // Campos de aprovação
  statusAprovacao?: string;
  dataEnvioGestor?: Date;
  dataAprovacaoGestor?: Date;
  aprovadoGestorPor?: string;
  observacoesGestor?: string;
  dataEnvioAcr?: Date;
  dataAprovacaoAcr?: Date;
  aprovadoAcrPor?: string;
  observacoesAcr?: string;
}

export interface CriarEvidenciaRequest {
  tipo: 'TEXTO' | 'ARQUIVO' | 'LINK';
  titulo: string;
  descricao?: string;
  conteudoTexto?: string;
  linkUrl?: string;
}

export interface CriarPlanoAcaoRequest {
  titulo: string;
  whatOQue?: string;
  whyPorQue?: string;
  whereOnde?: string;
  whenQuando?: Date;
  whoQuem?: string;
  howComo?: string;
  howMuchQuantoCusta?: string;
}

export interface AprovacaoRequest {
  aprovado: boolean; // true = aprovar, false = solicitar revisão
  observacoes?: string;
  situacaoFinal?: string; // Situação final escolhida pela ACR: ATENDE_INTEGRALMENTE, ATENDE_PARCIALMENTE, NAO_SE_APLICA
}

export enum StatusAprovacao {
  RASCUNHO = 'RASCUNHO',
  EM_ANALISE_GESTOR = 'EM_ANALISE_GESTOR',
  APROVADO_GESTOR = 'APROVADO_GESTOR',
  REVISAO_SOLICITADA_GESTOR = 'REVISAO_SOLICITADA_GESTOR',
  EM_ANALISE_ACR = 'EM_ANALISE_ACR',
  APROVADO_ACR = 'APROVADO_ACR',
  REVISAO_SOLICITADA_ACR = 'REVISAO_SOLICITADA_ACR',
  REJEITADO = 'REJEITADO'
}
