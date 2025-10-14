export interface SituacaoObrigacao {
  id?: number;
  codigo: string;
  descricao: string;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SituacaoObrigacaoDTO {
  id?: number;
  codigo: string;
  descricao: string;
  ativo: boolean;
}