import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { User, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, LogIn, AlertCircle, Trees } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { getAuthSession } from '@/lib/auth';

export default function SirsLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in with a valid session, navigate straight to dashboard
  useEffect(() => {
    const session = getAuthSession();
    if (session.isAuthenticated) {
      navigate(session.dashboardUrl, { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMsg('Username dan Password wajib diisi');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Attempt API call to NestJS backend /api/auth/login
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUser, password: trimmedPass }),
      });

      if (res.ok) {
        const data = await res.json();
        const token = data.access_token || data.token || 'jwt_token';
        const role = (data.role || trimmedUser).toLowerCase();
        const finalUsername = data.username || trimmedUser;

        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_role', role);
        localStorage.setItem('username', finalUsername);
        if (data.nama_lengkap) {
          localStorage.setItem('user_name', data.nama_lengkap);
        }

        setLoading(false);
        navigate(role === 'petugas' ? '/dashboard/tagihan' : '/dashboard');
        return;
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setErrorMsg(errData.message || 'Username atau Password salah');
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.log('Backend API unreachable, using local credential verification');
    }

    // 2. Local fallback verification if backend API is not running locally
    setTimeout(() => {
      const u = trimmedUser.toLowerCase();
      const p = trimmedPass;

      const isKetua = u === 'ketua' && (p === 'ketua123' || p === 'ketua');
      const isAdmin = u === 'admin' && (p === 'admin123' || p === 'admin');
      const isPetugas = u === 'petugas' && (p === 'petugas123' || p === 'petugas');

      if (isKetua || isAdmin || isPetugas) {
        const role = isKetua ? 'ketua' : isAdmin ? 'admin' : 'petugas';
        localStorage.setItem('auth_token', `mock_jwt_token_dlh_${role}_2026`);
        localStorage.setItem('user_role', role);
        localStorage.setItem('username', trimmedUser);
        localStorage.setItem(
          'user_name',
          isKetua ? 'Kepala Dinas DLH' : isAdmin ? 'Administrator DLH' : 'Petugas Loket'
        );

        setLoading(false);
        navigate(role === 'petugas' ? '/dashboard/tagihan' : '/dashboard');
      } else {
        setErrorMsg('Username atau Password salah');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* LEFT PANEL: BRAND DEEP & NATURAL FOREST */}
      <div className="md:w-5/12 bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#022c22] text-white p-8 md:p-14 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Transparent Natural Forest Background */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80"
            alt="Natural Forest DLH"
            className="w-full h-full object-cover object-center opacity-30 mix-blend-overlay scale-105"
          />
          {/* Natural Forest Gradient Shade */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#022c22] via-[#064e3b]/85 to-[#022c22]/90 mix-blend-multiply" />
          {/* Ambient Lighting Accents */}
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute top-1/4 -right-24 w-80 h-80 rounded-full bg-teal-400/15 blur-3xl pointer-events-none" />
        </div>

        {/* Brand Header with Official DLH Lumajang Fixed Logo */}
        <div className="relative z-10 space-y-8">
          <Link to="/" className="inline-flex items-center gap-3.5 group">
            <div className="w-20 h-20 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg border border-white/50 group-hover:scale-105 transition-all">
              <img
                src="/logo-dlh.png"
                alt="Logo DLH Lumajang"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-bold tracking-tight text-white block leading-none">
                E-Marisa
              </span>
              <span className="text-[11px] font-semibold text-emerald-300/90 tracking-wider uppercase block mt-1.5">
                DLH Lumajang
              </span>
            </div>
          </Link>

          <div className="pt-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              <Trees className="w-3.5 h-3.5 text-emerald-300" />
              <span>Portal Internal SIRS</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Sistem Informasi Pengurus Retribusi
            </h2>

            <p className="text-sm text-emerald-100/85 leading-relaxed max-w-md">
              Portal terpadu pengelolaan retribusi pelayanan kebersihan Dinas Lingkungan Hidup Kabupaten Lumajang untuk mewujudkan tata kelola yang bersih, transparan, dan berkelanjutan.
            </p>

            {/* Quick Metrics Badge */}
            <div className="grid grid-cols-2 gap-3 pt-4 max-w-sm">
              <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
                <span className="block text-xl font-extrabold text-white font-mono">100%</span>
                <span className="text-[11px] text-emerald-200/80 leading-snug block mt-0.5">
                  Layanan Retribusi Digital
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
                <span className="block text-xl font-extrabold text-white font-mono">21 Kec</span>
                <span className="text-[11px] text-emerald-200/80 leading-snug block mt-0.5">
                  Kabupaten Lumajang
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Badge Footer on Green Side */}
        <div className="relative z-10 pt-10 text-xs text-emerald-200/75 flex items-center gap-2.5 border-t border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Akses Terenkripsi & Terotorisasi Dinas Lingkungan Hidup</span>
        </div>
      </div>

      {/* RIGHT PANEL: FORM */}
      <div className="md:w-7/12 p-8 md:p-16 flex flex-col justify-between bg-[var(--color-ink-50)]">
        <div className="max-w-md w-full mx-auto my-auto space-y-8">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-ink-500)] hover:text-[var(--color-brand-mid)] transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>

            <h1 className="text-3xl font-extrabold text-[var(--color-ink-900)] tracking-tight">Login Pengurus</h1>
            <p className="text-sm text-[var(--color-ink-500)] mt-1">
              Masukkan kredensial akun pengurus Anda untuk melanjutkan.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-700)] uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full px-4 py-3 pl-11 rounded-xl border border-[var(--color-ink-300)] text-sm text-[var(--color-ink-900)] focus:outline-none focus:border-[var(--color-brand-mid)] focus:ring-2 focus:ring-[var(--color-brand-wash)] bg-white transition-all"
                  required
                />
                <User className="w-5 h-5 text-[var(--color-ink-500)] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-700)] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full px-4 py-3 pl-11 pr-11 rounded-xl border border-[var(--color-ink-300)] text-sm text-[var(--color-ink-900)] focus:outline-none focus:border-[var(--color-brand-mid)] focus:ring-2 focus:ring-[var(--color-brand-wash)] bg-white transition-all"
                  required
                />
                <Lock className="w-5 h-5 text-[var(--color-ink-500)] absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-danger)] bg-[var(--color-danger-bg)] p-3 rounded-lg border border-[var(--color-danger)]/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[var(--color-brand-mid)] hover:bg-[var(--color-brand-deep)] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <span className="animate-pulse">Memverifikasi...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Masuk ke Dashboard
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
