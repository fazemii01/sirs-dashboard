import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { getAuthSession, AuthSession } from '@/lib/auth';

export default function Footer() {
  const [session, setSession] = useState<AuthSession>(() => getAuthSession());

  useEffect(() => {
    setSession(getAuthSession());
  }, []);

  return (
    <footer className="w-full py-8 border-t border-[var(--color-ink-100)] bg-white mt-auto text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-ink-500)]">
        <p className="m-0 font-medium">
          &copy; {new Date().getFullYear()} E-Marisa v2.0 |{' '}
          <span className="font-semibold text-[var(--color-ink-700)]">
            Dinas Lingkungan Hidup Kabupaten Lumajang
          </span>
        </p>

        <div className="flex items-center gap-6">
          <Link to="/tagihan" className="hover:text-[var(--color-brand-mid)] transition-colors">
            Cek Tagihan
          </Link>
          <Link
            to={session.isAuthenticated ? session.dashboardUrl : '/login'}
            className="hover:text-[var(--color-brand-mid)] transition-colors"
          >
            {session.isAuthenticated ? 'Dashboard Internal' : 'Portal Admin'}
          </Link>
        </div>
      </div>
    </footer>
  );
}
