import React, { useState, useEffect, useMemo } from 'react';
import NavCollapse from './nav-collapse';
import SimpleBar from 'simplebar-react';
import { Link } from 'react-router';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from 'src/components/ui/sidebar';
import { NavUser } from './NavUser';
import { Badge } from 'src/components/ui/badge';
import { getSirsSidebarItems } from './sidebaritems';

const SidebarLayout = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const [role, setRole] = useState<string>('admin');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('user_role') || 'admin';
      setRole(savedRole);
    }
  }, []);

  const menuItems = useMemo(() => getSirsSidebarItems(role), [role]);

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="border-r border-sidebar-border"
      side="left"
    >
      <SidebarHeader className="h-16 px-4 group-data-[state=collapsed]:px-2.5 flex flex-row items-center justify-between border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="size-15 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20 p-1">
            <img src="/logo-dlh.png" alt="Logo DLH" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col group-data-[state=collapsed]:hidden overflow-hidden text-left">
            <span className="text-sm font-bold tracking-tight text-foreground truncate leading-none">
              E-Marisa
            </span>
            <span className="text-[11px] font-medium text-muted-foreground truncate mt-1">
              DLH Lumajang
            </span>
          </div>
        </Link>
        <Badge className="group-data-[state=collapsed]:hidden text-[10px] uppercase font-semibold" variant="outline">
          SIRS V.1.0
        </Badge>
      </SidebarHeader>

      <SidebarContent>
        <SimpleBar style={{ height: '100%' }}>
          <SidebarGroup className="flex items-center justify-center group-data-[state=collapsed]:px-2 px-3 py-3">
            <div className="px-0 group-data-[state=collapsed]:px-0 w-full flex flex-col gap-4">
              <NavCollapse menu={menuItems} className="text-sm" />
            </div>
          </SidebarGroup>
        </SimpleBar>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border/60">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarLayout;
