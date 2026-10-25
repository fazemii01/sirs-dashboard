import { FC, Suspense } from 'react';
import Sidebar from './vertical/sidebar/Sidebar';
import Header from './vertical/header/Header';
import { SidebarInset, SidebarProvider } from 'src/components/ui/sidebar';
import Footer from './shared/footer/Footer';
import { Outlet, Navigate, useLocation } from 'react-router';
import { TableSkeleton } from '@/components/shared/PageSkeleton';
import { getAuthSession } from '@/lib/auth';

const FullLayout: FC = () => {
  const session = getAuthSession();
  const location = useLocation();

  // Auth guard: redirect to /login if session is not authenticated or expired
  if (!session.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <SidebarProvider
      defaultOpen={true}
      style={{ "--sidebar-width-icon": "52px" } as React.CSSProperties}
    >
      <div className="print:hidden">
        <Sidebar />
      </div>

      <SidebarInset className="min-w-0 overflow-x-hidden print:m-0 print:p-0 print:bg-white">
        {/* Top Header */}
        <div className="print:hidden">
          <Header />
        </div>

        {/* Body Content */}
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 print:p-0 print:m-0">
          <div className="w-full min-h-[calc(100vh-140px)] print:min-h-0 print:p-0">
            <Suspense fallback={<TableSkeleton />}>
              <Outlet />
            </Suspense>
          </div>
          <div className="pt-6 print:hidden">
            <Footer />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default FullLayout;
