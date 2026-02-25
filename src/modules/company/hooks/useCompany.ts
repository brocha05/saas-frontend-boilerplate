'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { companyApi } from '../api/companyApi';
import { useCompanyStore } from '@/store/companyStore';
import type { UpdateCompanyRequest } from '../types/company.types';

export const companyKeys = {
  all: ['companies'] as const,
  current: () => [...companyKeys.all, 'current'] as const,
};

export function useCurrentCompany() {
  const { setCurrentCompany } = useCompanyStore();
  return useQuery({
    queryKey: companyKeys.current(),
    queryFn: () => companyApi.getCurrent().then((r) => r.data),
    onSuccess: (company: import('@/types').Company) => setCurrentCompany(company),
  } as Parameters<typeof useQuery>[0]);
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  const { updateCurrentCompany } = useCompanyStore();

  return useMutation({
    mutationFn: (data: UpdateCompanyRequest) =>
      companyApi.update(data).then((r) => r.data),
    onSuccess: (company) => {
      queryClient.setQueryData(companyKeys.current(), company);
      updateCurrentCompany(company);
      toast.success('Company updated.');
    },
    onError: () => toast.error('Failed to update company.'),
  });
}
