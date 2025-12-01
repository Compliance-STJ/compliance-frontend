import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParteNorma } from '../../services/norma-manual.service';

@Component({
  selector: 'app-parte-norma-tree-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tree-item" [class.expanded]="expanded" [class.has-children]="hasChildren">
      <div class="tree-item-header" [class.selecionada]="parte.selecionado">
        <div class="tree-controls">
          <button
            *ngIf="hasChildren"
            (click)="toggleExpanded()"
            class="expand-btn"
            [class.expanded]="expanded">
            {{ expanded ? '▼' : '▶' }}
          </button>
          <input
            type="checkbox"
            [checked]="parte.selecionado"
            (change)="onCheckboxChange($event)"
            class="parte-checkbox">
        </div>

        <div class="tree-content">
          <span class="parte-tipo" [class]="'tipo-' + parte.tipo">
            {{ getTipoParteLabel(parte.tipo) }}
          </span>
          <span class="parte-numero">{{ parte.numero }}</span>
          <span class="parte-texto">{{ parte.texto }}</span>
        </div>
      </div>

      <div *ngIf="hasChildren && expanded" class="tree-children">
        <app-parte-norma-tree-item
          *ngFor="let filho of parte.filhos"
          [parte]="filho"
          (selecaoChange)="onChildSelecaoChange($event)">
        </app-parte-norma-tree-item>
      </div>
    </div>
  `,
  styles: [`
    .tree-item {
      margin-left: 20px;
    }

    .tree-item.has-children {
      border-left: 2px solid #e0e0e0;
      padding-left: 8px;
      margin-left: 0;
    }

    .tree-item-header {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 4px;
      transition: background-color 0.2s;
    }

    .tree-item-header:hover {
      background-color: #f8f9fa;
    }

    .tree-item-header.selecionada {
      background-color: #e3f2fd;
      border: 1px solid #2196f3;
    }

    .tree-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-right: 12px;
    }

    .expand-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 12px;
      color: #666;
      padding: 2px 4px;
      border-radius: 3px;
      transition: all 0.2s;
    }

    .expand-btn:hover {
      background-color: #f0f0f0;
    }

    .expand-btn.expanded {
      transform: rotate(0deg);
    }

    .parte-checkbox {
      margin: 0;
    }

    .tree-content {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .parte-tipo {
      font-weight: bold;
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 3px;
      text-transform: uppercase;
      min-width: 60px;
      text-align: center;
    }

    .tipo-caput, .tipo-artigo {
      background-color: #4caf50;
      color: white;
    }

    .tipo-paragrafo {
      background-color: #2196f3;
      color: white;
    }

    .tipo-inciso {
      background-color: #ff9800;
      color: white;
    }

    .tipo-alinea {
      background-color: #9c27b0;
      color: white;
    }

    .parte-numero {
      font-weight: bold;
      color: #333;
      min-width: 30px;
    }

    .parte-texto {
      flex: 1;
      color: #555;
      line-height: 1.4;
    }

    .tree-children {
      margin-left: 20px;
    }
  `]
})
export class ParteNormaTreeItemComponent {
  @Input() parte!: ParteNorma;
  @Output() selecaoChange = new EventEmitter<ParteNorma>();

  expanded = false;

  // Propriedade local para controlar o checkbox
  get isSelecionado(): boolean {
    return this.parte.selecionado;
  }

  set isSelecionado(value: boolean) {
    this.parte.selecionado = value;
  }

  get hasChildren(): boolean {
    return !!(this.parte.filhos && this.parte.filhos.length > 0);
  }

  toggleExpanded() {
    this.expanded = !this.expanded;
  }

  onCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.parte.selecionado = checkbox.checked;
    console.log('✅ Checkbox clicked:', this.parte.tipo, this.parte.numero, 'selecionado:', this.parte.selecionado);
    this.selecaoChange.emit(this.parte);
  }

  onSelecaoChange() {
    console.log('Checkbox changed:', this.parte.tipo, this.parte.numero, 'selecionado:', this.parte.selecionado);
    this.selecaoChange.emit(this.parte);
  }

  onChildSelecaoChange(child: ParteNorma) {
    this.selecaoChange.emit(child);
  }

  getTipoParteLabel(tipo: string): string {
    const labels: { [key: string]: string } = {
      'caput': 'CAPUT',
      'artigo': 'ART.',
      'paragrafo': '§',
      'inciso': 'Inc.',
      'alinea': 'Al.'
    };
    return labels[tipo] || tipo.toUpperCase();
  }
}