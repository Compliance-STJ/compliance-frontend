import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-demo.component.html',
  styleUrl: './toast-demo.component.css'
})
export class ToastDemoComponent {

  constructor(private toastService: ToastService) {}

  showSuccessToast(): void {
    this.toastService.success(
      'Operação realizada com sucesso!',
      'Todos os dados foram salvos corretamente.'
    );
  }

  showErrorToast(): void {
    this.toastService.error(
      'Erro ao processar solicitação',
      'Verifique sua conexão com a internet e tente novamente.'
    );
  }

  showWarningToast(): void {
    this.toastService.warning(
      'Atenção necessária',
      'Alguns campos obrigatórios não foram preenchidos.'
    );
  }

  showInfoToast(): void {
    this.toastService.info(
      'Informação importante',
      'O sistema será atualizado às 23:00 hoje.'
    );
  }

  showToastWithAction(): void {
    this.toastService.error(
      'Erro de conexão',
      'Não foi possível conectar ao servidor.',
      {
        duration: 0, // Não remove automaticamente
        action: {
          label: 'Tentar novamente',
          handler: () => {
            this.toastService.info('Reconectando...', 'Tentando estabelecer conexão novamente.');
          }
        }
      }
    );
  }

  showSaveSuccess(): void {
    this.toastService.saveSuccess('Unidade');
  }

  showLoadError(): void {
    this.toastService.loadError('dados do usuário');
  }

  showConnectionError(): void {
    this.toastService.connectionError();
  }

  clearAllToasts(): void {
    this.toastService.clear();
  }

  // Confirmation examples
  showConfirmDelete(): void {
    this.toastService.confirmDelete('Usuário João Silva', () => {
      this.toastService.success('Excluído', 'Usuário foi removido com sucesso!');
    });
  }

  showConfirmActivate(): void {
    this.toastService.confirmActivate('Produto XYZ', () => {
      this.toastService.success('Ativado', 'Produto foi ativado com sucesso!');
    });
  }

  showConfirmDeactivate(): void {
    this.toastService.confirmDeactivate('Serviço ABC', () => {
      this.toastService.success('Desativado', 'Serviço foi desativado com sucesso!');
    });
  }

  showCustomConfirm(): void {
    this.toastService.confirm(
      'Confirmar operação crítica',
      'Esta ação irá afetar todos os usuários do sistema. Tem certeza?',
      () => {
        this.toastService.success('Executado', 'Operação crítica foi executada!');
      },
      () => {
        this.toastService.info('Cancelado', 'Operação foi cancelada pelo usuário.');
      },
      'Executar',
      'Cancelar'
    );
  }
}