import apiClient from '@/lib/api/client';
import type { Company } from '@/types';
import type { UpdateCompanyRequest } from '../types/company.types';

export const companyApi = {
  getCurrent: () => apiClient.get<Company>('/companies/me'),

  getAll: () => apiClient.get<Company[]>('/companies'),

  update: (id: string, data: UpdateCompanyRequest) =>
    apiClient.patch<Company>(`/companies/${id}`, data),

  uploadLogo: (id: string, file: File) => {
    const form = new FormData();
    form.append('logo', file);
    return apiClient.post<{ url: string }>(`/companies/${id}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: (id: string) => apiClient.delete<void>(`/companies/${id}`),
};
