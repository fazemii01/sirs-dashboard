import { useState, useMemo, useRef, useEffect } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, Search, X, ZapOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TarifOption {
  va: number;
  nama: string;
  nominal: number;
  kategori?: string;
}

interface TarifComboboxProps {
  value: string;
  onChange: (value: string) => void;
  tarifList: TarifOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function matchesTarifQuery(tarif: TarifOption, query: string): boolean {
  if (!query || !query.trim()) return true;

  const q = query.toLowerCase().trim();
  const cleanQ = q.replace(/[^a-z0-9]/g, '');

  const vaStr = tarif.va.toString();
  const vaWithUnit = `${tarif.va}va`;
  const vaWithVolt = `${tarif.va}volt`;
  const nameStr = (tarif.nama || '').toLowerCase();
  const cleanName = nameStr.replace(/[^a-z0-9]/g, '');

  const nominalStr = tarif.nominal.toString();
  const cleanNominal = nominalStr.replace(/[^0-9]/g, '');
  const formattedNominal = tarif.nominal.toLocaleString('id-ID'); // e.g. "5.000", "1.500.000"

  // 1. Direct contains check
  if (
    vaStr.includes(q) ||
    nameStr.includes(q) ||
    nominalStr.includes(q) ||
    formattedNominal.includes(q) ||
    vaWithUnit.includes(q) ||
    vaWithVolt.includes(q)
  ) {
    return true;
  }

  // 2. Normalized check (handles "5.000" vs "5000", "900 VA" vs "900va", "Rp 8.000" vs "8000")
  if (cleanQ.length > 0) {
    if (
      vaStr.includes(cleanQ) ||
      cleanName.includes(cleanQ) ||
      cleanNominal.includes(cleanQ) ||
      vaWithUnit.includes(cleanQ) ||
      vaWithVolt.includes(cleanQ)
    ) {
      return true;
    }
  }

  // 3. Multi-word search (e.g. "900 rumah", "rs 1.500")
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const allMatch = tokens.every((token) => {
      const cleanToken = token.replace(/[^a-z0-9]/g, '');
      return (
        vaStr.includes(token) ||
        nameStr.includes(token) ||
        nominalStr.includes(token) ||
        formattedNominal.includes(token) ||
        (cleanToken && (vaStr.includes(cleanToken) || cleanNominal.includes(cleanToken) || cleanName.includes(cleanToken)))
      );
    });
    if (allMatch) return true;
  }

  return false;
}

export default function TarifCombobox({
  value,
  onChange,
  tarifList,
  placeholder = 'Pilih Daya Listrik / Tarif Retribusi...',
  disabled = false,
  className,
}: TarifComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when popover opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [open]);

  const selectedTarif = useMemo(() => {
    return tarifList.find((t) => t.va.toString() === value);
  }, [tarifList, value]);

  const filteredTarifList = useMemo(() => {
    return tarifList.filter((t) => matchesTarifQuery(t, search));
  }, [tarifList, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'w-full h-9 px-3 rounded-md border border-input bg-card text-xs flex items-center justify-between gap-2 shadow-xs hover:bg-accent/40 focus:outline-none focus:ring-1 focus:ring-ring transition-colors cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed',
              !selectedTarif && !value && 'text-muted-foreground',
              className
            )}
          />
        }
      >
        {selectedTarif ? (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Badge
              variant="outline"
              className="font-mono text-[10px] px-1 py-0 h-4 bg-muted text-foreground shrink-0 border-border"
            >
              {selectedTarif.va} VA
            </Badge>
            <span className="truncate font-medium text-foreground">
              {selectedTarif.nama}
            </span>
            <span className="ml-auto text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
              Rp {selectedTarif.nominal.toLocaleString('id-ID')}
            </span>
          </div>
        ) : value ? (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Badge
              variant="outline"
              className="font-mono text-[10px] px-1 py-0 h-4 bg-muted text-foreground shrink-0 border-border"
            >
              {value} VA
            </Badge>
            <span className="truncate font-medium text-foreground">
              Tarif Khusus ({value} VA)
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground truncate">{placeholder}</span>
        )}
        <ChevronsUpDown className="size-3.5 text-muted-foreground shrink-0 ml-1" />
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        sideOffset={6}
        collisionAvoidance={{ side: 'none' }}
        className="w-[calc(100vw-32px)] sm:w-[420px] max-w-[420px] p-0 shadow-xl rounded-xl border border-border bg-popover z-50 overflow-hidden"
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2 bg-muted/20">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari VA, nama, atau tarif (cth: 900, miskin, 8000)..."
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                searchInputRef.current?.focus();
              }}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded-sm cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Status subheader */}
        <div className="px-3 py-1.5 text-[11px] font-medium text-muted-foreground bg-muted/30 border-b border-border/50 flex justify-between items-center">
          <span>{filteredTarifList.length} opsi daya & tarif</span>
          {filteredTarifList.length > 6 && (
            <span className="text-[10px] text-muted-foreground/80">Maks 6 baris terlihat (gulir ke bawah)</span>
          )}
        </div>

        {/* Scrollable List strictly sized to exactly 6 items (6 * 38px + borders = 236px) */}
        <div className="max-h-[236px] overflow-y-auto p-1 divide-y divide-border/40">
          {filteredTarifList.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground space-y-1.5">
              <ZapOff className="size-6 mx-auto text-muted-foreground/60 mb-2" />
              <p className="font-semibold text-foreground">Tarif tidak ditemukan</p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Tidak ada tarif yang cocok dengan &quot;{search}&quot;. Coba cari dengan angka daya (misal: 450, 900), nama kategori, atau nominal harga (misal: 8000).
              </p>
            </div>
          ) : (
            filteredTarifList.map((t) => {
              const isSelected = value === t.va.toString();
              return (
                <div
                  key={t.va}
                  onClick={() => {
                    onChange(t.va.toString());
                    setOpen(false);
                  }}
                  className={cn(
                    'h-[38px] flex items-center justify-between gap-2.5 px-2.5 rounded-md text-xs cursor-pointer select-none transition-colors shrink-0',
                    isSelected
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Badge
                      variant={isSelected ? 'default' : 'secondary'}
                      className={cn(
                        'font-mono text-[10px] font-bold px-1.5 py-0 h-5 shrink-0',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                      )}
                    >
                      {t.va} VA
                    </Badge>
                    <span className="truncate text-xs font-semibold text-foreground">
                      {t.nama}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      Rp {t.nominal.toLocaleString('id-ID')}
                      <span className="text-[10px] font-normal text-muted-foreground ml-1">/bln</span>
                    </span>
                    {isSelected && (
                      <Check className="size-3.5 text-primary shrink-0" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
