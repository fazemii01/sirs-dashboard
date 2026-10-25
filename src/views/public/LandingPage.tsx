import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { ArrowRight, CheckCircle2, Zap, Search, ShieldCheck, FileCheck, PhoneCall, LayoutDashboard } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { getAuthSession, AuthSession } from '@/lib/auth';

export default function LandingPage() {
  const [session, setSession] = useState<AuthSession>(() => getAuthSession());
  const [pengaturan, setPengaturan] = useState<{
    nama_aplikasi?: string;
    judul_beranda?: string;
    deskripsi_beranda?: string;
    no_wa_admin?: string;
  } | null>(null);

  useEffect(() => {
    setSession(getAuthSession());
    async function loadPengaturan() {
      try {
        const res = await fetch(`${API_BASE_URL}/pengaturan`);
        if (res.ok) {
          const data = await res.json();
          setPengaturan(data);
        }
      } catch (err) {
        // silent fallback
      }
    }
    loadPengaturan();
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-ink-50)]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-brand-wash)] border border-[var(--color-brand-light)]/20 text-xs font-semibold text-[var(--color-brand-deep)]">
                <ShieldCheck className="w-4 h-4 text-[var(--color-brand-mid)]" />
                Layanan Resmi DLH Kabupaten Lumajang
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--color-ink-900)] tracking-tight leading-[1.15]">
                Retribusi Sampah, <br />
                <span className="text-[var(--color-brand-mid)]">Sekarang Digital.</span>
              </h1>

              <p className="text-lg text-[var(--color-ink-700)] leading-relaxed max-w-2xl">
                Portal layanan administrasi pembayaran iuran kebersihan lingkungan. Cek tagihan Anda kapan saja dan di mana saja dengan mudah, transparan, dan terintegrasi.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to="/tagihan"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--color-brand-mid)] text-white text-base font-semibold shadow-md hover:bg-[var(--color-brand-deep)] transition-all transform hover:-translate-y-0.5"
                >
                  Cek Tagihan Sekarang
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to={session.isAuthenticated ? session.dashboardUrl : '/login'}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-[var(--color-ink-300)] text-[var(--color-ink-900)] text-base font-semibold hover:bg-white hover:border-[var(--color-brand-mid)] transition-all"
                >
                  {session.isAuthenticated ? (
                    <>
                      <LayoutDashboard className="w-5 h-5 text-[var(--color-brand-mid)]" />
                      Buka Dashboard
                    </>
                  ) : (
                    'Portal Pengurus'
                  )}
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex items-center gap-6 pt-4 text-xs font-medium text-[var(--color-ink-500)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
                  <span>Data Aman & Terverifikasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
                  <span>Dukungan QRIS Dinamis</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-[var(--color-brand-mid)] to-teal-400 rounded-3xl opacity-20 blur-xl"></div>
              <div className="relative bg-white p-8 rounded-3xl border border-[var(--color-ink-100)] shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--color-ink-100)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-wash)] flex items-center justify-center text-[var(--color-brand-mid)] font-bold text-sm">
                      JGY
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--color-ink-900)]">Contoh ID Retribusi</h4>
                      <span className="text-xs font-mono-id text-[var(--color-brand-deep)]">LMJ-JGY-0001</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)] text-xs font-semibold">
                    Terverifikasi
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-dashed border-[var(--color-ink-100)]">
                    <span className="text-[var(--color-ink-500)]">Kelurahan</span>
                    <span className="font-medium text-[var(--color-ink-900)]">Jogoyudan</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-dashed border-[var(--color-ink-100)]">
                    <span className="text-[var(--color-ink-500)]">RT / RW</span>
                    <span className="font-medium text-[var(--color-ink-900)]">RT 01 / RW 01</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-dashed border-[var(--color-ink-100)]">
                    <span className="text-[var(--color-ink-500)]">Daya Listrik</span>
                    <span className="font-medium text-[var(--color-ink-900)]">900 VA</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/tagihan?id=LMJ-JGY-0001"
                    className="w-full py-3 rounded-xl bg-[var(--color-ink-50)] hover:bg-[var(--color-brand-wash)] text-[var(--color-brand-deep)] text-xs font-semibold flex items-center justify-center gap-2 border border-[var(--color-ink-100)] transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    Simulasi Cek Tagihan Ini
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DARK STATS BAND */}
        <section className="bg-[var(--color-ink-900)] py-12 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-[var(--color-brand-light)] block">7</span>
              <span className="text-xs text-[var(--color-ink-300)] uppercase tracking-wider mt-1 block">Kelurahan Cakupan</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-[var(--color-brand-light)] block">100%</span>
              <span className="text-xs text-[var(--color-ink-300)] uppercase tracking-wider mt-1 block">Transparan</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-[var(--color-brand-light)] block">24/7</span>
              <span className="text-xs text-[var(--color-ink-300)] uppercase tracking-wider mt-1 block">Akses Online</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-[var(--color-brand-light)] block">QRIS</span>
              <span className="text-xs text-[var(--color-ink-300)] uppercase tracking-wider mt-1 block">Pembayaran Instan</span>
            </div>
          </div>
        </section>

        {/* FEATURE CARDS */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold text-[var(--color-ink-900)] tracking-tight">
              Keunggulan Layanan Digital
            </h2>
            <p className="text-base text-[var(--color-ink-500)]">
              Dirancang untuk memberikan kemudahan bagi warga dan efisiensi pengelolaan administrasi bagi petugas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[var(--color-ink-100)] border-l-4 border-l-[var(--color-brand-mid)] shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-wash)] text-[var(--color-brand-mid)] flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-ink-900)]">Cepat & Praktis</h3>
              <p className="text-sm text-[var(--color-ink-500)] leading-relaxed">
                Cek rincian biaya iuran kebersihan lingkungan hanya dengan memasukkan ID Wajib Retribusi tanpa perlu login.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[var(--color-ink-100)] border-l-4 border-l-[var(--color-brand-mid)] shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-wash)] text-[var(--color-brand-mid)] flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-ink-900)]">Transparan</h3>
              <p className="text-sm text-[var(--color-ink-500)] leading-relaxed">
                Riwayat pembayaran lunas dan tunggakan tercatat secara realtime di sistem database DLH Lumajang.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[var(--color-ink-100)] border-l-4 border-l-[var(--color-brand-mid)] shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-wash)] text-[var(--color-brand-mid)] flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-ink-900)]">Dynamic QRIS</h3>
              <p className="text-sm text-[var(--color-ink-500)] leading-relaxed">
                Pembayaran otomatis menghasilkan QRIS dinamis sesuai invoice nominal tagihan warga.
              </p>
            </div>
          </div>
        </section>

        {/* INFO STRIP */}
        <section className="bg-[var(--color-brand-wash)] border-y border-[var(--color-brand-light)]/20 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white text-[var(--color-brand-mid)] flex items-center justify-center shadow-xs shrink-0">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[var(--color-brand-deep)]">Tidak Tahu ID Wajib Retribusi Anda?</h4>
                <p className="text-xs text-[var(--color-ink-700)] mt-0.5">
                  Hubungi Customer Service dengan menyertakan Nama Lengkap, Kelurahan/Desa, Kecamatan, RT, dan RW.
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/${(pengaturan?.no_wa_admin || '6281234567890').replace(/\D/g, '')}?text=Halo%20Admin%20DLH%2C%20saya%20tidak%20tahu%20ID%20Wajib%20Retribusi%20saya.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-[var(--color-brand-mid)] hover:bg-[var(--color-brand-deep)] text-white text-sm font-semibold transition-colors shadow-xs whitespace-nowrap"
            >
              Hubungi CS via WhatsApp
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
