'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Building2 } from 'lucide-react';
import { useCurrentTenant, useUpdateTenant } from '@/modules/organization/hooks/useOrganization';
import { useTenantStore } from '@/store/tenantStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatPlanLabel } from '@/lib/utils/formatters';

const tenantSchema = z.object({
  name: z.string().min(2, 'Tenant name must be at least 2 characters'),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

export default function OrganizationPage() {
  const { currentTenant } = useTenantStore();
  const { isLoading } = useCurrentTenant();
  const { mutate: updateTenant, isPending } = useUpdateTenant();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    values: { name: currentTenant?.name ?? '' },
  });

  const onSubmit = (data: TenantFormValues) => {
    if (!currentTenant) return;
    updateTenant({ id: currentTenant.id, data });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Organization"
        description="Manage your organization settings and preferences."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>General</CardTitle>
              <CardDescription>Update your organization details.</CardDescription>
            </div>
            {currentTenant?.plan && (
              <Badge variant={currentTenant.plan === 'free' ? 'secondary' : 'default'}>
                {formatPlanLabel(currentTenant.plan)} plan
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization name</Label>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="name"
                    placeholder="Acme Inc."
                    className={errors.name ? 'border-destructive' : ''}
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Organization slug</Label>
                <Input value={currentTenant?.slug ?? ''} disabled className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground">
                  The slug is auto-generated and cannot be changed.
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isPending || !isDirty}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save changes
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete organization</p>
              <p className="text-xs text-muted-foreground mt-1">
                Permanently delete this organization and all associated data.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
