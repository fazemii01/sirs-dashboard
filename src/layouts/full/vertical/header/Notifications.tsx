import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Bell,
  CheckCheck,
  Receipt,
  AlertTriangle,
  UserPlus,
  Zap,
  ShieldCheck,
  Trash2,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  isRead: boolean;
  type: 'payment' | 'warning' | 'user' | 'tarif' | 'system';
  href: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Pelunasan Tagihan Baru',
    subtitle: 'Bambang Sutrisno melunasi retribusi sampah Maret 2026 (Rp 50.000) di Loket Pusat',
    time: '10 menit yang lalu',
    isRead: false,
    type: 'payment',
    href: '/dashboard/invoice',
  },
  {
    id: 'notif-2',
    title: 'Peringatan Jatuh Tempo Tagihan',
    subtitle: '24 wajib retribusi wilayah Rogotrunan melewati batas tanggal 20 bulan ini',
    time: '1 jam yang lalu',
    isRead: false,
    type: 'warning',
    href: '/dashboard/tagihan',
  },
  {
    id: 'notif-3',
    title: 'Wajib Retribusi Baru Terdaftar',
    subtitle: 'Pendaftaran 3 pelanggan baru dari Kel. Ditotrunan berhasil diverifikasi',
    time: '2 jam yang lalu',
    isRead: false,
    type: 'user',
    href: '/dashboard/pelanggan',
  },
  {
    id: 'notif-4',
    title: 'Sinkronisasi Tarif Retribusi',
    subtitle: 'Struktur tarif retribusi sampah tahun 2026 telah disinkronkan ke loket',
    time: 'Kemarin, 14:20',
    isRead: true,
    type: 'tarif',
    href: '/dashboard/tarif',
  },
  {
    id: 'notif-5',
    title: 'Pencadangan Sistem Selesai',
    subtitle: 'Backup database otomatis SIRS E-Marisa berhasil disimpan ke server',
    time: '2 hari yang lalu',
    isRead: true,
    type: 'system',
    href: '/dashboard/pengaturan',
  },
];

const STORAGE_KEY = 'sirs_notifications_v1';

export default function Notifications({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load notifications from localStorage:', e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const displayedNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    saveNotifications(updated);
  };

  const handleItemClick = (item: NotificationItem) => {
    handleMarkAsRead(item.id);
    setOpen(false);
    if (item.href) {
      navigate(item.href);
    }
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    saveNotifications(updated);
    toast.success('Semua notifikasi ditandai telah dibaca');
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveNotifications([]);
    toast.info('Riwayat notifikasi dibersihkan');
  };

  const handleResetNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveNotifications(INITIAL_NOTIFICATIONS);
    toast.success('Notifikasi sistem disinkronkan kembali');
  };

  const renderIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'payment':
        return (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Receipt className="size-4" />
          </div>
        );
      case 'warning':
        return (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-4" />
          </div>
        );
      case 'user':
        return (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <UserPlus className="size-4" />
          </div>
        );
      case 'tarif':
        return (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Zap className="size-4" />
          </div>
        );
      case 'system':
      default:
        return (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <ShieldCheck className="size-4" />
          </div>
        );
    }
  };

  return (
    <div className={cn('relative', className)}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="relative flex size-9 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Pemberitahuan Sistem SIRS"
            />
          }
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <>
              <span className="absolute top-1.5 right-1.5 size-2 bg-destructive rounded-full animate-ping pointer-events-none" />
              <span className="absolute top-1.5 right-1.5 size-2 bg-destructive rounded-full pointer-events-none" />
            </>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-[360px] sm:w-[400px] max-w-[95vw] p-0 shadow-lg rounded-xl border border-border bg-popover z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Pemberitahuan
              </h3>
              {unreadCount > 0 ? (
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/25 text-[10px] font-bold px-1.5 py-0"
                >
                  {unreadCount} baru
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium px-1.5 py-0 text-muted-foreground"
                >
                  Semua Terbaca
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Tandai semua telah dibaca"
                >
                  <CheckCheck className="size-3.5" />
                  <span className="hidden sm:inline">Tandai Dibaca</span>
                </Button>
              )}
            </div>
          </div>

          {/* Filter Subheader */}
          <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border/50 text-xs">
            <div className="flex items-center gap-1 rounded-md border border-border p-0.5 bg-background">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={cn(
                  'px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer',
                  filter === 'all'
                    ? 'bg-muted text-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Semua ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={cn(
                  'px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer',
                  filter === 'unread'
                    ? 'bg-muted text-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Belum Dibaca ({unreadCount})
              </button>
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="size-3" />
                <span>Bersihkan</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-border/40">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                <CheckCheck className="size-8 mx-auto text-muted-foreground/40" />
                <p className="font-semibold text-foreground">
                  {filter === 'unread'
                    ? 'Tidak ada notifikasi belum dibaca'
                    : 'Belum ada notifikasi baru'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Semua aktivitas operasional retribusi sampah tercatat normal.
                </p>
                {notifications.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetNotifications}
                    className="h-7 text-xs gap-1 mt-2 cursor-pointer"
                  >
                    <RotateCcw className="size-3" />
                    <span>Muat Contoh Notifikasi</span>
                  </Button>
                )}
              </div>
            ) : (
              displayedNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    'flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-muted/60 relative group',
                    !item.isRead ? 'bg-primary/[0.03]' : 'opacity-85'
                  )}
                >
                  {renderIcon(item.type)}

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={cn(
                          'text-xs truncate',
                          !item.isRead
                            ? 'font-bold text-foreground'
                            : 'font-medium text-foreground/80'
                        )}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {item.time}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                    {!item.isRead ? (
                      <span
                        className="size-2 rounded-full bg-primary shrink-0"
                        title="Belum dibaca"
                      />
                    ) : (
                      <span className="size-2" />
                    )}
                    <ArrowUpRight className="size-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>

          <DropdownMenuSeparator className="my-0" />

          {/* Footer Action */}
          <div className="p-2.5 bg-muted/20 flex items-center justify-between text-xs">
            <Link
              to="/dashboard/tagihan"
              onClick={() => setOpen(false)}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              <span>Buka Rekapitulasi Tagihan</span>
              <ArrowUpRight className="size-3" />
            </Link>

            <span className="text-[10px] text-muted-foreground">
              E-Marisa DLH
            </span>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
