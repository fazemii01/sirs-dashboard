import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import { DashboardSkeleton, TableSkeleton } from '@/components/shared/PageSkeleton';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// Error 404
const Error = Loadable(lazy(() => import('../views/auth/error')));

// Public pages
const LandingPage = Loadable(lazy(() => import('../views/public/LandingPage')));
const CekTagihanPage = Loadable(lazy(() => import('../views/public/CekTagihanPage')));

// Authentication
const SirsLogin = Loadable(lazy(() => import('../views/auth/SirsLogin')));

// SIRS Core Business Operations (menggunakan Skeleton transisi halus)
const SirsDashboardOverview = Loadable(
  lazy(() => import('../views/sirs/dashboard/DashboardOverview')),
  <DashboardSkeleton />
);
const SirsPelanggan = Loadable(
  lazy(() => import('../views/sirs/pelanggan/PelangganPage')),
  <TableSkeleton />
);
const SirsTagihan = Loadable(
  lazy(() => import('../views/sirs/tagihan/TagihanPage')),
  <TableSkeleton />
);
const SirsInvoice = Loadable(
  lazy(() => import('../views/sirs/invoice/InvoicePage')),
  <TableSkeleton />
);

// SIRS Settings & Administration (menggunakan Skeleton transisi halus)
const SirsWilayah = Loadable(
  lazy(() => import('../views/sirs/wilayah/WilayahPage')),
  <TableSkeleton />
);
const SirsTarif = Loadable(
  lazy(() => import('../views/sirs/tarif/TarifPage')),
  <TableSkeleton />
);
const SirsPengaturanAplikasi = Loadable(
  lazy(() => import('../views/sirs/pengaturan/PengaturanAplikasiPage')),
  <TableSkeleton />
);
const SirsUser = Loadable(
  lazy(() => import('../views/sirs/user/UserPage')),
  <TableSkeleton />
);

const Router = [
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/tagihan', element: <CekTagihanPage /> },
      { path: '/login', element: <SirsLogin /> },
      { path: '/auth/login', element: <SirsLogin /> },
      { path: '404', element: <Error /> },
      { path: '/auth/404', element: <Error /> },
    ],
  },
  {
    path: '/',
    element: <FullLayout />,
    children: [
      // SIRS Core Business Operations Routes
      { path: '/dashboard', element: <SirsDashboardOverview /> },
      { path: '/dashboard/pelanggan', element: <SirsPelanggan /> },
      { path: '/dashboard/tagihan', element: <SirsTagihan /> },
      { path: '/dashboard/invoice', element: <SirsInvoice /> },

      // SIRS Master & Administration Routes
      { path: '/dashboard/pengaturan/wilayah', element: <SirsWilayah /> },
      { path: '/dashboard/wilayah', element: <Navigate to="/dashboard/pengaturan/wilayah" replace /> },
      { path: '/dashboard/tarif', element: <SirsTarif /> },
      { path: '/dashboard/pengaturan/aplikasi', element: <SirsPengaturanAplikasi /> },
      { path: '/dashboard/pengaturan', element: <SirsPengaturanAplikasi /> },
      { path: '/dashboard/pengaturan/jadwal', element: <SirsPengaturanAplikasi /> },
      { path: '/dashboard/user', element: <SirsUser /> },

      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

const router = createBrowserRouter(Router);

export default router;
