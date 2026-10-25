import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Search,
  Printer,
  Banknote,
  CheckCircle2,
  XCircle,
  Zap,
  QrCode,
  CreditCard,
  User,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Camera,
  Upload,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import KopSurat from '@/components/sirs/KopSurat';
import ReceiptPrint from '@/components/sirs/ReceiptPrint';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import { buildAspiQrisPayload } from '@/lib/qris';

interface InvoiceRow {
  idInvoice: string;
  idPelanggan: string;
  nama: string;
  alamat: string;
  rt: string;
  rw: string;
  tahun: string;
  bulan: string;
  nominal: number;
  status: string;
  penerima: string;
  buktiUrl?: string;
}

const BULAN_LIST = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const getMonthNumber = (bulanStr?: string): number => {
  if (!bulanStr) return 1;
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
  return 1;
};

export default function TagihanPage() {
  const [search, setSearch] = useState('');
  const [filterTahun, setFilterTahun] = useState('all');
  const [filterBulan, setFilterBulan] = useState('all');
  const [filterBatch, setFilterBatch] = useState('all'); // 'all' | 'batch1' | 'batch2'
  const [filterStatus, setFilterStatus] = useState('all');

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Print States
  const [printReceiptData, setPrintReceiptData] = useState<InvoiceRow | null>(null);
  const [showPrintReport, setShowPrintReport] = useState(false);
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);

  // Pay Modal States
  const [payModalData, setPayModalData] = useState<InvoiceRow | null>(null);
  const [payMethod, setPayMethod] = useState<'tunai' | 'qris'>('tunai');
  const [buktiImage, setBuktiImage] = useState<string>('');
  const [officerName, setOfficerName] = useState<string>('Petugas Loket DLH');
  const [isProcessingPay, setIsProcessingPay] = useState(false);

  // Camera States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Generate Mass Invoices Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genTahun, setGenTahun] = useState(new Date().getFullYear().toString());
  const [genBulan, setGenBulan] = useState('Juli');
  const [isGenerating, setIsGenerating] = useState(false);

  const availableYears = useMemo(() => {
    const set = new Set<string>();
    const currentYr = new Date().getFullYear();
    for (let i = currentYr - 2; i <= currentYr + 5; i++) {
      set.add(i.toString());
    }
    invoices.forEach((inv) => {
      if (inv.tahun && /^\d{4}$/.test(inv.tahun)) set.add(inv.tahun);
    });
    return Array.from(set).sort().reverse();
  }, [invoices]);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/tagihan`, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.data || [];
        setInvoices(
          rawList.map((inv: any) => ({
            idInvoice: inv.id_invoice || `INV-${inv.id}`,
            idPelanggan: inv.id_pelanggan || '-',
            nama: inv.pelanggan?.nama || inv.nama || inv.id_pelanggan || '-',
            alamat: inv.pelanggan?.alamat || inv.alamat || '-',
            rt: inv.pelanggan?.rt || '01',
            rw: inv.pelanggan?.rw || '01',
            tahun: inv.bulan ? inv.bulan.split(' ').pop() || '2026' : '2026',
            bulan: inv.bulan || 'Maret 2026',
            nominal: Number(inv.nominal) || 0,
            status:
              inv.status?.toLowerCase() === 'lunas'
                ? 'Lunas'
                : 'Belum Lunas',
            penerima: inv.penerima || '-',
            buktiUrl: inv.bukti_url || '',
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load tagihan API:', err);
      toast.error('Gagal mengambil data tagihan dari server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((item) => {
        const namaStr = (item.nama || '').toLowerCase();
        const idStr = (item.idPelanggan || '').toLowerCase();
        const invStr = (item.idInvoice || '').toLowerCase();
        const searchLower = search.toLowerCase();

        const matchSearch =
          search === '' ||
          namaStr.includes(searchLower) ||
          idStr.includes(searchLower) ||
          invStr.includes(searchLower);
        const matchTahun = filterTahun === 'all' || item.tahun === filterTahun;
        const matchBulan =
          filterBulan === 'all' ||
          (item.bulan || '').toLowerCase().includes(filterBulan.toLowerCase());
        const matchStatus = filterStatus === 'all' || item.status === filterStatus;

        const monthNum = getMonthNumber(item.bulan);
        const matchBatch =
          filterBatch === 'all' ||
          (filterBatch === 'batch1' && monthNum >= 1 && monthNum <= 6) ||
          (filterBatch === 'batch2' && monthNum >= 7 && monthNum <= 12);

        return matchSearch && matchTahun && matchBulan && matchStatus && matchBatch;
      })
      .sort((a, b) => {
        const yearA = parseInt(a.tahun || '0', 10);
        const yearB = parseInt(b.tahun || '0', 10);
        if (yearA !== yearB) return yearA - yearB;
        return getMonthNumber(a.bulan) - getMonthNumber(b.bulan);
      });
  }, [invoices, search, filterTahun, filterBulan, filterBatch, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage));
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  const totalNominal = filteredInvoices.reduce((acc, curr) => acc + curr.nominal, 0);
  const totalLunas = filteredInvoices
    .filter((inv) => inv.status === 'Lunas')
    .reduce((acc, curr) => acc + curr.nominal, 0);
  const totalBelumLunas = totalNominal - totalLunas;

  // Single Receipt Print
  const handleTriggerSingleReceiptPrint = (row: InvoiceRow) => {
    setShowPrintReport(false);
    setPrintReceiptData(row);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Full Report Print
  const handleTriggerFullReportPrint = () => {
    setPrintReceiptData(null);
    setShowPrintReport(true);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Camera Management
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      toast.error('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    const maxWidth = 1000;
    const origWidth = videoRef.current.videoWidth || 1280;
    const origHeight = videoRef.current.videoHeight || 720;
    const scale = Math.min(1, maxWidth / origWidth);
    canvas.width = origWidth * scale;
    canvas.height = origHeight * scale;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      setBuktiImage(dataUrl);
      stopCamera();
      toast.success('Foto bukti pembayaran berhasil diambil');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSizeBytes = 2 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        toast.error('Ukuran file melebihi batas 2MB. Silakan pilih foto lain yang lebih kecil.');
        e.target.value = '';
        return;
      }

      const img = new Image();
      const reader = new FileReader();
      reader.onload = (event) => {
        img.src = event.target?.result as string;
      };
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 1000;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          setBuktiImage(compressed);
        } else {
          setBuktiImage(img.src);
        }
        toast.success('Gambar bukti pembayaran berhasil dioptimalkan');
      };
      img.onerror = () => {
        toast.error('Gagal memproses file gambar.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMarkAsPaid = async (idInvoice: string) => {
    setIsProcessingPay(true);
    try {
      const finalPenerima =
        payMethod === 'tunai'
          ? `Loket Tunai (${officerName || 'Petugas DLH'})`
          : `QRIS / Transfer (${officerName || 'Petugas DLH'})`;

      const payload = {
        idInvoice,
        status: 'Lunas',
        admin: finalPenerima,
        buktiUrl: buktiImage || undefined,
      };

      const res = await fetch(`${API_BASE_URL}/pembayaran`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          `Pembayaran ${
            payMethod === 'tunai' ? 'Tunai di Loket' : 'QRIS'
          } berhasil dikonfirmasi LUNAS!`
        );
        stopCamera();
        setPayModalData(null);
        setBuktiImage('');
        await loadInvoices();
      } else {
        const errData = await res.json().catch(() => null);
        toast.error(`Gagal: ${errData?.message || 'Gagal mengonfirmasi pembayaran'}`);
      }
    } catch (err) {
      console.error('Error confirming payment:', err);
      toast.error('Gagal terhubung ke server backend');
    } finally {
      setIsProcessingPay(false);
    }
  };

  const handleGenerateInvoices = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/tagihan/generate-massal`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ bulan: genBulan, tahun: genTahun }),
      });

      if (res.ok) {
        const result = await res.json();
        const msg =
          result.message ||
          result.pesan ||
          `Berhasil menerbitkan tagihan retribusi untuk periode ${genBulan} ${genTahun}!`;
        toast.success(msg);
        setShowGenerateModal(false);
        await loadInvoices();
      } else {
        toast.error('Gagal menerbitkan tagihan massal');
      }
    } catch (err) {
      console.error('Error generating mass invoices:', err);
      toast.error('Gagal terhubung ke server backend');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Riwayat & Loket Tagihan
            </h1>
            <Badge variant="secondary" className="font-medium text-xs">
              {filteredInvoices.length.toLocaleString('id-ID')} Tagihan
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Terbitkan tagihan bulanan massal, konfirmasi pembayaran loket tunai/QRIS, dan cetak kuitansi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowGenerateModal(true)}
          >
            <Zap className="mr-2 h-4 w-4" />
            Terbitkan Tagihan Bulanan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerFullReportPrint}
          >
            <Printer className="mr-2 h-4 w-4" />
            Laporan PDF
          </Button>
        </div>
      </div>

      {/* Unified Table Card with Filters */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-4 border-b">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            {/* Search Input */}
            <div className="lg:col-span-3 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Pencarian
              </label>
              <div className="relative">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari ID Pelanggan, Nama, No. Invoice..."
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            {/* Filter Batch 6 Bulan (Semester) */}
            <div className="lg:col-span-3 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-emerald-600" />
                Periode Batch (6 Bulan)
              </label>
              <Select
                value={filterBatch}
                onValueChange={(val) => {
                  if (val) {
                    setFilterBatch(val);
                    setCurrentPage(1);
                  }
                }}
              >
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Semua Periode (12 Bulan)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Periode (12 Bulan)</SelectItem>
                  <SelectItem value="batch1">Batch 1 (Semester I: Jan - Jun)</SelectItem>
                  <SelectItem value="batch2">Batch 2 (Semester II: Jul - Des)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Tahun */}
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Tahun
              </label>
              <Select
                value={filterTahun}
                onValueChange={(val) => {
                  if (val) {
                    setFilterTahun(val);
                    setCurrentPage(1);
                  }
                }}
              >
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Semua Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {availableYears.map((yr) => (
                    <SelectItem key={yr} value={yr}>
                      {yr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Bulan */}
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Bulan
              </label>
              <Select
                value={filterBulan}
                onValueChange={(val) => {
                  if (val) {
                    setFilterBulan(val);
                    setCurrentPage(1);
                  }
                }}
              >
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Semua Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {BULAN_LIST.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Status Tagihan */}
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Status Tagihan
              </label>
              <Select
                value={filterStatus}
                onValueChange={(val) => {
                  if (val) {
                    setFilterStatus(val);
                    setCurrentPage(1);
                  }
                }}
              >
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Belum Lunas">Belum Lunas</SelectItem>
                  <SelectItem value="Lunas">Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[140px]">No. Invoice</TableHead>
                <TableHead className="w-[120px]">ID Pelanggan</TableHead>
                <TableHead>Nama Pelanggan</TableHead>
                <TableHead className="text-center w-[70px]">RT / RW</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Waktu Bayar / Kanal</TableHead>
                <TableHead className="text-center w-[120px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="p-10 text-center text-xs text-muted-foreground"
                  >
                    {isLoading
                      ? 'Memuat data tagihan...'
                      : 'Belum ada data tagihan yang sesuai dengan kriteria filter.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInvoices.map((item) => {
                  const isLunas = item.status === 'Lunas';
                  return (
                    <TableRow key={item.idInvoice} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        {item.idInvoice}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                        >
                          {item.idPelanggan}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {item.nama}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">
                        {item.rt} / {item.rw}
                      </TableCell>
                      <TableCell className="text-xs font-medium">{item.bulan}</TableCell>
                      <TableCell className="font-bold text-foreground">
                        Rp {item.nominal.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={isLunas ? 'secondary' : 'destructive'}
                          className={`font-semibold text-xs ${
                            isLunas
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isLunas ? (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {isLunas ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-foreground">{item.penerima}</span>
                            {item.buktiUrl && (
                              <button
                                type="button"
                                onClick={() => setViewProofUrl(item.buktiUrl || null)}
                                className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                              >
                                <Camera className="w-3 h-3" /> Foto Bukti
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {!isLunas ? (
                            <Button
                              size="sm"
                              onClick={() => {
                                setPayModalData(item);
                                setPayMethod('tunai');
                                setBuktiImage('');
                              }}
                              className="h-8 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                            >
                              <Banknote className="w-3.5 h-3.5 mr-1" />
                              Bayar Loket
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTriggerSingleReceiptPrint(item)}
                              className="h-8 text-xs font-semibold text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20"
                            >
                              <Printer className="w-3.5 h-3.5 mr-1" />
                              Cetak
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t text-xs text-muted-foreground">
          <div>
            Menampilkan{' '}
            <span className="font-bold text-foreground">
              {filteredInvoices.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </span>{' '}
            -{' '}
            <span className="font-bold text-foreground">
              {Math.min(currentPage * itemsPerPage, filteredInvoices.length)}
            </span>{' '}
            dari{' '}
            <span className="font-bold text-foreground">
              {filteredInvoices.length.toLocaleString('id-ID')}
            </span>{' '}
            tagihan
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-foreground px-2">
              Halaman {currentPage} dari {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Bayar Loket Dialog (Tabs: Loket Tunai vs QRIS ASPI) */}
      <Dialog
        open={Boolean(payModalData)}
        onOpenChange={(open) => {
          if (!open) {
            stopCamera();
            setPayModalData(null);
            setBuktiImage('');
          }
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Banknote className="w-5 h-5 text-emerald-600" />
              Loket Pembayaran Retribusi
            </DialogTitle>
            <DialogDescription>
              Pilih metode penyelesaian pembayaran tunai di loket DLH atau scan QRIS ASPI dinamis.
            </DialogDescription>
          </DialogHeader>

          {payModalData && (
            <div className="space-y-4 pt-1">
              {/* Billing Summary Box */}
              <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-emerald-600" /> Wajib Retribusi:
                  </span>
                  <span className="font-bold text-foreground">{payModalData.nama}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> ID Pelanggan:
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {payModalData.idPelanggan}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Periode Tagihan:
                  </span>
                  <span className="font-semibold text-foreground">{payModalData.bulan}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="font-bold text-foreground text-sm">Total Nominal:</span>
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                    Rp {payModalData.nominal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Tabs: Tunai vs QRIS */}
              <Tabs
                value={payMethod}
                onValueChange={(v) => {
                  if (v) {
                    setPayMethod(v as 'tunai' | 'qris');
                    stopCamera();
                  }
                }}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tunai" className="text-xs font-bold">
                    <Banknote className="w-3.5 h-3.5 mr-1.5" />
                    Loket (Tunai)
                  </TabsTrigger>
                  <TabsTrigger value="qris" className="text-xs font-bold">
                    <QrCode className="w-3.5 h-3.5 mr-1.5" />
                    QRIS (ASPI)
                  </TabsTrigger>
                </TabsList>

                {/* Tunai Tab Content */}
                <TabsContent value="tunai" className="space-y-4 pt-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Nama Petugas Loket / Penerima
                    </label>
                    <Input
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      placeholder="Contoh: Petugas Loket DLH"
                      className="text-xs"
                    />
                  </div>

                  {/* Upload & Webcam Capture Section */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">
                      Unggah Bukti Bayar / Tangkap Kamera Loket (Maksimal 2MB)
                    </label>

                    <div className="flex gap-2">
                      <label className="flex-1 py-2 px-3 rounded-lg border border-border text-xs font-semibold text-foreground bg-muted/30 hover:bg-muted cursor-pointer flex items-center justify-center gap-2 transition-colors">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        <span>Upload File Gambar</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>

                      {!isCameraActive ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={startCamera}
                          className="flex-1 text-xs font-semibold"
                        >
                          <Camera className="w-4 h-4 mr-1.5 text-indigo-600" />
                          Buka Kamera Loket
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={stopCamera}
                          className="text-xs font-semibold"
                        >
                          Tutup Kamera
                        </Button>
                      )}
                    </div>

                    {/* Live Webcam Stream */}
                    {isCameraActive && (
                      <div className="relative rounded-xl overflow-hidden border-2 border-indigo-500 bg-black space-y-2 p-2">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="flex justify-center pt-1">
                          <Button
                            type="button"
                            size="sm"
                            onClick={capturePhoto}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                          >
                            <Camera className="w-4 h-4 mr-1.5" />
                            Ambil Foto Bukti (Snapshot)
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Thumbnail Preview */}
                    {buktiImage && (
                      <div className="p-2 border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl flex items-center gap-3">
                        <img
                          src={buktiImage}
                          alt="Bukti Pembayaran"
                          className="w-14 h-14 object-cover rounded-lg border border-emerald-300"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300 truncate">
                            Foto Bukti Terlampir
                          </p>
                          <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                            Tersimpan dalam format terkompresi
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setBuktiImage('')}
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* QRIS Tab Content */}
                <TabsContent value="qris" className="pt-3">
                  <div className="flex flex-col items-center justify-center p-6 bg-card rounded-xl border-2 border-dashed border-emerald-500/40 space-y-3 text-center">
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                    >
                      <QrCode className="w-3.5 h-3.5 mr-1" /> Dynamic QRIS (ASPI)
                    </Badge>

                    <div className="p-3 bg-white rounded-xl shadow-xs border border-border">
                      <QRCodeSVG
                        value={buildAspiQrisPayload(
                          payModalData.idInvoice,
                          payModalData.nominal
                        )}
                        size={170}
                        level="H"
                      />
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                      Pindai kode QRIS di atas melalui aplikasi Mobile Banking Bank Jatim,
                      GoPay, OVO, ShopeePay, Dana, BCA, atau dompet digital lainnya.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    stopCamera();
                    setPayModalData(null);
                    setBuktiImage('');
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isProcessingPay}
                  onClick={() => handleMarkAsPaid(payModalData.idInvoice)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  {isProcessingPay
                    ? 'Memproses...'
                    : payMethod === 'tunai'
                    ? 'Konfirmasi Bayar Tunai'
                    : 'Konfirmasi Lunas via QRIS'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Mass Invoices Dialog */}
      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Terbitkan Tagihan Bulanan Massal
            </DialogTitle>
            <DialogDescription>
              Sistem akan memproses penerbitan tagihan retribusi sampah untuk seluruh Wajib
              Retribusi aktif pada periode yang dipilih.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Tahun Tagihan
              </label>
              <Select value={genTahun} onValueChange={(val) => val && setGenTahun(val)}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((yr) => (
                    <SelectItem key={yr} value={yr}>
                      {yr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Periode Bulan
              </label>
              <Select value={genBulan} onValueChange={(val) => val && setGenBulan(val)}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent>
                  {BULAN_LIST.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Nominal tagihan dihitung otomatis berdasarkan tarif daya listrik (VA) masing-masing
              pelanggan sesuai peraturan daerah yang berlaku.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowGenerateModal(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isGenerating}
              onClick={handleGenerateInvoices}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
            >
              <Zap className="w-4 h-4 mr-1.5 text-amber-300" />
              {isGenerating ? 'Memproses...' : 'Terbitkan Sekarang'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proof Photo Preview Dialog */}
      <Dialog
        open={Boolean(viewProofUrl)}
        onOpenChange={(open) => {
          if (!open) setViewProofUrl(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              Bukti Foto Pembayaran Loket
            </DialogTitle>
          </DialogHeader>

          {viewProofUrl && (
            <div className="p-2 bg-slate-950 rounded-xl flex items-center justify-center">
              <img
                src={viewProofUrl}
                alt="Bukti Bayar"
                className="max-h-[60vh] object-contain rounded-lg"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setViewProofUrl(null)}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PRINTABLE SINGLE RECEIPT TEMPLATE */}
      {printReceiptData && (
        <div className="printable-receipt-area hidden">
          <ReceiptPrint
            invoiceId={printReceiptData.idInvoice}
            waktu="14:20:05 26/07/2026"
            bulan={printReceiptData.bulan}
            idPelanggan={printReceiptData.idPelanggan}
            nama={printReceiptData.nama}
            alamat={printReceiptData.alamat}
            nominal={printReceiptData.nominal}
            admin={printReceiptData.penerima}
          />
        </div>
      )}

      {/* PRINTABLE FULL REPORT DOCUMENT */}
      {showPrintReport && (
        <div className="printable-receipt-area hidden">
          <div className="max-w-4xl mx-auto p-8 bg-white font-sans text-slate-800 space-y-6">
            <KopSurat subTitle="DINAS LINGKUNGAN HIDUP" />

            <div className="text-center pt-2 border-t border-slate-300 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wide">
                {filterBatch === 'batch1'
                  ? 'LAPORAN REKAPITULASI SEMESTER I (BATCH 1: BULAN 1 - 6)'
                  : filterBatch === 'batch2'
                  ? 'LAPORAN REKAPITULASI SEMESTER II (BATCH 2: BULAN 7 - 12)'
                  : 'LAPORAN REKAPITULASI TAGIHAN RETRIBUSI SAMPAH (12 BULAN)'}
              </h3>
              <p className="text-xs text-slate-500">
                Tahun {filterTahun !== 'all' ? filterTahun : '2026'} | Filter Status:{' '}
                {filterStatus !== 'all' ? filterStatus : 'Semua Status'}
              </p>
            </div>

            {/* 3 Summary Boxes */}
            <div className="grid grid-cols-3 gap-4 text-xs font-semibold bg-slate-100 p-4 rounded-xl border border-slate-300 text-center">
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">
                  Total Tagihan ({filteredInvoices.length} Inv)
                </span>
                <span className="text-sm font-bold text-slate-900">
                  Rp {totalNominal.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">
                  Realisasi Lunas
                </span>
                <span className="text-sm font-bold text-emerald-700">
                  Rp {totalLunas.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">
                  Piutang Belum Lunas
                </span>
                <span className="text-sm font-bold text-rose-600">
                  Rp {totalBelumLunas.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="w-full">
              <table className="w-full table-fixed text-[9px] text-left border-collapse border-2 border-slate-600">
                <thead className="bg-slate-200 text-slate-900 font-bold border-b-2 border-slate-600">
                  <tr>
                    <th className="p-1 border border-slate-400 text-center w-[28px]">No</th>
                    <th className="p-1 border border-slate-400 w-[70px] truncate">Bulan</th>
                    <th className="p-1 border border-slate-400 w-[115px] truncate">
                      No. Invoice
                    </th>
                    <th className="p-1 border border-slate-400 w-[80px] truncate">
                      ID Pelanggan
                    </th>
                    <th className="p-1 border border-slate-400 w-[95px] truncate">
                      Nama Pelanggan
                    </th>
                    <th className="p-1 border border-slate-400 text-center w-[42px]">
                      RT / RW
                    </th>
                    <th className="p-1 border border-slate-400 text-right w-[60px] truncate">
                      Nominal
                    </th>
                    <th className="p-1 border border-slate-400 text-center w-[65px] truncate">
                      Status
                    </th>
                    <th className="p-1 border border-slate-400 w-[85px] truncate">Penerima</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv, idx) => (
                    <tr key={inv.idInvoice} className="border-b border-slate-300">
                      <td className="p-1 border border-slate-300 text-center font-mono">
                        {idx + 1}
                      </td>
                      <td className="p-1 border border-slate-300 font-bold truncate">
                        {inv.bulan}
                      </td>
                      <td className="p-1 border border-slate-300 font-mono font-bold text-[8px] truncate">
                        {inv.idInvoice}
                      </td>
                      <td className="p-1 border border-slate-300 font-mono font-bold text-[8px] truncate">
                        {inv.idPelanggan}
                      </td>
                      <td className="p-1 border border-slate-300 font-bold truncate">
                        {inv.nama}
                      </td>
                      <td className="p-1 border border-slate-300 text-center font-semibold whitespace-nowrap">
                        {inv.rt} / {inv.rw}
                      </td>
                      <td className="p-1 border border-slate-300 text-right font-semibold truncate">
                        Rp {inv.nominal.toLocaleString('id-ID')}
                      </td>
                      <td className="p-1 border border-slate-300 text-center font-bold truncate">
                        {inv.status.toUpperCase()}
                      </td>
                      <td className="p-1 border border-slate-300 font-medium truncate">
                        {inv.penerima}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature Block */}
            <div className="pt-8 flex justify-between text-xs">
              <div className="text-center space-y-12">
                <p>Bendahara Penerimaan</p>
                <p className="font-bold underline uppercase">( Bendahara DLH )</p>
              </div>
              <div className="text-center space-y-12">
                <p>
                  Lumajang,{' '}
                  {new Date().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="font-bold underline uppercase">
                  Kepala Dinas Lingkungan Hidup
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
