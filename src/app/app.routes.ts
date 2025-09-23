import { Routes } from '@angular/router';
import { PaginaInicialComponent } from './components/pagina-inicial/pagina-inicial.component';
import { NormasComponent } from './components/normas/normas.component';
import { SituacaoNormaComponent } from './components/SituacaoNorma/situacao-norma.component';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: PaginaInicialComponent, title: 'Página Inicial' },
  { path: 'normas', component: NormasComponent, title: 'Normas' },
  { path: 'situacoes-norma', component: SituacaoNormaComponent, title: 'Situações de Norma' },

  { path: '**', redirectTo: 'inicio' }
];
