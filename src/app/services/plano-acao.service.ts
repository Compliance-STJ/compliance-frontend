import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PlanoAcao, CriarPlanoAcaoRequest } from '../models/obrigacao-responsavel.model';

@Injectable({
  providedIn: 'root'
})
export class PlanoAcaoService {
  private apiUrl = `${environment.apiUrl}/planos-acao`;

  constructor(private http: HttpClient) {}

  criarPlanoAcao(responsavelId: number, request: CriarPlanoAcaoRequest): Observable<PlanoAcao> {
    return this.http.post<PlanoAcao>(`${this.apiUrl}/responsavel/${responsavelId}`, request);
  }

  listarPlanosAcao(responsavelId: number): Observable<PlanoAcao[]> {
    return this.http.get<PlanoAcao[]>(`${this.apiUrl}/responsavel/${responsavelId}`);
  }

  buscarPorId(id: number): Observable<PlanoAcao> {
    return this.http.get<PlanoAcao>(`${this.apiUrl}/${id}`);
  }

  atualizarStatus(planoId: number, status: string): Observable<PlanoAcao> {
    return this.http.patch<PlanoAcao>(`${this.apiUrl}/${planoId}/status`, { status });
  }

  atualizarPlanoAcao(id: number, request: CriarPlanoAcaoRequest): Observable<PlanoAcao> {
    return this.http.put<PlanoAcao>(`${this.apiUrl}/${id}`, request);
  }

  removerPlanoAcao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  iniciarExecucao(planoId: number): Observable<PlanoAcao> {
    return this.http.post<PlanoAcao>(`${this.apiUrl}/${planoId}/iniciar`, {});
  }

  concluirPlano(planoId: number): Observable<PlanoAcao> {
    return this.http.post<PlanoAcao>(`${this.apiUrl}/${planoId}/concluir`, {});
  }

  cancelarPlano(planoId: number): Observable<PlanoAcao> {
    return this.http.post<PlanoAcao>(`${this.apiUrl}/${planoId}/cancelar`, {});
  }
}
