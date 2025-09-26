export interface Origem {
  id?: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  dataInicio?: string;
  dataFim?: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
  criadoPor?: string;
  atualizadoPor?: string;
}

export interface OrigemEstatisticas {
  total: number;
  ativas: number;
  inativas: number;
}