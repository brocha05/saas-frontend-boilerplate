import apiClient from '@/lib/api/client';
import type {
  Subscription,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  BillingPortalResponse,
  Invoice,
} from '../types/billing.types';

export const billingApi = {
  getSubscription: () => apiClient.get<Subscription>('/billing/subscription'),

  getInvoices: () => apiClient.get<Invoice[]>('/billing/invoices'),

  createCheckoutSession: (data: CheckoutSessionRequest) =>
    apiClient.post<CheckoutSessionResponse>('/billing/checkout', data),

  createBillingPortalSession: () =>
    apiClient.post<BillingPortalResponse>('/billing/portal'),

  cancelSubscription: () => apiClient.post<Subscription>('/billing/cancel'),

  resumeSubscription: () => apiClient.post<Subscription>('/billing/resume'),
};
