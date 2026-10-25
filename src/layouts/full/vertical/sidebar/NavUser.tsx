import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { ChevronsUpDown, LogOut, Globe, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function NavUser() {
  const navigate = useNavigate();
  const { isMobile } = useSidebar();
  const [username, setUsername] = useState('Admin');
  const [role, setRole] = useState('admin');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUsername(localStorage.getItem('username') || 'Admin');
      setRole((localStorage.getItem('user_role') || 'admin').toLowerCase());
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    localStorage.removeItem('user_name');
    navigate('/login');
  };

  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'ketua':
        return 'Ketua / Kadis';
      case 'admin':
        return 'Administrator';
      case 'petugas':
        return 'Petugas Loket';
      default:
        return r.toUpperCase();
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase border border-primary/20">
              {username.slice(0, 2)}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-foreground">{username}</span>
              <span className="truncate text-xs text-muted-foreground">{getRoleLabel(role)}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase border border-primary/20">
                  {username.slice(0, 2)}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{username}</span>
                  <span className="truncate text-xs text-muted-foreground">{getRoleLabel(role)}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={<Link to="/" />}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Globe className="size-4" />
                <span>Portal Publik DLH</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link to="/dashboard" />}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Shield className="size-4" />
                <span>Dashboard Internal</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="size-4 mr-2" />
              <span>Keluar Sistem</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
