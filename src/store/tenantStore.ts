import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Tenant } from '@/types';

interface TenantState {
  currentTenantId: string | null;
  currentTenant: Tenant | null;
}

interface TenantActions {
  setCurrentTenant: (tenant: Tenant) => void;
  updateCurrentTenant: (data: Partial<Tenant>) => void;
  clearTenant: () => void;
}

type TenantStore = TenantState & TenantActions;

export const useTenantStore = create<TenantStore>()(
  persist(
    (set) => ({
      currentTenantId: null,
      currentTenant: null,

      setCurrentTenant: (tenant) =>
        set({ currentTenant: tenant, currentTenantId: tenant.id }),

      updateCurrentTenant: (data) =>
        set((state) => ({
          currentTenant: state.currentTenant ? { ...state.currentTenant, ...data } : null,
        })),

      clearTenant: () =>
        set({ currentTenantId: null, currentTenant: null }),
    }),
    {
      name: 'tenant-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
    }
  )
);
