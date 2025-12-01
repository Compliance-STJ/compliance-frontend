import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SituacaoAprovacaoNorma, SituacaoAprovacaoNormaDTO } from './situacao-aprovacao-norma.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SituacaoAprovacaoNormaService {
  private apiUrl = environment.apiUrl;
  private readonly baseUrl =  `${this.apiUrl}/situacoes-aprovacao-norma`;

  constructor(private http: HttpClient) { }

  // Listar todas as situações de aprovação de norma
  listar(): Observable<SituacaoAprovacaoNorma[]> {
    return this.http.get<SituacaoAprovacaoNorma[]>(this.baseUrl);
  }

  // Buscar situação de aprovação de norma por ID
  buscarPorId(id: number): Observable<SituacaoAprovacaoNorma> {
    return this.http.get<SituacaoAprovacaoNorma>(`${this.baseUrl}/${id}`);
  }

  // Criar nova situação de aprovação de norma
  criar(situacao: SituacaoAprovacaoNormaDTO): Observable<SituacaoAprovacaoNorma> {
    return this.http.post<SituacaoAprovacaoNorma>(this.baseUrl, situacao);
  }

  // Atualizar situação de aprovação de norma existente
  atualizar(id: number, situacao: SituacaoAprovacaoNormaDTO): Observable<SituacaoAprovacaoNorma> {
    return this.http.put<SituacaoAprovacaoNorma>(`${this.baseUrl}/${id}`, situacao);
  }

  // Excluir situação de aprovação de norma
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
