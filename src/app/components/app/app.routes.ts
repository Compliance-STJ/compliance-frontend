import { Routes } from '@angular/router';
import { PaginaInicialComponent } from '../pagina-inicial/pagina-inicial.component';
import { NormasComponent } from '../normas/normas.component';
import { SituacaoNormaComponent } from '../SituacaoNorma/situacao-norma.component';
import { SituacaoObrigacaoComponent } from '../ObrigacaoSituacao/situacao-obrigacao.component';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: PaginaInicialComponent },
  { path: 'normas', component: NormasComponent, title: 'Normas' },
  { path: 'situacoes-norma', component: SituacaoNormaComponent, title: 'Situações de Norma' },
  { path: 'situacoes-obrigacao', component: SituacaoObrigacaoComponent, title: 'Situações de Obrigação' },
  { path: '**', redirectTo: 'inicio' }
];
