export interface Unidade {
  id?: number;
  nome: string;
  sigla: string;
  descricao?: string;
  ativo: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
  criadoPor?: string;
  atualizadoPor?: string;
  email?: string;
  telefone?: string;
  responsavel?: string;
}

export interface UnidadeEstatisticas {
  total: number;
  ativas: number;
  inativas: number;
}