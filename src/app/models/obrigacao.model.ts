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

  /** Lista detalhada dos responsáveis */
  responsaveis?: ObrigacaoResponsavel[];

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

  /** ID da obrigação pai (quando for uma obrigação filha de um desdobramento) */
  obrigacaoPaiId?: number;

  /** Indica se a obrigação foi desdobrada em obrigações filhas */
  desdobrada?: boolean;
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

/**
 * Interface para requisição de desdobramento de obrigação
 */
export interface DesdobramentoRequest {
  /** ID da obrigação a ser desdobrada */
  obrigacaoId: number;

  /** IDs das unidades para criar obrigações filhas */
  unidadesIds: number[];

  /** Observações sobre o desdobramento */
  observacoes?: string;
}

/**
 * Interface para resposta do desdobramento de obrigação
 */
export interface DesdobramentoResponse {
  /** Obrigação pai (desdobrada) */
  obrigacaoPai: Obrigacao;

  /** Lista de obrigações filhas criadas */
  obrigacoesFilhas: Obrigacao[];

  /** Mensagem de sucesso */
  mensagem: string;

  /** Total de obrigações filhas criadas */
  totalDesdobradas: number;
}

/**
 * Interface que representa um responsável por uma obrigação
 */
export interface ObrigacaoResponsavel {
  /** Identificador único */
  id?: number;

  /** ID da obrigação */
  obrigacaoId: number;

  /** ID da unidade responsável */
  unidadeId: number;

  /** Nome da unidade responsável */
  nomeUnidade?: string;

  /** Situação do responsável (código varia conforme perfil do usuário) */
  situacao: string;

  /** Descrição da situação */
  situacaoDescricao?: string;

  /** Data de cadastro */
  dataCadastro?: string;

  /** Data da última atualização */
  dataAtualizacao?: string;

  /** Observações */
  observacoes?: string;

  /** Usuário que criou */
  criadoPor?: string;

  /** Usuário que atualizou */
  atualizadoPor?: string;

  /** Indica se está ativo */
  ativo?: boolean;

  /** Quantidade de evidências */
  quantidadeEvidencias?: number;

  /** Quantidade de planos de ação */
  quantidadePlanos?: number;

  /** Lista de evidências (quando detalhes completos são carregados) */
  evidencias?: Evidencia[];

  /** Lista de planos de ação (quando detalhes completos são carregados) */
  planosAcao?: PlanoAcao[];
}

/**
 * Interface que representa uma evidência de conformidade
 */
export interface Evidencia {
  /** Identificador único */
  id?: number;

  /** ID do responsável */
  obrigacaoResponsavelId: number;

  /** Tipo da evidência */
  tipo: 'texto' | 'arquivo' | 'link';

  /** Título da evidência */
  titulo: string;

  /** Descrição */
  descricao?: string;

  /** Conteúdo em texto */
  conteudoTexto?: string;

  /** Nome do arquivo */
  arquivoNome?: string;

  /** Caminho do arquivo */
  arquivoCaminho?: string;

  /** Tipo do arquivo */
  arquivoTipo?: string;

  /** Tamanho do arquivo */
  arquivoTamanho?: number;

  /** URL do link */
  linkUrl?: string;

  /** Data de cadastro */
  dataCadastro?: string;

  /** Data da última atualização */
  dataAtualizacao?: string;

  /** Usuário que cadastrou */
  cadastradoPor?: string;

  /** Usuário que atualizou */
  atualizadoPor?: string;

  /** Indica se está ativo */
  ativo?: boolean;

  // Campos de aprovação
  /** Status da aprovação */
  statusAprovacao?: string;
  /** Data de envio para gestor */
  dataEnvioGestor?: string;
  /** Data de aprovação pelo gestor */
  dataAprovacaoGestor?: string;
  /** Usuário gestor que aprovou */
  aprovadoGestorPor?: string;
  /** Observações do gestor */
  observacoesGestor?: string;
  /** Data de envio para ACR */
  dataEnvioAcr?: string;
  /** Data de aprovação pelo ACR */
  dataAprovacaoAcr?: string;
  /** Usuário ACR que aprovou */
  aprovadoAcrPor?: string;
  /** Observações do ACR */
  observacoesAcr?: string;
}

/**
 * Interface que representa um plano de ação 5W2H
 */
export interface PlanoAcao {
  /** Identificador único */
  id?: number;

  /** ID do responsável */
  obrigacaoResponsavelId: number;

  /** Título do plano */
  titulo: string;

  /** What - O que será feito? */
  whatOQue?: string;

  /** Why - Por que será feito? */
  whyPorQue?: string;

  /** Where - Onde será feito? */
  whereOnde?: string;

  /** When - Quando será feito? */
  whenQuando?: string;

  /** Who - Quem fará? */
  whoQuem?: string;

  /** How - Como será feito? */
  howComo?: string;

  /** How Much - Quanto custará? */
  howMuchQuantoCusta?: string;

  /** Status do plano */
  status?: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';

  /** Data de início */
  dataInicio?: string;

  /** Data de conclusão */
  dataConclusao?: string;

  /** Data de cadastro */
  dataCadastro?: string;

  /** Data da última atualização */
  dataAtualizacao?: string;

  /** Usuário que cadastrou */
  cadastradoPor?: string;

  /** Usuário que atualizou */
  atualizadoPor?: string;

  /** Indica se está ativo */
  ativo?: boolean;
}
/**
 * Interface para detalhamento completo de uma obrigação (visualização ACR)
 */
export interface ObrigacaoDetalhamentoACR {
  // Dados da obrigação
  id: number;
  normaId: number;
  normaNome?: string;
  normaNumero?: string;
  titulo: string;
  descricao: string;
  tipo: 'recomendacao' | 'determinacao';
  prazoConformidade: string;
  recorrencia: 'unica' | 'mensal' | 'trimestral' | 'semestral' | 'anual';
  situacao: 'pendente' | 'em_andamento' | 'conforme' | 'nao_conforme' | 'vencida';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  observacoes?: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
  criadoPor?: string;
  atualizadoPor?: string;
  ativo: boolean;
  obrigacaoPaiId?: number;
  desdobrada?: boolean;

  // Lista de responsáveis detalhados
  responsaveis: ResponsavelDetalhado[];

  // Estatísticas agregadas
  estatisticas: EstatisticasResponsaveis;
}

/**
 * Interface para responsável com detalhamento completo
 */
export interface ResponsavelDetalhado {
  id: number;
  unidadeId: number;
  unidadeNome?: string;
  unidadeSigla?: string;
  situacao: 'pendente' | 'em_analise' | 'aguardando_aprovacao' | 'aguardando_aprovacao_unidade' | 'conforme' | 'nao_conforme' | 'vencida';
  observacoes?: string;
  dataCadastro?: string;
  dataAtualizacao?: string;
  criadoPor?: string;
  atualizadoPor?: string;

  // Evidências do responsável
  evidencias: Evidencia[];

  // Planos de ação do responsável
  planosAcao: PlanoAcao[];

  // Contadores
  totalEvidencias: number;
  totalPlanosAcao: number;
  planosEmAndamento: number;
  planosConcluidos: number;
}

/**
 * Interface para estatísticas agregadas de responsáveis
 */
export interface EstatisticasResponsaveis {
  totalResponsaveis: number;
  responsaveisConformes: number;
  responsaveisPendentes: number;
  responsaveisNaoConformes: number;
  responsaveisEmAnalise: number;
  totalEvidencias: number;
  totalPlanosAcao: number;
  percentualConformidade: number;
  totalAprovados: number;
  totalPendentes: number;
}
