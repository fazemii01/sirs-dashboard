import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, CircleDot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function NavSecondary() {
  const navigate = useNavigate();
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

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'ketua':
        return <Badge variant="default" className="text-[11px] font-semibold">Ketua / Kadis</Badge>;
      case 'admin':
        return <Badge variant="secondary" className="text-[11px] font-semibold">Administrator</Badge>;
      case 'petugas':
        return <Badge variant="outline" className="text-[11px] font-semibold border-primary/40 text-primary">Petugas Loket</Badge>;
      default:
        return <Badge variant="secondary" className="text-[11px] font-semibold uppercase">{r}</Badge>;
    }
  };

  return (
    <div className="-mx-1 rounded-xl border border-border bg-card p-3 shadow-xs">
      <div className="flex flex-col gap-3">
        {/* User Account Info */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 font-semibold text-xs uppercase">
              {username.slice(0, 2)}
            </div>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="font-semibold text-xs leading-tight text-foreground truncate">
                {username}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                <CircleDot className="size-2 text-emerald-500 fill-emerald-500" />
                <span>Online</span>
              </div>
            </div>
          </div>
          {getRoleBadge(role)}
        </div>

        {/* Logout Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full h-8 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <LogOut className="size-3.5" />
          <span>Keluar Sistem</span>
        </Button>
      </div>
    </div>
  );
}
