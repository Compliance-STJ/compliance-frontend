import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
  confirmActions?: {
    confirm: {
      label: string;
      handler: () => void;
    };
    cancel: {
      label: string;
      handler: () => void;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private addToast(toast: Omit<Toast, 'id'>): string {
    console.log('ToastService.addToast chamado:', toast);
    const id = this.generateId();
    const newToast: Toast = {
      id,
      duration: 5000,
      dismissible: true,
      ...toast
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, newToast]);

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newToast.duration);
    }

    return id;
  }

  success(title: string, message?: string, options?: Partial<Toast>): string {
    return this.addToast({
      type: 'success',
      title,
      message,
      ...options
    });
  }

  error(title: string, message?: string, options?: Partial<Toast>): string {
    return this.addToast({
      type: 'error',
      title,
      message,
      duration: 8000, // Errors stay longer
      ...options
    });
  }

  warning(title: string, message?: string, options?: Partial<Toast>): string {
    return this.addToast({
      type: 'warning',
      title,
      message,
      duration: 6000,
      ...options
    });
  }

  info(title: string, message?: string, options?: Partial<Toast>): string {
    return this.addToast({
      type: 'info',
      title,
      message,
      ...options
    });
  }

  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.toastsSubject.next([]);
  }

  // Convenience methods for common operations
  saveSuccess(entity: string = 'item'): string {
    return this.success(
      'Salvo com sucesso',
      `${entity} foi salvo com sucesso.`
    );
  }

  saveError(entity: string = 'item', error?: string): string {
    return this.error(
      'Erro ao salvar',
      error || `Erro ao salvar ${entity}. Tente novamente.`
    );
  }

  deleteSuccess(entity: string = 'item'): string {
    return this.success(
      'Removido com sucesso',
      `${entity} foi removido com sucesso.`
    );
  }

  deleteError(entity: string = 'item', error?: string): string {
    return this.error(
      'Erro ao remover',
      error || `Erro ao remover ${entity}. Tente novamente.`
    );
  }

  loadError(entity: string = 'dados', error?: string): string {
    return this.error(
      'Erro ao carregar',
      error || `Erro ao carregar ${entity}. Verifique sua conexão.`
    );
  }

  connectionError(): string {
    return this.error(
      'Erro de conexão',
      'Não foi possível conectar ao servidor. Verifique sua internet.',
      { duration: 0, dismissible: true }
    );
  }

  operationSuccess(operation: string): string {
    return this.success(
      'Operação concluída',
      `${operation} foi executada com sucesso.`
    );
  }

  // Confirmation methods
  confirm(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmLabel: string = 'Confirmar',
    cancelLabel: string = 'Cancelar'
  ): string {
    console.log('ToastService.confirm chamado:', title, message);
    return this.addToast({
      type: 'confirm',
      title,
      message,
      duration: 0, // Don't auto-dismiss confirmations
      dismissible: false, // Force user to choose
      confirmActions: {
        confirm: {
          label: confirmLabel,
          handler: () => {
            onConfirm();
          }
        },
        cancel: {
          label: cancelLabel,
          handler: () => {
            if (onCancel) onCancel();
          }
        }
      }
    });
  }

  // Convenience confirmation methods
  confirmDelete(itemName: string, onConfirm: () => void): string {
    console.log('ToastService.confirmDelete chamado para:', itemName);
    return this.confirm(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
      onConfirm,
      undefined,
      'Excluir',
      'Cancelar'
    );
  }

  confirmActivate(itemName: string, onConfirm: () => void, onCancel?: () => void): string {
    return this.confirm(
      'Confirmar ativação',
      `Tem certeza que deseja ativar "${itemName}"?`,
      onConfirm,
      onCancel,
      'Ativar',
      'Cancelar'
    );
  }

  confirmDeactivate(itemName: string, onConfirm: () => void, onCancel?: () => void): string {
    return this.confirm(
      'Confirmar desativação',
      `Tem certeza que deseja desativar "${itemName}"?`,
      onConfirm,
      onCancel,
      'Desativar',
      'Cancelar'
    );
  }

  confirmStatusChange(itemName: string, newStatus: string, onConfirm: () => void, onCancel?: () => void): string {
    return this.confirm(
      'Confirmar alteração',
      `Tem certeza que deseja ${newStatus} "${itemName}"?`,
      onConfirm,
      onCancel,
      'Confirmar',
      'Cancelar'
    );
  }

  // Method to get current toasts (for checking if there are confirmation toasts)
  getToasts(): Toast[] {
    return this.toastsSubject.getValue();
  }
}