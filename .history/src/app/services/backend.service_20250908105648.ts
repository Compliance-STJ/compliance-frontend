import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Verifica se o backend está respondendo
   * @returns Observable<boolean> true se o backend está respondendo, false caso contrário
   */
  checkBackendStatus(): Observable<boolean> {
    return this.http.get<any>(`${this.apiUrl}/status`, { responseType: 'text' as 'json' }).pipe(
      map(response => {
        console.log('Resposta do backend:', response);
        return true; // Se recebeu resposta, o backend está online
      }),
      tap(status => console.log(`Backend status: ${status ? 'Online' : 'Offline'}`)),
      catchError(error => {
        console.error('Erro ao verificar status do backend:', error);
        return of(false);
      })
    );
  }
}
