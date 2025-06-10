import { Outlet, Link } from '@remix-run/react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Home, Building2, Users } from 'lucide-react';

export function Layout() {
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
            <SidebarMenuButton asChild>
              <Link to="/users">
                <Users />
                <span>Users</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
          <SidebarTrigger />
          {/* The page title will be rendered by the specific route component */}
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
