import { useState, useEffect, useMemo } from 'react';
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
  Search,
  Printer,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Building2,
  Banknote,
} from 'lucide-react';
import { toast } from 'sonner';
import ReceiptPrint from '@/components/sirs/ReceiptPrint';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';

interface ReceiptRow {
  idKuitansi: string;
  idInvoice: string;
  idPelanggan: string;
  nama: string;
  alamat: string;
  waktuBayar: string;
  bulan: string;
  tahun: string;
  nominal: number;
  admin: string;
  kanal: string;
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

export default function InvoicePage() {
  const [search, setSearch] = useState('');
  const [filterTahun, setFilterTahun] = useState('all');
  const [filterBulan, setFilterBulan] = useState('all');
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [printReceiptData, setPrintReceiptData] = useState<ReceiptRow | null>(null);

  const loadReceipts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/pembayaran`, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.data || [];
        setReceipts(
          rawList.map((p: any) => ({
            idKuitansi: p.id_kuitansi || p.id || '-',
            idInvoice: p.id_invoice || '-',
            idPelanggan: p.id_pelanggan || '-',
            nama: p.pelanggan?.nama || p.nama || p.id_pelanggan || '-',
            alamat: p.pelanggan?.alamat
              ? `${p.pelanggan.alamat} (RT ${p.pelanggan.rt || '01'} / RW ${p.pelanggan.rw || '01'})`
              : '-',
            waktuBayar: p.waktu_bayar
              ? new Date(p.waktu_bayar).toLocaleString('id-ID')
              : new Date(p.created_at || Date.now()).toLocaleString('id-ID'),
            bulan: p.bulan || '-',
            tahun: p.bulan ? p.bulan.split(' ').pop() || '2026' : '2026',
            nominal: Number(p.nominal) || 0,
            admin: p.admin || 'Petugas DLH',
            kanal: p.referensi_bank
              ? `Bank SNAP (Ref: ${p.referensi_bank})`
              : 'Loket Tunai DLH',
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load pembayaran API:', err);
      toast.error('Gagal mengambil arsip kuitansi dari server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  const availableYears = useMemo(() => {
    const set = new Set<string>();
    const currentYr = new Date().getFullYear();
    for (let i = currentYr - 2; i <= currentYr + 5; i++) {
      set.add(i.toString());
    }
    receipts.forEach((r) => {
      if (r.tahun && /^\d{4}$/.test(r.tahun)) set.add(r.tahun);
    });
    return Array.from(set).sort().reverse();
  }, [receipts]);

  const filteredReceipts = useMemo(() => {
    return receipts
      .filter((item) => {
        const namaStr = (item.nama || '').toLowerCase();
        const idStr = (item.idPelanggan || '').toLowerCase();
        const kuitansiStr = (item.idKuitansi || '').toLowerCase();
        const searchLower = search.toLowerCase();

        const matchSearch =
          search === '' ||
          namaStr.includes(searchLower) ||
          idStr.includes(searchLower) ||
          kuitansiStr.includes(searchLower);
        const matchTahun = filterTahun === 'all' || item.tahun === filterTahun;
        const matchBulan =
          filterBulan === 'all' ||
          item.bulan.toLowerCase().includes(filterBulan.toLowerCase());
        return matchSearch && matchTahun && matchBulan;
      })
      .sort((a, b) => {
        const yearA = parseInt(a.tahun || '0', 10);
        const yearB = parseInt(b.tahun || '0', 10);
        if (yearA !== yearB) return yearA - yearB;
        return getMonthNumber(a.bulan) - getMonthNumber(b.bulan);
      });
  }, [receipts, search, filterTahun, filterBulan]);

  const totalPages = Math.max(1, Math.ceil(filteredReceipts.length / itemsPerPage));
  const paginatedReceipts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReceipts.slice(start, start + itemsPerPage);
  }, [filteredReceipts, currentPage]);

  const handlePrintReceipt = (row: ReceiptRow) => {
    setPrintReceiptData(row);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleExportCSV = () => {
    let csv =
      'No Kuitansi,ID Wajib Retribusi,Nama,Waktu Bayar,Periode,Nominal,Penerima,Kanal\n';
    filteredReceipts.forEach((r) => {
      const cleanNama = r.nama.replace(/"/g, '""');
      const cleanPenerima = r.admin.replace(/"/g, '""');
      const cleanKanal = r.kanal.replace(/"/g, '""');
      csv += `"${r.idKuitansi}","${r.idPelanggan}","${cleanNama}","${r.waktuBayar}","${r.bulan}",${r.nominal},"${cleanPenerima}","${cleanKanal}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bukti_Tanda_Terima_Invoice_${filteredReceipts.length}_rows.csv`;
    link.click();
    toast.success(`Export rekap CSV berhasil (${filteredReceipts.length} baris data)`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Bukti Tanda Terima (Invoice)
            </h1>
            <Badge variant="secondary" className="font-medium text-xs">
              {filteredReceipts.length} Kuitansi Lunas
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Daftar resmi seluruh transaksi pembayaran retribusi yang telah terverifikasi dan sah.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export Rekap CSV
        </Button>
      </div>

      {/* Unified Table Card with Filters */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-4 border-b">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            {/* Search Input */}
            <div className="lg:col-span-6 space-y-1.5">
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
                  placeholder="Cari No. Kuitansi, ID Pelanggan, atau Nama..."
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            {/* Filter Tahun */}
            <div className="lg:col-span-3 space-y-1.5">
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
            <div className="lg:col-span-3 space-y-1.5">
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
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[140px]">No. Kuitansi</TableHead>
                <TableHead className="w-[120px]">ID Pelanggan</TableHead>
                <TableHead>Nama Pelanggan</TableHead>
                <TableHead>Waktu Bayar</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Penerima / Kanal</TableHead>
                <TableHead className="text-center w-[110px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceipts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="p-10 text-center text-xs text-muted-foreground"
                  >
                    {isLoading
                      ? 'Memuat data kuitansi...'
                      : 'Belum ada bukti tanda terima pembayaran.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReceipts.map((item) => (
                  <TableRow key={item.idKuitansi} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      {item.idKuitansi}
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
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {item.waktuBayar}
                    </TableCell>
                    <TableCell className="text-xs font-semibold">{item.bulan}</TableCell>
                    <TableCell className="font-bold text-emerald-700 dark:text-emerald-400">
                      Rp {item.nominal.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-semibold text-foreground">{item.admin}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        {item.kanal.includes('SNAP') ? (
                          <Building2 className="w-3 h-3 text-sky-600 shrink-0" />
                        ) : (
                          <Banknote className="w-3 h-3 text-amber-600 shrink-0" />
                        )}
                        <span>{item.kanal}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintReceipt(item)}
                        className="h-8 text-xs font-semibold text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20"
                        title="Cetak Kuitansi Resmi"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" />
                        Cetak
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t text-xs text-muted-foreground">
          <div>
            Menampilkan{' '}
            <span className="font-bold text-foreground">
              {filteredReceipts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </span>{' '}
            -{' '}
            <span className="font-bold text-foreground">
              {Math.min(currentPage * itemsPerPage, filteredReceipts.length)}
            </span>{' '}
            dari{' '}
            <span className="font-bold text-foreground">
              {filteredReceipts.length.toLocaleString('id-ID')}
            </span>{' '}
            kuitansi
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

      {/* PRINTABLE SINGLE RECEIPT TEMPLATE */}
      {printReceiptData && (
        <div className="printable-receipt-area hidden">
          <ReceiptPrint
            invoiceId={printReceiptData.idInvoice}
            waktu={printReceiptData.waktuBayar}
            bulan={printReceiptData.bulan}
            idPelanggan={printReceiptData.idPelanggan}
            nama={printReceiptData.nama}
            alamat={printReceiptData.alamat}
            nominal={printReceiptData.nominal}
            admin={printReceiptData.admin}
          />
        </div>
      )}
    </div>
  );
}
