import { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export interface WilayahItem {
  id: string;
  kecamatan: string;
  kelurahan: string;
  kodeSingkatan: string;
}

export default function WilayahPage() {
  const [wilayahList, setWilayahList] = useState<WilayahItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKecamatan, setFilterKecamatan] = useState<string>('ALL');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WilayahItem | null>(null);

  // Delete Alert
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WilayahItem | null>(null);

  // Rename Kecamatan States
  const [renameKecModalOpen, setRenameKecModalOpen] = useState(false);
  const [targetKecamatanToRename, setTargetKecamatanToRename] = useState('');
  const [newKecamatanName, setNewKecamatanName] = useState('');
  const [isRenamingKec, setIsRenamingKec] = useState(false);

  // Delete Kecamatan States
  const [deleteKecDialogOpen, setDeleteKecDialogOpen] = useState(false);
  const [targetKecamatanToDelete, setTargetKecamatanToDelete] = useState('');
  const [isDeletingKec, setIsDeletingKec] = useState(false);

  // Form states
  const [formKec, setFormKec] = useState('Lumajang');
  const [isCustomKec, setIsCustomKec] = useState(false);
  const [customKecName, setCustomKecName] = useState('');
  const [formKel, setFormKel] = useState('');
  const [formKode, setFormKode] = useState('');
  const [keepModalOpen, setKeepModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // CSV Import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvMsg, setCsvMsg] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Fetch Wilayah Data
  const loadWilayah = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/wilayah`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.data || [];
        setWilayahList(
          rawList.map((w: any) => ({
            id: String(w.id),
            kecamatan: w.kecamatan || 'Lumajang',
            kelurahan: w.kelurahan || '',
            kodeSingkatan: w.kode_kel || (w.kelurahan ? w.kelurahan.slice(0, 3).toUpperCase() : 'LMJ'),
          }))
        );
      } else {
        toast.error('Gagal mengambil data master wilayah dari server');
      }
    } catch (err) {
      console.error('Failed to load wilayah API:', err);
      toast.error('Gagal terhubung ke endpoint server wilayah');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWilayah();
  }, []);

  // Unique list of Kecamatan
  const existingKecamatanList = useMemo(() => {
    const setKec = new Set<string>();
    wilayahList.forEach((w) => {
      if (w.kecamatan) setKec.add(w.kecamatan.trim());
    });
    return Array.from(setKec).sort();
  }, [wilayahList]);

  // Grouped data by Kecamatan
  const groupedWilayah = useMemo(() => {
    const groups: Record<string, WilayahItem[]> = {};

    const filtered = wilayahList.filter((w) => {
      const matchKec = filterKecamatan === 'ALL' || w.kecamatan.toLowerCase() === filterKecamatan.toLowerCase();
      if (!matchKec) return false;

      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        w.kecamatan.toLowerCase().includes(s) ||
        w.kelurahan.toLowerCase().includes(s) ||
        w.kodeSingkatan.toLowerCase().includes(s)
      );
    });

    filtered.forEach((item) => {
      const kecKey = item.kecamatan.trim() || 'Lainnya';
      if (!groups[kecKey]) groups[kecKey] = [];
      groups[kecKey].push(item);
    });

    return groups;
  }, [wilayahList, search, filterKecamatan]);

  const totalDesaCount = useMemo(() => {
    return Object.values(groupedWilayah).reduce((acc, curr) => acc + curr.length, 0);
  }, [groupedWilayah]);

  const handleOpenModal = (targetKec?: string, item?: WilayahItem) => {
    if (item) {
      setSelectedItem(item);
      setFormKec(item.kecamatan);
      setIsCustomKec(false);
      setCustomKecName('');
      setFormKel(item.kelurahan);
      setFormKode(item.kodeSingkatan);
    } else {
      setSelectedItem(null);
      const defaultKec = targetKec || (filterKecamatan !== 'ALL' ? filterKecamatan : existingKecamatanList[0]) || 'Lumajang';
      setFormKec(defaultKec);
      setIsCustomKec(false);
      setCustomKecName('');
      setFormKel('');
      setFormKode('');
    }
    setModalOpen(true);
  };

  const handleKelurahanChange = (val: string) => {
    setFormKel(val);
    if (!selectedItem && (!formKode || formKode.length < 3)) {
      const clean = val.toUpperCase().replace(/[^A-Z]/g, '');
      if (clean.length >= 3) {
        setFormKode(clean.slice(0, 3));
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalKecamatan = isCustomKec ? customKecName.trim() : formKec.trim();
    if (!finalKecamatan) {
      toast.error('Nama Kecamatan tidak boleh kosong');
      return;
    }
    if (!formKel.trim()) {
      toast.error('Nama Kelurahan/Desa tidak boleh kosong');
      return;
    }

    const finalKode = formKode.toUpperCase().trim() || formKel.trim().slice(0, 3).toUpperCase();

    try {
      setIsSaving(true);
      const payload = {
        id: selectedItem ? Number(selectedItem.id) : undefined,
        kecamatan: finalKecamatan,
        kelurahan: formKel.trim(),
        kode_kel: finalKode,
      };

      const res = await fetch(`${API_BASE_URL}/wilayah`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          selectedItem
            ? `Berhasil memperbarui ${formKel} (${finalKecamatan})`
            : `Berhasil menambahkan Desa/Kelurahan "${formKel}" ke Kecamatan ${finalKecamatan}`
        );

        await loadWilayah();

        if (keepModalOpen && !selectedItem) {
          setFormKel('');
          setFormKode('');
          setFormKec(finalKecamatan);
        } else {
          setModalOpen(false);
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        toast.error(errJson.message || 'Gagal menyimpan data wilayah');
      }
    } catch (err) {
      console.error('Error saving wilayah:', err);
      toast.error('Gagal terhubung ke server backend');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (item: WilayahItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`${API_BASE_URL}/wilayah/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        toast.success(`Data wilayah ${itemToDelete.kelurahan} berhasil dihapus`);
        await loadWilayah();
      } else {
        const errJson = await res.json().catch(() => ({}));
        toast.error(errJson.message || 'Gagal menghapus data wilayah');
      }
    } catch (err) {
      console.error('Error deleting wilayah:', err);
      toast.error('Gagal terhubung ke server backend');
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleOpenRenameKecamatanModal = (kecName: string) => {
    setTargetKecamatanToRename(kecName);
    setNewKecamatanName(kecName);
    setRenameKecModalOpen(true);
  };

  const handleSaveRenameKecamatan = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newKecamatanName.trim();
    if (!trimmed) {
      toast.error('Nama Kecamatan baru tidak boleh kosong');
      return;
    }
    if (trimmed.toLowerCase() === targetKecamatanToRename.toLowerCase()) {
      setRenameKecModalOpen(false);
      return;
    }

    try {
      setIsRenamingKec(true);
      const res = await fetch(`${API_BASE_URL}/wilayah/kecamatan/rename`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ oldName: targetKecamatanToRename, newName: trimmed }),
      });

      if (res.ok) {
        toast.success(`Kecamatan "${targetKecamatanToRename}" berhasil diubah menjadi "${trimmed}"`);
        setRenameKecModalOpen(false);
        await loadWilayah();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || 'Gagal mengubah nama kecamatan');
      }
    } catch (err) {
      console.error('Error renaming kecamatan:', err);
      toast.error('Gagal terhubung ke server backend');
    } finally {
      setIsRenamingKec(false);
    }
  };

  const handleOpenDeleteKecamatanDialog = (kecName: string) => {
    setTargetKecamatanToDelete(kecName);
    setDeleteKecDialogOpen(true);
  };

  const handleConfirmDeleteKecamatan = async () => {
    if (!targetKecamatanToDelete) return;
    try {
      setIsDeletingKec(true);
      const res = await fetch(`${API_BASE_URL}/wilayah/kecamatan/${encodeURIComponent(targetKecamatanToDelete)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        toast.success(`Sektor Kecamatan "${targetKecamatanToDelete}" dan seluruh desanya berhasil dihapus`);
        setDeleteKecDialogOpen(false);
        await loadWilayah();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || 'Gagal menghapus kecamatan');
      }
    } catch (err) {
      console.error('Error deleting kecamatan:', err);
      toast.error('Gagal terhubung ke server backend');
    } finally {
      setIsDeletingKec(false);
    }
  };

  const handleExportCSV = () => {
    let csv = 'kecamatan,kelurahan,kode_singkatan\n';
    wilayahList.forEach((w) => {
      csv += `"${w.kecamatan}","${w.kelurahan}","${w.kodeSingkatan}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Master_Wilayah_Lumajang.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Master_Wilayah_Lumajang.csv berhasil diunduh');
  };

  const handleImportCSVSubmit = async () => {
    if (!csvFile) {
      toast.error('Pilih berkas CSV terlebih dahulu');
      return;
    }

    try {
      setIsImporting(true);
      const text = await csvFile.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        toast.error('Berkas CSV kosong atau hanya memiliki baris header');
        return;
      }

      let successCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 2) {
          const kec = cols[0];
          const kel = cols[1];
          const kode = cols[2] || kel.slice(0, 3).toUpperCase();
          if (kec && kel) {
            await fetch(`${API_BASE_URL}/wilayah`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({
                kecamatan: kec,
                kelurahan: kel,
                kode_kel: kode.toUpperCase(),
              }),
            });
            successCount++;
          }
        }
      }

      toast.success(`Berhasil mengimpor ${successCount} data wilayah`);
      setCsvModalOpen(false);
      setCsvFile(null);
      setCsvMsg('');
      await loadWilayah();
    } catch (err) {
      console.error('Error importing CSV:', err);
      toast.error('Terjadi kesalahan saat memproses berkas CSV');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Kode Wilayah
            </h1>
            <Badge variant="secondary" className="font-medium text-xs">
              {Object.keys(groupedWilayah).length} Kecamatan | {totalDesaCount} Desa/Kelurahan
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Pengelompokan wilayah administratif Kabupaten Lumajang untuk kodefikasi ID Wajib Retribusi dan rute penagihan.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCsvModalOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            size="sm"
            onClick={() => handleOpenModal()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Wilayah Baru
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="size-4 text-muted-foreground absolute left-3 top-2.5" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Kecamatan, Desa/Kelurahan, atau Kode Singkatan..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Filter Sektor:</span>
            <Select
              value={filterKecamatan}
              onValueChange={(val) => setFilterKecamatan(val || 'ALL')}
            >
              <SelectTrigger className="w-full sm:w-[200px] text-xs">
                <SelectValue placeholder="Pilih Sektor Kecamatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Kecamatan</SelectItem>
                {existingKecamatanList.map((kec) => (
                  <SelectItem key={kec} value={kec}>
                    Kecamatan {kec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grouped Category Cards */}
      {loading ? (
        <Card className="p-12 text-center border-dashed">
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground text-sm">
            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Memuat data master wilayah...</span>
          </div>
        </Card>
      ) : Object.keys(groupedWilayah).length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-sm text-muted-foreground">
            Tidak ada data wilayah yang sesuai dengan kata kunci pencarian atau filter yang dipilih.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedWilayah).map(([kecamatanName, items]) => (
            <Card key={kecamatanName} className="border border-border overflow-hidden">
              {/* Kecamatan Header */}
              <div className="bg-muted/40 border-b border-border px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-md bg-background border border-border text-foreground">
                    <Building2 className="size-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-foreground uppercase">
                      Kecamatan {kecamatanName}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Sektor Utama | {items.length} Desa / Kelurahan Terdaftar
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenRenameKecamatanModal(kecamatanName)}
                    className="gap-1.5 text-xs font-medium h-8"
                    title="Ubah Nama Kecamatan"
                  >
                    <Edit2 className="size-3.5" />
                    Ubah Kecamatan
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDeleteKecamatanDialog(kecamatanName)}
                    className="gap-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive h-8 border-destructive/30"
                    title="Hapus Seluruh Data Kecamatan"
                  >
                    <Trash2 className="size-3.5" />
                    Hapus Sektor
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleOpenModal(kecamatanName)}
                    className="gap-1.5 text-xs font-medium h-8"
                  >
                    <Plus className="size-3.5" />
                    Tambah Desa/Kelurahan
                  </Button>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="w-14 text-center">No</TableHead>
                      <TableHead>Nama Desa / Kelurahan (Item Wilayah)</TableHead>
                      <TableHead className="w-36">Kode Singkatan</TableHead>
                      <TableHead className="w-48">Format ID Pelanggan</TableHead>
                      <TableHead className="w-28 text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                            <span>{item.kelurahan}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono font-bold text-xs">
                            {item.kodeSingkatan}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">LMJ-</span>
                          <span className="text-primary font-bold">{item.kodeSingkatan}</span>
                          <span>-0001</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleOpenModal(kecamatanName, item)}
                              title="Edit Desa/Kelurahan"
                            >
                              <Edit2 className="size-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDeleteClick(item)}
                              title="Hapus Desa/Kelurahan"
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Wilayah Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              <span>{selectedItem ? 'Edit Desa / Kelurahan' : 'Tambah Desa / Kelurahan Baru'}</span>
            </DialogTitle>
            <DialogDescription>
              Tentukan Kecamatan dan nama Desa/Kelurahan beserta kode singkatan 3 digit.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            {/* Kecamatan Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                1. Sektor Kecamatan (Kategori Utama)
              </label>
              {!isCustomKec ? (
                <div className="space-y-2">
                  <Select
                    value={formKec}
                    onValueChange={(val) => {
                      if (val === '__NEW__') {
                        setIsCustomKec(true);
                        setCustomKecName('');
                      } else if (val) {
                        setFormKec(val);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue placeholder="Pilih Kecamatan" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingKecamatanList.map((kec) => (
                        <SelectItem key={kec} value={kec}>
                          Kecamatan {kec}
                        </SelectItem>
                      ))}
                      <SelectItem value="__NEW__" className="text-primary font-semibold">
                        + Tambah Kecamatan Baru...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={customKecName}
                    onChange={(e) => setCustomKecName(e.target.value)}
                    placeholder="Nama Kecamatan Baru (misal: Pasrujambe)"
                    className="text-xs"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCustomKec(false)}
                  >
                    Batal
                  </Button>
                </div>
              )}
            </div>

            {/* Nama Kelurahan / Desa */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                2. Nama Kelurahan / Desa (Item Wilayah)
              </label>
              <Input
                type="text"
                value={formKel}
                onChange={(e) => handleKelurahanChange(e.target.value)}
                placeholder="Misal: Jogoyudan, Ditotrunan, Tompokersan..."
                className="text-xs"
                required
              />
            </div>

            {/* Kode Singkatan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>3. Kode Singkatan Wilayah (3 Huruf)</span>
                <span className="text-[10px] text-muted-foreground font-mono">Contoh: JGY</span>
              </label>
              <Input
                type="text"
                value={formKode}
                onChange={(e) => setFormKode(e.target.value.toUpperCase())}
                placeholder="Misal: JGY"
                maxLength={5}
                className="font-mono text-xs uppercase"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Digunakan untuk format otomatis ID Pelanggan (contoh:{' '}
                <span className="font-mono font-bold text-primary">
                  LMJ-{formKode || 'JGY'}-0001
                </span>
                ).
              </p>
            </div>

            {!selectedItem && (
              <div className="pt-2 border-t border-border flex items-center space-x-2">
                <Checkbox
                  id="keepModalOpen"
                  checked={keepModalOpen}
                  onCheckedChange={(checked) => setKeepModalOpen(Boolean(checked))}
                />
                <label
                  htmlFor="keepModalOpen"
                  className="text-xs text-muted-foreground cursor-pointer select-none leading-none"
                >
                  Lanjut tambah Desa/Kelurahan lain untuk Kecamatan ini setelah disimpan
                </label>
              </div>
            )}

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                disabled={isSaving}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving}
                className="bg-primary text-primary-foreground"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Data Wilayah'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import CSV Modal */}
      <Dialog open={csvModalOpen} onOpenChange={setCsvModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="size-4 text-primary" />
              <span>Import Master Wilayah CSV</span>
            </DialogTitle>
            <DialogDescription>
              Unggah file CSV untuk mengimpor daftar Kecamatan dan Desa/Kelurahan sekaligus.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="p-3 bg-muted/50 rounded-lg border border-border text-xs space-y-2">
              <p className="font-semibold text-foreground">Struktur Kolom CSV yang Diharapkan:</p>
              <p className="font-mono text-[11px] bg-background p-1.5 rounded border border-border">
                kecamatan,kelurahan,kode_singkatan
              </p>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => {
                  const sampleCsv =
                    'kecamatan,kelurahan,kode_singkatan\nLumajang,Jogoyudan,JGY\nLumajang,Jogotrunan,JGT\nSukodono,Dawuhan Lor,DWL\nPasirian,Pasirian,PSR\n';
                  const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'Format_Master_Wilayah_Sample.csv';
                  a.click();
                }}
                className="gap-1 mt-1"
              >
                <Download className="size-3" /> Unduh Template CSV Sample
              </Button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Pilih File CSV:</label>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setCsvFile(file);
                    setCsvMsg(`File terpilih: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
                  }
                }}
                className="text-xs"
              />
              {csvMsg && <p className="text-[11px] text-primary font-medium">{csvMsg}</p>}
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCsvModalOpen(false)}
                disabled={isImporting}
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleImportCSVSubmit}
                disabled={!csvFile || isImporting}
                className="bg-primary text-primary-foreground gap-1.5"
              >
                {isImporting ? 'Mengimpor...' : 'Mulai Proses Import'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-5" />
              <span>Hapus Master Wilayah</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus Desa/Kelurahan{' '}
              <strong className="text-foreground">{itemToDelete?.kelurahan}</strong> (Kode:{' '}
              <span className="font-mono font-bold text-foreground">{itemToDelete?.kodeSingkatan}</span>)
              dari Kecamatan <strong className="text-foreground">{itemToDelete?.kecamatan}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Ya, Hapus Wilayah
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Kecamatan Dialog */}
      <Dialog open={renameKecModalOpen} onOpenChange={setRenameKecModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              <span>Ubah Nama Kecamatan</span>
            </DialogTitle>
            <DialogDescription>
              Mengubah nama kecamatan akan secara otomatis memperbarui seluruh desa/kelurahan dan pelanggan terkait di wilayah ini.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRenameKecamatan} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Nama Kecamatan Sekarang:</label>
              <div className="p-2.5 bg-muted/50 rounded-md border border-border text-sm font-bold text-foreground">
                Kecamatan {targetKecamatanToRename}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nama Kecamatan Baru:</label>
              <Input
                type="text"
                value={newKecamatanName}
                onChange={(e) => setNewKecamatanName(e.target.value)}
                placeholder="Masukkan nama kecamatan baru..."
                className="text-sm"
                required
                autoFocus
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRenameKecModalOpen(false)}
                disabled={isRenamingKec}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isRenamingKec || !newKecamatanName.trim()}
                className="bg-primary text-primary-foreground gap-1.5"
              >
                {isRenamingKec ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Kecamatan Alert Dialog */}
      <AlertDialog open={deleteKecDialogOpen} onOpenChange={setDeleteKecDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-5" />
              <span>Hapus Seluruh Sektor Kecamatan</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus sektor{' '}
              <strong className="text-foreground">Kecamatan {targetKecamatanToDelete}</strong> beserta seluruh data desa/kelurahan di dalamnya?
              <br /><br />
              <span className="text-destructive font-medium">
                Peringatan: Jika masih terdapat pelanggan yang terdaftar di kecamatan ini, proses penghapusan akan ditolak demi keamanan data.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteKecDialogOpen(false)} disabled={isDeletingKec}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDeleteKecamatan}
              disabled={isDeletingKec}
            >
              {isDeletingKec ? 'Menghapus...' : 'Ya, Hapus Kecamatan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
