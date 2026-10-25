import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Zap,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Building,
  Home,
  Factory,
} from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import {
  Card,
  CardHeader,
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

export interface Tarif {
  va: number;
  nama: string;
  nominal: number;
  kategori: string;
}

export default function TarifPage() {
  const [tarifList, setTarifList] = useState<Tarif[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTarif, setSelectedTarif] = useState<Tarif | null>(null);

  // Form states
  const [formVa, setFormVa] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formNominal, setFormNominal] = useState('');
  const [formKategori, setFormKategori] = useState('Rumah Tangga');
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tarifToDelete, setTarifToDelete] = useState<Tarif | null>(null);

  // User Role Check (Ketua vs Admin/Petugas)
  const [userRole, setUserRole] = useState<string>('ketua');

  useEffect(() => {
    const role =
      (typeof window !== 'undefined' &&
        (localStorage.getItem('user_role') || localStorage.getItem('role') || localStorage.getItem('username'))) ||
      'ketua';
    setUserRole(role.toLowerCase());
  }, []);

  const isKetua = userRole === 'ketua' || userRole.includes('ketua');

  const loadTarif = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/tarif`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.data || [];
        setTarifList(
          rawList.map((t: any) => ({
            va: Number(t.va),
            nama: t.nama_tarif || `Tarif ${t.va} VA`,
            nominal: Number(t.nominal),
            kategori:
              t.kategori ||
              (t.va <= 3500
                ? 'Rumah Tangga'
                : t.va <= 10000
                ? 'Komersial & Bisnis'
                : 'Industri & Fasilitas'),
          }))
        );
      } else {
        toast.error('Gagal mengambil data tarif dari server');
      }
    } catch (err) {
      console.error('Failed to load tarif API:', err);
      toast.error('Gagal terhubung ke endpoint server tarif');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTarif();
  }, []);

  const filteredTarif = useMemo(() => {
    return tarifList.filter((t) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        t.nama.toLowerCase().includes(s) ||
        t.kategori.toLowerCase().includes(s) ||
        t.va.toString().includes(s)
      );
    });
  }, [tarifList, search]);

  // Category counts
  const categoryStats = useMemo(() => {
    const rt = tarifList.filter((t) => t.kategori === 'Rumah Tangga').length;
    const bisnis = tarifList.filter((t) => t.kategori.includes('Komersial') || t.kategori.includes('Bisnis')).length;
    const industri = tarifList.filter((t) => t.kategori.includes('Industri') || t.kategori.includes('Sosial')).length;
    return { rt, bisnis, industri, total: tarifList.length };
  }, [tarifList]);

  const handleOpenModal = (t?: Tarif) => {
    if (!isKetua) {
      toast.error('Hanya role Ketua yang memiliki wewenang mengubah master tarif');
      return;
    }
    if (t) {
      setSelectedTarif(t);
      setFormVa(t.va.toString());
      setFormNama(t.nama);
      setFormNominal(t.nominal.toString());
      setFormKategori(t.kategori);
    } else {
      setSelectedTarif(null);
      setFormVa('');
      setFormNama('');
      setFormNominal('');
      setFormKategori('Rumah Tangga');
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isKetua) {
      toast.error('Akses ditolak: Hanya Ketua yang dapat menyimpan tarif');
      return;
    }

    const vaNum = parseInt(formVa, 10);
    const nomNum = parseInt(formNominal, 10);

    if (isNaN(vaNum) || vaNum <= 0) {
      toast.error('Daya VA harus berupa angka positif');
      return;
    }
    if (isNaN(nomNum) || nomNum < 0) {
      toast.error('Nominal tarif harus berupa angka valid');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        va: vaNum,
        nama_tarif: formNama.trim() || `Tarif ${vaNum} VA`,
        nominal: nomNum,
        kategori: formKategori,
      };

      const res = await fetch(`${API_BASE_URL}/tarif`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          selectedTarif
            ? `Berhasil memperbarui tarif ${vaNum} VA`
            : `Berhasil menambahkan tarif baru ${vaNum} VA`
        );
        setModalOpen(false);
        await loadTarif();
      } else {
        const errJson = await res.json().catch(() => ({}));
        toast.error(errJson.message || 'Gagal menyimpan tarif retribusi');
      }
    } catch (err) {
      console.error('Error saving tarif:', err);
      toast.error('Gagal terhubung ke server backend');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (t: Tarif) => {
    if (!isKetua) {
      toast.error('Hanya role Ketua yang dapat menghapus tarif retribusi');
      return;
    }
    setTarifToDelete(t);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!tarifToDelete) return;
    try {
      const res = await fetch(`${API_BASE_URL}/tarif/${tarifToDelete.va}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        toast.success(`Tarif ${tarifToDelete.va} VA berhasil dihapus`);
        await loadTarif();
      } else {
        const errJson = await res.json().catch(() => ({}));
        toast.error(errJson.message || 'Gagal menghapus tarif');
      }
    } catch (err) {
      console.error('Error deleting tarif:', err);
      toast.error('Gagal terhubung ke server backend');
    } finally {
      setDeleteDialogOpen(false);
      setTarifToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Tarif Retribusi
            </h1>
            <Badge variant="secondary" className="font-medium text-xs">
              {tarifList.length} Kategori
            </Badge>
            {isKetua ? (
              <Badge variant="outline" className="text-xs border-primary text-primary gap-1">
                <ShieldCheck className="h-3 w-3" /> Ketua (Full Akses)
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
                <ShieldAlert className="h-3 w-3" /> Mode Lihat Saja
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Besaran tarif resmi retribusi pelayanan kebersihan Dinas Lingkungan Hidup Kabupaten Lumajang sesuai Perda/Perbupati.
          </p>
        </div>

        <div>
          <Button
            size="sm"
            onClick={() => handleOpenModal()}
            disabled={!isKetua}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Tarif Baru
          </Button>
        </div>
      </div>

      {/* Role Alert for Non-Ketua */}
      {!isKetua && (
        <Card className="border border-border bg-muted/40">
          <CardContent className="p-4 flex items-center gap-3 text-xs text-muted-foreground">
            <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Akses Terbatas: Mode Lihat Saja</p>
              <p>
                Penambahan, perubahan nominal, dan penghapusan master tarif hanya dapat dilakukan oleh akun dengan hak akses Ketua.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Rumah Tangga</p>
              <p className="text-xl font-bold text-foreground">{categoryStats.rt} Kategori</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Komersial & Bisnis</p>
              <p className="text-xl font-bold text-foreground">{categoryStats.bisnis} Kategori</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Industri & Fasum</p>
              <p className="text-xl font-bold text-foreground">{categoryStats.industri} Kategori</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unified Tarif Table Card */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-4 border-b">
          <div className="relative max-w-md">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Nama Tarif, Kategori Sektor, atau Kode Daya VA..."
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40 font-semibold">Kode / Daya (VA)</TableHead>
                <TableHead className="font-semibold">Kategori Sektor</TableHead>
                <TableHead className="font-semibold">Nama Tarif Resmi</TableHead>
                <TableHead className="font-semibold">Nominal Bulanan</TableHead>
                <TableHead className="w-28 text-center font-semibold">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Memuat daftar tarif...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTarif.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-xs">
                    Tidak ada tarif retribusi yang cocok dengan kriteria pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTarif.map((t) => (
                  <TableRow key={t.va} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-bold text-foreground">
                      <Badge variant="outline" className="font-mono text-xs gap-1 border-primary/30 text-primary">
                        <Zap className="size-3 text-primary" />
                        {t.va} VA
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      {t.kategori}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {t.nama}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-foreground">
                      Rp {t.nominal.toLocaleString('id-ID')}
                      <span className="text-[11px] font-normal text-muted-foreground"> / bulan</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenModal(t)}
                          disabled={!isKetua}
                          title={isKetua ? 'Edit Tarif' : 'Hanya Ketua'}
                        >
                          <Edit2 className="size-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteClick(t)}
                          disabled={!isKetua}
                          title={isKetua ? 'Hapus Tarif' : 'Hanya Ketua'}
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Add / Edit Tarif */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              <span>{selectedTarif ? 'Edit Master Tarif' : 'Tambah Master Tarif Baru'}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedTarif
                ? `Perbarui nama, sektor, dan nominal bulanan untuk tarif ${selectedTarif.va} VA.`
                : 'Daftarkan golongan daya VA dan besaran nominal retribusi bulanan baru.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Daya / Kode VA</label>
              <Input
                type="number"
                value={formVa}
                onChange={(e) => setFormVa(e.target.value)}
                placeholder="Misal: 900"
                className="text-xs font-mono"
                required
                disabled={Boolean(selectedTarif)}
              />
              {selectedTarif && (
                <p className="text-[11px] text-muted-foreground">
                  *Kode Daya VA adalah identitas unik dan tidak dapat diubah saat edit.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Kategori Sektor</label>
              <Select
                value={formKategori}
                onValueChange={(val) => val && setFormKategori(val)}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rumah Tangga">Rumah Tangga</SelectItem>
                  <SelectItem value="Komersial & Bisnis">Komersial & Bisnis</SelectItem>
                  <SelectItem value="Fasilitas Umum & Sosial">Fasilitas Umum & Sosial</SelectItem>
                  <SelectItem value="Industri">Industri</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nama Tarif Resmi</label>
              <Input
                type="text"
                value={formNama}
                onChange={(e) => setFormNama(e.target.value)}
                placeholder="Misal: Rumah Tangga R1-900VA"
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Nominal Bulanan (Rp)</span>
                {formNominal && (
                  <span className="font-mono text-xs text-primary font-bold">
                    Rp {Number(formNominal || 0).toLocaleString('id-ID')}
                  </span>
                )}
              </label>
              <Input
                type="number"
                value={formNominal}
                onChange={(e) => setFormNominal(e.target.value)}
                placeholder="Misal: 15000"
                className="text-xs font-mono"
                required
              />
            </div>

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
                {isSaving ? 'Menyimpan...' : 'Simpan Master Tarif'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-5" />
              <span>Hapus Master Tarif</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data tarif retribusi{' '}
              <strong className="text-foreground">{tarifToDelete?.nama}</strong> (
              <span className="font-mono font-bold text-foreground">{tarifToDelete?.va} VA</span>) dengan
              nominal Rp {tarifToDelete?.nominal.toLocaleString('id-ID')}/bulan?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Ya, Hapus Tarif
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
