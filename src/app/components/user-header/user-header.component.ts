import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AuthUser, UserRole } from '../../models/user.model';
import { HasRoleDirective } from '../../directives/permission.directive';

@Component({
  selector: 'app-user-header',
  standalone: true,
  imports: [CommonModule, RouterLink, HasRoleDirective],
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.css']
})
export class UserHeaderComponent implements OnInit, OnDestroy {
  currentUser: AuthUser | null = null;
  showUserMenu = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeUserMenu();
  }
  
  getRoleDisplayName(role: UserRole): string {
    const roleNames = {
      [UserRole.ACR]: 'Administrador ACR',
      [UserRole.GESTOR]: 'Gestor',
      [UserRole.RESPONSAVEL]: 'Responsável',
      [UserRole.USUARIO]: 'Usuário',
      [UserRole.CONSULTOR]: 'Consultor'
    };
    return roleNames[role] || role;
  }

  // Expor UserRole para o template
  UserRole = UserRole;
}