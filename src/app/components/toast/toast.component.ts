import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Observable } from 'rxjs';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 1, 0.2)',
          style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit {
  toasts$: Observable<Toast[]>;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  ngOnInit(): void {}

  onClose(toast: Toast): void {
    this.toastService.remove(toast.id);
  }

  onAction(toast: Toast): void {
    if (toast.action) {
      toast.action.handler();
      this.toastService.remove(toast.id);
    }
  }

  onConfirm(toast: Toast): void {
    if (toast.confirmActions?.confirm) {
      toast.confirmActions.confirm.handler();
      this.toastService.remove(toast.id);
    }
  }

  onCancel(toast: Toast): void {
    if (toast.confirmActions?.cancel) {
      toast.confirmActions.cancel.handler();
    }
    this.toastService.remove(toast.id);
  }

  getIcon(type: string): string {
    const icons = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ',
      confirm: '❓'
    };
    return icons[type as keyof typeof icons] || 'ℹ';
  }

  getToastClass(type: string): string {
    return `toast toast-${type}`;
  }

}