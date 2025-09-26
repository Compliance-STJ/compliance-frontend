import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Origem, OrigemEstatisticas } from './origem.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrigemService {
private apiUrl = environment.apiUrl;
  private readonly baseUrl =  `${this.apiUrl}/origens`;

  constructor(private http: HttpClient) { }

  /**
   * Lista todas as origens
   */
  listarTodas(): Observable<Origem[]> {
    return this.http.get<Origem[]>(this.baseUrl);
  }

  /**
   * Lista apenas as origens ativas
   */
  listarAtivas(): Observable<Origem[]> {
    return this.http.get<Origem[]>(`${this.baseUrl}/ativas`);
  }

  /**
   * Lista as origens vigentes
   */
  listarVigentes(): Observable<Origem[]> {
    return this.http.get<Origem[]>(`${this.baseUrl}/vigentes`);
  }

  /**
   * Busca origem por ID
   */
  buscarPorId(id: number): Observable<Origem> {
    return this.http.get<Origem>(`${this.baseUrl}/${id}`);
  }

  /**
   * Busca origens por nome
   */
  buscarPorNome(nome: string): Observable<Origem[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<Origem[]>(`${this.baseUrl}/buscar`, { params });
  }

  /**
   * Cria uma nova origem
   */
  criar(origem: Origem): Observable<Origem> {
    return this.http.post<Origem>(this.baseUrl, origem);
  }

  /**
   * Atualiza uma origem existente
   */
  atualizar(id: number, origem: Origem): Observable<Origem> {
    return this.http.put<Origem>(`${this.baseUrl}/${id}`, origem);
  }

  /**
   * Ativa uma origem
   */
  ativar(id: number): Observable<Origem> {
    return this.http.patch<Origem>(`${this.baseUrl}/${id}/ativar`, {});
  }

  /**
   * Inativa uma origem
   */
  inativar(id: number): Observable<Origem> {
    return this.http.patch<Origem>(`${this.baseUrl}/${id}/inativar`, {});
  }

  /**
   * Remove uma origem (inativação lógica)
   */
  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Deleta uma origem permanentemente
   */
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/deletar`);
  }

  /**
   * Obtém estatísticas das origens
   */
  obterEstatisticas(): Observable<OrigemEstatisticas> {
    return this.http.get<OrigemEstatisticas>(`${this.baseUrl}/estatisticas`);
  }
}