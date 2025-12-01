import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ObrigacaoResponsavel,
  Evidencia,
  PlanoAcao
} from '../../models/obrigacao.model';

@Injectable({
  providedIn: 'root'
})
export class ObrigacaoResponsavelService {

  private apiUrl = `${environment.apiUrl}/obrigacoes/responsaveis`;
  private evidenciasUrl = `${environment.apiUrl}/evidencias`;
  private planosUrl = `${environment.apiUrl}/planos-acao`;

  constructor(private http: HttpClient) { }

  // === RESPONSÁVEIS ===

  /**
   * Lista todos os responsáveis de uma obrigação
   */
  listarPorObrigacao(obrigacaoId: number): Observable<ObrigacaoResponsavel[]> {
    return this.http.get<ObrigacaoResponsavel[]>(`${this.apiUrl}/obrigacao/${obrigacaoId}`);
  }

  /**
   * Lista todas as obrigações atribuídas a uma unidade
   */
  listarPorUnidade(unidadeId: number): Observable<ObrigacaoResponsavel[]> {
    return this.http.get<ObrigacaoResponsavel[]>(`${this.apiUrl}/unidade/${unidadeId}/minhas-obrigacoes`);
  }

  /**
   * Busca um responsável pelo ID
   */
  buscarPorId(id: number): Observable<ObrigacaoResponsavel> {
    return this.http.get<ObrigacaoResponsavel>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cria um novo responsável
   */
  criar(responsavel: ObrigacaoResponsavel): Observable<ObrigacaoResponsavel> {
    return this.http.post<ObrigacaoResponsavel>(this.apiUrl, responsavel);
  }

  /**
   * Atualiza um responsável
   */
  atualizar(id: number, responsavel: ObrigacaoResponsavel): Observable<ObrigacaoResponsavel> {
    return this.http.put<ObrigacaoResponsavel>(`${this.apiUrl}/${id}`, responsavel);
  }

  /**
   * Atualiza a situação de um responsável
   */
  atualizarSituacao(id: number, situacao: string): Observable<ObrigacaoResponsavel> {
    const params = new HttpParams().set('situacao', situacao);
    return this.http.patch<ObrigacaoResponsavel>(`${this.apiUrl}/${id}/situacao`, null, { params });
  }

  /**
   * Exclui um responsável
   */
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // === EVIDÊNCIAS ===

  /**
   * Lista todas as evidências de um responsável
   */
  listarEvidenciasPorResponsavel(responsavelId: number): Observable<Evidencia[]> {
    return this.http.get<Evidencia[]>(`${this.evidenciasUrl}/responsavel/${responsavelId}`);
  }

  /**
   * Busca uma evidência pelo ID
   */
  buscarEvidenciaPorId(id: number): Observable<Evidencia> {
    return this.http.get<Evidencia>(`${this.evidenciasUrl}/${id}`);
  }

  /**
   * Cria uma nova evidência
   */
  criarEvidencia(evidencia: Partial<Evidencia>): Observable<Evidencia> {
    return this.http.post<Evidencia>(this.evidenciasUrl, evidencia);
  }

  /**
   * Atualiza uma evidência
   */
  atualizarEvidencia(id: number, evidencia: Partial<Evidencia>): Observable<Evidencia> {
    return this.http.put<Evidencia>(`${this.evidenciasUrl}/${id}`, evidencia);
  }

  /**
   * Exclui uma evidência
   */
  excluirEvidencia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.evidenciasUrl}/${id}`);
  }

  // === PLANOS DE AÇÃO ===

  /**
   * Lista todos os planos de ação de um responsável
   */
  listarPlanosPorResponsavel(responsavelId: number): Observable<PlanoAcao[]> {
    return this.http.get<PlanoAcao[]>(`${this.planosUrl}/responsavel/${responsavelId}`);
  }

  /**
   * Busca um plano de ação pelo ID
   */
  buscarPlanoPorId(id: number): Observable<PlanoAcao> {
    return this.http.get<PlanoAcao>(`${this.planosUrl}/${id}`);
  }

  /**
   * Cria um novo plano de ação
   */
  criarPlano(plano: Partial<PlanoAcao>): Observable<PlanoAcao> {
    return this.http.post<PlanoAcao>(this.planosUrl, plano);
  }

  /**
   * Atualiza um plano de ação
   */
  atualizarPlano(id: number, plano: Partial<PlanoAcao>): Observable<PlanoAcao> {
    return this.http.put<PlanoAcao>(`${this.planosUrl}/${id}`, plano);
  }

  /**
   * Atualiza o status de um plano de ação
   */
  atualizarStatusPlano(id: number, status: string): Observable<PlanoAcao> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<PlanoAcao>(`${this.planosUrl}/${id}/status`, null, { params });
  }

  /**
   * Exclui um plano de ação
   */
  excluirPlano(id: number): Observable<void> {
    return this.http.delete<void>(`${this.planosUrl}/${id}`);
  }

  // === APROVAÇÕES ===

  /**
   * Aprova uma evidência
   */
  aprovarEvidencia(id: number, observacoes?: string): Observable<Evidencia> {
    return this.http.post<Evidencia>(`${this.evidenciasUrl}/${id}/aprovacao-gestor`, { 
      aprovado: true,
      observacoes: observacoes || null
    });
  }

  /**
   * Recusa uma evidência
   */
  recusarEvidencia(id: number, observacoes: string): Observable<Evidencia> {
    return this.http.post<Evidencia>(`${this.evidenciasUrl}/${id}/aprovacao-gestor`, { 
      aprovado: false,
      observacoes: observacoes
    });
  }
}