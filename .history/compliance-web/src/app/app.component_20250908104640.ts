import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BackendStatusComponent } from './components/backend-status.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    BackendStatusComponent
  ],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>Compliance Frontend</h1>
      </header>
      
      <main class="app-content">
        <app-backend-status></app-backend-status>
        <router-outlet></router-outlet>
      </main>
      
      <footer class="app-footer">
        <p>© 2025 Compliance System</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .app-header {
      background-color: #343a40;
      color: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .app-header h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    
    .app-content {
      flex: 1;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
    
    .app-footer {
      background-color: #f8f9fa;
      padding: 1rem 2rem;
      text-align: center;
      font-size: 0.9rem;
      color: #6c757d;
      border-top: 1px solid #e9ecef;
    }
  `]
})
export class AppComponent {
  title = 'Compliance Frontend';
}
