import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ObrigacaoResponsavel, CriarEvidenciaRequest, CriarPlanoAcaoRequest } from '../models/obrigacao-responsavel.model';

@Injectable({
  providedIn: 'root'
})
export class ObrigacaoResponsavelService {
  private apiUrl = `${environment.apiUrl}/obrigacoes/responsaveis`;

  constructor(private http: HttpClient) {}

  listarPorObrigacao(obrigacaoId: number): Observable<ObrigacaoResponsavel[]> {
    return this.http.get<ObrigacaoResponsavel[]>(`${this.apiUrl}/obrigacao/${obrigacaoId}`);
  }

  adicionarResponsavel(obrigacaoId: number, unidadeId: number): Observable<ObrigacaoResponsavel> {
    return this.http.post<ObrigacaoResponsavel>(
      `${this.apiUrl}/obrigacao/${obrigacaoId}/unidade/${unidadeId}`,
      {}
    );
  }

  atualizarSituacao(responsavelId: number, situacao: string): Observable<ObrigacaoResponsavel> {
    return this.http.patch<ObrigacaoResponsavel>(
      `${this.apiUrl}/${responsavelId}/situacao`,
      { situacao }
    );
  }

  minhasObrigacoes(unidadeId: number): Observable<ObrigacaoResponsavel[]> {
    return this.http.get<ObrigacaoResponsavel[]>(`${this.apiUrl}/unidade/${unidadeId}/minhas-obrigacoes`);
  }

  obrigacoesPendentes(unidadeId: number): Observable<ObrigacaoResponsavel[]> {
    return this.http.get<ObrigacaoResponsavel[]>(`${this.apiUrl}/unidade/${unidadeId}/pendentes`);
  }

  obrigacoesPorSituacao(unidadeId: number, situacao: string): Observable<ObrigacaoResponsavel[]> {
    return this.http.get<ObrigacaoResponsavel[]>(
      `${this.apiUrl}/unidade/${unidadeId}/situacao/${situacao}`
    );
  }

  contarPendentes(unidadeId: number): Observable<{ pendentes: number }> {
    return this.http.get<{ pendentes: number }>(
      `${this.apiUrl}/unidade/${unidadeId}/contador-pendentes`
    );
  }

  buscarPorId(id: number): Observable<ObrigacaoResponsavel> {
    return this.http.get<ObrigacaoResponsavel>(`${this.apiUrl}/${id}`);
  }

  removerResponsavel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  adicionarEvidencia(responsavelId: number, request: CriarEvidenciaRequest): Observable<ObrigacaoResponsavel> {
    return this.http.post<ObrigacaoResponsavel>(
      `${environment.apiUrl}/evidencias/responsavel/${responsavelId}`,
      request
    );
  }

  adicionarPlanoAcao(responsavelId: number, request: CriarPlanoAcaoRequest): Observable<ObrigacaoResponsavel> {
    return this.http.post<ObrigacaoResponsavel>(
      `${environment.apiUrl}/planos-acao/responsavel/${responsavelId}`,
      request
    );
  }

  obrigacoesEnviadas(unidadeId: number): Observable<ObrigacaoResponsavel[]> {
    return this.http.get<ObrigacaoResponsavel[]>(`${this.apiUrl}/unidade/${unidadeId}/enviadas`);
  }

  aceitarObrigacao(responsavelId: number): Observable<ObrigacaoResponsavel> {
    return this.http.put<ObrigacaoResponsavel>(`${this.apiUrl}/${responsavelId}/aceitar`, {});
  }

  obrigacoesAguardandoAprovacao(unidadeId: number): Observable<ObrigacaoResponsavel[]> {
    return this.http.get<ObrigacaoResponsavel[]>(`${this.apiUrl}/unidade/${unidadeId}/aguardando-aprovacao`);
  }

  obrigacoesAguardandoAprovacaoACR(): Observable<ObrigacaoResponsavel[]> {
    return this.http.get<ObrigacaoResponsavel[]>(`${this.apiUrl}/aguardando-aprovacao-acr`);
  }
}
