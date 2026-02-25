'use client';

import { ExternalLink, Download, Loader2 } from 'lucide-react';
import {
  useSubscription,
  useBillingPortal,
  useInvoices,
  useCancelSubscription,
} from '@/modules/billing/hooks/useSubscription';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useState } from 'react';
import { formatDate, formatCurrency, formatPlanLabel } from '@/lib/utils/formatters';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  active: 'success',
  trialing: 'success',
  past_due: 'warning',
  canceled: 'destructive',
  incomplete: 'secondary',
};

export default function BillingPage() {
  const [cancelOpen, setCancelOpen] = useState(false);
  const { data: subscription, isLoading: subLoading, plan } = useSubscription();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const { mutate: openPortal, isPending: portalPending } = useBillingPortal();
  const { mutate: cancelSub, isPending: cancelPending } = useCancelSubscription();

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Billing"
        description="Manage your subscription, payment method, and invoices."
      />

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>Your subscription details and usage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-semibold text-lg">{formatPlanLabel(plan)} Plan</p>
                    {subscription && (
                      <p className="text-sm text-muted-foreground">
                        Renews on {formatDate(subscription.currentPeriodEnd)}
                      </p>
                    )}
                  </div>
                  {subscription && (
                    <Badge variant={STATUS_VARIANT[subscription.status] ?? 'secondary'}>
                      {subscription.status}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  {plan !== 'enterprise' && (
                    <Button variant="outline" size="sm" asChild>
                      <a href="/dashboard/upgrade">Upgrade</a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openPortal()}
                    disabled={portalPending || plan === 'free'}
                  >
                    {portalPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <ExternalLink className="h-4 w-4" />
                    Manage billing
                  </Button>
                </div>
              </div>

              {subscription && !subscription.cancelAtPeriodEnd && plan !== 'free' && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Want to cancel? Your access will remain until the end of the billing period.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setCancelOpen(true)}
                    >
                      Cancel plan
                    </Button>
                  </div>
                </>
              )}

              {subscription?.cancelAtPeriodEnd && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Your subscription will be canceled on{' '}
                    <strong>{formatDate(subscription.currentPeriodEnd)}</strong>.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Download past invoices for your records.</CardDescription>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !invoices?.length ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No invoices yet.
            </p>
          ) : (
            <div className="divide-y">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">Invoice #{invoice.number}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(invoice.date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </span>
                    <Badge
                      variant={invoice.status === 'paid' ? 'success' : 'warning'}
                    >
                      {invoice.status}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={invoice.pdfUrl} target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel subscription"
        description="Your subscription will be canceled at the end of the current billing period. You will retain access until then."
        confirmLabel="Cancel subscription"
        variant="destructive"
        isLoading={cancelPending}
        onConfirm={() => cancelSub(undefined, { onSuccess: () => setCancelOpen(false) })}
      />
    </div>
  );
}
