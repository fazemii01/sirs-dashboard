import { useState, useMemo, useEffect } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search,
  Plus,
  FileSpreadsheet,
  FileDown,
  Printer,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Phone,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import KopSurat from '@/components/sirs/KopSurat';
import TarifCombobox from '@/components/sirs/TarifCombobox';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';

interface Pelanggan {
  id: string;
  nama: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  va: number;
  noHp: string;
}

interface WilayahItem {
  id?: number;
  kecamatan: string;
  kelurahan: string;
  kode_kel?: string;
}

interface TarifItem {
  va: number;
  nama: string;
  nominal: number;
  kategori?: string;
}

const DEFAULT_TARIF: TarifItem[] = [
  { va: 450, nama: 'Rumah Tangga R1-450VA', nominal: 3000 },
  { va: 900, nama: 'Rumah Tangga R1-900VA', nominal: 8000 },
  { va: 1300, nama: 'Rumah Tangga R1-1300VA', nominal: 8000 },
  { va: 2200, nama: 'Rumah Tangga R1-2200VA', nominal: 8000 },
  { va: 3500, nama: 'Rumah Tangga R2-3500VA (Mewah)', nominal: 15000 },
  { va: 5500, nama: 'Komersial / Minimarket (5500VA)', nominal: 15000 },
  { va: 6600, nama: 'Toko / Ruko Niaga', nominal: 25000 },
];

const DEFAULT_KECAMATAN = [
  'Lumajang',
  'Sukodono',
  'Pasrujambe',
  'Senduro',
  'Gucialit',
  'Padang',
  'Klakah',
  'Ranuyoso',
  'Randuagung',
  'Jatiroto',
  'Rowokangkung',
  'Yosowilangun',
  'Tekung',
  'Kunir',
  'Tempeh',
  'Pasirian',
  'Candipuro',
  'Pronojiwo',
  'Tempursari',
  'Sumbersuko',
];

const DEFAULT_KELURAHAN = [
  { nama: 'Jogoyudan', kode: 'JGY' },
  { nama: 'Jogotrunan', kode: 'JGT' },
  { nama: 'Rogotrunan', kode: 'RGT' },
  { nama: 'Citrodiwangsan', kode: 'CTR' },
  { nama: 'Tompokersan', kode: 'TMP' },
  { nama: 'Kepuharjo', kode: 'KPH' },
  { nama: 'Ditotrunan', kode: 'DTR' },
];

export default function PelangganPage() {
  const [search, setSearch] = useState('');
  const [filterKel, setFilterKel] = useState('all');
  const [filterKec, setFilterKec] = useState('all');
  const [filterVa, setFilterVa] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [modalOpen, setModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResultMsg, setCsvResultMsg] = useState('');
  const [selectedItem, setSelectedItem] = useState<Pelanggan | null>(null);
  const [showPrintReport, setShowPrintReport] = useState(false);

  // Delete Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Pelanggan | null>(null);

  // Form states (RT and RW separated per spec)
  const [formNama, setFormNama] = useState('');
  const [formAlamat, setFormAlamat] = useState('');
  const [formRt, setFormRt] = useState('01');
  const [formRw, setFormRw] = useState('01');
  const [formKel, setFormKel] = useState('Jogoyudan');
  const [formKec, setFormKec] = useState('Lumajang');
  const [formVa, setFormVa] = useState('900');
  const [formHp, setFormHp] = useState('');

  const [livePelanggan, setLivePelanggan] = useState<Pelanggan[]>([]);
  const [masterWilayahList, setMasterWilayahList] = useState<WilayahItem[]>([]);
  const [masterTarifList, setMasterTarifList] = useState<TarifItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/pelanggan`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.data || [];
        setLivePelanggan(
          rawList.map((p: any) => ({
            id: p.id_pelanggan || p.id || '-',
            nama: p.nama || '-',
            alamat: p.alamat || '-',
            rt: p.rt || '01',
            rw: p.rw || '01',
            kelurahan: p.kelurahan || 'Lumajang',
            kecamatan: p.kecamatan || 'Lumajang',
            va: Number(p.va) || 900,
            noHp: p.no_hp || '-',
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load pelanggan API:', err);
      toast.error('Gagal mengambil data pelanggan dari server');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWilayahList = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/wilayah`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.data || [];
        setMasterWilayahList(rawList);
      }
    } catch (err) {
      console.error('Failed to load master wilayah API:', err);
    }
  };

  const loadTarifList = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tarif`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.data || [];
        if (rawList.length > 0) {
          setMasterTarifList(
            rawList.map((t: any) => ({
              va: Number(t.va),
              nama: t.nama_tarif || t.nama || `Tarif ${t.va} VA`,
              nominal: Number(t.nominal) || 0,
              kategori: t.kategori,
            }))
          );
        }
      }
    } catch (err) {
      console.error('Failed to load master tarif API:', err);
    }
  };

  useEffect(() => {
    loadData();
    loadWilayahList();
    loadTarifList();
  }, []);

  const dynamicTarifList = useMemo(() => {
    if (masterTarifList.length > 0) {
      return [...masterTarifList].sort((a, b) => a.va - b.va);
    }
    return DEFAULT_TARIF;
  }, [masterTarifList]);

  const dynamicKecamatanList = useMemo(() => {
    const setKec = new Set<string>();
    masterWilayahList.forEach((w) => {
      if (w.kecamatan) setKec.add(w.kecamatan.trim());
    });
    if (setKec.size === 0) {
      DEFAULT_KECAMATAN.forEach((k) => setKec.add(k));
    }
    return Array.from(setKec).sort();
  }, [masterWilayahList]);

  const dynamicKelurahanOptions = useMemo(() => {
    const matches = masterWilayahList.filter(
      (w) => w.kecamatan && w.kecamatan.toLowerCase().trim() === formKec.toLowerCase().trim()
    );
    if (matches.length > 0) {
      return matches.map((w) => ({
        nama: w.kelurahan,
        kode: w.kode_kel || w.kelurahan.slice(0, 3).toUpperCase(),
      }));
    }
    return DEFAULT_KELURAHAN;
  }, [masterWilayahList, formKec]);

  const dynamicAllKelurahanFilterList = useMemo(() => {
    const setKel = new Set<string>();
    masterWilayahList.forEach((w) => {
      if (w.kelurahan) setKel.add(w.kelurahan.trim());
    });
    if (setKel.size === 0) {
      DEFAULT_KELURAHAN.forEach((k) => setKel.add(k.nama));
    }
    return Array.from(setKel).sort();
  }, [masterWilayahList]);

  const filteredData = useMemo(() => {
    return livePelanggan.filter((item) => {
      const searchLower = search.toLowerCase();
      const matchSearch =
        search === '' ||
        item.nama.toLowerCase().includes(searchLower) ||
        item.id.toLowerCase().includes(searchLower);
      const matchKel = filterKel === 'all' || item.kelurahan === filterKel;
      const matchKec = filterKec === 'all' || item.kecamatan === filterKec;
      const matchVa = filterVa === 'all' || item.va.toString() === filterVa;
      return matchSearch && matchKel && matchKec && matchVa;
    });
  }, [livePelanggan, search, filterKel, filterKec, filterVa]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleOpenModal = (item?: Pelanggan) => {
    loadWilayahList();
    loadTarifList();
    if (item) {
      setSelectedItem(item);
      setFormNama(item.nama);
      setFormAlamat(item.alamat);
      setFormRt(item.rt || '01');
      setFormRw(item.rw || '01');
      setFormKel(item.kelurahan || 'Jogoyudan');
      setFormKec(item.kecamatan || 'Lumajang');
      setFormVa(item.va.toString());
      setFormHp(item.noHp === '-' ? '' : item.noHp);
    } else {
      const defaultKec = dynamicKecamatanList[0] || 'Lumajang';
      setSelectedItem(null);
      setFormNama('');
      setFormAlamat('');
      setFormRt('01');
      setFormRw('01');
      setFormKec(defaultKec);
      const firstKel = dynamicKelurahanOptions[0]?.nama || 'Jogoyudan';
      setFormKel(firstKel);
      const defaultVa = dynamicTarifList[0]?.va ? dynamicTarifList[0].va.toString() : '900';
      setFormVa(defaultVa);
      setFormHp('');
    }
    setModalOpen(true);
  };

  const handleSavePelanggan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        id_pelanggan: selectedItem ? selectedItem.id : undefined,
        nama: formNama.trim(),
        alamat: formAlamat.trim(),
        rt: formRt.trim() || '01',
        rw: formRw.trim() || '01',
        kelurahan: formKel,
        kecamatan: formKec,
        va: Number(formVa),
        no_hp: formHp.trim() || '-',
      };

      const res = await fetch(`${API_BASE_URL}/pelanggan`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        toast.success(
          selectedItem
            ? 'Data Wajib Retribusi berhasil diperbarui'
            : 'Data Wajib Retribusi baru berhasil ditambahkan'
        );
        await loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(`Gagal menyimpan data: ${err.message || 'Terjadi kesalahan'}`);
      }
    } catch (err) {
      console.error('Error saving pelanggan:', err);
      toast.error('Gagal terhubung ke server backend');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (item: Pelanggan) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`${API_BASE_URL}/pelanggan/${encodeURIComponent(itemToDelete.id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        toast.success(`Data Wajib Retribusi "${itemToDelete.nama}" berhasil dihapus`);
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        await loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(`Gagal menghapus data: ${err.message || 'Terjadi kesalahan'}`);
      }
    } catch (err) {
      console.error('Error deleting pelanggan:', err);
      toast.error('Gagal terhubung ke server backend');
    }
  };

  const handleTriggerPrintReport = () => {
    setShowPrintReport(true);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleExportCSV = () => {
    let csv = 'ID Wajib Retribusi,Nama,Alamat,RT,RW,Kelurahan,Kecamatan,VA,No HP\n';
    filteredData.forEach((w) => {
      const cleanNama = w.nama.replace(/"/g, '""');
      const cleanAlamat = w.alamat.replace(/"/g, '""');
      csv += `"${w.id}","${cleanNama}","${cleanAlamat}","${w.rt}","${w.rw}","${w.kelurahan}","${w.kecamatan}",${w.va},"${w.noHp}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Data_Pelanggan_Lumajang_${filteredData.length}_rows.csv`;
    link.click();
    toast.success(`Export CSV berhasil (${filteredData.length} baris data)`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Data Pelanggan
            </h1>
            <Badge variant="secondary" className="font-medium text-xs">
              {filteredData.length.toLocaleString('id-ID')} Total
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Pengelolaan basis data Wajib Retribusi persampahan terpadu Kabupaten Lumajang.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCsvModalOpen(true)}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
            Import CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
          >
            <FileDown className="mr-2 h-4 w-4 text-sky-600" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerPrintReport}
          >
            <Printer className="mr-2 h-4 w-4 text-rose-600" />
            Cetak
          </Button>
          <Button
            size="sm"
            onClick={() => handleOpenModal()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pelanggan
          </Button>
        </div>
      </div>

      {/* Unified Table Card with Filters in CardHeader */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-4 border-b">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            {/* Search Input */}
            <div className="lg:col-span-5 space-y-1.5">
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
                  placeholder="Cari nama pelanggan atau ID Wajib Retribusi..."
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            {/* Filter Kecamatan */}
            <div className="lg:col-span-3 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Kecamatan
              </label>
              <Select
                value={filterKec}
                onValueChange={(val) => {
                  if (val) {
                    setFilterKec(val);
                    setCurrentPage(1);
                  }
                }}
              >
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Semua Kecamatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kecamatan</SelectItem>
                  {dynamicKecamatanList.map((kec) => (
                    <SelectItem key={kec} value={kec}>
                      {kec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Kelurahan */}
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Kelurahan / Desa
              </label>
              <Select
                value={filterKel}
                onValueChange={(val) => {
                  if (val) {
                    setFilterKel(val);
                    setCurrentPage(1);
                  }
                }}
              >
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Semua Kelurahan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelurahan</SelectItem>
                  {dynamicAllKelurahanFilterList.map((kel) => (
                    <SelectItem key={kel} value={kel}>
                      {kel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Tarif VA */}
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Tarif (VA)
              </label>
              <Select
                value={filterVa}
                onValueChange={(val) => {
                  if (val) {
                    setFilterVa(val);
                    setCurrentPage(1);
                  }
                }}
              >
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Semua VA" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="all">Semua Daya VA</SelectItem>
                  {dynamicTarifList.map((t) => (
                    <SelectItem key={t.va} value={t.va.toString()}>
                      {t.va} VA ({t.nama || `Rp ${t.nominal.toLocaleString('id-ID')}`})
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
                <TableHead className="w-[140px]">ID Wajib Retribusi</TableHead>
                <TableHead>Nama Kepala Keluarga</TableHead>
                <TableHead>Alamat & RT/RW</TableHead>
                <TableHead>Kelurahan / Desa</TableHead>
                <TableHead>Kecamatan</TableHead>
                <TableHead>Daya (VA)</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead className="text-center w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="p-10 text-center text-xs text-muted-foreground"
                  >
                    {isLoading
                      ? 'Memuat data pelanggan...'
                      : 'Tidak ada data pelanggan yang sesuai dengan filter.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                      >
                        {item.id}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {item.nama}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div>{item.alamat}</div>
                      <div className="font-mono text-[11px] text-foreground/80">
                        RT {item.rt} / RW {item.rw}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{item.kelurahan}</TableCell>
                    <TableCell className="text-xs font-medium">{item.kecamatan}</TableCell>
                    <TableCell className="text-xs font-semibold">
                      <Badge variant="outline" className="text-xs font-medium">
                        <Zap className="w-3 h-3 mr-1 text-amber-500" />
                        {item.va} VA
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {item.noHp && item.noHp !== '-' ? (
                        <span className="flex items-center gap-1 text-foreground/80">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          {item.noHp}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal(item)}
                          className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          title="Edit Pelanggan"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(item)}
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Hapus Pelanggan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
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
              {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </span>{' '}
            -{' '}
            <span className="font-bold text-foreground">
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </span>{' '}
            dari{' '}
            <span className="font-bold text-foreground">
              {filteredData.length.toLocaleString('id-ID')}
            </span>{' '}
            pelanggan
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

      {/* Add / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Edit Data Wajib Retribusi' : 'Tambah Wajib Retribusi Baru'}
            </DialogTitle>
            <DialogDescription>
              Isi data lengkap Wajib Retribusi sesuai dokumen administrasi kependudukan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePelanggan} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nama Kepala Keluarga
              </label>
              <Input
                value={formNama}
                onChange={(e) => setFormNama(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Alamat Domisili</label>
              <Input
                value={formAlamat}
                onChange={(e) => setFormAlamat(e.target.value)}
                placeholder="Contoh: Jl. Mawar No. 12"
                className="text-xs"
                required
              />
            </div>

            {/* Separate RT and RW Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">RT</label>
                <Input
                  value={formRt}
                  onChange={(e) => setFormRt(e.target.value)}
                  placeholder="01"
                  className="text-xs font-mono"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">RW</label>
                <Input
                  value={formRw}
                  onChange={(e) => setFormRw(e.target.value)}
                  placeholder="01"
                  className="text-xs font-mono"
                  required
                />
              </div>
            </div>

            {/* Dynamic Kecamatan and Kelurahan Cascading Select */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Kecamatan</label>
                <Select
                  value={formKec}
                  onValueChange={(newKec) => {
                    if (newKec) {
                      setFormKec(newKec);
                      const matchingKel = masterWilayahList.filter(
                        (w) =>
                          w.kecamatan &&
                          w.kecamatan.toLowerCase().trim() === newKec.toLowerCase().trim()
                      );
                      if (matchingKel.length > 0) {
                        setFormKel(matchingKel[0].kelurahan);
                      }
                    }
                  }}
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Pilih Kecamatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {dynamicKecamatanList.map((kec) => (
                      <SelectItem key={kec} value={kec}>
                        {kec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Kelurahan / Desa
                </label>
                <Select
                  value={formKel}
                  onValueChange={(newKel) => newKel && setFormKel(newKel)}
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Pilih Kelurahan" />
                  </SelectTrigger>
                  <SelectContent>
                    {dynamicKelurahanOptions.map((item) => (
                      <SelectItem key={item.nama} value={item.nama}>
                        {item.nama} ({item.kode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Daya Listrik and WhatsApp */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Daya Listrik / Tarif Retribusi (VA)
                </label>
                <TarifCombobox
                  value={formVa}
                  onChange={(val) => setFormVa(val)}
                  tarifList={dynamicTarifList}
                  placeholder="Pilih Tarif Retribusi"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  No WhatsApp (Opsional)
                </label>
                <Input
                  value={formHp}
                  onChange={(e) => setFormHp(e.target.value)}
                  placeholder="6281234567890"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Wajib Retribusi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data Wajib Retribusi &quot;
              {itemToDelete?.nama}&quot; (ID: {itemToDelete?.id})? Semua rekaman tagihan
              terkait pelanggan ini juga akan terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Ya, Hapus Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import CSV Dialog */}
      <Dialog open={csvModalOpen} onOpenChange={setCsvModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Import Pelanggan via CSV
            </DialogTitle>
            <DialogDescription>
              Unggah file CSV dengan format baku untuk mendaftarkan banyak pelanggan
              sekaligus.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Download Template CSV button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const sampleCsv =
                  'nama,alamat,rt,rw,kelurahan,kecamatan,va,no_hp\nBudi Santoso,Jl. Mawar No 10,01,01,Jogoyudan,Lumajang,900,6281234567890\nSiti Aminah,Jl. Melati No 4,03,02,Jogotrunan,Lumajang,1300,628198765432\n';
                const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Format_Import_Pelanggan_DLH.csv';
                a.click();
              }}
              className="w-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Unduh Template Format CSV
            </Button>

            <div className="border-2 border-dashed border-border p-6 rounded-xl text-center space-y-2 hover:border-emerald-600 transition-colors cursor-pointer bg-muted/20">
              <input
                type="file"
                accept=".csv"
                className="hidden"
                id="csv-file-input"
                disabled={csvUploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setCsvUploading(true);
                  setCsvResultMsg('Mengunggah dan memproses CSV...');
                  try {
                    const text = await file.text();
                    const lines = text
                      .split(/\r?\n/)
                      .map((l) => l.trim())
                      .filter(Boolean);
                    if (lines.length <= 1) {
                      setCsvResultMsg('File CSV kosong atau hanya berisi baris header.');
                      return;
                    }

                    let insertedCount = 0;
                    for (let i = 1; i < lines.length; i++) {
                      const cols = lines[i]
                        .split(',')
                        .map((c) => c.trim().replace(/^"|"$/g, ''));
                      if (cols.length >= 2 && cols[0]) {
                        const payload = {
                          nama: cols[0],
                          alamat: cols[1] || 'Jl. Lumajang',
                          rt: cols[2] || '01',
                          rw: cols[3] || '01',
                          kelurahan: cols[4] || 'Jogoyudan',
                          kecamatan: cols[5] || 'Lumajang',
                          va: parseInt(cols[6]) || 900,
                          no_hp: cols[7] || '-',
                        };
                        const res = await fetch(`${API_BASE_URL}/pelanggan`, {
                          method: 'POST',
                          headers: getAuthHeaders(),
                          body: JSON.stringify(payload),
                        });
                        if (res.ok) insertedCount++;
                      }
                    }
                    const msg = `Berhasil mengimpor ${insertedCount} Wajib Retribusi ke sistem!`;
                    setCsvResultMsg(msg);
                    toast.success(msg);
                    await loadData();
                  } catch (err) {
                    console.error('Error importing CSV:', err);
                    setCsvResultMsg('Gagal memproses file CSV.');
                    toast.error('Gagal memproses file CSV');
                  } finally {
                    setCsvUploading(false);
                  }
                }}
              />
              <label htmlFor="csv-file-input" className="cursor-pointer block space-y-2">
                <FileSpreadsheet className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-foreground">
                  {csvUploading ? 'Sedang Memproses...' : 'Klik untuk Memilih File CSV'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Format .csv (Maksimal 10.000 baris data)
                </p>
              </label>
            </div>

            {csvResultMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-medium">
                {csvResultMsg}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCsvModalOpen(false);
                setCsvResultMsg('');
              }}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PRINTABLE OFFICIAL REPORT DOCUMENT */}
      {showPrintReport && (
        <div className="printable-receipt-area hidden">
          <div className="max-w-4xl mx-auto p-8 bg-white font-sans text-slate-800 space-y-6">
            <KopSurat subTitle="DINAS LINGKUNGAN HIDUP" />

            <div className="text-center pt-2 border-t border-slate-300 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wide">
                LAPORAN DATA WAJIB RETRIBUSI SAMPAH
              </h3>
              <p className="text-xs text-slate-500">
                Tanggal Cetak:{' '}
                {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Filter Summary */}
            <div className="flex justify-between items-center text-xs font-semibold bg-slate-100 p-3 rounded-lg border border-slate-300">
              <div>
                Wilayah:{' '}
                {filterKel !== 'all' ? filterKel : 'Seluruh Kelurahan'} (
                {filterKec !== 'all' ? filterKec : 'Kab. Lumajang'})
              </div>
              <div>Filter Daya: {filterVa !== 'all' ? `${filterVa} VA` : 'Semua Tarif'}</div>
              <div>Total Data: {filteredData.length} Wajib Retribusi</div>
            </div>

            {/* Table up to 500 records */}
            <table className="w-full text-xs text-left border-collapse border-2 border-slate-600">
              <thead className="bg-slate-200 text-slate-900 font-bold border-b-2 border-slate-600">
                <tr>
                  <th className="p-2 border border-slate-400 text-center w-10">No</th>
                  <th className="p-2 border border-slate-400 whitespace-nowrap">
                    ID Wajib Retribusi
                  </th>
                  <th className="p-2 border border-slate-400">Nama</th>
                  <th className="p-2 border border-slate-400">Alamat</th>
                  <th className="p-2 border border-slate-400 text-center">RT/RW</th>
                  <th className="p-2 border border-slate-400">Kelurahan</th>
                  <th className="p-2 border border-slate-400 text-right">Daya</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 500).map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-300">
                    <td className="p-2 border border-slate-300 text-center font-mono">
                      {idx + 1}
                    </td>
                    <td className="p-2 border border-slate-300 font-mono font-bold whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="p-2 border border-slate-300 font-bold">{item.nama}</td>
                    <td className="p-2 border border-slate-300">{item.alamat}</td>
                    <td className="p-2 border border-slate-300 text-center font-semibold whitespace-nowrap">
                      {item.rt} / {item.rw}
                    </td>
                    <td className="p-2 border border-slate-300">{item.kelurahan}</td>
                    <td className="p-2 border border-slate-300 text-right font-semibold whitespace-nowrap">
                      {item.va} VA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature Block */}
            <div className="pt-8 flex justify-between text-xs">
              <div />
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
