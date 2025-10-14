import { Routes } from '@angular/router';
import { PaginaInicialComponent } from '../pagina-inicial/pagina-inicial.component';
import { NormasComponent } from '../normas/normas.component';
import { SituacaoNormaComponent } from '../SituacaoNorma/situacao-norma.component';
import { SituacaoObrigacaoComponent } from '../SituacaoObrigacao/situacao-obrigacao.component';
import { OrigemComponent } from '../origem/origem.component';
import { ObrigatoriedadeComponent } from '../obrigatoriedade/obrigatoriedade.component';
import { UnidadeComponent } from '../unidades/unidade.component';
import { LoginComponent } from '../login/login.component';
import { UnauthorizedComponent } from '../unauthorized/unauthorized.component';
import { RedirectComponent } from '../redirect/redirect.component';
import { authGuard } from '../../guards/auth.guard';
import { UserRole } from '../../models/user.model';
import { Resources, Actions } from '../../models/user.model';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { 
    path: 'inicio', 
    component: PaginaInicialComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'normas', 
    component: NormasComponent, 
    title: 'Normas',
    canActivate: [authGuard],
    data: { permission: { resource: Resources.NORMAS, action: Actions.READ } }
  },
  { 
    path: 'situacoes-norma', 
    component: SituacaoNormaComponent, 
    title: 'Situações de Norma',
    canActivate: [authGuard],
    data: { permission: { resource: Resources.SITUACOES_NORMA, action: Actions.READ } }
  },
  { 
    path: 'situacoes-obrigacao', 
    component: SituacaoObrigacaoComponent, 
    title: 'Situações de Obrigação',
    canActivate: [authGuard],
    data: { permission: { resource: Resources.SITUACOES_OBRIGACAO, action: Actions.READ } }
  },
  { 
    path: 'origens', 
    component: OrigemComponent, 
    title: 'Gestão de Origens',
    canActivate: [authGuard],
    data: { permission: { resource: Resources.ORIGENS, action: Actions.READ } }
  },
  { 
    path: 'obrigatoriedades', 
    component: ObrigatoriedadeComponent, 
    title: 'Gestão de Obrigatoriedades',
    canActivate: [authGuard],
    data: { permission: { resource: Resources.OBRIGATORIEDADES, action: Actions.READ } }
  },
  { 
    path: 'unidades', 
    component: UnidadeComponent, 
    title: 'Gestão de Unidades Responsáveis',
    canActivate: [authGuard],
    data: { permission: { resource: Resources.UNIDADES, action: Actions.READ } }
  },
  { path: '', component: RedirectComponent, pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
