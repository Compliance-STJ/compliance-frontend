import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SituacaoNorma, SituacaoNormaDTO } from './situacao-norma.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SituacaoNormaService {
  private apiUrl = environment.apiUrl;
  private readonly baseUrl =  `${this.apiUrl}/situacoes-norma`;

  constructor(private http: HttpClient) { }

  // Listar todas as situações de norma
  listar(): Observable<SituacaoNorma[]> {
    return this.http.get<SituacaoNorma[]>(this.baseUrl);
  }

  // Buscar situação de norma por ID
  buscarPorId(id: number): Observable<SituacaoNorma> {
    return this.http.get<SituacaoNorma>(`${this.baseUrl}/${id}`);
  }

  // Criar nova situação de norma
  criar(situacao: SituacaoNormaDTO): Observable<SituacaoNorma> {
    return this.http.post<SituacaoNorma>(this.baseUrl, situacao);
  }

  // Atualizar situação de norma existente
  atualizar(id: number, situacao: SituacaoNormaDTO): Observable<SituacaoNorma> {
    return this.http.put<SituacaoNorma>(`${this.baseUrl}/${id}`, situacao);
  }

  // Excluir situação de norma
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}