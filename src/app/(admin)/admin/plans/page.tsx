'use client';

import { useState } from 'react';
import { Plus, Pencil, Package, CheckCircle2, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAdminPlans,
  useCreatePlan,
  useUpdatePlan,
  useTogglePlan,
} from '@/modules/admin/hooks/useAdmin';
import type { Plan } from '@/types';

const planSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens'),
  stripePriceId: z.string().min(1, 'Stripe Price ID is required'),
  stripeProductId: z.string().min(1, 'Stripe Product ID is required'),
  interval: z.enum(['MONTH', 'YEAR']),
  price: z.coerce.number().int().positive('Must be greater than 0'),
  currency: z.string().min(3).max(3),
  features: z.string(),
});

type PlanFormValues = z.infer<typeof planSchema>;

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function PlanFormFields({ form }: { form: ReturnType<typeof useForm<PlanFormValues>> }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Name *</Label>
          <Input placeholder="Pro" {...form.register('name')} />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Slug *</Label>
          <Input placeholder="pro" {...form.register('slug')} />
          {form.formState.errors.slug && (
            <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Stripe Price ID *</Label>
        <Input placeholder="price_1ABC..." {...form.register('stripePriceId')} />
        {form.formState.errors.stripePriceId && (
          <p className="text-xs text-destructive">{form.formState.errors.stripePriceId.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Stripe Product ID *</Label>
        <Input placeholder="prod_1ABC..." {...form.register('stripeProductId')} />
        {form.formState.errors.stripeProductId && (
          <p className="text-xs text-destructive">
            {form.formState.errors.stripeProductId.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5 col-span-1">
          <Label>Price (cents) *</Label>
          <Input type="number" placeholder="4900" {...form.register('price')} />
          {form.formState.errors.price && (
            <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
          )}
        </div>
        <div className="space-y-1.5 col-span-1">
          <Label>Currency</Label>
          <Input placeholder="usd" maxLength={3} {...form.register('currency')} />
        </div>
        <div className="space-y-1.5 col-span-1">
          <Label>Interval *</Label>
          <Select
            defaultValue={form.getValues('interval')}
            onValueChange={(v) => form.setValue('interval', v as 'MONTH' | 'YEAR')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTH">Monthly</SelectItem>
              <SelectItem value="YEAR">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Features (one per line)</Label>
        <textarea
          className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Unlimited users&#10;5 GB storage&#10;Priority support"
          {...form.register('features')}
        />
        <p className="text-xs text-muted-foreground">Each line will be saved as a plan feature.</p>
      </div>
    </div>
  );
}

export default function AdminPlansPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);

  const { data: plans, isLoading } = useAdminPlans();
  const { mutate: createPlan, isPending: creating } = useCreatePlan();
  const { mutate: updatePlan, isPending: updating } = useUpdatePlan();
  const { mutate: togglePlan } = useTogglePlan();

  const createForm = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: { interval: 'MONTH', currency: 'usd', features: '' },
  });

  const editForm = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
  });

  const handleCreate = (values: PlanFormValues) => {
    createPlan(
      {
        name: values.name,
        slug: values.slug,
        stripePriceId: values.stripePriceId,
        stripeProductId: values.stripeProductId,
        interval: values.interval,
        price: values.price,
        currency: values.currency,
        features: values.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          createForm.reset({ interval: 'MONTH', currency: 'usd', features: '' });
        },
      }
    );
  };

  const handleEdit = (values: PlanFormValues) => {
    if (!editPlan) return;
    updatePlan(
      {
        id: editPlan.id,
        data: {
          name: values.name,
          slug: values.slug,
          stripePriceId: values.stripePriceId,
          stripeProductId: values.stripeProductId,
          interval: values.interval,
          price: values.price,
          currency: values.currency,
          features: values.features
            .split('\n')
            .map((f) => f.trim())
            .filter(Boolean),
        },
      },
      { onSuccess: () => setEditPlan(null) }
    );
  };

  const openEdit = (plan: Plan) => {
    setEditPlan(plan);
    editForm.reset({
      name: plan.name,
      slug: plan.slug,
      stripePriceId: plan.stripePriceId,
      stripeProductId: plan.stripeProductId,
      interval: plan.interval,
      price: plan.price,
      currency: plan.currency,
      features: (plan.features as string[]).join('\n'),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Plans"
        description="Manage the pricing plans available to your customers."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New plan
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="hidden border-b bg-muted/30 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid md:grid-cols-[1fr_120px_100px_80px_120px_80px]">
          <span>Plan</span>
          <span>Price</span>
          <span>Interval</span>
          <span>Currency</span>
          <span>Stripe Price ID</span>
          <span>Status</span>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : !plans?.length ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Package className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm font-medium text-muted-foreground">No plans created yet.</p>
              <Button size="sm" onClick={() => setCreateOpen(true)} className="mt-2">
                <Plus className="mr-2 h-3.5 w-3.5" />
                Create first plan
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30 md:grid md:grid-cols-[1fr_120px_100px_80px_120px_80px] md:items-center"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.slug}</p>
                    </div>
                  </div>

                  <p className="text-sm font-medium">{formatPrice(plan.price, plan.currency)}</p>

                  <p className="text-sm text-muted-foreground">
                    {plan.interval === 'MONTH' ? 'Monthly' : 'Yearly'}
                  </p>

                  <p className="text-xs uppercase text-muted-foreground">{plan.currency}</p>

                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {plan.stripePriceId}
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <Switch
                      checked={plan.isActive}
                      onCheckedChange={(checked) => togglePlan({ id: plan.id, active: checked })}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openEdit(plan)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features preview per plan */}
      {plans && plans.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={plan.isActive ? '' : 'opacity-50'}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(plan.price, plan.currency)}/
                      {plan.interval === 'MONTH' ? 'mo' : 'yr'}
                    </p>
                  </div>
                  <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <ul className="space-y-1.5">
                  {(plan.features as string[]).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {!(plan.features as string[]).length && (
                    <li className="flex items-center gap-2 text-xs text-muted-foreground">
                      <XCircle className="h-3.5 w-3.5" />
                      No features defined
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o);
          if (!o) createForm.reset({ interval: 'MONTH', currency: 'usd', features: '' });
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create new plan</DialogTitle>
          </DialogHeader>
          <PlanFormFields form={createForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createForm.handleSubmit(handleCreate)} disabled={creating}>
              {creating ? 'Creating...' : 'Create plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editPlan} onOpenChange={(o) => !o && setEditPlan(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit plan — {editPlan?.name}</DialogTitle>
          </DialogHeader>
          <PlanFormFields form={editForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlan(null)}>
              Cancel
            </Button>
            <Button onClick={editForm.handleSubmit(handleEdit)} disabled={updating}>
              {updating ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
