import type { Company } from '@/types';

export type { Company };

export interface UpdateCompanyRequest {
  name?: string;
  logo?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: 'admin' | 'member';
}
