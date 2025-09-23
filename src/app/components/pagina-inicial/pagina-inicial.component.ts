import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Message {
  from: string;
  subject: string;
  content: string;
}

@Component({
  selector: 'app-pagina-inicial',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pagina-inicial.component.html',
  styleUrls: ['./pagina-inicial.component.css']
})
export class PaginaInicialComponent {
  messages: Message[] = [
    {
      from: 'Tribunal Superior',
      subject: 'Relatório de Compliance',
      content: 'O relatório mensal de compliance está disponível para revisão.'
    },
    {
      from: 'Setor Administrativo',
      subject: 'Atualizações do Sistema',
      content: 'Novas atualizações do sistema estão programadas para o próximo mês.'
    },
    {
      from: 'Jurisprudência',
      subject: 'Novos Casos',
      content: 'Foram adicionados novos casos à base de dados de jurisprudência.'
    }
  ];
}
