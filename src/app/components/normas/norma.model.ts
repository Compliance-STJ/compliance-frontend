export interface Norma {
  id?: number;
  nome: string;
  numero: string;
  descricao?: string;
  dataNorma: string; // ISO date format
  dataPublicacao?: string;
  dataVigencia?: string;

  // Informações da situação
  situacaoId: number;
  situacaoCodigo?: string;
  situacaoDescricao?: string;

  // Informações da origem
  origemId?: number;
  origemNome?: string;

  // Informações da obrigatoriedade
  obrigatoriedadeId?: number;
  obrigatoriedadeNome?: string;

  categoria?: string;
  orgaoEmissor?: string;
  link?: string;
  documentoAnexo?: string;
  observacoes?: string;

  dataCadastro?: string;
  dataAtualizacao?: string;
  cadastradoPor?: string;
  atualizadoPor?: string;

  // Optional nested obligations (for mock data compatibility)
  obrigacoes?: any[];
}

export interface NormaPage {
  content: Norma[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface NormaFilter {
  nome?: string;
  situacaoId?: number;
  origemId?: number;
  categoria?: string;
  page?: number;
  size?: number;
}
