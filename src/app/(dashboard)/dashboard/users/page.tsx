'use client';

import { useState } from 'react';
import { UserPlus, MoreHorizontal, Mail } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { useUsers, useDeleteUser } from '@/modules/users/hooks/useUsers';
import { usePagination } from '@/lib/hooks/usePagination';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { DataTable } from '@/components/shared/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { Modal } from '@/components/shared/Modal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/types';
import { formatDate, formatInitials } from '@/lib/utils/formatters';

export default function UsersPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const pagination = usePagination();
  const debouncedSearch = useDebounce(pagination.search, 400);

  const { data, isLoading } = useUsers({
    page: pagination.page,
    limit: pagination.limit,
    search: debouncedSearch,
  });

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const columns: ColumnDef<User>[] = [
    {
      id: 'user',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xs">
                {formatInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{`${user.firstName} ${user.lastName}`}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }) => {
        const role = getValue<string>();
        return (
          <Badge variant={role === 'owner' ? 'default' : 'secondary'} className="capitalize">
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ getValue }) => (
        <Badge variant={getValue<boolean>() ? 'success' : 'secondary'}>
          {getValue<boolean>() ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{formatDate(getValue<string>())}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Mail className="h-4 w-4" />
              Resend invite
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteId(row.original.id)}
            >
              Remove user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage team members and their permissions.">
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Invite user
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        totalPages={data?.totalPages}
        currentPage={pagination.page}
        onPageChange={pagination.setPage}
        searchValue={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder="Search users..."
      />

      {/* Invite modal */}
      <Modal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        title="Invite user"
        description="Send an invitation to a new team member."
      >
        <p className="text-sm text-muted-foreground py-4">
          Invite form component — wire to useCreateUser() hook.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setInviteOpen(false)}>
            Cancel
          </Button>
          <Button>Send invite</Button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Remove user"
        description="This user will lose access to the organization. This action cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={() => {
          if (deleteId) {
            deleteUser(deleteId, { onSuccess: () => setDeleteId(null) });
          }
        }}
      />
    </div>
  );
}
