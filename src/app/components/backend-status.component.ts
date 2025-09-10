import { Component } from '@angular/core';
import { BackendService } from '../services/backend.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-backend-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="backend-status-container">
      <button 
        (click)="checkBackendStatus()" 
        class="status-btn"
        [ngClass]="{'online': isOnline === true, 'offline': isOnline === false, 'unknown': isOnline === null}">
        Verificar Status do Backend
      </button>
      
      <div class="status-result" *ngIf="isOnline !== null">
        <div class="status-indicator">
          <span class="status-text">
            Backend está: 
            <strong [ngClass]="{'online-text': isOnline, 'offline-text': !isOnline}">
              {{ isOnline ? 'Online' : 'Offline' }}
            </strong>
          </span>
        </div>
        
        <div class="status-message" *ngIf="statusMessage">
          <p>Mensagem: <span class="message-text">{{ statusMessage }}</span></p>
        </div>
      </div>
      
      <div class="loading-indicator" *ngIf="checking">
        Verificando...
      </div>
    </div>
  `,
  styles: [`
    .backend-status-container {
      margin: 20px;
      padding: 15px;
      border-radius: 8px;
      background-color: #f5f5f5;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .status-btn {
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      border: none;
      background-color: #007bff;
      color: white;
      transition: background-color 0.3s;
    }
    
    .status-btn:hover {
      background-color: #0069d9;
    }
    
    .status-btn.online {
      background-color: #28a745;
    }
    
    .status-btn.offline {
      background-color: #dc3545;
    }
    
    .status-result {
      margin-top: 15px;
      font-size: 16px;
      text-align: center;
    }
    
    .status-indicator {
      margin-bottom: 10px;
    }
    
    .online-text {
      color: #28a745;
    }
    
    .offline-text {
      color: #dc3545;
    }
    
    .status-message {
      margin-top: 5px;
      font-size: 14px;
      background-color: #e9ecef;
      padding: 10px;
      border-radius: 5px;
      max-width: 400px;
    }
    
    .message-text {
      font-weight: 500;
      font-style: italic;
    }
    
    .loading-indicator {
      margin-top: 10px;
      font-style: italic;
      color: #6c757d;
    }
  `]
})
export class BackendStatusComponent {
  isOnline: boolean | null = null;
  statusMessage: string = '';
  checking = false;

  constructor(private backendService: BackendService) {}

  checkBackendStatus(): void {
    this.checking = true;
    this.backendService.checkBackendStatus().subscribe({
      next: (result) => {
        this.isOnline = result.online;
        this.statusMessage = result.message;
        this.checking = false;
      },
      error: () => {
        this.isOnline = false;
        this.statusMessage = 'Erro ao tentar conectar ao backend';
        this.checking = false;
      }
    });
  }
}
