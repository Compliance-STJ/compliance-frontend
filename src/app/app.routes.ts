import { Routes } from '@angular/router';
import { PaginaInicialComponent } from './components/pagina-inicial/pagina-inicial.component';
import { NormasComponent } from './components/normas/normas.component';
import { SituacaoNormaComponent } from './components/SituacaoNorma/situacao-norma.component';
import { OrigemComponent } from './components/origem/origem.component';
import { ObrigatoriedadeComponent } from './components/obrigatoriedade/obrigatoriedade.component';
import { UnidadesComponent } from './components/unidades/unidades.component';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: PaginaInicialComponent, title: 'Página Inicial' },
  { path: 'normas', component: NormasComponent, title: 'Normas' },
  { path: 'situacoes-norma', component: SituacaoNormaComponent, title: 'Situações de Norma' },
  { path: 'origens', component: OrigemComponent, title: 'Gestão de Origens' },
  { path: 'obrigatoriedades', component: ObrigatoriedadeComponent, title: 'Gestão de Obrigatoriedades' },
  { path: 'unidades', component: UnidadesComponent, title: 'Gestão de Unidades Responsáveis' },

  { path: '**', redirectTo: 'inicio' }
];
