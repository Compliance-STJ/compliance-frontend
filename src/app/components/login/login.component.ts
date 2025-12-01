import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = {
    email: 'acr',
    senha: '123456'
  };
  
  loading = false;

  // Usuários de exemplo para facilitar o teste
  mockUsers = [
    { email: 'acr', role: 'ACR - Administrador', description: 'Acesso total ao sistema' },
    { email: 'gestor_unidade', role: 'Gestor Unidade', description: 'Gerencia unidade específica e aprova evidências' },
    { email: 'usuario', role: 'Usuário', description: 'Acesso limitado às funcionalidades básicas' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  login(): void {
    if (!this.credentials.email || !this.credentials.senha) {
      // Usar método correto do ToastService
      this.toastService.error('Erro de validação', 'Email e senha são obrigatórios');
      return;
    }

    this.loading = true;

    this.authService.login(this.credentials.email, this.credentials.senha)
      .subscribe({
        next: (authUser) => {
          this.router.navigate(['/inicio']);
          this.loading = false;
        },
        error: (error) => {
          this.toastService.error('Erro de autenticação', error.message || 'Credenciais inválidas');
          this.loading = false;
        }
      });
  }

  selectMockUser(email: string): void {
    this.credentials.email = email;
    this.credentials.senha = '123456';
  }
}