import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'react-router';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import QrisModal from '@/components/public/QrisModal';
import KopSurat from '@/components/admin/KopSurat';
import {
  Search,
  QrCode,
  Printer,
  Filter,
  PhoneCall,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { API_BASE_URL, APP_DOMAIN } from '@/lib/api';

interface InvoiceItem {
  invoice: string;
  bulan: string;
  nominal: number;
  status: string;
  qris_payload: string;
}

interface PelangganInfo {
  id_pelanggan: string;
  nama: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  va: number;
}

function getMonthNumber(bulanStr: string): number {
  if (!bulanStr) return 0;
  const b = bulanStr.toLowerCase();
  if (b.includes('jan')) return 1;
  if (b.includes('feb')) return 2;
  if (b.includes('mar')) return 3;
  if (b.includes('apr')) return 4;
  if (b.includes('mei')) return 5;
  if (b.includes('jun')) return 6;
  if (b.includes('jul')) return 7;
  if (b.includes('agu') || b.includes('ags')) return 8;
  if (b.includes('sep')) return 9;
  if (b.includes('okt')) return 10;
  if (b.includes('nov')) return 11;
  if (b.includes('des')) return 12;
  return 0;
}

function TagihanContent() {
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id') || '';
  const queryInvoice = searchParams.get('invoice') || '';

  const [inputId, setInputId] = useState('');
  const [activeInvoiceId, setActiveInvoiceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pelanggan, setPelanggan] = useState<PelangganInfo | null>(null);
  const [tagihan, setTagihan] = useState<InvoiceItem[]>([]);
  const [filterTahun, setFilterTahun] = useState('');
  const [selectedQris, setSelectedQris] = useState<InvoiceItem | null>(null);
  const [showPrintStatement, setShowPrintStatement] = useState(false);
  const [pengaturan, setPengaturan] = useState<{
    judul_beranda?: string;
    deskripsi_beranda?: string;
    no_wa_admin?: string;
    nama_aplikasi?: string;
  } | null>(null);

  useEffect(() => {
    async function loadPublicPengaturan() {
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
    loadPublicPengaturan();
  }, []);

  const handleCekTagihan = async (idOrInvoice: string, targetInvoice?: string) => {
    const cleanQuery = (idOrInvoice || '').trim();
    if (!cleanQuery) {
      setErrorMsg('Silakan masukkan ID Wajib Retribusi atau No. Invoice terlebih dahulu');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setPelanggan(null);
    setTagihan([]);

    try {
      let url = `${API_BASE_URL}/tagihan/public?id=${encodeURIComponent(cleanQuery)}`;
      if (targetInvoice) {
        url += `&invoice=${encodeURIComponent(targetInvoice)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.pelanggan) {
          setPelanggan({
            id_pelanggan: data.pelanggan.id_pelanggan,
            nama: data.pelanggan.nama,
            alamat: data.pelanggan.alamat,
            rt: data.pelanggan.rt || '01',
            rw: data.pelanggan.rw || '01',
            kelurahan: data.pelanggan.kelurahan,
            kecamatan: data.pelanggan.kecamatan,
            va: data.pelanggan.va,
          });
          setTagihan(data.tagihan || []);
          if (targetInvoice) {
            setActiveInvoiceId(targetInvoice);
          } else if (data.matched_invoice) {
            setActiveInvoiceId(data.matched_invoice);
          }
        } else {
          setErrorMsg(`Data "${cleanQuery}" tidak ditemukan dalam database.`);
        }
      } else {
        setErrorMsg(`Server backend merespons error ${res.status}.`);
      }
    } catch (err: any) {
      setErrorMsg(`Gagal memuat data (${err?.message || 'Koneksi error'}). Pastikan backend aktif.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let id = queryId;
    let invoice = queryInvoice;

    if (!id && !invoice && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      id = urlParams.get('id') || '';
      invoice = urlParams.get('invoice') || '';
    }

    if (invoice) {
      setActiveInvoiceId(invoice);
    }

    const targetQuery = id || invoice;
    if (targetQuery) {
      setInputId(targetQuery);
      handleCekTagihan(targetQuery, invoice || undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryId, queryInvoice]);

  const handlePrintStatement = () => {
    setShowPrintStatement(true);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const targetedInvoice = useMemo(() => {
    if (!activeInvoiceId || !tagihan.length) return null;
    return (
      tagihan.find(
        (item) => item.invoice.toLowerCase().trim() === activeInvoiceId.toLowerCase().trim()
      ) || null
    );
  }, [activeInvoiceId, tagihan]);

  const yearsAvailable = useMemo(() => {
    const set = new Set<string>();
    const currentYr = new Date().getFullYear();
    for (let i = currentYr - 2; i <= currentYr + 5; i++) {
      set.add(i.toString());
    }
    tagihan.forEach((item) => {
      const parts = item.bulan ? item.bulan.trim().split(' ') : [];
      if (parts.length > 1 && /^\d{4}$/.test(parts[parts.length - 1])) {
        set.add(parts[parts.length - 1]);
      }
    });
    return Array.from(set).sort().reverse();
  }, [tagihan]);

  const filteredTagihan = useMemo(() => {
    return tagihan
      .filter((item) => (filterTahun ? item.bulan.includes(filterTahun) : true))
      .sort((a, b) => {
        const yearA = parseInt(a.bulan ? a.bulan.trim().split(' ').pop() || '0' : '0', 10);
        const yearB = parseInt(b.bulan ? b.bulan.trim().split(' ').pop() || '0' : '0', 10);
        if (yearA !== yearB) {
          return yearA - yearB;
        }
        return getMonthNumber(a.bulan) - getMonthNumber(b.bulan);
      });
  }, [tagihan, filterTahun]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-ink-50)]">
      <Navbar />

      <main className="flex-1 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full">
        {/* HEADER */}
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <h1 className="text-3xl font-extrabold text-[var(--color-ink-900)] tracking-tight">
            {pengaturan?.judul_beranda || 'Lihat Tagihan Retribusi'}
          </h1>
          <p className="text-sm text-[var(--color-ink-500)]">
            {pengaturan?.deskripsi_beranda || (
              <>
                Masukkan ID Wajib Retribusi atau No. Invoice Anda (Contoh:{' '}
                <span className="font-mono-id text-[var(--color-brand-deep)]">JGY0101001</span>)
              </>
            )}
          </p>
        </div>

        {/* SEARCH BOX */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[var(--color-ink-100)] shadow-sm max-w-xl mx-auto mb-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCekTagihan(inputId);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-500)] uppercase tracking-wider mb-2">
                ID Wajib Retribusi / No. Invoice
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                  placeholder="Ketik ID Wajib Retribusi atau No. Invoice..."
                  className="w-full px-4 py-3.5 pl-11 rounded-xl border border-[var(--color-ink-300)] font-mono-id text-base text-[var(--color-ink-900)] uppercase focus:outline-none focus:border-[var(--color-brand-mid)] focus:ring-2 focus:ring-[var(--color-brand-wash)] transition-all bg-[var(--color-ink-50)]"
                />
                <Search className="w-5 h-5 text-[var(--color-ink-500)] absolute left-3.5 top-4" />
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
              className="w-full py-3.5 rounded-xl bg-[var(--color-brand-mid)] hover:bg-[var(--color-brand-deep)] text-white font-semibold text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="animate-pulse">Mencari Data...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Cari Tagihan Anda
                </>
              )}
            </button>
          </form>
        </div>

        {/* RESULTS SECTION */}
        {pelanggan && (
          <div className="space-y-6 animate-fadeIn">
            {/* SCANNED INVOICE VERIFICATION BANNER */}
            {targetedInvoice && (
              <div
                className={`p-6 rounded-2xl border-2 shadow-sm transition-all ${
                  targetedInvoice.status === 'Lunas'
                    ? 'bg-emerald-50/80 border-emerald-500/40 text-emerald-950'
                    : 'bg-amber-50/80 border-amber-500/40 text-amber-950'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/80 border shadow-xs inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Verifikasi QR Code Resmi
                      </span>
                      <span className="text-xs font-mono font-bold">
                        {targetedInvoice.invoice}
                      </span>
                    </div>

                    <h3 className="text-lg font-black tracking-tight">
                      Periode: {targetedInvoice.bulan} - Rp{' '}
                      {targetedInvoice.nominal.toLocaleString('id-ID')}
                    </h3>

                    <p className="text-xs opacity-80">
                      Wajib Retribusi: <strong>{pelanggan.nama}</strong> ({pelanggan.id_pelanggan})
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider ${
                        targetedInvoice.status === 'Lunas'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-amber-600 text-white shadow-xs'
                      }`}
                    >
                      {targetedInvoice.status === 'Lunas' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      STATUS: {targetedInvoice.status.toUpperCase()}
                    </span>

                    {targetedInvoice.status !== 'Lunas' && (
                      <button
                        onClick={() => setSelectedQris(targetedInvoice)}
                        className="px-4 py-1.5 rounded-xl bg-[var(--color-brand-mid)] hover:bg-[var(--color-brand-deep)] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Bayar QRIS
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Customer Details Card */}
            <div className="bg-white p-6 rounded-2xl border border-[var(--color-ink-100)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-[var(--color-ink-500)] uppercase tracking-wider block">
                  Data Wajib Retribusi
                </span>
                <h3 className="text-lg font-bold text-[var(--color-ink-900)] mt-0.5">
                  {pelanggan.nama}
                </h3>
                <p className="text-xs text-[var(--color-ink-700)] mt-1">
                  {pelanggan.alamat} (RT {pelanggan.rt} / RW {pelanggan.rw}), Kel.{' '}
                  {pelanggan.kelurahan}, Kec. {pelanggan.kecamatan}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-md bg-[var(--color-brand-wash)] text-[var(--color-brand-deep)] text-xs font-bold border border-[var(--color-brand-light)]/20 font-mono-id">
                  {pelanggan.id_pelanggan}
                </span>
                <span className="px-3 py-1 rounded-md bg-[var(--color-ink-100)] text-[var(--color-ink-700)] text-xs font-semibold">
                  {pelanggan.va} VA
                </span>
              </div>
            </div>

            {/* Table Header Filter & Print Actions */}
            <div className="bg-white p-4 rounded-xl border border-[var(--color-ink-100)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[var(--color-ink-500)]" />
                <label className="text-xs font-semibold text-[var(--color-ink-700)]">
                  Filter Tahun:
                </label>
                <select
                  value={filterTahun}
                  onChange={(e) => setFilterTahun(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--color-ink-300)] text-xs bg-[var(--color-ink-50)] text-[var(--color-ink-900)] focus:outline-none focus:border-[var(--color-brand-mid)] cursor-pointer"
                >
                  <option value="">Semua Tahun</option>
                  {yearsAvailable.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handlePrintStatement}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-ink-300)] text-xs font-semibold text-[var(--color-ink-700)] hover:bg-[var(--color-ink-50)] transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Cetak Tagihan
              </button>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-2xl border border-[var(--color-ink-100)] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-[var(--color-ink-50)] text-[var(--color-ink-500)] text-xs uppercase tracking-wider font-semibold border-b border-[var(--color-ink-100)]">
                    <tr>
                      <th className="p-4 text-center">QRIS</th>
                      <th className="p-4">No. Invoice</th>
                      <th className="p-4">Bulan / Tahun</th>
                      <th className="p-4">Nominal</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-ink-100)] text-[var(--color-ink-700)]">
                    {filteredTagihan.map((item, idx) => {
                      const isLunas = item.status === 'Lunas';
                      const isTargeted =
                        activeInvoiceId &&
                        item.invoice.toLowerCase().trim() === activeInvoiceId.toLowerCase().trim();

                      return (
                        <tr
                          key={idx}
                          className={`transition-colors ${
                            isTargeted
                              ? 'bg-[var(--color-brand-wash)]/40 font-semibold'
                              : 'hover:bg-[var(--color-ink-50)]'
                          }`}
                        >
                          <td className="p-4 text-center">
                            <button
                              onClick={() => setSelectedQris(item)}
                              title="Generate QRIS Dinamis"
                              className="p-2 rounded-lg bg-[var(--color-brand-wash)] text-[var(--color-brand-mid)] hover:bg-[var(--color-brand-mid)] hover:text-white transition-colors cursor-pointer"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="p-4 font-mono text-xs">
                            <div className="flex items-center gap-1.5">
                              <span>{item.invoice}</span>
                              {isTargeted && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[var(--color-brand-mid)] text-white tracking-wider">
                                  SCAN QR
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 font-medium">{item.bulan}</td>
                          <td className="p-4 font-semibold">
                            Rp {item.nominal.toLocaleString('id-ID')}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                isLunas
                                  ? 'bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success)]/20'
                                  : 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger)]/20'
                              }`}
                            >
                              {isLunas ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              {item.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM HELP INFO */}
        <div className="mt-12 bg-white p-6 rounded-2xl border border-[var(--color-ink-100)] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-wash)] text-[var(--color-brand-mid)] flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-[var(--color-ink-900)]">
              Tidak Tahu ID Wajib Retribusi Anda?
            </h4>
            <p className="text-xs text-[var(--color-ink-500)] mt-0.5">
              Hubungi Layanan CS DLH melalui WhatsApp{' '}
              <a
                href={`https://wa.me/${(pengaturan?.no_wa_admin || '6281234567890').replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[var(--color-brand-mid)] hover:underline"
              >
                +{pengaturan?.no_wa_admin || '6281234567890'}
              </a>{' '}
              dengan menyertakan Nama lengkap, Kelurahan/Desa, Kecamatan, RT, dan RW.
            </p>
          </div>
        </div>
      </main>

      {/* QRIS DYNAMIC MODAL */}
      {selectedQris && (
        <QrisModal
          invoiceId={selectedQris.invoice}
          nominal={selectedQris.nominal}
          bulan={selectedQris.bulan}
          pelanggan={
            pelanggan
              ? {
                  idPelanggan: pelanggan.id_pelanggan,
                  nama: pelanggan.nama,
                  alamat: `${pelanggan.alamat} (RT ${pelanggan.rt} / RW ${pelanggan.rw}), Kel. ${pelanggan.kelurahan}, Kec. ${pelanggan.kecamatan}`,
                }
              : undefined
          }
          qrisPayload={selectedQris.qris_payload}
          onClose={() => setSelectedQris(null)}
          onPaymentSuccess={() => {
            setTagihan((prev) =>
              prev.map((item) =>
                item.invoice === selectedQris.invoice ? { ...item, status: 'Lunas' } : item
              )
            );
          }}
        />
      )}

      {/* PRINTABLE BILLING STATEMENT */}
      {showPrintStatement && pelanggan && (
        <div className="printable-receipt-area hidden">
          <div className="max-w-xl mx-auto p-8 border-2 border-slate-800 bg-white font-sans text-slate-800 space-y-6">
            <KopSurat subTitle="DINAS LINGKUNGAN HIDUP" />
            <div className="text-center pt-2 pb-1 border-b border-slate-300">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Rincian Lembar Tagihan Retribusi Sampah
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">ID Wajib Retribusi:</span>
                <span className="font-mono-id font-bold">{pelanggan.id_pelanggan}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Nama Pelanggan:</span>
                <span className="font-bold">{pelanggan.nama}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Alamat:</span>
                <span>
                  {pelanggan.alamat} (RT {pelanggan.rt} / RW {pelanggan.rw})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Kelurahan / Kecamatan:</span>
                <span>
                  Kel. {pelanggan.kelurahan}, Kec. {pelanggan.kecamatan}
                </span>
              </div>
            </div>

            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-semibold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">Bulan</th>
                  <th className="p-2 border-r border-slate-300">Nominal</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTagihan.map((inv, i) => (
                  <tr key={i} className="border-b border-slate-200">
                    <td className="p-2 border-r border-slate-300 font-medium">{inv.bulan}</td>
                    <td className="p-2 border-r border-slate-300 font-semibold">
                      Rp {inv.nominal.toLocaleString('id-ID')}
                    </td>
                    <td className="p-2 font-bold uppercase">{inv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-4 flex flex-col items-center justify-center space-y-2 text-center border-t border-slate-300">
              <QRCodeSVG
                value={`${APP_DOMAIN.replace(/\/$/, '')}/tagihan?id=${encodeURIComponent(pelanggan.id_pelanggan)}`}
                size={100}
                level="M"
              />
              <p className="text-[10px] text-slate-500 max-w-xs">
                Scan QR untuk cek status tagihan online resmi Dinas Lingkungan Hidup Kabupaten Lumajang.
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function CekTagihanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-ink-50)] text-sm text-[var(--color-ink-500)]">
          Memuat data tagihan...
        </div>
      }
    >
      <TagihanContent />
    </Suspense>
  );
}
