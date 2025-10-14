export enum UserRole {
  ACR = 'acr',
  RESPONSAVEL = 'responsavel',
  USUARIO = 'usuario',
  GESTOR = 'gestor',
  CONSULTOR = 'consultor'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  unit?: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface AuthUser {
  user: User;
  token: string;
  refreshToken?: string;
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: string[];
}

// Definição de recursos e ações do sistema
export const Resources = {
  NORMAS: 'normas',
  OBRIGACOES: 'obrigacoes',
  ORIGENS: 'origens',
  UNIDADES: 'unidades',
  OBRIGATORIEDADES: 'obrigatoriedades',
  SITUACOES_NORMA: 'situacoes-norma',
  SITUACOES_OBRIGACAO: 'situacoes-obrigacao',
  USUARIOS: 'usuarios',
  DASHBOARD: 'dashboard',
  CONFIGURACOES: 'configuracoes',
  AUDITORIA: 'auditoria'
} as const;

export const Actions = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  EXPORT: 'export'
} as const;

// Permissões por perfil baseadas na US050
export const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ACR]: [
    { resource: Resources.NORMAS, actions: [Actions.CREATE, Actions.READ, Actions.UPDATE, Actions.DELETE] },
    { resource: Resources.OBRIGACOES, actions: [Actions.CREATE, Actions.READ, Actions.UPDATE, Actions.DELETE, Actions.APPROVE] },
    { resource: Resources.ORIGENS, actions: [Actions.CREATE, Actions.READ, Actions.UPDATE, Actions.DELETE] },
    { resource: Resources.UNIDADES, actions: [Actions.CREATE, Actions.READ, Actions.UPDATE, Actions.DELETE] },
    { resource: Resources.OBRIGATORIEDADES, actions: [Actions.CREATE, Actions.READ, Actions.UPDATE, Actions.DELETE] },
    { resource: Resources.SITUACOES_NORMA, actions: [Actions.CREATE, Actions.READ, Actions.UPDATE, Actions.DELETE] },
    { resource: Resources.SITUACOES_OBRIGACAO, actions: [Actions.CREATE, Actions.READ, Actions.UPDATE, Actions.DELETE] },
    { resource: Resources.USUARIOS, actions: [Actions.CREATE, Actions.READ, Actions.UPDATE, Actions.DELETE] },
    { resource: Resources.DASHBOARD, actions: [Actions.READ, Actions.EXPORT] },
    { resource: Resources.CONFIGURACOES, actions: [Actions.CREATE, Actions.READ, Actions.UPDATE, Actions.DELETE] },
    { resource: Resources.AUDITORIA, actions: [Actions.READ, Actions.EXPORT] }
  ],
  [UserRole.GESTOR]: [
    { resource: Resources.NORMAS, actions: [Actions.CREATE, Actions.READ, Actions.UPDATE, Actions.DELETE] },
    { resource: Resources.OBRIGACOES, actions: [Actions.CREATE, Actions.READ, Actions.UPDATE, Actions.DELETE, Actions.APPROVE] },
    { resource: Resources.ORIGENS, actions: [Actions.CREATE, Actions.READ, Actions.UPDATE, Actions.DELETE] },
    { resource: Resources.UNIDADES, actions: [Actions.CREATE, Actions.READ, Actions.UPDATE, Actions.DELETE] },
    { resource: Resources.OBRIGATORIEDADES, actions: [Actions.CREATE, Actions.READ, Actions.UPDATE, Actions.DELETE] },
    { resource: Resources.SITUACOES_NORMA, actions: [Actions.CREATE, Actions.READ, Actions.UPDATE, Actions.DELETE] },
    { resource: Resources.SITUACOES_OBRIGACAO, actions: [Actions.CREATE, Actions.READ, Actions.UPDATE, Actions.DELETE] },
    { resource: Resources.USUARIOS, actions: [Actions.READ] },
    { resource: Resources.DASHBOARD, actions: [Actions.READ, Actions.EXPORT] },
    { resource: Resources.CONFIGURACOES, actions: [Actions.READ, Actions.UPDATE] },
    { resource: Resources.AUDITORIA, actions: [Actions.READ, Actions.EXPORT] }
  ],
  [UserRole.RESPONSAVEL]: [
    { resource: Resources.NORMAS, actions: [Actions.READ] },
    { resource: Resources.OBRIGACOES, actions: [Actions.READ, Actions.UPDATE, Actions.APPROVE] },
    { resource: Resources.SITUACOES_OBRIGACAO, actions: [Actions.READ, Actions.UPDATE] },
    { resource: Resources.DASHBOARD, actions: [Actions.READ] }
  ],
  [UserRole.USUARIO]: [
    { resource: Resources.NORMAS, actions: [Actions.READ] },
    { resource: Resources.OBRIGACOES, actions: [Actions.READ, Actions.UPDATE] },
    { resource: Resources.SITUACOES_OBRIGACAO, actions: [Actions.READ] }
  ],
  [UserRole.CONSULTOR]: [
    { resource: Resources.NORMAS, actions: [Actions.READ] },
    { resource: Resources.OBRIGACOES, actions: [Actions.READ] },
    { resource: Resources.DASHBOARD, actions: [Actions.READ] }
  ]
};