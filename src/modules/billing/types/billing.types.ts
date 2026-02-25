import type { Subscription, PlanType, PlanFeatures } from '@/types';

export type { Subscription, PlanType, PlanFeatures };

export interface CheckoutSessionRequest {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResponse {
  url: string;
}

export interface BillingPortalResponse {
  url: string;
}

export interface Invoice {
  id: string;
  number: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  amount: number;
  currency: string;
  date: string;
  pdfUrl: string;
}
