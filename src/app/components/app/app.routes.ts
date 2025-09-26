import { Routes } from '@angular/router';
import { PaginaInicialComponent } from '../pagina-inicial/pagina-inicial.component';
import { NormasComponent } from '../normas/normas.component';
import { SituacaoNormaComponent } from '../SituacaoNorma/situacao-norma.component';
import { SituacaoObrigacaoComponent } from '../ObrigacaoSituacao/situacao-obrigacao.component';
import { OrigemComponent } from '../origem/origem.component';
import { ObrigatoriedadeComponent } from '../obrigatoriedade/obrigatoriedade.component';
import { UnidadeComponent } from '../unidades/unidade.component';

export const routes: Routes = [
  { path: 'inicio', component: PaginaInicialComponent },
  { path: 'normas', component: NormasComponent, title: 'Normas' },
  { path: 'situacoes-norma', component: SituacaoNormaComponent, title: 'Situações de Norma' },
  { path: 'situacoes-obrigacao', component: SituacaoObrigacaoComponent, title: 'Situações de Obrigação' },
  { path: 'origens', component: OrigemComponent, title: 'Gestão de Origens' },
  { path: 'obrigatoriedades', component: ObrigatoriedadeComponent, title: 'Gestão de Obrigatoriedades' },
  { path: 'unidades', component: UnidadeComponent, title: 'Gestão de Unidades Responsáveis' },
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: '**', redirectTo: 'inicio' }
];
