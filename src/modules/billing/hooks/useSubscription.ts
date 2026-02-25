'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { billingApi } from '../api/billingApi';
import { useTenantStore } from '@/store/tenantStore';
import { PLAN_FEATURES } from '@/types';
import type { PlanFeatures, CheckoutSessionRequest } from '../types/billing.types';

export const billingKeys = {
  all: ['billing'] as const,
  subscription: () => [...billingKeys.all, 'subscription'] as const,
  invoices: () => [...billingKeys.all, 'invoices'] as const,
};

// ─── useSubscription ─────────────────────────────────────────────────────────

export function useSubscription() {
  const { currentTenant } = useTenantStore();

  const query = useQuery({
    queryKey: billingKeys.subscription(),
    queryFn: () => billingApi.getSubscription().then((r) => r.data),
    enabled: !!currentTenant,
  });

  const plan = currentTenant?.plan ?? 'free';
  const features: PlanFeatures = PLAN_FEATURES[plan];

  const hasFeature = (feature: keyof PlanFeatures): boolean => {
    const value = features[feature];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0;
    return false;
  };

  const canUse = (feature: keyof PlanFeatures, count?: number): boolean => {
    const value = features[feature];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') {
      return count !== undefined ? value >= count : value > 0;
    }
    return false;
  };

  return {
    ...query,
    plan,
    features,
    hasFeature,
    canUse,
    isActive:
      query.data?.status === 'active' || query.data?.status === 'trialing',
  };
}

// ─── useCheckout ──────────────────────────────────────────────────────────────

export function useCheckout() {
  return useMutation({
    mutationFn: (data: CheckoutSessionRequest) =>
      billingApi.createCheckoutSession(data).then((r) => r.data),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: () => toast.error('Failed to start checkout. Please try again.'),
  });
}

// ─── useBillingPortal ─────────────────────────────────────────────────────────

export function useBillingPortal() {
  return useMutation({
    mutationFn: () => billingApi.createBillingPortalSession().then((r) => r.data),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: () => toast.error('Failed to open billing portal.'),
  });
}

// ─── useInvoices ──────────────────────────────────────────────────────────────

export function useInvoices() {
  return useQuery({
    queryKey: billingKeys.invoices(),
    queryFn: () => billingApi.getInvoices().then((r) => r.data),
  });
}

// ─── useCancelSubscription ────────────────────────────────────────────────────

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => billingApi.cancelSubscription().then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() });
      toast.success('Subscription will cancel at the end of the billing period.');
    },
    onError: () => toast.error('Failed to cancel subscription.'),
  });
}
