// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: Record<string, string[]>;
}

export type PaginationParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

// ─── User ─────────────────────────────────────────────────────────────────────

export type UserRole = 'owner' | 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Tenant ───────────────────────────────────────────────────────────────────

export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan?: PlanType;
  ownerId: string;
  membersCount: number;
  createdAt: string;
  updatedAt: string;
}


// ─── Billing / Subscription ───────────────────────────────────────────────────

export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'trialing'
  | 'incomplete';

export interface Subscription {
  id: string;
  organizationId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}

export interface PlanFeatures {
  maxUsers: number;
  maxOrganizations: number;
  analytics: boolean;
  apiAccess: boolean;
  customDomain: boolean;
  prioritySupport: boolean;
  sso: boolean;
  auditLogs: boolean;
}

export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  free: {
    maxUsers: 3,
    maxOrganizations: 1,
    analytics: false,
    apiAccess: false,
    customDomain: false,
    prioritySupport: false,
    sso: false,
    auditLogs: false,
  },
  starter: {
    maxUsers: 10,
    maxOrganizations: 1,
    analytics: true,
    apiAccess: true,
    customDomain: false,
    prioritySupport: false,
    sso: false,
    auditLogs: false,
  },
  pro: {
    maxUsers: 50,
    maxOrganizations: 3,
    analytics: true,
    apiAccess: true,
    customDomain: true,
    prioritySupport: true,
    sso: false,
    auditLogs: true,
  },
  enterprise: {
    maxUsers: Infinity,
    maxOrganizations: Infinity,
    analytics: true,
    apiAccess: true,
    customDomain: true,
    prioritySupport: true,
    sso: true,
    auditLogs: true,
  },
};
