'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tenantApi } from '../api/organizationApi';
import { useTenantStore } from '@/store/tenantStore';
import type { UpdateTenantRequest } from '../types/organization.types';

export const tenantKeys = {
  all: ['tenants'] as const,
  current: () => [...tenantKeys.all, 'current'] as const,
  list: () => [...tenantKeys.all, 'list'] as const,
};

export function useCurrentTenant() {
  const { setCurrentTenant } = useTenantStore();
  return useQuery({
    queryKey: tenantKeys.current(),
    queryFn: () => tenantApi.getCurrent().then((r) => r.data),
    onSuccess: (tenant: import('@/types').Tenant) => setCurrentTenant(tenant),
  } as Parameters<typeof useQuery>[0]);
}

export function useTenants() {
  return useQuery({
    queryKey: tenantKeys.list(),
    queryFn: () => tenantApi.getAll().then((r) => r.data),
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  const { updateCurrentTenant } = useTenantStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantRequest }) =>
      tenantApi.update(id, data).then((r) => r.data),
    onSuccess: (tenant) => {
      queryClient.setQueryData(tenantKeys.current(), tenant);
      updateCurrentTenant(tenant);
      toast.success('Tenant updated.');
    },
    onError: () => toast.error('Failed to update tenant.'),
  });
}
