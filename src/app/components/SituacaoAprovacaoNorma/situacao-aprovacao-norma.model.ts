export interface SituacaoAprovacaoNorma {
  id?: number;
  codigo: string;
  descricao: string;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SituacaoAprovacaoNormaDTO {
  id?: number;
  codigo: string;
  descricao: string;
  ativo: boolean;
}
