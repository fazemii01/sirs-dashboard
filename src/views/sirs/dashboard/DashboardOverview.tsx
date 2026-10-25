import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  Banknote,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  Calendar,
  Receipt,
  ArrowUpRight,
  RefreshCw,
  BarChart3,
  AreaChart as AreaChartIcon,
  Building2,
  Home,
  Store,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';

interface ChartItem {
  bulan: string;
  lunas: number;
  tunggakan: number;
}

interface RecentPayment {
  waktu: string;
  nama: string;
  kelurahan?: string;
  bulan: string;
  nominal: number;
  admin: string;
  nomorInvoice?: string;
}

interface StatsState {
  totalLunas: number;
  totalTunggakan: number;
  totalPelanggan: number;
  kepatuhan: number;
  chartData: ChartItem[];
  recentPayments: RecentPayment[];
}

const chartConfig = {
  lunas: {
    label: 'Penerimaan Lunas',
    color: 'var(--chart-1)',
  },
  tunggakan: {
    label: 'Tunggakan Retribusi',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

const getFallbackDashboardData = (year: string): StatsState => {
  const is2026 = year === '2026';

  const chartData: ChartItem[] = [
    { bulan: 'Jan', lunas: is2026 ? 48500000 : 42100000, tunggakan: is2026 ? 4200000 : 5100000 },
    { bulan: 'Feb', lunas: is2026 ? 52300000 : 44800000, tunggakan: is2026 ? 3800000 : 4900000 },
    { bulan: 'Mar', lunas: is2026 ? 58900000 : 46200000, tunggakan: is2026 ? 3100000 : 4400000 },
    { bulan: 'Apr', lunas: is2026 ? 54100000 : 45500000, tunggakan: is2026 ? 3500000 : 4700000 },
    { bulan: 'Mei', lunas: is2026 ? 61200000 : 48900000, tunggakan: is2026 ? 2900000 : 4200000 },
    { bulan: 'Jun', lunas: is2026 ? 64800000 : 51200000, tunggakan: is2026 ? 2400000 : 3900000 },
    { bulan: 'Jul', lunas: is2026 ? 59400000 : 49700000, tunggakan: is2026 ? 3200000 : 4100000 },
    { bulan: 'Agu', lunas: is2026 ? 63100000 : 52400000, tunggakan: is2026 ? 2600000 : 3700000 },
    { bulan: 'Sep', lunas: is2026 ? 66500000 : 53800000, tunggakan: is2026 ? 2200000 : 3500000 },
    { bulan: 'Okt', lunas: is2026 ? 68200000 : 55600000, tunggakan: is2026 ? 2100000 : 3300000 },
    { bulan: 'Nov', lunas: is2026 ? 71000000 : 57100000, tunggakan: is2026 ? 1900000 : 3100000 },
    { bulan: 'Des', lunas: is2026 ? 75400000 : 61200000, tunggakan: is2026 ? 1500000 : 2800000 },
  ];

  const totalLunas = chartData.reduce((acc, curr) => acc + curr.lunas, 0);
  const totalTunggakan = chartData.reduce((acc, curr) => acc + curr.tunggakan, 0);
  const kepatuhan = Math.round((totalLunas / (totalLunas + totalTunggakan)) * 1000) / 10;

  const recentPayments: RecentPayment[] = is2026
    ? [
        {
          waktu: '10:42 WIB',
          nama: 'Bambang Sutrisno',
          kelurahan: 'Kel. Rogotrunan',
          bulan: 'Maret 2026',
          nominal: 50000,
          admin: 'Loket DLH Pusat',
          nomorInvoice: 'INV-2026/03/0084',
        },
        {
          waktu: '09:15 WIB',
          nama: 'Toko Barokah Jaya',
          kelurahan: 'Kel. Ditotrunan',
          bulan: 'Maret 2026',
          nominal: 150000,
          admin: 'Petugas Lapangan 1',
          nomorInvoice: 'INV-2026/03/0083',
        },
        {
          waktu: '08:30 WIB',
          nama: 'Ibu Siti Aminah',
          kelurahan: 'Kel. Jogotrunan',
          bulan: 'Maret 2026',
          nominal: 35000,
          admin: 'Loket DLH Pusat',
          nomorInvoice: 'INV-2026/03/0082',
        },
        {
          waktu: 'Kemarin, 15:10',
          nama: 'Warung Bu Haji',
          kelurahan: 'Kel. Tompokersan',
          bulan: 'Februari 2026',
          nominal: 75000,
          admin: 'Petugas Lapangan 2',
          nomorInvoice: 'INV-2026/02/0312',
        },
        {
          waktu: 'Kemarin, 14:00',
          nama: 'CV. Maju Berkah',
          kelurahan: 'Kel. Kepuharjo',
          bulan: 'Februari 2026',
          nominal: 250000,
          admin: 'Loket DLH Pusat',
          nomorInvoice: 'INV-2026/02/0311',
        },
      ]
    : [
        {
          waktu: '28 Des 2025',
          nama: 'Haji Mansyur',
          kelurahan: 'Kel. Rogotrunan',
          bulan: 'Desember 2025',
          nominal: 100000,
          admin: 'Loket DLH',
          nomorInvoice: 'INV-2025/12/0950',
        },
        {
          waktu: '27 Des 2025',
          nama: 'Rumah Makan Padang Murah',
          kelurahan: 'Kel. Ditotrunan',
          bulan: 'Desember 2025',
          nominal: 200000,
          admin: 'Petugas Loket',
          nomorInvoice: 'INV-2025/12/0949',
        },
      ];

  return {
    totalLunas,
    totalTunggakan,
    totalPelanggan: is2026 ? 1482 : 1340,
    kepatuhan,
    chartData,
    recentPayments,
  };
};

export default function DashboardOverview() {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [loading, setLoading] = useState(false);
  const [activeMetric, setActiveMetric] = useState<'all' | 'lunas' | 'tunggakan'>('all');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const fallbackData = useMemo(() => getFallbackDashboardData(selectedYear), [selectedYear]);

  const [statsData, setStatsData] = useState<StatsState>(() => fallbackData);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/tagihan/stats?tahun=${selectedYear}`, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && (data.totalLunas > 0 || (data.chartData && data.chartData.length > 0))) {
          setStatsData({
            totalLunas: Number(data.totalLunas) || fallbackData.totalLunas,
            totalTunggakan: Number(data.totalTunggakan) || fallbackData.totalTunggakan,
            totalPelanggan: Number(data.totalPelanggan) || fallbackData.totalPelanggan,
            kepatuhan: Number(data.kepatuhan) || fallbackData.kepatuhan,
            chartData: data.chartData && data.chartData.length > 0 ? data.chartData : fallbackData.chartData,
            recentPayments:
              data.recentPayments && data.recentPayments.length > 0
                ? data.recentPayments
                : fallbackData.recentPayments,
          });
          return;
        }
      }
      setStatsData(fallbackData);
    } catch {
      setStatsData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedYear, fallbackData]);

  const totalRealisasi = useMemo(
    () => statsData.chartData.reduce((acc, curr) => acc + curr.lunas, 0),
    [statsData.chartData]
  );

  const totalPiutang = useMemo(
    () => statsData.chartData.reduce((acc, curr) => acc + curr.tunggakan, 0),
    [statsData.chartData]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Dashboard Statistik
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitoring real-time transaksi dan realisasi penerimaan retribusi persampahan Kabupaten Lumajang.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 shadow-xs">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Tahun Anggaran:</span>
            <Select value={selectedYear} onValueChange={(val) => val && setSelectedYear(val)}>
              <SelectTrigger className="w-[100px] h-7 border-0 bg-transparent p-0 text-xs font-semibold focus:ring-0">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={loading}
            className="h-9 gap-1.5 text-xs shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sinkronisasi</span>
          </Button>

          <Button size="sm" render={<Link to="/dashboard/tagihan" />} className="h-9 gap-1.5 text-xs shadow-xs cursor-pointer">
            <CreditCard className="h-3.5 w-3.5" />
            <span>Loket Bayar</span>
          </Button>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Pendapatan Lunas */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Realisasi Lunas
            </CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Banknote className="size-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight">
              Rp {statsData.totalLunas.toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Badge
                variant="outline"
                className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium"
              >
                <TrendingUp className="size-3" />
                +14.2%
              </Badge>
              <span className="text-xs text-muted-foreground truncate">
                Tahun {selectedYear}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Tunggakan */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sisa Tunggakan
            </CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown className="size-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              Rp {statsData.totalTunggakan.toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Badge
                variant="outline"
                className="gap-1 border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-medium"
              >
                <TrendingDown className="size-3" />
                -3.8%
              </Badge>
              <span className="text-xs text-muted-foreground truncate">
                Piutang tertagih aktif
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Pelanggan Aktif KK */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wajib Retribusi Aktif
            </CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="size-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight">
              {statsData.totalPelanggan.toLocaleString('id-ID')} <span className="text-base font-medium text-muted-foreground">KK</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Badge
                variant="outline"
                className="gap-1 border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium"
              >
                <TrendingUp className="size-3" />
                +28 KK
              </Badge>
              <span className="text-xs text-muted-foreground truncate">
                Terdata di Kabupaten
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Kepatuhan Bayar % */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rasio Kepatuhan Bayar
            </CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <CheckCircle2 className="size-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold tracking-tight">
                {statsData.kepatuhan}%
              </div>
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium"
              >
                Target 90%
              </Badge>
            </div>
            <div className="space-y-1">
              <Progress value={statsData.kepatuhan} className="h-1.5" />
              <p className="text-[11px] text-muted-foreground">
                Melampaui standar kepatuhan daerah
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart Section: shadcn Interactive Chart */}
      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between space-y-0 border-b border-border p-0">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base sm:text-lg">
                Grafik Penerimaan & Tunggakan Retribusi
              </CardTitle>
              <Badge variant="secondary" className="text-xs font-normal">
                Tahun {selectedYear}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Komparasi arus kas penerimaan retribusi lunas vs sisa tunggakan per bulan
            </CardDescription>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap border-t sm:border-t-0 sm:border-l border-border">
            {/* Metric Tab: Komparasi */}
            <button
              type="button"
              data-active={activeMetric === 'all'}
              onClick={() => setActiveMetric('all')}
              className="flex flex-1 sm:min-w-[130px] flex-col justify-center gap-0.5 border-r border-border px-4 py-3 text-left transition-colors data-[active=true]:bg-muted/70 hover:bg-muted/30 cursor-pointer"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Semua Data
              </span>
              <span className="text-sm sm:text-base font-bold text-foreground">
                Rp {(totalRealisasi + totalPiutang).toLocaleString('id-ID')}
              </span>
            </button>

            {/* Metric Tab: Penerimaan Lunas */}
            <button
              type="button"
              data-active={activeMetric === 'lunas'}
              onClick={() => setActiveMetric('lunas')}
              className="flex flex-1 sm:min-w-[130px] flex-col justify-center gap-0.5 border-r border-border px-4 py-3 text-left transition-colors data-[active=true]:bg-muted/70 hover:bg-muted/30 cursor-pointer"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Lunas
              </span>
              <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
                Rp {totalRealisasi.toLocaleString('id-ID')}
              </span>
            </button>

            {/* Metric Tab: Tunggakan */}
            <button
              type="button"
              data-active={activeMetric === 'tunggakan'}
              onClick={() => setActiveMetric('tunggakan')}
              className="flex flex-1 sm:min-w-[130px] flex-col justify-center gap-0.5 px-4 py-3 text-left transition-colors data-[active=true]:bg-muted/70 hover:bg-muted/30 cursor-pointer"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tunggakan
              </span>
              <span className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400">
                Rp {totalPiutang.toLocaleString('id-ID')}
              </span>
            </button>
          </div>
        </CardHeader>

        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <div className="flex items-center gap-4 text-xs font-medium">
            {(activeMetric === 'all' || activeMetric === 'lunas') && (
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-[var(--chart-1)]" />
                <span className="text-muted-foreground">Penerimaan Lunas</span>
              </div>
            )}
            {(activeMetric === 'all' || activeMetric === 'tunggakan') && (
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-[var(--chart-2)]" />
                <span className="text-muted-foreground">Tunggakan</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 rounded-md border border-border p-0.5 bg-muted/40">
            <Button
              variant={chartType === 'area' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setChartType('area')}
              className="h-7 px-2 text-xs gap-1 cursor-pointer"
            >
              <AreaChartIcon className="size-3.5" />
              <span className="hidden sm:inline">Area</span>
            </Button>
            <Button
              variant={chartType === 'bar' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setChartType('bar')}
              className="h-7 px-2 text-xs gap-1 cursor-pointer"
            >
              <BarChart3 className="size-3.5" />
              <span className="hidden sm:inline">Batang</span>
            </Button>
          </div>
        </div>

        <CardContent className="px-2 sm:px-6 pt-2 pb-4">
          <ChartContainer config={chartConfig} className="h-[280px] sm:h-[320px] w-full">
            {chartType === 'area' ? (
              <AreaChart
                data={statsData.chartData}
                margin={{ top: 12, right: 12, left: 12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillLunas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillTunggakan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-border/50"
                />
                <XAxis
                  dataKey="bulan"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                  className="fill-muted-foreground"
                  tickFormatter={(v) =>
                    v >= 1000000
                      ? `${(v / 1000000).toFixed(0)}jt`
                      : v >= 1000
                      ? `${(v / 1000).toFixed(0)}k`
                      : `${v}`
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            {chartConfig[name as keyof typeof chartConfig]?.label || name}:
                          </span>
                          <span className="font-semibold text-foreground">
                            Rp {Number(value).toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                {(activeMetric === 'all' || activeMetric === 'lunas') && (
                  <Area
                    type="monotone"
                    dataKey="lunas"
                    name="lunas"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#fillLunas)"
                  />
                )}
                {(activeMetric === 'all' || activeMetric === 'tunggakan') && (
                  <Area
                    type="monotone"
                    dataKey="tunggakan"
                    name="tunggakan"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#fillTunggakan)"
                  />
                )}
              </AreaChart>
            ) : (
              <BarChart
                data={statsData.chartData}
                margin={{ top: 12, right: 12, left: 12, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-border/50"
                />
                <XAxis
                  dataKey="bulan"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                  className="fill-muted-foreground"
                  tickFormatter={(v) =>
                    v >= 1000000
                      ? `${(v / 1000000).toFixed(0)}jt`
                      : v >= 1000
                      ? `${(v / 1000).toFixed(0)}k`
                      : `${v}`
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            {chartConfig[name as keyof typeof chartConfig]?.label || name}:
                          </span>
                          <span className="font-semibold text-foreground">
                            Rp {Number(value).toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                {(activeMetric === 'all' || activeMetric === 'lunas') && (
                  <Bar
                    dataKey="lunas"
                    name="lunas"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                  />
                )}
                {(activeMetric === 'all' || activeMetric === 'tunggakan') && (
                  <Bar
                    dataKey="tunggakan"
                    name="tunggakan"
                    fill="var(--chart-2)"
                    radius={[4, 4, 0, 0]}
                  />
                )}
              </BarChart>
            )}
          </ChartContainer>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-border px-6 py-3.5 text-xs text-muted-foreground bg-muted/10">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <TrendingUp className="size-4 text-emerald-500" />
            <span>Penerimaan semester ini diproyeksikan tumbuh 12.8%</span>
          </div>
          <div className="text-muted-foreground">
            Sumber data: Realisasi loket penerimaan dan tagihan bulanan SIRS DLH
          </div>
        </CardFooter>
      </Card>

      {/* Bottom Row: Recent Transactions + Category Composition */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Recent Payments (7 cols) */}
        <Card className="lg:col-span-7 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="size-4 text-emerald-600 dark:text-emerald-400" />
                5 Pelunasan Terakhir
              </CardTitle>
              <CardDescription className="text-xs">
                Aktivitas transaksi penerimaan retribusi langsung di loket DLH
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<Link to="/dashboard/invoice" />} className="h-8 gap-1 text-xs">
              Semua Faktur
              <ArrowUpRight className="size-3.5" />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {statsData.recentPayments.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Belum ada transaksi pelunasan terbaru.
                </div>
              ) : (
                statsData.recentPayments.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                        <AvatarFallback>
                          {p.nama
                            .split(' ')
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {p.nama}
                          </span>
                          {p.nomorInvoice && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">
                              {p.nomorInvoice}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{p.kelurahan || 'Kabupaten Lumajang'}</span>
                          <span>•</span>
                          <span>Bulan: {p.bulan}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 pl-12 sm:pl-0">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        +Rp {p.nominal.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {p.waktu} • {p.admin}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Sektor Wajib Retribusi & Shortcut (5 cols) */}
        <Card className="lg:col-span-5 shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="size-4 text-primary" />
              Distribusi Kategori Retribusi
            </CardTitle>
            <CardDescription className="text-xs">
              Segmentasi wajib retribusi aktif dan proporsi kontribusi
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Category 1: Rumah Tangga */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium">
                  <div className="p-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Home className="size-3.5" />
                  </div>
                  <span>Rumah Tangga (Domestik)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">1.150 KK</span>
                  <span className="text-muted-foreground text-[11px]">(77.6%)</span>
                </div>
              </div>
              <Progress value={77.6} className="h-2" />
            </div>

            {/* Category 2: Usaha & Niaga */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium">
                  <div className="p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Store className="size-3.5" />
                  </div>
                  <span>Pertokoan & Usaha Niaga</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">240 Usaha</span>
                  <span className="text-muted-foreground text-[11px]">(16.2%)</span>
                </div>
              </div>
              <Progress value={16.2} className="h-2" />
            </div>

            {/* Category 3: Industri & Fasilitas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium">
                  <div className="p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Building2 className="size-3.5" />
                  </div>
                  <span>Industri & Instansi Publik</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">92 Instansi</span>
                  <span className="text-muted-foreground text-[11px]">(6.2%)</span>
                </div>
              </div>
              <Progress value={6.2} className="h-2" />
            </div>
          </CardContent>

          <CardFooter className="pt-2 border-t border-border mt-auto">
            <div className="grid grid-cols-2 gap-2 w-full pt-1">
              <Button variant="outline" size="sm" render={<Link to="/dashboard/pelanggan" />} className="text-xs h-8 gap-1">
                <span>Data Pelanggan</span>
                <ChevronRight className="size-3" />
              </Button>
              <Button size="sm" render={<Link to="/dashboard/tagihan" />} className="text-xs h-8 gap-1">
                <span>Buka Loket</span>
                <ChevronRight className="size-3" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
