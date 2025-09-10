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
   * @returns Observable com o status e a mensagem do backend
   */
  checkBackendStatus(): Observable<{online: boolean, message: string}> {
    return this.http.get(`${this.apiUrl}/status`, { responseType: 'text' }).pipe(
      map(response => {
        console.log('Resposta do backend:', response);
        return { 
          online: true, 
          message: response 
        };
      }),
      tap(result => console.log(`Backend status: ${result.online ? 'Online' : 'Offline'}, Mensagem: ${result.message}`)),
      catchError(error => {
        console.error('Erro ao verificar status do backend:', error);
        return of({ 
          online: false, 
          message: error.message || 'Não foi possível conectar ao backend' 
        });
      })
    );
  }
}
