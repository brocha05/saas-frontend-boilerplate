import type { User, Tenant } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  tenant: Tenant;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
