import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(private http: HttpClient) {}

  /**
   * Realiza uma requisição GET com headers para evitar problemas de CORS
   * @param url URL da requisição
   * @param options Opções da requisição
   * @returns Observable com o resultado da requisição
   */
  get<T>(url: string, options: any = {}): Observable<T> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Accept': '*/*'
    });

    const httpOptions = {
      ...options,
      headers: options.headers ? { ...options.headers, ...headers } : headers
    };

    return this.http.get<T>(url, httpOptions);
  }

  /**
   * Realiza uma requisição POST com headers para evitar problemas de CORS
   * @param url URL da requisição
   * @param body Corpo da requisição
   * @param options Opções da requisição
   * @returns Observable com o resultado da requisição
   */
  post<T>(url: string, body: any, options: any = {}): Observable<T> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Accept': '*/*'
    });

    const httpOptions = {
      ...options,
      headers: options.headers ? { ...options.headers, ...headers } : headers
    };

    return this.http.post<T>(url, body, httpOptions);
  }
}
