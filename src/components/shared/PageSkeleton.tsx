import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton for Public Pages (Landing, Cek Tagihan)
 */
export function PublicPageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-ink-50)]">
      {/* Navbar Skeleton */}
      <div className="border-b border-[var(--color-ink-100)] bg-white/80 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="w-24 h-4 rounded" />
              <Skeleton className="w-16 h-2.5 rounded" />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Skeleton className="w-20 h-8 rounded-lg" />
            <Skeleton className="w-28 h-8 rounded-lg" />
            <Skeleton className="w-32 h-9 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <Skeleton className="w-48 h-6 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="w-full max-w-lg h-12 rounded-xl" />
              <Skeleton className="w-3/4 max-w-md h-12 rounded-xl" />
            </div>
            <Skeleton className="w-full max-w-xl h-20 rounded-xl" />
            <div className="flex gap-4 pt-2">
              <Skeleton className="w-44 h-12 rounded-xl" />
              <Skeleton className="w-36 h-12 rounded-xl" />
            </div>
            <div className="flex gap-6 pt-2">
              <Skeleton className="w-36 h-5 rounded-full" />
              <Skeleton className="w-36 h-5 rounded-full" />
            </div>
          </div>

          {/* Right Column (Hero Card) */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-3xl border border-[var(--color-ink-100)] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--color-ink-100)]">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="w-32 h-4 rounded" />
                    <Skeleton className="w-24 h-3 rounded" />
                  </div>
                </div>
                <Skeleton className="w-20 h-6 rounded-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="w-full h-8 rounded-lg" />
                <Skeleton className="w-full h-8 rounded-lg" />
                <Skeleton className="w-full h-8 rounded-lg" />
              </div>
              <Skeleton className="w-full h-11 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Internal Admin Dashboard Overview
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-2">
          <Skeleton className="w-56 h-8 rounded-lg" />
          <Skeleton className="w-80 h-4 rounded" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="w-28 h-9 rounded-lg" />
          <Skeleton className="w-32 h-9 rounded-lg" />
        </div>
      </div>

      {/* 4 KPI Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card p-5 rounded-xl border border-border space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="w-24 h-4 rounded" />
              <Skeleton className="w-9 h-9 rounded-lg" />
            </div>
            <Skeleton className="w-32 h-8 rounded-lg" />
            <Skeleton className="w-28 h-3 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Area (Chart + Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="w-36 h-6 rounded" />
            <Skeleton className="w-24 h-8 rounded-lg" />
          </div>
          <Skeleton className="w-full h-64 rounded-xl" />
        </div>
        <div className="bg-card p-6 rounded-xl border border-border space-y-4">
          <Skeleton className="w-32 h-6 rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="space-y-1">
                  <Skeleton className="w-28 h-4 rounded" />
                  <Skeleton className="w-20 h-3 rounded" />
                </div>
                <Skeleton className="w-16 h-6 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Data Tables (Pelanggan, Tagihan, Invoice, Wilayah, Tarif, User, etc.)
 */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb / Title Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-2">
          <Skeleton className="w-56 h-8 rounded-lg" />
          <Skeleton className="w-80 h-4 rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-28 h-9 rounded-lg" />
          <Skeleton className="w-32 h-9 rounded-lg" />
        </div>
      </div>

      {/* Filter / Search Bar Card Skeleton */}
      <div className="p-4 rounded-xl border border-border bg-card flex flex-wrap gap-3 items-center justify-between">
        <Skeleton className="w-72 h-9 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="w-28 h-9 rounded-lg" />
          <Skeleton className="w-28 h-9 rounded-lg" />
        </div>
      </div>

      {/* Table Card Skeleton */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        {/* Table Head */}
        <div className="bg-muted/40 px-6 py-3.5 flex gap-4 border-b border-border">
          <Skeleton className="w-12 h-4 rounded" />
          <Skeleton className="w-36 h-4 rounded" />
          <Skeleton className="w-48 h-4 rounded" />
          <Skeleton className="w-28 h-4 rounded" />
          <Skeleton className="w-24 h-4 rounded" />
          <Skeleton className="w-20 h-4 rounded ml-auto" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, idx) => (
            <div key={idx} className="px-6 py-4 flex gap-4 items-center">
              <Skeleton className="w-12 h-4 rounded" />
              <Skeleton className="w-36 h-5 rounded" />
              <Skeleton className="w-48 h-4 rounded" />
              <Skeleton className="w-28 h-4 rounded" />
              <Skeleton className="w-24 h-6 rounded-full" />
              <Skeleton className="w-16 h-8 rounded-lg ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
