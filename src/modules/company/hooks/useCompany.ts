'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { companyApi } from '../api/companyApi';
import { useCompanyStore } from '@/store/companyStore';
import type { UpdateCompanyRequest, InviteUserRequest } from '../types/company.types';

export const companyKeys = {
  all: ['companies'] as const,
  current: () => [...companyKeys.all, 'current'] as const,
  members: () => [...companyKeys.all, 'members'] as const,
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

export function useUploadLogo() {
  const queryClient = useQueryClient();
  const { updateCurrentCompany } = useCompanyStore();

  return useMutation({
    mutationFn: (file: File) => companyApi.uploadLogo(file).then((r) => r.data),
    onSuccess: (data) => {
      updateCurrentCompany({ logoUrl: data.url });
      queryClient.invalidateQueries({ queryKey: companyKeys.current() });
      toast.success('Logo updated.');
    },
    onError: () => toast.error('Failed to upload logo.'),
  });
}

export function useCompanyMembers() {
  return useQuery({
    queryKey: companyKeys.members(),
    queryFn: () => companyApi.getMembers().then((r) => r.data),
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteUserRequest) => companyApi.inviteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.members() });
      toast.success('Invitation sent.');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message;
      toast.error(msg ?? 'Failed to send invitation.');
    },
  });
}
