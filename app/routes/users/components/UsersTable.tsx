import { UniversalTableCard } from '@/components/building-blocks/universal-table-card/universal-table-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

export const usersQuery = `
  SELECT
    u.user_id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    u.role,
    u.created_at,
    u.last_login_at,
    u.is_active,
    o.organization_name
  FROM users u
  JOIN organizations o ON u.organization_id = o.organization_id
  ORDER BY u.created_at DESC
  LIMIT $1
  OFFSET $2
`;

export const usersCountQuery = `
  SELECT COUNT(*) as total
  FROM users
`;

export interface UserData {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  last_login_at: string | null;
  is_active: boolean;
  organization_name: string;
}

export interface UserCountData {
  total: number;
}

const ITEMS_PER_PAGE = 10;

interface UsersTableProps {
  users: UserData[];
  usersCount: number;
  isLoading: boolean;
  onFiltersChange?: (filters: { page: number; limit: number }) => void;
}

export function UsersTable({ users, usersCount, isLoading, onFiltersChange }: UsersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onFiltersChange?.({ page, limit: ITEMS_PER_PAGE });
  };

  const totalPages = usersCount > 0 ? Math.ceil(usersCount / ITEMS_PER_PAGE) : 0;

  const PaginationControls = (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );

  return (
    <UniversalTableCard
      title="Users"
      description="List of all registered users and their details"
      CardFooterComponent={PaginationControls}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Last Login</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user: UserData) => (
              <TableRow key={user.user_id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.first_name} {user.last_name}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.organization_name}</TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? 'default' : 'destructive'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                <TableCell>{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : '-'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </UniversalTableCard>
  );
}
