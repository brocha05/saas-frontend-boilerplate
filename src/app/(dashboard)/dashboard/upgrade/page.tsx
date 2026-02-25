'use client';

import { Check, Loader2 } from 'lucide-react';
import { useCheckout } from '@/modules/billing/hooks/useSubscription';
import { useOrgStore } from '@/store/orgStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import type { PlanType } from '@/types';

// Map plan → Stripe price ID (replace with real values from env)
const PRICE_IDS: Record<string, string> = {
  starter_monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER ?? 'price_starter',
  pro_monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? 'price_pro',
  enterprise_monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE ?? 'price_enterprise',
};

const plans = [
  {
    name: 'Starter',
    plan: 'starter' as PlanType,
    price: 29,
    priceId: PRICE_IDS.starter_monthly,
    features: ['Up to 10 users', 'Analytics', 'API access', 'Email support'],
    highlighted: false,
  },
  {
    name: 'Pro',
    plan: 'pro' as PlanType,
    price: 79,
    priceId: PRICE_IDS.pro_monthly,
    features: [
      'Up to 50 users',
      '3 organizations',
      'Advanced analytics',
      'Custom domain',
      'Audit logs',
      'Priority support',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    plan: 'enterprise' as PlanType,
    price: null,
    priceId: PRICE_IDS.enterprise_monthly,
    features: ['Unlimited everything', 'SSO / SAML', 'Dedicated support', 'SLA guarantee'],
    highlighted: false,
  },
];

export default function UpgradePage() {
  const { currentOrg } = useOrgStore();
  const { mutate: checkout, isPending } = useCheckout();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Upgrade your plan"
        description="Unlock more features to accelerate your team's growth."
      />

      <div className="grid gap-6 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentOrg?.plan === plan.plan;
          return (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col rounded-2xl border p-6',
                plan.highlighted && 'border-primary shadow-lg shadow-primary/10 bg-primary/5',
                isCurrent && 'opacity-60 pointer-events-none'
              )}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most popular
                </Badge>
              )}
              {isCurrent && (
                <Badge variant="secondary" className="absolute -top-3 right-4">
                  Current
                </Badge>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-2">
                  {plan.price === null ? (
                    <span className="text-3xl font-bold">Custom</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/mo</span>
                    </>
                  )}
                </div>
              </div>

              <ul className="flex-1 space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.highlighted ? 'default' : 'outline'}
                disabled={isPending || isCurrent}
                onClick={() =>
                  checkout({
                    priceId: plan.priceId,
                    successUrl: `${window.location.origin}/dashboard/billing?success=1`,
                    cancelUrl: `${window.location.origin}/dashboard/upgrade`,
                  })
                }
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {plan.price === null ? 'Contact sales' : 'Upgrade now'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
