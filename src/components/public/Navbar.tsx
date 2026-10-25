import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { LogIn, Menu, X, FileText, Home, LayoutDashboard } from 'lucide-react';
import { getAuthSession, AuthSession } from '@/lib/auth';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<AuthSession>(() => getAuthSession());
  const location = useLocation();
  const pathname = location.pathname;

  // Re-verify session on mount and route changes to reflect active/expired login
  useEffect(() => {
    setSession(getAuthSession());
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/tagihan', label: 'Lihat Tagihan', icon: FileText },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--color-ink-100)] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border border-[var(--color-ink-900)] shadow-xs transition-all group-hover:scale-105 group-hover:border-[var(--color-brand-mid)]">
            <img
              src="/logo-dlh.png"
              alt="Logo DLH Lumajang"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="text-lg font-bold text-[var(--color-brand-deep)] tracking-tight block leading-none">
              E-Marisa
            </span>
            <span className="text-[10px] font-medium text-[var(--color-ink-500)] tracking-wider uppercase block mt-1">
              DLH Lumajang
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[var(--color-brand-mid)] bg-[var(--color-brand-wash)] font-semibold'
                      : 'text-[var(--color-ink-700)] hover:text-[var(--color-brand-mid)] hover:bg-[var(--color-ink-100)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {session.isAuthenticated ? (
            <Link
              to={session.dashboardUrl}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--color-brand-mid)] hover:bg-[var(--color-brand-deep)] shadow-xs transition-all transform hover:-translate-y-0.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[var(--color-brand-mid)] border border-[var(--color-brand-mid)] hover:bg-[var(--color-brand-wash)] transition-all"
            >
              <LogIn className="w-4 h-4" />
              Login Pengurus
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-[var(--color-ink-700)] hover:bg-[var(--color-ink-100)] cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-[var(--color-ink-100)] bg-white px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'text-[var(--color-brand-mid)] bg-[var(--color-brand-wash)] font-semibold'
                    : 'text-[var(--color-ink-700)]'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}

          {session.isAuthenticated ? (
            <Link
              to={session.dashboardUrl}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-semibold text-white bg-[var(--color-brand-mid)] hover:bg-[var(--color-brand-deep)] mt-4 shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-semibold text-white bg-[var(--color-brand-mid)] mt-4 shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              Login Pengurus
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
