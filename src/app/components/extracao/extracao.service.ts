import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ExtrairPorUrlRequest {
  url: string;
}

export interface ResultadoCompleto {
  norma: string;
  ementa: string;
  data_publicacao: string;
  obrigacoes: ObrigacaoCompleta[];
}

export interface ObrigacaoCompleta {
  artigo_dispositivo_legal: string;
  obrigacao_requisito: string;
  texto_integral: string;
  area_compliance: string;
  unidades_responsaveis: UnidadesResponsaveis;
}

export interface UnidadesResponsaveis {
  principal: UnidadeResponsavel;
  apoio: UnidadeResponsavel[];
}

export interface UnidadeResponsavel {
  sigla: string;
  nome: string;
  justificativa: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExtracaoService {
  private apiUrl = `${environment.apiUrl}/extracao`;

  constructor(private http: HttpClient) {}

  /**
   * Extrai obrigações completas a partir de uma URL
   */
  extrairPorUrl(url: string): Observable<ResultadoCompleto> {
    return this.http.post<ResultadoCompleto>(
      `${this.apiUrl}/url`,
      { url }
    );
  }

  /**
   * Verifica o status da API de extração
   */
  verificarStatus(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/status`);
  }
}
