import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from 'src/components/ui/sheet';
import { Avatar, AvatarFallback } from 'src/components/ui/avatar';
import { Button } from 'src/components/ui/button';
import { Badge } from 'src/components/ui/badge';
import { cn } from 'src/lib/utils';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  MapPin,
  Banknote,
  ShieldAlert,
  LogOut,
  CircleDot,
  Building2,
} from 'lucide-react';

export default function ProfileSheet() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('Admin');
  const [role, setRole] = useState('admin');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('username') || 'Admin';
      const r = (localStorage.getItem('user_role') || 'admin').toLowerCase();
      const fn = localStorage.getItem('user_name') || '';
      setUsername(u);
      setRole(r);
      setFullName(fn);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    localStorage.removeItem('user_name');
    navigate('/login');
  };

  const isKetua = role === 'ketua';
  const isAdmin = role === 'admin' || isKetua;

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'ketua':
        return <Badge variant="default" className="text-xs font-semibold">Ketua / Kadis</Badge>;
      case 'admin':
        return <Badge variant="secondary" className="text-xs font-semibold">Administrator</Badge>;
      case 'petugas':
        return <Badge variant="outline" className="text-xs font-semibold border-primary/40 text-primary">Petugas Loket</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs font-semibold uppercase">{r}</Badge>;
    }
  };

  const getRoleDisplayName = (r: string) => {
    if (fullName) return fullName;
    switch (r) {
      case 'ketua':
        return 'Kepala Dinas DLH';
      case 'admin':
        return 'Administrator Sistem';
      case 'petugas':
        return 'Petugas Loket Retribusi';
      default:
        return 'Petugas DLH';
    }
  };

  const menuLinks = [
    ...(isAdmin
      ? [
          {
            title: 'Dashboard Statistik',
            href: '/dashboard',
            icon: LayoutDashboard,
            desc: 'Ringkasan performa & PAD retribusi',
          },
        ]
      : []),
    {
      title: 'Data Pelanggan',
      href: '/dashboard/pelanggan',
      icon: Users,
      desc: 'Master data wajib retribusi sampah',
    },
    {
      title: 'Riwayat & Loket Retribusi',
      href: '/dashboard/tagihan',
      icon: CreditCard,
      desc: 'Pencatatan & status bayar tagihan',
    },
    {
      title: 'Bukti Tanda Terima (Invoice)',
      href: '/dashboard/invoice',
      icon: Receipt,
      desc: 'Cetak kwitansi & invoice resmi',
    },
    ...(isAdmin
      ? [
          {
            title: 'Pengaturan Wilayah',
            href: '/dashboard/pengaturan/wilayah',
            icon: MapPin,
            desc: 'Zona, kecamatan & kelurahan',
          },
        ]
      : []),
    ...(isKetua
      ? [
          {
            title: 'Tarif Retribusi',
            href: '/dashboard/tarif',
            icon: Banknote,
            desc: 'Perbup & skema tarif retribusi',
          },
          {
            title: 'Manajemen User',
            href: '/dashboard/user',
            icon: ShieldAlert,
            desc: 'Hak akses & akun pengurus',
          },
        ]
      : []),
  ];

  const initials = username.slice(0, 2).toUpperCase();

  return (
    <Sheet>
      {/* Trigger Button in Header */}
      <SheetTrigger className="cursor-pointer hover:bg-primary/5 flex items-center justify-center rounded-full size-10 transition-colors">
        <Avatar className="size-8 border border-border">
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </SheetTrigger>

      {/* Drawer Panel */}
      <SheetContent
        showCloseButton={true}
        side="right"
        className="border-s w-full sm:max-w-sm flex flex-col p-0 gap-0"
      >
        <SheetHeader className="p-5 border-b border-border bg-muted/20">
          <SheetTitle className="text-base font-bold">Profil Akun Petugas</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Sistem Informasi Retribusi Sampah (E-Marisa)
          </SheetDescription>
        </SheetHeader>

        {/* User Info Header */}
        <div className="p-5 flex flex-col gap-3 items-center text-center border-b border-border bg-card">
          <Avatar className="size-16 border-2 border-primary/20 shadow-xs">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-center gap-1">
            <h4 className="text-base font-bold text-foreground leading-snug">
              {getRoleDisplayName(role)}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">@{username}</span>
              {getRoleBadge(role)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
              <Building2 className="size-3 text-muted-foreground" />
              <span>DLH Kabupaten Lumajang</span>
            </div>
          </div>
        </div>

        {/* Quick Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
            Navigasi Cepat SIRS
          </div>
          {menuLinks.map((item) => (
            <SheetClose
              key={item.title}
              render={
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors text-foreground group'
                  )}
                />
              }
            >
              <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/15 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <item.icon className="size-4" />
              </div>
              <div className="flex flex-col overflow-hidden text-left">
                <span className="text-xs font-semibold leading-tight text-foreground truncate">
                  {item.title}
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {item.desc}
                </span>
              </div>
            </SheetClose>
          ))}
        </div>

        {/* Footer with Logout Button */}
        <SheetFooter className="p-4 border-t border-border bg-muted/20 flex flex-col gap-3 mt-auto">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground w-full px-1">
            <div className="flex items-center gap-1">
              <CircleDot className="size-2 text-emerald-500 fill-emerald-500" />
              <span>Sesi Login Terverifikasi</span>
            </div>
            <span className="font-mono">V.1.0</span>
          </div>

          <Button
            type="button"
            variant="destructive"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>Keluar Sistem (Logout)</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
