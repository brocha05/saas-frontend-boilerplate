'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useSubscription } from '@/modules/billing/hooks/useSubscription';
import type { PlanFeatures } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface FeatureGateProps {
  feature: keyof PlanFeatures;
  /** Required count (for numeric features like maxUsers) */
  requiredCount?: number;
  /** Replace children with a locked overlay (default: true) */
  overlay?: boolean;
  /** Custom message shown when feature is locked */
  message?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Conditionally renders children based on the active subscription plan.
 *
 * Usage:
 * ```tsx
 * <FeatureGate feature="analytics">
 *   <AnalyticsPanel />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({
  feature,
  requiredCount,
  overlay = true,
  message,
  children,
  className,
}: FeatureGateProps) {
  const { canUse } = useSubscription();

  const allowed = canUse(feature, requiredCount);

  if (allowed) return <>{children}</>;

  if (!overlay) return null;

  return (
    <div className={cn('relative', className)}>
      {/* Blurred children */}
      <div className="pointer-events-none select-none blur-sm opacity-50">{children}</div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-md bg-background/80 backdrop-blur-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            {message ?? 'This feature requires a higher plan'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Upgrade your plan to unlock this feature
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/dashboard/upgrade">Upgrade plan</Link>
        </Button>
      </div>
    </div>
  );
}
