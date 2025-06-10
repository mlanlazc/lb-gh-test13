import { useFetcher, useLoaderData } from '@remix-run/react';
import { useEffect } from 'react';
import { LoaderError } from '@/types/loader-error';
import { QueryData, executeQuery } from '@/db/execute-query';
import { OrganizationsTable, OrganizationData, organizationsCountQuery, organizationsQuery, OrganizationCountData } from './organizations/components/OrganizationsTable';
import { WithErrorHandling } from '@/components/hoc/error-handling-wrapper/error-handling-wrapper';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Home, Building2 } from 'lucide-react';
import { Link } from '@remix-run/react';

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
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <SidebarHeader>
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Home className="h-6 w-6" />
            <span>Home</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuButton asChild>
              <Link to="/organizations">
                <Building2 />
                <span>Organizations</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">Organizations Dashboard</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
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
      </SidebarInset>
    </SidebarProvider>
  );
}
