'use client';

import { Building2, ChevronsUpDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useTenantStore } from '@/store/tenantStore';
import { cn } from '@/lib/utils/cn';

export function OrgSelector() {
  const { currentTenant } = useTenantStore();

  return (
    <div className="flex items-center gap-2 px-2 text-sm font-medium">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <span className="truncate max-w-[140px]">{currentTenant?.name ?? 'No tenant'}</span>
    </div>
  );
}
