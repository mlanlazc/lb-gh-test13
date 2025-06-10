import { executeQuery } from '@/db/execute-query';
import { UserCountData, UserData, usersCountQuery, usersQuery } from '@/routes/users/components/UsersTable';

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const page = parseInt(formData.get('page') as string) || 1;
    const limit = parseInt(formData.get('limit') as string) || 10;
    const offset = (page - 1) * limit;

    const usersCount = await executeQuery<UserCountData>(usersCountQuery);
    if (usersCount.isError) {
      return Response.json(usersCount);
    }

    const users = await executeQuery<UserData>(usersQuery, [limit.toString(), offset.toString()]);
    if (users.isError) {
      return Response.json(users);
    }

    return Response.json({
      data: {
        users: users.data,
        usersCount: usersCount.data[0].total,
      },
      isError: false,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
