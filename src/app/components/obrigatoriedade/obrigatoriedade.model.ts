/**
 * Interface que representa uma Obrigatoriedade no sistema de compliance.
 * Define os diferentes tipos ou níveis de obrigatoriedade que podem ser
 * associados às normas (ex: Obrigatório, Recomendado, Opcional).
 */
export interface Obrigatoriedade {
  /** Identificador único da obrigatoriedade */
  id?: number;
  
  /** Nome da obrigatoriedade (ex: "Obrigatório", "Recomendado") */
  nome: string;
  
  /** Descrição detalhada da obrigatoriedade */
  descricao?: string;
  
  /** Indica se a obrigatoriedade está ativa */
  ativo: boolean;
  
  /** Data de início da vigência da obrigatoriedade */
  dataInicio?: string;
  
  /** Data de fim da vigência da obrigatoriedade */
  dataFim?: string;
  
  /** Ordem de exibição/prioridade da obrigatoriedade */
  ordem?: number;
  
  /** Data de criação do registro */
  dataCriacao?: string;
  
  /** Data da última atualização do registro */
  dataAtualizacao?: string;
  
  /** Usuário que criou o registro */
  criadoPor?: string;
  
  /** Usuário que fez a última atualização */
  atualizadoPor?: string;
}

/**
 * Interface para estatísticas das obrigatoriedades
 */
export interface ObrigatoriedadeEstatisticas {
  /** Total de obrigatoriedades cadastradas */
  total: number;
  
  /** Número de obrigatoriedades ativas */
  ativas: number;
  
  /** Número de obrigatoriedades inativas */
  inativas: number;
  
  /** Número de obrigatoriedades vigentes */
  vigentes: number;
}

/**
 * Interface para filtros de busca de obrigatoriedades
 */
export interface ObrigatoriedadeFiltro {
  /** Filtro por nome */
  nome?: string;
  
  /** Filtro por descrição */
  descricao?: string;
  
  /** Filtro por status ativo */
  ativo?: boolean;
  
  /** Filtro por data de início (a partir de) */
  dataInicioAPartirDe?: string;
  
  /** Filtro por data de fim (até) */
  dataFimAte?: string;
  
  /** Filtro por termo geral */
  termo?: string;
}