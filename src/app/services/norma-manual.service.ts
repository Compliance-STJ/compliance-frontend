import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TipoParteNorma {
  artigo: 'artigo';
  paragrafo: 'paragrafo';
  inciso: 'inciso';
  alinea: 'alinea';
  caput: 'caput';
}

export interface ParteNorma {
  id: string;
  tipo: keyof TipoParteNorma;
  numero: string;
  texto: string;
  texto_completo: string;
  selecionado: boolean;
  ordem: number;
  filhos?: ParteNorma[];
  nivel?: number;
}

export interface NormaEstruturada {
  titulo: string;
  ementa: string;
  data_publicacao: string;
  texto_integral: string;
  partes: ParteNorma[];
}

export interface ObrigacaoManual {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'recomendacao' | 'determinacao';
  partes_selecionadas: string[];
  texto_compilado: string;
  unidades_responsaveis: number[];
  prazo_conformidade: string;
  recorrencia: 'unica' | 'mensal' | 'trimestral' | 'semestral' | 'anual';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  observacoes?: string;
}

export interface AnalisarNormaRequest {
  texto?: string;
  url?: string;
}

export interface AnalisarPorUrlRequest {
  url: string;
}

export interface CompilarTextoRequest {
  partes_selecionadas: ParteNorma[];
}

export interface CompilarTextoResponse {
  texto_compilado: string;
}

export interface NormaParaCriacao {
  nome: string;
  numero?: string;
  descricao?: string;
  dataNorma: string;
  dataPublicacao?: string;
  situacaoId: number;
  origemId?: number;
  categoria?: string;
  orgaoEmissor?: string;
  link?: string;
  observacoes?: string;
}

export interface ObrigacaoParaCriacao {
  titulo: string;
  descricao: string;
  tipo: string;
  unidadesResponsaveis: number[];
  prazoConformidade: string;
  recorrencia: string;
  prioridade: string;
  observacoes?: string;
}

export interface NormaEObrigacaoRequest {
  norma: NormaParaCriacao;
  obrigacao: ObrigacaoParaCriacao;
}

export interface NormaCriada {
  id: number;
  nome: string;
  numero: string;
  descricao?: string;
  dataNorma: string;
  dataPublicacao?: string;
  situacaoId: number;
  origemId?: number;
  categoria?: string;
  orgaoEmissor?: string;
  link?: string;
  observacoes?: string;
}

export interface ObrigacaoCriada {
  id: number;
  normaId: number;
  titulo: string;
  descricao: string;
  tipo: string;
  unidadesResponsaveis: number[];
  prazoConformidade: string;
  recorrencia: string;
  prioridade: string;
  observacoes?: string;
  situacao: string;
  ativo: boolean;
}

export interface NormaInfoExtraida {
  titulo: string;
  numero: string;
  dataPublicacao: string;
  orgaoEmissor: string;
  categoria: string;
}

export interface NormaEObrigacaoResponse {
  norma: NormaCriada;
  obrigacao: ObrigacaoCriada;
}

@Injectable({
  providedIn: 'root'
})
export class NormaManualService {

  private apiUrl = `${environment.apiUrl}/norma-manual`;

  constructor(private http: HttpClient) { }

  /**
   * Analisa o texto da norma e retorna sua estrutura organizada
   */
  analisarNorma(request: AnalisarNormaRequest): Observable<NormaEstruturada> {
    return this.http.post<NormaEstruturada>(`${this.apiUrl}/analisar`, request);
  }

  /**
   * Analisa uma norma a partir de uma URL
   */
  analisarNormaPorUrl(request: AnalisarPorUrlRequest): Observable<NormaEstruturada> {
    return this.http.post<NormaEstruturada>(`${this.apiUrl}/analisar-url`, request);
  }

  /**
   * Compila o texto de uma obrigação a partir das partes selecionadas
   */
  compilarTexto(request: CompilarTextoRequest): Observable<CompilarTextoResponse> {
    return this.http.post<CompilarTextoResponse>(`${this.apiUrl}/compilar`, request);
  }

  /**
   * Cria uma norma junto com sua primeira obrigação
   */
  criarNormaEObrigacao(request: NormaEObrigacaoRequest): Observable<NormaEObrigacaoResponse> {
    return this.http.post<NormaEObrigacaoResponse>(`${environment.apiUrl}/normas/com-obrigacao`, request);
  }

  /**
   * Extrai informações básicas da norma automaticamente
   */
  extrairInfoNorma(request: AnalisarNormaRequest): Observable<NormaInfoExtraida> {
    return this.http.post<NormaInfoExtraida>(`${this.apiUrl}/extrair-info`, request);
  }
}