import apiClient from '@/lib/api/client';
import type { Company } from '@/types';
import type { UpdateCompanyRequest } from '../types/company.types';

export const companyApi = {
  getCurrent: () => apiClient.get<Company>('/companies/me'),

  update: (data: UpdateCompanyRequest) =>
    apiClient.patch<Company>('/companies/me', data),

  uploadLogo: (file: File) => {
    const form = new FormData();
    form.append('logo', file);
    return apiClient.post<{ url: string }>('/companies/me/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: () => apiClient.delete<void>('/companies/me'),
};
