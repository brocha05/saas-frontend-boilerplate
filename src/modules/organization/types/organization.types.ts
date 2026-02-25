import type { Tenant } from '@/types';

export type { Tenant };

export interface UpdateTenantRequest {
  name?: string;
  logo?: string;
}

/** @deprecated Use UpdateTenantRequest instead */
export type UpdateOrganizationRequest = UpdateTenantRequest;

export interface InviteMemberRequest {
  email: string;
  role: 'admin' | 'member';
}
