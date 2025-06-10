import { executeQuery } from '@/db/execute-query';
import { OrganizationCountData, OrganizationData, organizationsCountQuery, organizationsQuery } from '@/routes/organizations/components/OrganizationsTable';

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const page = parseInt(formData.get('page') as string) || 1;
    const limit = parseInt(formData.get('limit') as string) || 10;
    const offset = (page - 1) * limit;

    const organizationsCount = await executeQuery<OrganizationCountData>(organizationsCountQuery);
    if (organizationsCount.isError) {
      return Response.json(organizationsCount);
    }

    const organizations = await executeQuery<OrganizationData>(organizationsQuery, [limit.toString(), offset.toString()]);
    if (organizations.isError) {
      return Response.json(organizations);
    }

    return Response.json({
      data: {
        organizations: organizations.data,
        organizationsCount: organizationsCount.data[0].total,
      },
      isError: false,
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return Response.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}
