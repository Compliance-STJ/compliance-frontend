import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Norma, NormaPage, NormaFilter } from './norma.model';

@Injectable({
  providedIn: 'root'
})
export class NormaService {
  private apiUrl = `${environment.apiUrl}/normas`;

  constructor(private http: HttpClient) {}

  listarNormas(page: number = 0, size: number = 10): Observable<NormaPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<NormaPage>(this.apiUrl, { params });
  }

  buscarPorId(id: number): Observable<Norma> {
    return this.http.get<Norma>(`${this.apiUrl}/${id}`);
  }

  criarNorma(norma: Norma): Observable<Norma> {
    return this.http.post<Norma>(this.apiUrl, norma);
  }

  atualizarNorma(id: number, norma: Norma): Observable<Norma> {
    return this.http.put<Norma>(`${this.apiUrl}/${id}`, norma);
  }

  excluirNorma(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  buscarPorSituacao(situacaoId: number, page: number = 0, size: number = 10): Observable<NormaPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<NormaPage>(`${this.apiUrl}/situacao/${situacaoId}`, { params });
  }

  buscarPorOrigem(origemId: number, page: number = 0, size: number = 10): Observable<NormaPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<NormaPage>(`${this.apiUrl}/origem/${origemId}`, { params });
  }

  buscarPorNome(nome: string, page: number = 0, size: number = 10): Observable<NormaPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<NormaPage>(`${this.apiUrl}/buscar?nome=${encodeURIComponent(nome)}`, { params });
  }

  listarCategorias(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categorias`);
  }

  filtrarNormas(filter: NormaFilter): Observable<NormaPage> {
    let params = new HttpParams()
      .set('page', (filter.page || 0).toString())
      .set('size', (filter.size || 10).toString());

    if (filter.nome) {
      params = params.set('nome', filter.nome);
    }
    if (filter.situacaoId) {
      params = params.set('situacaoId', filter.situacaoId.toString());
    }
    if (filter.origemId) {
      params = params.set('origemId', filter.origemId.toString());
    }
    if (filter.categoria) {
      params = params.set('categoria', filter.categoria);
    }

    return this.http.get<NormaPage>(`${this.apiUrl}/filtrar`, { params });
  }
}
