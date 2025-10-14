export interface JwtPayload {
  sub: string; // ID do usuário
  email: string;
  name: string;
  role: string;
  unit?: string;
  permissions: string[];
  iat: number; // issued at
  exp: number; // expiration time
  iss: string; // issuer
}

export interface LoginRequest {
  login?: string;
  email?: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: number;
    nome: string;
    email: string;
    tipo: string;
    unidade?: string;
    ativo: boolean;
    primeiroLogin: boolean;
    dataUltimoLogin?: string;
    permissoes: string[];
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  expired: boolean;
  payload?: JwtPayload;
}