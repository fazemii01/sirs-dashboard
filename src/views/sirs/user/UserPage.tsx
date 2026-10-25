import { useState, useEffect, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  User,
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

export interface UserItem {
  uuid: string;
  username: string;
  namaLengkap: string;
  role: 'ketua' | 'admin' | 'petugas';
}

export default function UserPage() {
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Form states
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formRole, setFormRole] = useState<'ketua' | 'admin' | 'petugas'>('admin');
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

  // Current logged in user role check
  const [currentRole, setCurrentRole] = useState<string>('ketua');

  useEffect(() => {
    const role =
      (typeof window !== 'undefined' &&
        (localStorage.getItem('user_role') || localStorage.getItem('role') || localStorage.getItem('username'))) ||
      'ketua';
    setCurrentRole(role.toLowerCase());
  }, []);

  const isKetua = currentRole === 'ketua' || currentRole.includes('ketua');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/user`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.data || [];
        setUserList(
          rawList.map((u: any) => ({
            uuid: String(u.id || u.uuid || u.username),
            username: u.username,
            namaLengkap: u.nama_lengkap || u.username,
            role: (u.role || 'petugas') as 'ketua' | 'admin' | 'petugas',
          }))
        );
      } else {
        toast.error('Gagal mengambil data user dari server');
      }
    } catch (err) {
      console.error('Failed to load user API:', err);
      toast.error('Gagal terhubung ke endpoint server user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return userList.filter((u) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        u.username.toLowerCase().includes(s) ||
        u.namaLengkap.toLowerCase().includes(s) ||
        u.role.toLowerCase().includes(s) ||
        u.uuid.toLowerCase().includes(s)
      );
    });
  }, [userList, search]);

  const stats = useMemo(() => {
    const ketuaCount = userList.filter((u) => u.role === 'ketua').length;
    const adminCount = userList.filter((u) => u.role === 'admin').length;
    const petugasCount = userList.filter((u) => u.role === 'petugas').length;
    return { ketuaCount, adminCount, petugasCount, total: userList.length };
  }, [userList]);

  const handleOpenModal = (u?: UserItem) => {
    if (!isKetua) {
      toast.error('Akses ditolak: Hanya Ketua yang dapat mengelola akun pengurus');
      return;
    }
    if (u) {
      setSelectedUser(u);
      setFormUsername(u.username);
      setFormNama(u.namaLengkap);
      setFormRole(u.role);
      setFormPassword('');
    } else {
      setSelectedUser(null);
      setFormUsername('');
      setFormNama('');
      setFormRole('admin');
      setFormPassword('');
    }
    setModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isKetua) {
      toast.error('Akses ditolak: Hanya Ketua yang dapat menyimpan user');
      return;
    }

    if (!formUsername.trim()) {
      toast.error('Username tidak boleh kosong');
      return;
    }
    if (!formNama.trim()) {
      toast.error('Nama Lengkap tidak boleh kosong');
      return;
    }
    if (!selectedUser && !formPassword) {
      toast.error('Password wajib diisi untuk pengguna baru');
      return;
    }

    try {
      setIsSaving(true);
      const payload: any = {
        id: selectedUser ? selectedUser.uuid : undefined,
        username: formUsername.trim(),
        nama_lengkap: formNama.trim(),
        role: formRole,
      };
      if (formPassword) {
        payload.password = formPassword;
      }

      const res = await fetch(`${API_BASE_URL}/user`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          selectedUser
            ? `Berhasil memperbarui data user ${formUsername}`
            : `Berhasil mendaftarkan user baru ${formUsername}`
        );
        setModalOpen(false);
        await loadUsers();
      } else {
        const errJson = await res.json().catch(() => ({}));
        toast.error(errJson.message || 'Gagal menyimpan user');
      }
    } catch (err) {
      console.error('Error saving user:', err);
      toast.error('Gagal terhubung ke server backend');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (u: UserItem) => {
    if (!isKetua) {
      toast.error('Hanya role Ketua yang dapat menghapus akun pengurus');
      return;
    }
    setUserToDelete(u);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`${API_BASE_URL}/user/${encodeURIComponent(userToDelete.uuid)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        toast.success(`Akun pengurus "${userToDelete.username}" berhasil dihapus`);
        await loadUsers();
      } else {
        const errJson = await res.json().catch(() => ({}));
        toast.error(errJson.message || 'Gagal menghapus user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Gagal terhubung ke server backend');
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const renderRoleBadge = (role: 'ketua' | 'admin' | 'petugas') => {
    switch (role) {
      case 'ketua':
        return (
          <Badge variant="outline" className="text-xs border-primary text-primary font-bold uppercase gap-1">
            <ShieldCheck className="size-3" />
            Ketua (Full Akses)
          </Badge>
        );
      case 'admin':
        return (
          <Badge variant="outline" className="text-xs border-blue-500/40 text-blue-600 dark:text-blue-400 font-semibold uppercase gap-1">
            <Shield className="size-3" />
            Admin Keuangan
          </Badge>
        );
      case 'petugas':
      default:
        return (
          <Badge variant="secondary" className="text-xs font-semibold uppercase gap-1">
            <User className="size-3" />
            Petugas Loket
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Manajemen User
            </h1>
            <Badge variant="secondary" className="font-medium text-xs">
              {userList.length} Akun Terdaftar
            </Badge>
            {isKetua ? (
              <Badge variant="outline" className="text-xs border-primary text-primary gap-1">
                <ShieldCheck className="h-3 w-3" /> Akses: Ketua (Full Akses)
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
                <ShieldAlert className="h-3 w-3" /> Akses: Terbatas (Read Only)
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Pengelolaan kredensial akun pengurus aplikasi E-Marisa DLH Lumajang dengan pembagian hak akses terperinci.
          </p>
        </div>

        <div>
          <Button
            size="sm"
            onClick={() => handleOpenModal()}
            disabled={!isKetua}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Tambah User Baru
          </Button>
        </div>
      </div>

      {/* Role Alert for Non-Ketua */}
      {!isKetua && (
        <Card className="border border-border bg-muted/40">
          <CardContent className="p-4 flex items-center gap-3 text-xs text-muted-foreground">
            <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Fitur Khusus Ketua</p>
              <p>
                Halaman manajemen pengguna dan pembagian hak akses dibatasi hanya untuk akun dengan peran Ketua DLH Lumajang.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Ketua (Super Admin)</p>
              <p className="text-xl font-bold text-foreground">{stats.ketuaCount} Akun</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Admin Keuangan</p>
              <p className="text-xl font-bold text-foreground">{stats.adminCount} Akun</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Petugas Loket</p>
              <p className="text-xl font-bold text-foreground">{stats.petugasCount} Akun</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unified Users Table Card */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-4 border-b">
          <div className="relative max-w-md">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Username, Nama Lengkap, atau Role..."
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48 font-semibold">UUID / ID Pengurus</TableHead>
                <TableHead className="w-40 font-semibold">Username</TableHead>
                <TableHead className="font-semibold">Nama Lengkap</TableHead>
                <TableHead className="w-48 text-center font-semibold">Role Akses</TableHead>
                <TableHead className="w-28 text-center font-semibold">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Memuat data pengurus...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-xs">
                    Tidak ada akun pengurus yang sesuai dengan kriteria pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.uuid} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[180px]">
                      {u.uuid}
                    </TableCell>
                    <TableCell className="font-bold text-foreground">
                      {u.username}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {u.namaLengkap}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderRoleBadge(u.role)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenModal(u)}
                          disabled={!isKetua}
                          title={isKetua ? 'Edit User' : 'Hanya Ketua'}
                        >
                          <Edit2 className="size-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteClick(u)}
                          disabled={!isKetua}
                          title={isKetua ? 'Hapus User' : 'Hanya Ketua'}
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

      {/* Modal Add / Edit User */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="size-4 text-primary" />
              <span>{selectedUser ? 'Edit Akun Pengurus' : 'Tambah Akun Pengurus Baru'}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? `Perbarui informasi kredensial dan hak akses untuk akun "${selectedUser.username}".`
                : 'Buat akun pengurus baru dengan hak akses yang sesuai dengan tugas dinas.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveUser} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Username Login</label>
              <Input
                type="text"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                placeholder="Misal: budi_santoso"
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nama Lengkap & Gelar</label>
              <Input
                type="text"
                value={formNama}
                onChange={(e) => setFormNama(e.target.value)}
                placeholder="Misal: Budi Santoso, S.Kom."
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Password</span>
                {selectedUser && (
                  <span className="text-[10px] text-muted-foreground">*Kosongkan jika tidak diganti</span>
                )}
              </label>
              <Input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder={selectedUser ? 'Ketik password baru (opsional)...' : 'Ketik password login...'}
                className="text-xs font-mono"
                required={!selectedUser}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Hak Akses (Role)</label>
              <Select
                value={formRole}
                onValueChange={(val) => val && setFormRole(val as 'ketua' | 'admin' | 'petugas')}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Pilih Role Akses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ketua">Ketua (Full Akses Master & Konfigurasi)</SelectItem>
                  <SelectItem value="admin">Admin Keuangan (Validasi Tagihan & Laporan)</SelectItem>
                  <SelectItem value="petugas">Petugas Loket (Pencatatan Pembayaran)</SelectItem>
                </SelectContent>
              </Select>
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
                {isSaving ? 'Menyimpan...' : 'Simpan Data Pengurus'}
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
              <span>Hapus Akun Pengurus</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus akun pengurus{' '}
              <strong className="text-foreground">{userToDelete?.namaLengkap}</strong> (Username:{' '}
              <span className="font-mono font-bold text-foreground">{userToDelete?.username}</span>)?
              Pengguna ini tidak akan dapat login lagi ke sistem. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Ya, Hapus Pengurus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
