import { useSidebar } from "src/components/ui/sidebar";
import { Button } from "src/components/ui/button";
import { PanelLeft } from 'lucide-react';
import { Separator } from "src/components/ui/separator";
import { Link, useLocation } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import FullLogo from "../../shared/logo/FullLogo";
import Search from "./Search";
import Profile from "./Profile";
import LightDark from "./Light-Dark";
import Notifications from "./Notifications";

const getBreadcrumbInfo = (pathname: string) => {
  if (pathname === '/dashboard') return { parent: 'Utama', title: 'Dashboard Statistik' };
  if (pathname.startsWith('/dashboard/pelanggan')) return { parent: 'Utama', title: 'Data Pelanggan' };
  if (pathname.startsWith('/dashboard/tagihan')) return { parent: 'Manajemen Retribusi', title: 'Riwayat & Loket' };
  if (pathname.startsWith('/dashboard/invoice')) return { parent: 'Manajemen Retribusi', title: 'Bukti Tanda Terima (Invoice)' };
  if (pathname.startsWith('/dashboard/pengaturan/wilayah') || pathname.startsWith('/dashboard/wilayah')) return { parent: 'Pengaturan', title: 'Kode Wilayah' };
  if (pathname.startsWith('/dashboard/tarif')) return { parent: 'Pengaturan', title: 'Tarif Retribusi' };
  if (pathname.startsWith('/dashboard/pengaturan')) return { parent: 'Pengaturan', title: 'Aplikasi & Sistem' };
  if (pathname.startsWith('/dashboard/user')) return { parent: 'Sistem', title: 'Manajemen User' };
  return { parent: 'Dashboard', title: 'Overview' };
};

const Header = () => {
  const { toggleSidebar } = useSidebar();
  const location = useLocation();
  const breadcrumb = getBreadcrumbInfo(location.pathname);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-4 sm:px-6">
      <div className="flex flex-1 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
          onClick={toggleSidebar}
        >
          <PanelLeft className="h-4 w-4" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

        <div className="block lg:hidden">
          <FullLogo />
        </div>

        <Separator orientation="vertical" className="mr-2 h-4 hidden sm:block" />

        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/dashboard" />}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {breadcrumb.parent !== 'Utama' && (
              <>
                <BreadcrumbItem className="text-muted-foreground/70 hidden md:block">
                  {breadcrumb.parent}
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:block">
          <Search />
        </div>
        <LightDark />
        <Notifications className="hidden sm:block" />
        <Profile />
      </div>
    </header>
  );
};

export default Header;
