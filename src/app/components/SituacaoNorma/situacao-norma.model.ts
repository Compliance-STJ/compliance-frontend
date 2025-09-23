export interface SituacaoNorma {
  id?: number;
  codigo: string;
  descricao: string;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SituacaoNormaDTO {
  id?: number;
  codigo: string;
  descricao: string;
  ativo: boolean;
}