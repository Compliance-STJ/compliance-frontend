import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SituacaoNorma, SituacaoNormaDTO } from './situacao-norma.model';

@Injectable({
  providedIn: 'root'
})
export class SituacaoNormaService {
  private apiUrl = 'http://localhost:8080/api/situacoes-norma';

  constructor(private http: HttpClient) { }

  // Listar todas as situações de norma
  listar(): Observable<SituacaoNorma[]> {
    return this.http.get<SituacaoNorma[]>(this.apiUrl);
  }

  // Buscar situação de norma por ID
  buscarPorId(id: number): Observable<SituacaoNorma> {
    return this.http.get<SituacaoNorma>(`${this.apiUrl}/${id}`);
  }

  // Criar nova situação de norma
  criar(situacao: SituacaoNormaDTO): Observable<SituacaoNorma> {
    return this.http.post<SituacaoNorma>(this.apiUrl, situacao);
  }

  // Atualizar situação de norma existente
  atualizar(id: number, situacao: SituacaoNormaDTO): Observable<SituacaoNorma> {
    return this.http.put<SituacaoNorma>(`${this.apiUrl}/${id}`, situacao);
  }

  // Excluir situação de norma
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}