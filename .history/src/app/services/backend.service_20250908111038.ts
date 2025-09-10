import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    // Faz chamada direta para o backend (sem proxy)
    const url = `${this.apiUrl}/status`;
    console.log('Verificando backend diretamente em:', url);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': '*/*'
    });
    
    return this.http.get(url, { 
      responseType: 'text',
      headers: headers
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
          errorMsg = 'Erro de CORS: O servidor backend não permite requisições de origem cruzada. '+
                     'O backend precisa ser configurado para aceitar requisições de http://localhost:4200';
        } else if (error.status === 403) {
          errorMsg = 'Acesso negado pelo servidor (403 Forbidden). Verifique as configurações de CORS no backend.';
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
}