import { useFetcher, useLoaderData } from '@remix-run/react';
import { useEffect } from 'react';
import { LoaderError } from '@/types/loader-error';
import { QueryData, executeQuery } from '@/db/execute-query';
import { UsersTable, UserData, usersCountQuery, usersQuery, UserCountData } from './users/components/UsersTable';
import { WithErrorHandling } from '@/components/hoc/error-handling-wrapper/error-handling-wrapper';

const ITEMS_PER_PAGE = 10;

type CombinedUsersData = {
  users: UserData[];
  usersCount: number;
};

export async function loader(): Promise<QueryData<CombinedUsersData> | LoaderError> {
  try {
    const [usersResult, usersCountResult] = await Promise.all([
      executeQuery<UserData>(usersQuery, [ITEMS_PER_PAGE.toString(), '0']),
      executeQuery<UserCountData>(usersCountQuery),
    ]);

    if (usersResult.isError) {
      return usersResult as QueryData<any>;
    }
    if (usersCountResult.isError) {
      return usersCountResult as QueryData<any>;
    }

    return {
      data: {
        users: usersResult.data,
        usersCount: usersCountResult.data[0]?.total || 0,
      },
      isError: false,
    };
  } catch (error) {
    console.error('Error in users loader:', error);
    return { isError: true, errorMessage: error instanceof Error ? error.message : 'Failed to load users data' };
  }
}

export default function UsersPage() {
  const initialLoaderData = useLoaderData<typeof loader>();
  const usersFetcher = useFetcher<QueryData<CombinedUsersData>>();

  useEffect(() => {
    if (usersFetcher.state === 'idle' && !usersFetcher.data) {
      usersFetcher.submit({ page: 1, limit: ITEMS_PER_PAGE }, { method: 'post', action: '/resources/users' });
    }
  }, [usersFetcher]);

  const handleUsersTableFiltersChange = (filters: { page: number; limit: number }): void => {
    usersFetcher.submit(
      {
        page: filters.page,
        limit: filters.limit,
      },
      { method: 'post', action: '/resources/users' },
    );
  };

  const queryDataToRender = usersFetcher.data || initialLoaderData;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <h1 className="text-xl font-semibold">Users Dashboard</h1>
      <WithErrorHandling
        queryData={queryDataToRender}
        render={(data) => (
          <UsersTable
            users={data.users}
            usersCount={data.usersCount}
            isLoading={usersFetcher.state === 'submitting'}
            onFiltersChange={handleUsersTableFiltersChange}
          />
        )}
      />
    </main>
  );
}
