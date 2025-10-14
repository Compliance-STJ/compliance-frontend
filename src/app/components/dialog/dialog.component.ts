import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() width = '500px';
  @Input() height = 'auto';
  @Input() showCloseButton = true;
  @Input() closeOnBackdropClick = true;

  @Output() closed = new EventEmitter<void>();

  ngOnInit(): void {
    // Prevent body scroll when dialog is open
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy(): void {
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }

  onBackdropClick(): void {
    if (this.closeOnBackdropClick) {
      this.close();
    }
  }

  onDialogClick(event: Event): void {
    event.stopPropagation();
  }

  close(): void {
    this.isOpen = false;
    document.body.style.overflow = 'auto';
    this.closed.emit();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }
}