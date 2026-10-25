import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  MapPin,
  Banknote,
  Settings,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';

export interface ChildItem {
  id?: number | string;
  name: string;
  icon?: LucideIcon;
  items?: ChildItem[];
  item?: unknown;
  url?: string;
  color?: string;
  disabled?: boolean;
  subtitle?: string;
  badge?: boolean;
  badgeType?: string;
  badgeContent?: string;
  isActive?: boolean;
  external?: boolean;
  isPro?: boolean;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: LucideIcon;
  id?: number | string;
  to?: string;
  item?: MenuItem[];
  items?: ChildItem[];
  url?: string;
  disabled?: boolean;
  subtitle?: string;
  badgeType?: string;
  badge?: boolean;
  badgeContent?: string;
  isActive?: boolean;
  isPro?: boolean;
}

/**
 * Generates dynamic SIRS sidebar menu items tailored to user role.
 * Role matrix:
 * - isKetua: role === 'ketua'
 * - isAdmin: role === 'admin' || isKetua
 * - Petugas: only core customer and fee collection menus
 */
export function getSirsSidebarItems(role: string = 'admin'): MenuItem[] {
  const r = (role || '').toLowerCase().trim();
  const isKetua = r === 'ketua';
  const isAdmin = r === 'admin' || isKetua;

  const menu: MenuItem[] = [];

  // 1. Group: Utama
  const utamaItems: ChildItem[] = [];
  if (isAdmin) {
    utamaItems.push({
      id: 'nav-dashboard',
      name: 'Dashboard Statistik',
      icon: LayoutDashboard,
      url: '/dashboard',
    });
  }
  utamaItems.push({
    id: 'nav-pelanggan',
    name: 'Data Pelanggan',
    icon: Users,
    url: '/dashboard/pelanggan',
  });

  menu.push({
    heading: 'Utama',
    items: utamaItems,
  });

  // 2. Group: Manajemen Retribusi (all roles)
  menu.push({
    heading: 'Manajemen Retribusi',
    items: [
      {
        id: 'nav-tagihan',
        name: 'Riwayat & Loket',
        icon: CreditCard,
        url: '/dashboard/tagihan',
      },
      {
        id: 'nav-invoice',
        name: 'Bukti Tanda Terima (Invoice)',
        icon: Receipt,
        url: '/dashboard/invoice',
      },
    ],
  });

  // 3. Group: Pengaturan (isAdmin only)
  if (isAdmin) {
    const pengaturanItems: ChildItem[] = [
      {
        id: 'nav-wilayah',
        name: 'Kode Wilayah',
        icon: MapPin,
        url: '/dashboard/pengaturan/wilayah',
      },
    ];

    if (isKetua) {
      pengaturanItems.push({
        id: 'nav-tarif',
        name: 'Tarif Retribusi',
        icon: Banknote,
        url: '/dashboard/tarif',
      });
    }

    pengaturanItems.push({
      id: 'nav-aplikasi',
      name: 'Aplikasi & Sistem',
      icon: Settings,
      url: '/dashboard/pengaturan/aplikasi',
    });

    menu.push({
      heading: 'Pengaturan',
      items: pengaturanItems,
    });
  }

  // 4. Group: Sistem (isKetua only)
  if (isKetua) {
    menu.push({
      heading: 'Sistem',
      items: [
        {
          id: 'nav-user',
          name: 'Manajemen User',
          icon: ShieldAlert,
          url: '/dashboard/user',
        },
      ],
    });
  }

  return menu;
}

const SidebarContent: MenuItem[] = getSirsSidebarItems('ketua');
export default SidebarContent;
