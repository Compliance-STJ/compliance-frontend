import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Evidencia, CriarEvidenciaRequest, AprovacaoRequest } from '../models/obrigacao-responsavel.model';

@Injectable({
  providedIn: 'root'
})
export class EvidenciaService {
  private apiUrl = `${environment.apiUrl}/evidencias`;

  constructor(private http: HttpClient) {}

  adicionarEvidencia(responsavelId: number, request: CriarEvidenciaRequest): Observable<Evidencia> {
    return this.http.post<Evidencia>(`${this.apiUrl}/responsavel/${responsavelId}`, request);
  }

  uploadArquivo(evidenciaId: number, arquivo: File): Observable<Evidencia> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.http.post<Evidencia>(`${this.apiUrl}/${evidenciaId}/upload`, formData);
  }

  listarEvidencias(responsavelId: number): Observable<Evidencia[]> {
    return this.http.get<Evidencia[]>(`${this.apiUrl}/responsavel/${responsavelId}`);
  }

  buscarPorId(id: number): Observable<Evidencia> {
    return this.http.get<Evidencia>(`${this.apiUrl}/${id}`);
  }

  atualizarEvidencia(id: number, request: CriarEvidenciaRequest): Observable<Evidencia> {
    return this.http.put<Evidencia>(`${this.apiUrl}/${id}`, request);
  }

  removerEvidencia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Métodos de aprovação
  enviarParaAnaliseGestor(evidenciaId: number): Observable<Evidencia> {
    return this.http.post<Evidencia>(`${this.apiUrl}/${evidenciaId}/enviar-analise-gestor`, {});
  }

  aprovacaoGestor(evidenciaId: number, request: AprovacaoRequest): Observable<Evidencia> {
    return this.http.post<Evidencia>(`${this.apiUrl}/${evidenciaId}/aprovacao-gestor`, request);
  }

  aprovacaoAcr(evidenciaId: number, request: AprovacaoRequest): Observable<Evidencia> {
    return this.http.post<Evidencia>(`${this.apiUrl}/${evidenciaId}/aprovacao-acr`, request);
  }
}
