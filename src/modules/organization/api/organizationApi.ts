import apiClient from '@/lib/api/client';
import type { Tenant } from '@/types';
import type { UpdateTenantRequest } from '../types/organization.types';

export const tenantApi = {
  getCurrent: () => apiClient.get<Tenant>('/tenants/me'),

  getAll: () => apiClient.get<Tenant[]>('/tenants'),

  update: (id: string, data: UpdateTenantRequest) =>
    apiClient.patch<Tenant>(`/tenants/${id}`, data),

  uploadLogo: (id: string, file: File) => {
    const form = new FormData();
    form.append('logo', file);
    return apiClient.post<{ url: string }>(`/tenants/${id}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: (id: string) => apiClient.delete<void>(`/tenants/${id}`),
};

/** @deprecated Use tenantApi instead */
export const organizationApi = tenantApi;
