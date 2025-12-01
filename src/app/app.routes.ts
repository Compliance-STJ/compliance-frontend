import { Routes } from '@angular/router';
import { PaginaInicialComponent } from './components/pagina-inicial/pagina-inicial.component';
import { NormasComponent } from './components/normas/normas.component';
import { SituacaoNormaComponent } from './components/SituacaoNorma/situacao-norma.component';
import { SituacaoAprovacaoNormaComponent } from './components/SituacaoAprovacaoNorma/situacao-aprovacao-norma.component';
import { OrigemComponent } from './components/origem/origem.component';
import { ObrigatoriedadeComponent } from './components/obrigatoriedade/obrigatoriedade.component';
import { UnidadeComponent } from './components/unidades/unidade.component';
import { LoginComponent } from './components/login/login.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { RedirectComponent } from './components/redirect/redirect.component';
import { authGuard } from './guards/auth.guard';
import { permissionGuard } from './guards/permission.guard';
import { SituacaoObrigacaoComponent } from './components/SituacaoObrigacao/situacao-obrigacao.component';
import { ObrigacoesComponent } from './components/obrigacoes/obrigacoes.component';
import { ExtracaoComponent } from './components/extracao/extracao.component';
import { NormaManualComponent } from './components/norma-manual/norma-manual';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { MinhasObrigacoesComponent } from './components/minhas-obrigacoes/minhas-obrigacoes.component';
import { ObrigacaoDetalhamentoComponent } from './components/obrigacao-detalhamento/obrigacao-detalhamento';
import { AprovacoesAcrComponent } from './components/aprovacoes-acr/aprovacoes-acr.component';
import { AprovacoesGestorComponent } from './components/aprovacoes-gestor/aprovacoes-gestor.component';
import { ObrigacoesUnidadeComponent } from './components/obrigacoes-unidade/obrigacoes-unidade.component';

export const routes: Routes = [
  // Rotas públicas
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'unauthorized', component: UnauthorizedComponent, title: 'Acesso Negado' },

  // Rota raiz - redireciona com base na autenticação
  {
    path: '',
    component: RedirectComponent,
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    component: PaginaInicialComponent,
    title: 'Página Inicial',
    canActivate: [authGuard]
  },
  {
    path: 'normas',
    component: NormasComponent,
    title: 'Normas',
    canActivate: [authGuard, permissionGuard],
    data: { requiredPermission: { resource: 'normas', action: 'read' } }
  },
  {
    path: 'situacoes-norma',
    component: SituacaoNormaComponent,
    title: 'Situações de Norma',
    canActivate: [authGuard, permissionGuard],
    data: { requiredPermission: { resource: 'situacoes-norma', action: 'read' } }
  },
  {
    path: 'situacoes-aprovacao-norma',
    component: SituacaoAprovacaoNormaComponent,
    title: 'Situações de Aprovação de Norma',
    canActivate: [authGuard, permissionGuard],
    data: { requiredPermission: { resource: 'situacoes-aprovacao-norma', action: 'read' } }
  },
  {
    path: 'situacoes-obrigacoes',
    component: SituacaoObrigacaoComponent,
    title: 'Situações de Obrigações',
    canActivate: [authGuard, permissionGuard],
    data: { requiredPermission: { resource: 'situacoes-obrigacao', action: 'read' } }
  },
  {
    path: 'origens',
    component: OrigemComponent,
    title: 'Gestão de Origens',
    canActivate: [authGuard, permissionGuard],
    data: { requiredPermission: { resource: 'origens', action: 'read' } }
  },
  {
    path: 'obrigacoes',
    component: ObrigacoesComponent,
    title: 'Gestão de Obrigações',
    canActivate: [authGuard, permissionGuard],
    data: { requiredPermission: { resource: 'obrigacoes', action: 'read' } }
  },
  {
    path: 'obrigacoes/:id/detalhamento',
    component: ObrigacaoDetalhamentoComponent,
    title: 'Detalhamento da Obrigação',
    canActivate: [authGuard, permissionGuard],
    data: { requiredPermission: { resource: 'obrigacoes', action: 'read' } }
  },
  {
    path: 'extracao',
    component: ExtracaoComponent,
    title: 'Extração de Obrigações',
    canActivate: [authGuard]
  },
  {
    path: 'norma-manual',
    component: NormaManualComponent,
    title: 'Criação Manual de Obrigações',
    canActivate: [authGuard]
  },
  {
    path: 'obrigatoriedades',
    component: ObrigatoriedadeComponent,
    title: 'Gestão de Obrigatoriedades',
    canActivate: [authGuard, permissionGuard],
    data: { requiredPermission: { resource: 'obrigatoriedades', action: 'read' } }
  },
  {
    path: 'unidades',
    component: UnidadeComponent,
    title: 'Gestão de Unidades Responsáveis',
    canActivate: [authGuard, permissionGuard],
    data: { requiredPermission: { resource: 'unidades', action: 'read' } }
  },
  {
    path: 'usuarios',
    component: UsuariosComponent,
    title: 'Gestão de Usuários',
    canActivate: [authGuard, permissionGuard],
    data: { requiredPermission: { resource: 'usuarios', action: 'read' } }
  },
  {
    path: 'minhas-obrigacoes',
    component: MinhasObrigacoesComponent,
    title: 'Minhas Obrigações',
    canActivate: [authGuard]
  },
  {
    path: 'obrigacoes-unidade',
    component: ObrigacoesUnidadeComponent,
    title: 'Obrigações da Unidade',
    canActivate: [authGuard, permissionGuard],
    data: { requiredPermission: { resource: 'obrigacoes', action: 'read' } }
  },
  {
    path: 'aprovacoes-acr',
    component: AprovacoesAcrComponent,
    title: 'Aprovações ACR',
    canActivate: [authGuard, permissionGuard],
    data: { requiredPermission: { resource: 'obrigacoes', action: 'approve' } }
  },
  {
    path: 'aprovacoes-gestor',
    component: AprovacoesGestorComponent,
    title: 'Aprovações da Unidade',
    canActivate: [authGuard, permissionGuard],
    data: { requiredPermission: { resource: 'obrigacoes', action: 'update' } }
  },

  { path: '**', redirectTo: 'login' }
];
