/**
 * Interface que representa uma Obrigação no sistema de compliance.
 * Uma obrigação é uma determinação ou recomendação específica vinculada a uma norma
 * que deve ser cumprida por unidades responsáveis dentro de prazos estabelecidos.
 */
export interface Obrigacao {
  /** Identificador único da obrigação */
  id?: number;

  /** ID da norma à qual a obrigação está vinculada */
  normaId: number;

  /** Nome/título da obrigação */
  titulo: string;

  /** Descrição detalhada da obrigação */
  descricao: string;

  /** Tipo: 'recomendacao' ou 'determinacao' */
  tipo: 'recomendacao' | 'determinacao';

  /** IDs das unidades responsáveis pelo cumprimento */
  unidadesResponsaveis: number[];

  /** Prazo para conformidade (data limite) */
  prazoConformidade: string;

  /** Tipo de recorrência: 'unica', 'mensal', 'trimestral', 'semestral', 'anual' */
  recorrencia: 'unica' | 'mensal' | 'trimestral' | 'semestral' | 'anual';

  /** IDs de outras obrigações que são alteradas/impactadas por esta */
  obrigacoesAlteradas?: number[];

  /** Situação atual da obrigação */
  situacao: 'pendente' | 'em_andamento' | 'conforme' | 'nao_conforme' | 'vencida';

  /** Prioridade da obrigação */
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';

  /** Observações adicionais */
  observacoes?: string;

  /** Data de criação */
  dataCriacao?: string;

  /** Data da última atualização */
  dataAtualizacao?: string;

  /** Usuário que criou a obrigação */
  criadoPor?: string;

  /** Usuário que fez a última atualização */
  atualizadoPor?: string;

  /** Indica se a obrigação está ativa */
  ativo: boolean;
}

/**
 * Interface para o formulário de criação/edição de obrigação
 */
export interface ObrigacaoForm {
  normaId: number;
  titulo: string;
  descricao: string;
  tipo: 'recomendacao' | 'determinacao';
  unidadesResponsaveis: number[];
  prazoConformidade: string;
  recorrencia: 'unica' | 'mensal' | 'trimestral' | 'semestral' | 'anual';
  obrigacoesAlteradas?: number[];
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  observacoes?: string;
}

/**
 * Interface para resposta paginada de obrigações
 */
export interface ObrigacaoPage {
  content: Obrigacao[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * Interface para filtros de busca de obrigações
 */
export interface ObrigacaoFiltro {
  /** Filtro por norma */
  normaId?: number;

  /** Filtro por tipo */
  tipo?: 'recomendacao' | 'determinacao';

  /** Filtro por unidade responsável */
  unidadeId?: number;

  /** Filtro por situação */
  situacao?: 'pendente' | 'em_andamento' | 'conforme' | 'nao_conforme' | 'vencida';

  /** Filtro por prioridade */
  prioridade?: 'baixa' | 'media' | 'alta' | 'critica';

  /** Filtro por data de vencimento (a partir de) */
  vencimentoAPartirDe?: string;

  /** Filtro por data de vencimento (até) */
  vencimentoAte?: string;

  /** Filtro por termo geral */
  termo?: string;
}

/**
 * Interface para estatísticas de obrigações
 */
export interface ObrigacaoEstatisticas {
  /** Total de obrigações */
  total: number;

  /** Por situação */
  pendentes: number;
  emAndamento: number;
  conformes: number;
  naoConformes: number;
  vencidas: number;

  /** Por prioridade */
  baixaPrioridade: number;
  mediaPrioridade: number;
  altaPrioridade: number;
  prioridadeCritica: number;

  /** Por tipo */
  recomendacoes: number;
  determinacoes: number;
}