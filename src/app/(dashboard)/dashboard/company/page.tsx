'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Building2 } from 'lucide-react';
import { useCurrentCompany, useUpdateCompany } from '@/modules/company/hooks/useCompany';
import { useCompanyStore } from '@/store/companyStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatPlanLabel } from '@/lib/utils/formatters';

const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export default function CompanyPage() {
  const { currentCompany } = useCompanyStore();
  const { isLoading } = useCurrentCompany();
  const { mutate: updateCompany, isPending } = useUpdateCompany();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    values: { name: currentCompany?.name ?? '' },
  });

  const onSubmit = (data: CompanyFormValues) => {
    updateCompany(data);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Company"
        description="Manage your company settings and preferences."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>General</CardTitle>
              <CardDescription>Update your company details.</CardDescription>
            </div>
            {currentCompany?.plan && (
              <Badge variant={currentCompany.plan === 'free' ? 'secondary' : 'default'}>
                {formatPlanLabel(currentCompany.plan)} plan
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
                <Label htmlFor="name">Company name</Label>
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
                <Label>Company slug</Label>
                <Input value={currentCompany?.slug ?? ''} disabled className="font-mono text-sm" />
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
              <p className="text-sm font-medium">Delete company</p>
              <p className="text-xs text-muted-foreground mt-1">
                Permanently delete this company and all associated data.
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
