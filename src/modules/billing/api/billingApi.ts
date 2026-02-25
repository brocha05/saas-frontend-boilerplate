import apiClient from '@/lib/api/client';
import type {
  Subscription,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  BillingPortalResponse,
  Invoice,
} from '../types/billing.types';

export const billingApi = {
  getSubscription: () => apiClient.get<Subscription>('/subscriptions'),

  getInvoices: () => apiClient.get<Invoice[]>('/subscriptions/invoices'),

  createCheckoutSession: (data: CheckoutSessionRequest) =>
    apiClient.post<CheckoutSessionResponse>('/subscriptions/checkout', data),

  createBillingPortalSession: () =>
    apiClient.get<BillingPortalResponse>('/subscriptions/portal'),

  cancelSubscription: () =>
    apiClient.delete<{ message: string }>('/subscriptions/cancel'),

  resumeSubscription: () =>
    apiClient.post<{ message: string }>('/subscriptions/resume'),
};
