import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SituacaoObrigacao, SituacaoObrigacaoDTO } from './situacao-obrigacao.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SituacaoObrigacaoService {
  private apiUrl = environment.apiUrl;
  private readonly baseUrl =  `${this.apiUrl}/situacoes-obrigacao`;

  constructor(private http: HttpClient) { }

  // Listar todas as situações de obrigação
  listar(): Observable<SituacaoObrigacao[]> {
    return this.http.get<SituacaoObrigacao[]>(this.baseUrl);
  }

    // Listar apenas situações ativas
  listarAtivas(): Observable<SituacaoObrigacao[]> {
    return this.http.get<SituacaoObrigacao[]>(`${this.baseUrl}/ativas`);
  }

  // Buscar situação de obrigação por ID
  buscarPorId(id: number): Observable<SituacaoObrigacao> {
    return this.http.get<SituacaoObrigacao>(`${this.baseUrl}/${id}`);
  }

  // Buscar situação de obrigação por código
  buscarPorCodigo(codigo: string): Observable<SituacaoObrigacao> {
    return this.http.get<SituacaoObrigacao>(`${this.baseUrl}/codigo/${codigo}`);
  }

  // Criar nova situação de obrigação
  criar(situacao: SituacaoObrigacaoDTO): Observable<SituacaoObrigacao> {
    return this.http.post<SituacaoObrigacao>(this.baseUrl, situacao);
  }

  // Atualizar situação de obrigação existente
  atualizar(id: number, situacao: SituacaoObrigacaoDTO): Observable<SituacaoObrigacao> {
    return this.http.put<SituacaoObrigacao>(`${this.baseUrl}/${id}`, situacao);
  }

  // Excluir situação de obrigação
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}