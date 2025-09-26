import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Obrigatoriedade, ObrigatoriedadeEstatisticas } from './obrigatoriedade.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ObrigatoriedadeService {
  private apiUrl = environment.apiUrl;
  private readonly baseUrl = `${this.apiUrl}/obrigatoriedades`;

  constructor(private http: HttpClient) { }

  /**
   * Lista todas as obrigatoriedades
   */
  listarTodas(): Observable<Obrigatoriedade[]> {
    return this.http.get<Obrigatoriedade[]>(this.baseUrl);
  }

  /**
   * Lista apenas as obrigatoriedades ativas
   */
  listarAtivas(): Observable<Obrigatoriedade[]> {
    return this.http.get<Obrigatoriedade[]>(`${this.baseUrl}/ativas`);
  }

  /**
   * Lista as obrigatoriedades vigentes
   */
  listarVigentes(): Observable<Obrigatoriedade[]> {
    return this.http.get<Obrigatoriedade[]>(`${this.baseUrl}/vigentes`);
  }

  /**
   * Busca obrigatoriedade por ID
   */
  buscarPorId(id: number): Observable<Obrigatoriedade> {
    return this.http.get<Obrigatoriedade>(`${this.baseUrl}/${id}`);
  }

  /**
   * Busca obrigatoriedades por nome
   */
  buscarPorNome(nome: string): Observable<Obrigatoriedade[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<Obrigatoriedade[]>(`${this.baseUrl}/buscar`, { params });
  }

  /**
   * Pesquisa obrigatoriedades por termo geral
   */
  pesquisar(termo: string): Observable<Obrigatoriedade[]> {
    const params = new HttpParams().set('termo', termo);
    return this.http.get<Obrigatoriedade[]>(`${this.baseUrl}/pesquisar`, { params });
  }

  /**
   * Cria uma nova obrigatoriedade
   */
  criar(obrigatoriedade: Obrigatoriedade): Observable<Obrigatoriedade> {
    return this.http.post<Obrigatoriedade>(this.baseUrl, obrigatoriedade);
  }

  /**
   * Atualiza uma obrigatoriedade existente
   */
  atualizar(id: number, obrigatoriedade: Obrigatoriedade): Observable<Obrigatoriedade> {
    return this.http.put<Obrigatoriedade>(`${this.baseUrl}/${id}`, obrigatoriedade);
  }

  /**
   * Exclui uma obrigatoriedade
   */
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Ativa uma obrigatoriedade
   */
  ativar(id: number): Observable<Obrigatoriedade> {
    return this.http.patch<Obrigatoriedade>(`${this.baseUrl}/${id}/ativar`, {});
  }

  /**
   * Desativa uma obrigatoriedade
   */
  desativar(id: number): Observable<Obrigatoriedade> {
    return this.http.patch<Obrigatoriedade>(`${this.baseUrl}/${id}/desativar`, {});
  }

  /**
   * Obtém estatísticas das obrigatoriedades
   */
  obterEstatisticas(): Observable<ObrigatoriedadeEstatisticas> {
    return this.http.get<ObrigatoriedadeEstatisticas>(`${this.baseUrl}/estatisticas`);
  }

  /**
   * Lista obrigatoriedades que expiram em determinado número de dias
   */
  listarExpirandoEm(dias: number = 30): Observable<Obrigatoriedade[]> {
    const params = new HttpParams().set('dias', dias.toString());
    return this.http.get<Obrigatoriedade[]>(`${this.baseUrl}/expirando`, { params });
  }
}