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
      
      <div class="status-indicator" *ngIf="isOnline !== null">
        <span class="status-text">
          Backend está: 
          <strong [ngClass]="{'online-text': isOnline, 'offline-text': !isOnline}">
            {{ isOnline ? 'Online' : 'Offline' }}
          </strong>
        </span>
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
    
    .status-indicator {
      margin-top: 15px;
      font-size: 16px;
    }
    
    .online-text {
      color: #28a745;
    }
    
    .offline-text {
      color: #dc3545;
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
  checking = false;

  constructor(private backendService: BackendService) {}

  checkBackendStatus(): void {
    this.checking = true;
    this.backendService.checkBackendStatus().subscribe({
      next: (status) => {
        this.isOnline = status;
        this.checking = false;
      },
      error: () => {
        this.isOnline = false;
        this.checking = false;
      }
    });
  }
}
