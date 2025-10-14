import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BackendStatusComponent } from './components/backend-status/backend-status.component';
import { ToastComponent } from './components/toast/toast.component';
import { ToastDemoComponent } from './components/toast-demo/toast-demo.component';
import { UserHeaderComponent } from './components/user-header/user-header.component';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, BackendStatusComponent, ToastComponent, ToastDemoComponent, UserHeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('compliance-stj');
  protected currentRoute = signal('');
  protected isAuthenticated = signal(false);

  constructor(private router: Router, private authService: AuthService) {
    // Escutar mudanças de rota
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute.set(event.url);
      });

    // Escutar mudanças de autenticação
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated.set(!!user);
    });
  }

  protected isLoginPage(): boolean {
    return this.currentRoute().includes('/login');
  }

  protected showMainLayout(): boolean {
    return this.isAuthenticated() && !this.isLoginPage();
  }
}
