export interface SituacaoObrigacao {
  id?: number;
  codigo: string;
  descricao: string;
  descricaoAcr?: string;  // Descrição vista pela ACR
  descricaoUnidade?: string;  // Descrição vista pelo Gestor/Usuário da Unidade
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SituacaoObrigacaoDTO {
  id?: number;
  codigo: string;
  descricao: string;
  descricaoAcr?: string;
  descricaoUnidade?: string;
  ativo: boolean;
}

/**
 * Códigos padrão de situação de obrigação
 */
export enum CodigoSituacaoObrigacao {
  AGUARDANDO_EVIDENCIA = 'AGUARDANDO_EVIDENCIA',
  AGUARDANDO_APROVACAO_GESTOR = 'AGUARDANDO_APROVACAO_GESTOR',
  APROVADO_GESTOR = 'APROVADO_GESTOR',
  ATENDE_INTEGRALMENTE = 'ATENDE_INTEGRALMENTE',
  ATENDE_PARCIALMENTE = 'ATENDE_PARCIALMENTE',
  NAO_SE_APLICA = 'NAO_SE_APLICA'
}