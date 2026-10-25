import { useState, useEffect } from 'react';
import {
  Globe,
  Phone,
  CreditCard,
  QrCode,
  Image as ImageIcon,
  FileText,
  Zap,
  Calendar,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  Save,
  User,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export default function PengaturanAplikasiPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Section 1: Identitas Aplikasi & Kontak & Bank
  const [appName, setAppName] = useState('E-Marisa DLH Lumajang');
  const [waCs, setWaCs] = useState('6281234567890');
  const [bankRekening, setBankRekening] = useState('BANK JATIM - 1061001847');
  const [atasNama, setAtasNama] = useState('Bendahara Penerimaan DLH');
  const [qrisPreview, setQrisPreview] = useState<string | null>(null);

  // Section 2: Logo & Favicon
  const [logoPreview, setLogoPreview] = useState('/logo-dlh.png');
  const [faviconPreview, setFaviconPreview] = useState('/logo-dlh.png');

  // Section 3: Pesan Beranda Publik
  const [berandaTitle, setBerandaTitle] = useState('Lihat Tagihan Retribusi Sampah');
  const [berandaDesc, setBerandaDesc] = useState(
    'Portal Resmi Dinas Lingkungan Hidup Kabupaten Lumajang untuk kemudahan pengecekan dan pembayaran retribusi sampah secara online.'
  );

  // Section 4: Cron Job Schedule
  const [cronActive, setCronActive] = useState(true);
  const [cronDay, setCronDay] = useState('1');
  const [cronHour, setCronHour] = useState('00');
  const [cronMinute, setCronMinute] = useState('00');

  // Manual Trigger Execution & Logs
  const [isExecutingManual, setIsExecutingManual] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [lastExecutedAt, setLastExecutedAt] = useState<string | null>('-');
  const [lastProcessedCount, setLastProcessedCount] = useState<number>(0);
  const [lastCronStatus, setLastCronStatus] = useState<string>('Siap');

  // Helper to convert uploaded image file to Base64 data URL
  const handleFileToBase64 = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Load Settings from API
  useEffect(() => {
    async function loadPengaturan() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/pengaturan`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            if (data.nama_aplikasi) setAppName(data.nama_aplikasi);
            if (data.no_wa_admin) setWaCs(data.no_wa_admin);
            if (data.bank_rekening || data.no_rekening) {
              setBankRekening(data.bank_rekening || data.no_rekening);
            }
            if (data.atas_nama_rekening || data.atas_nama) {
              setAtasNama(data.atas_nama_rekening || data.atas_nama);
            }
            if (data.judul_beranda) setBerandaTitle(data.judul_beranda);
            if (data.deskripsi_beranda) setBerandaDesc(data.deskripsi_beranda);
            if (typeof data.cron_active === 'boolean') setCronActive(data.cron_active);
            if (data.cron_day) setCronDay(String(data.cron_day));
            if (data.cron_time) {
              const parts = String(data.cron_time).split(':');
              if (parts[0]) setCronHour(parts[0].padStart(2, '0'));
              if (parts[1]) setCronMinute(parts[1].padStart(2, '0'));
            }
            if (data.qris_url || data.link_qris) setQrisPreview(data.qris_url || data.link_qris);
            if (data.logo_url) setLogoPreview(data.logo_url);
            if (data.favicon_url) setFaviconPreview(data.favicon_url);
            if (data.last_cron_run) setLastExecutedAt(data.last_cron_run);
            if (typeof data.last_cron_count === 'number') setLastProcessedCount(data.last_cron_count);
            if (data.last_cron_status) setLastCronStatus(data.last_cron_status);
          }
        }
      } catch (err) {
        console.error('Failed to load pengaturan API:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPengaturan();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!waCs.startsWith('62')) {
      toast.error('Nomor WhatsApp wajib menggunakan format internasional dengan awalan 62');
      return;
    }

    try {
      setIsSaving(true);
      const cronTime = `${cronHour}:${cronMinute}`;

      const payload = {
        nama_aplikasi: appName,
        no_wa_admin: waCs,
        bank_rekening: bankRekening,
        atas_nama_rekening: atasNama,
        judul_beranda: berandaTitle,
        deskripsi_beranda: berandaDesc,
        cron_active: cronActive,
        cron_day: Number(cronDay),
        cron_time: cronTime,
        qris_url: qrisPreview,
        logo_url: logoPreview,
        favicon_url: faviconPreview,
      };

      const res = await fetch(`${API_BASE_URL}/pengaturan`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Seluruh pengaturan sistem & jadwal cron otomatis berhasil disimpan');
      } else {
        const errJson = await res.json().catch(() => ({}));
        toast.error(errJson.message || 'Gagal menyimpan pengaturan aplikasi');
      }
    } catch (err) {
      console.error('Error saving pengaturan:', err);
      toast.error('Gagal terhubung ke server backend');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerCronManual = async () => {
    try {
      setIsExecutingManual(true);
      setExecutionResult(null);

      const res = await fetch(`${API_BASE_URL}/tagihan/trigger-cron?force=true`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const result = await res.json().catch(() => ({}));

      if (res.ok && result.success !== false) {
        const count = result.createdCount ?? result.data?.createdCount ?? 0;
        const skipped = result.skippedCount ?? result.data?.skippedCount ?? 0;
        const msg =
          result.message ||
          result.data?.pesan ||
          `Berhasil memproses cron: ${count} tagihan baru dibuat (${skipped} pelanggan dilewati).`;

        setExecutionResult(msg);
        const timeNow = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'medium' }) + ' WIB';
        setLastExecutedAt(timeNow);
        setLastProcessedCount(count);
        setLastCronStatus('Sukses');
        toast.success('Uji coba eksekusi manual Cron Job berhasil dijalankan');
      } else {
        const errMsg = result.error || result.message || 'Gagal mengeksekusi Cron Job manual';
        setExecutionResult(`Gagal: ${errMsg}`);
        setLastCronStatus('Gagal');
        toast.error(errMsg);
      }
    } catch (err: any) {
      console.error('Error triggering cron:', err);
      const errMsg = `Gagal terhubung ke server backend: ${err?.message || 'Koneksi error'}`;
      setExecutionResult(errMsg);
      setLastCronStatus('Error');
      toast.error(errMsg);
    } finally {
      setIsExecutingManual(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Pengaturan Aplikasi & Sistem
            </h1>
            <Badge variant="secondary" className="font-medium text-xs">
              Konfigurasi Inti
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Kelola profil sistem E-Marisa DLH Lumajang, kontak layanan, rekening bank, dan penjadwalan otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving || loading}
            size="sm"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Menyimpan...' : loading ? 'Memuat Pengaturan...' : 'Simpan Semua Pengaturan'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: IDENTITAS APLIKASI & KONTAK & BANK */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="size-4 text-primary" />
              <span>1. Identitas Aplikasi & Rekening Pembayaran</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Informasi dasar sistem dan petunjuk transfer pembayaran resmi bagi masyarakat.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Globe className="size-3.5 text-muted-foreground" />
                  Nama Resmi Aplikasi
                </label>
                <Input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Misal: E-Marisa DLH Lumajang"
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Phone className="size-3.5 text-muted-foreground" />
                  No WhatsApp Layanan CS (Format 62...)
                </label>
                <Input
                  type="text"
                  value={waCs}
                  onChange={(e) => setWaCs(e.target.value)}
                  placeholder="Misal: 6281234567890"
                  className="text-xs font-mono"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Gunakan format internasional tanpa tanda plus atau strip (contoh: 6281234567890).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <CreditCard className="size-3.5 text-muted-foreground" />
                  Bank & Nomor Rekening Tujuan
                </label>
                <Input
                  type="text"
                  value={bankRekening}
                  onChange={(e) => setBankRekening(e.target.value)}
                  placeholder="Misal: BANK JATIM - 1061001847"
                  className="text-xs font-semibold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground" />
                  Atas Nama (a.n) Rekening Bank
                </label>
                <Input
                  type="text"
                  value={atasNama}
                  onChange={(e) => setAtasNama(e.target.value)}
                  placeholder="Misal: Bendahara Penerimaan DLH"
                  className="text-xs"
                  required
                />
              </div>
            </div>

            {/* QRIS Statis Preview & Upload */}
            <div className="pt-2 border-t border-border space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <QrCode className="size-3.5 text-muted-foreground" />
                Gambar QRIS Statis Resmi (Opsional)
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-border bg-muted/20">
                <div className="size-24 rounded-lg border border-border bg-background flex items-center justify-center overflow-hidden shrink-0">
                  {qrisPreview ? (
                    <img src={qrisPreview} alt="Preview QRIS" className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="text-center p-2 text-muted-foreground">
                      <QrCode className="size-8 mx-auto stroke-1" />
                      <span className="text-[10px] block mt-1">Belum ada QRIS</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileToBase64(file, (base64) => {
                          setQrisPreview(base64);
                          toast.success(`Gambar QRIS "${file.name}" siap disimpan`);
                        });
                      }
                    }}
                    className="text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Unggah barcode QRIS standar Bank Indonesia / QRIS Statis DLH Lumajang (PNG/JPG, maks 2MB).
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: LOGO & FAVICON */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="size-4 text-primary" />
              <span>2. Logo & Favicon Resmi DLH</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Aset visual identitas Pemerintah Kabupaten Lumajang untuk kop invoice dan browser favicon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Aplikasi */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Logo Aplikasi (Kop Surat & Header)</label>
                <div className="flex items-center gap-4 p-4 border border-border rounded-xl bg-muted/20">
                  <div className="size-16 rounded-lg border border-border bg-background flex items-center justify-center shrink-0 p-1">
                    <img src={logoPreview} alt="Logo DLH" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileToBase64(file, (base64) => {
                            setLogoPreview(base64);
                            toast.success(`Logo baru "${file.name}" siap disimpan`);
                          });
                        }
                      }}
                      className="text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground">Format PNG transparan disarankan (Maks 2MB).</p>
                  </div>
                </div>
              </div>

              {/* Favicon Browser */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Favicon Browser Tab</label>
                <div className="flex items-center gap-4 p-4 border border-border rounded-xl bg-muted/20">
                  <div className="size-16 rounded-lg border border-border bg-background flex items-center justify-center shrink-0 p-2">
                    <img src={faviconPreview} alt="Favicon" className="size-8 object-contain" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileToBase64(file, (base64) => {
                            setFaviconPreview(base64);
                            toast.success(`Favicon baru "${file.name}" siap disimpan`);
                          });
                        }
                      }}
                      className="text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground">Ukuran 32x32 atau 64x64 piksel (ICO/PNG, maks 1MB).</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3: PESAN BERANDA PUBLIK */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <span>3. Pesan Beranda Publik (Cek Tagihan Warga)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Teks sambutan yang tampil pada halaman cek tagihan mandiri untuk wajib retribusi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Judul Header Beranda</label>
              <Input
                type="text"
                value={berandaTitle}
                onChange={(e) => setBerandaTitle(e.target.value)}
                placeholder="Judul banner utama"
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Deskripsi Singkat / Panduan</label>
              <textarea
                rows={3}
                value={berandaDesc}
                onChange={(e) => setBerandaDesc(e.target.value)}
                placeholder="Penjelasan ringkas mengenai portal layanan pembayaran retribusi..."
                className="w-full px-3 py-2 rounded-lg border border-input bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4: PENJADWALAN CRON JOB OTOMATIS */}
        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="size-4 text-primary" />
                  <span>4. Penjadwalan Terbitan Tagihan Otomatis (Cron Job)</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Sistem pembuat tagihan massal bulanan menggunakan antrean Queue (100 pelanggan/batch).
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">
                  {cronActive ? 'Otomatis Aktif' : 'Non-Aktif'}
                </span>
                <Switch
                  checked={cronActive}
                  onCheckedChange={(checked) => setCronActive(Boolean(checked))}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {cronActive ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tanggal Eksekusi Bulanan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      Tanggal Eksekusi Bulanan
                    </label>
                    <Select
                      value={cronDay}
                      onValueChange={(val) => val && setCronDay(val)}
                    >
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue placeholder="Pilih Tanggal Eksekusi" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                          <SelectItem key={d} value={d.toString()}>
                            Setiap Tanggal {d} Awal Bulan
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">
                      Tagihan baru untuk seluruh Wajib Retribusi aktif akan terbit setiap tanggal {cronDay}.
                    </p>
                  </div>

                  {/* Waktu Eksekusi (WIB) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Clock className="size-3.5 text-muted-foreground" />
                      Waktu Eksekusi (WIB)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Select
                          value={cronHour}
                          onValueChange={(val) => val && setCronHour(val)}
                        >
                          <SelectTrigger className="w-full text-xs font-mono">
                            <SelectValue placeholder="Jam" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map((h) => (
                              <SelectItem key={h} value={h}>
                                Pukul {h}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <span className="text-muted-foreground font-bold">:</span>
                      <div className="flex-1">
                        <Select
                          value={cronMinute}
                          onValueChange={(val) => val && setCronMinute(val)}
                        >
                          <SelectTrigger className="w-full text-xs font-mono">
                            <SelectValue placeholder="Menit" />
                          </SelectTrigger>
                          <SelectContent>
                            {['00', '15', '30', '45'].map((m) => (
                              <SelectItem key={m} value={m}>
                                Menit {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <span className="text-xs text-muted-foreground font-semibold px-2">WIB</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Jadwal cron terdaftar: Pukul {cronHour}:{cronMinute} WIB.
                    </p>
                  </div>
                </div>

                {/* Queue Info Alert */}
                <div className="p-4 rounded-xl border border-border bg-muted/40 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <AlertCircle className="size-4 text-primary" />
                    <span>Mekanisme Eksekusi Antrean (Batch Queue System)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Sistem backend NestJS akan memproses penerbitan tagihan secara bertahap dalam batch berisi 100 KK per iterasi untuk menjaga kestabilan memori dan database server DLH Lumajang.
                  </p>
                </div>

                {/* Manual Execution Test Trigger */}
                <div className="p-4 rounded-xl border border-border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Play className="size-3.5 text-primary" />
                      Uji Coba Eksekusi Manual
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Jalankan penerbitan tagihan massal sekarang secara langsung tanpa menunggu jadwal cron otomatis.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTriggerCronManual}
                    disabled={isExecutingManual}
                    className="gap-1.5 shrink-0"
                  >
                    {isExecutingManual ? (
                      <>
                        <RefreshCw className="size-3.5 animate-spin" />
                        <span>Memproses Queue...</span>
                      </>
                    ) : (
                      <>
                        <Play className="size-3.5" />
                        <span>Jalankan Cron Now</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Execution Result Log */}
                {executionResult && (
                  <div className="p-3 rounded-lg border border-border bg-muted/30 text-xs space-y-1 text-foreground flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Hasil Eksekusi Manual:</p>
                      <p className="text-muted-foreground text-[11px]">{executionResult}</p>
                    </div>
                  </div>
                )}

                {/* Last Execution Info Card */}
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                    Log Eksekusi Terakhir
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-border">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Waktu Terakhir:</span>
                      <span className="font-semibold text-foreground">{lastExecutedAt || '-'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Total Tagihan:</span>
                      <span className="font-semibold text-foreground font-mono">
                        {lastProcessedCount.toLocaleString('id-ID')} Tagihan
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Status:</span>
                      <Badge
                        variant="outline"
                        className={`text-xs font-semibold ${
                          lastCronStatus.toLowerCase().includes('gagal') || lastCronStatus.toLowerCase().includes('error')
                            ? 'border-destructive/40 text-destructive'
                            : 'border-primary/40 text-primary'
                        }`}
                      >
                        {lastCronStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed rounded-xl text-xs text-muted-foreground space-y-2">
                <AlertCircle className="size-8 mx-auto text-muted-foreground stroke-1" />
                <p className="font-medium text-foreground">Cron Job Otomatis Saat Ini Dinonaktifkan</p>
                <p>
                  Tagihan retribusi bulanan tidak akan diterbitkan secara otomatis oleh server. Anda dapat mengaktifkan sakelar di atas jika ingin mengaktifkan jadwal otomatis kembali.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Global Save Button at bottom */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-8 gap-1.5 bg-primary text-primary-foreground font-semibold text-xs"
          >
            <Save className="size-4" />
            {isSaving ? 'Menyimpan Pengaturan...' : 'Simpan Seluruh Pengaturan Sistem'}
          </Button>
        </div>
      </form>
    </div>
  );
}
