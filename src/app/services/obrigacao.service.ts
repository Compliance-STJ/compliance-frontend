import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Obrigacao,
  ObrigacaoForm,
  ObrigacaoPage,
  ObrigacaoFiltro,
  ObrigacaoEstatisticas,
  DesdobramentoRequest,
  DesdobramentoResponse
} from '../models/obrigacao.model';

@Injectable({
  providedIn: 'root'
})
export class ObrigacaoService {
  private apiUrl = `${environment.apiUrl}/obrigacoes`;

  constructor(private http: HttpClient) {}

  /**
   * Lista obrigações com paginação e filtros
   */
  listarObrigacoes(page: number = 0, size: number = 10, filtros?: ObrigacaoFiltro): Observable<ObrigacaoPage> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filtros) {
      if (filtros.normaId) params = params.set('normaId', filtros.normaId.toString());
      if (filtros.tipo) params = params.set('tipo', filtros.tipo);
      if (filtros.unidadeId) params = params.set('unidadeId', filtros.unidadeId.toString());
      if (filtros.situacao) params = params.set('situacao', filtros.situacao);
      if (filtros.prioridade) params = params.set('prioridade', filtros.prioridade);
      if (filtros.vencimentoAPartirDe) params = params.set('vencimentoAPartirDe', filtros.vencimentoAPartirDe);
      if (filtros.vencimentoAte) params = params.set('vencimentoAte', filtros.vencimentoAte);
      if (filtros.termo) params = params.set('termo', filtros.termo);
    }

    return this.http.get<ObrigacaoPage>(this.apiUrl, { params });
  }

  /**
   * Busca uma obrigação específica por ID
   */
  buscarObrigacao(id: number): Observable<Obrigacao> {
    return this.http.get<Obrigacao>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cria uma nova obrigação
   */
  criarObrigacao(obrigacao: ObrigacaoForm): Observable<Obrigacao> {
    return this.http.post<Obrigacao>(this.apiUrl, obrigacao);
  }

  /**
   * Atualiza uma obrigação existente
   */
  atualizarObrigacao(id: number, obrigacao: ObrigacaoForm): Observable<Obrigacao> {
    return this.http.put<Obrigacao>(`${this.apiUrl}/${id}`, obrigacao);
  }

  /**
   * Exclui uma obrigação
   */
  excluirObrigacao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtém estatísticas das obrigações
   */
  obterEstatisticas(): Observable<ObrigacaoEstatisticas> {
    return this.http.get<ObrigacaoEstatisticas>(`${this.apiUrl}/estatisticas`);
  }

  /**
   * Lista obrigações por norma
   */
  listarObrigacoesPorNorma(normaId: number): Observable<Obrigacao[]> {
    return this.http.get<Obrigacao[]>(`${this.apiUrl}/norma/${normaId}`);
  }

  /**
   * Lista obrigações por unidade responsável
   */
  listarObrigacoesPorUnidade(unidadeId: number): Observable<Obrigacao[]> {
    return this.http.get<Obrigacao[]>(`${this.apiUrl}/unidade/${unidadeId}`);
  }

  /**
   * Lista obrigações vencidas
   */
  listarObrigacoesVencidas(): Observable<Obrigacao[]> {
    return this.http.get<Obrigacao[]>(`${this.apiUrl}/vencidas`);
  }

  /**
   * Altera situação de uma obrigação
   */
  alterarSituacao(id: number, novaSituacao: string): Observable<Obrigacao> {
    return this.http.patch<Obrigacao>(`${this.apiUrl}/${id}/situacao`, { situacao: novaSituacao });
  }

  /**
   * Lista obrigações relacionadas (que são alteradas por uma obrigação específica)
   */
  listarObrigacoesRelacionadas(id: number): Observable<Obrigacao[]> {
    return this.http.get<Obrigacao[]>(`${this.apiUrl}/${id}/relacionadas`);
  }

  /**
   * Desdobra uma obrigação em múltiplas obrigações filhas (uma por unidade)
   */
  desdobrarObrigacao(request: DesdobramentoRequest): Observable<DesdobramentoResponse> {
    return this.http.post<DesdobramentoResponse>(`${this.apiUrl}/${request.obrigacaoId}/desdobrar`, request);
  }

  /**
   * Lista obrigações filhas de uma obrigação pai
   */
  buscarObrigacoesFilhas(id: number): Observable<Obrigacao[]> {
    return this.http.get<Obrigacao[]>(`${this.apiUrl}/${id}/filhas`);
  }

  /**
   * Agrega o status das obrigações filhas para atualizar a obrigação pai
   */
  agregarStatusFilhas(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/agregar-status`, {});
  }
}