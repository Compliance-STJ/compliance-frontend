import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap, retry } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    console.log('Backend URL:', this.apiUrl);
  }

  /**
   * Verifica se o backend está respondendo
   * @returns Observable com o status e a mensagem do backend
   */
  checkBackendStatus(): Observable<{online: boolean, message: string}> {
    // Removendo a barra no final da URL se existir
    const url = this.apiUrl.endsWith('/') ? `${this.apiUrl}status` : `${this.apiUrl}/status`;
    console.log('Fazendo requisição para:', url);
    
    return this.http.get(url, { 
      responseType: 'text',
      // Adicionando headers para evitar problemas de cache
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }).pipe(
      // Tenta a requisição até 2 vezes antes de falhar
      retry(2),
      map(response => {
        console.log('Resposta do backend:', response);
        return { 
          online: true, 
          message: response 
        };
      }),
      tap(result => console.log(`Backend status: ${result.online ? 'Online' : 'Offline'}, Mensagem: ${result.message}`)),
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao verificar status do backend:', error);
        let errorMsg = '';
        
        if (error.error instanceof ErrorEvent) {
          // Erro do lado do cliente
          errorMsg = `Erro do cliente: ${error.error.message}`;
        } else {
          // Erro do servidor
          errorMsg = `Código: ${error.status}, Mensagem: ${error.message}`;
          
          // Verificação específica para o erro "0 Unknown Error"
          if (error.status === 0) {
            errorMsg = 'Não foi possível conectar ao backend. Verifique se o servidor está rodando e acessível.';
          }
        }
        
        return of({ 
          online: false, 
          message: errorMsg
        });
      })
    );
  }
}
