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
    // Em desenvolvimento, usa o proxy configurado no angular.json
    const url = `${this.apiUrl}/status`;
    console.log('Verificando backend em:', url);
    
    return this.http.get(url, { 
      responseType: 'text',
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    }).pipe(
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
        let errorMsg = 'Não foi possível conectar ao backend';
        
        if (error.status === 0) {
          errorMsg = 'Erro de CORS ou servidor indisponível. Verifique se o proxy está configurado corretamente.';
        } else if (error.status) {
          errorMsg = `Erro ${error.status}: ${error.statusText || error.message}`;
        }
        
        return of({ 
          online: false, 
          message: errorMsg
        });
      })
    );
  }
}
