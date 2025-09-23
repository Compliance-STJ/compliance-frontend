import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackendStatusService } from './backend-status.service';

@Component({
  selector: 'app-backend-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './backend-status.component.html',
  styleUrls: ['./backend-status.component.css']
})
export class BackendStatusComponent {
  isOnline: boolean | null = null;
  statusMessage: string = '';
  checking = false;

  constructor(private backendStatusService: BackendStatusService) {}

  checkBackendStatus(): void {
    this.checking = true;
    this.backendStatusService.checkBackendStatus().subscribe({
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
