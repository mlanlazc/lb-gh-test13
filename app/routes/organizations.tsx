import { useFetcher, useLoaderData } from '@remix-run/react';
import { useEffect } from 'react';
import { LoaderError } from '@/types/loader-error';
import { QueryData, executeQuery } from '@/db/execute-query';
import { OrganizationsTable, OrganizationData, organizationsCountQuery, organizationsQuery, OrganizationCountData } from './organizations/components/OrganizationsTable';
import { WithErrorHandling } from '@/components/hoc/error-handling-wrapper/error-handling-wrapper';

const ITEMS_PER_PAGE = 10;

type CombinedOrganizationsData = {
  organizations: OrganizationData[];
  organizationsCount: number;
};

export async function loader(): Promise<QueryData<CombinedOrganizationsData> | LoaderError> {
  try {
    const [organizationsResult, organizationsCountResult] = await Promise.all([
      executeQuery<OrganizationData>(organizationsQuery, [ITEMS_PER_PAGE.toString(), '0']),
      executeQuery<OrganizationCountData>(organizationsCountQuery),
    ]);

    if (organizationsResult.isError) {
      return organizationsResult as QueryData<any>;
    }
    if (organizationsCountResult.isError) {
      return organizationsCountResult as QueryData<any>;
    }

    return {
      data: {
        organizations: organizationsResult.data,
        organizationsCount: organizationsCountResult.data[0]?.total || 0,
      },
      isError: false,
    };
  } catch (error) {
    console.error('Error in organizations loader:', error);
    return { isError: true, errorMessage: error instanceof Error ? error.message : 'Failed to load organizations data' };
  }
}

export default function OrganizationsPage() {
  const initialLoaderData = useLoaderData<typeof loader>();
  const organizationsFetcher = useFetcher<QueryData<CombinedOrganizationsData>>();

  useEffect(() => {
    if (organizationsFetcher.state === 'idle' && !organizationsFetcher.data) {
      organizationsFetcher.submit({ page: 1, limit: ITEMS_PER_PAGE }, { method: 'post', action: '/resources/organizations' });
    }
  }, [organizationsFetcher]);

  const handleOrganizationsTableFiltersChange = (filters: { page: number; limit: number }): void => {
    organizationsFetcher.submit(
      {
        page: filters.page,
        limit: filters.limit,
      },
      { method: 'post', action: '/resources/organizations' },
    );
  };

  const queryDataToRender = organizationsFetcher.data || initialLoaderData;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <h1 className="text-xl font-semibold">Organizations Dashboard</h1>
      <WithErrorHandling
        queryData={queryDataToRender}
        render={(data) => (
          <OrganizationsTable
            organizations={data.organizations}
            organizationsCount={data.organizationsCount}
            isLoading={organizationsFetcher.state === 'submitting'}
            onFiltersChange={handleOrganizationsTableFiltersChange}
          />
        )}
      />
    </main>
  );
}
