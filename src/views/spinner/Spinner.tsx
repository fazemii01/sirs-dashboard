import { FC } from 'react';

const Spinner: FC = () => (
  <div
    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
    style={{ backgroundColor: 'var(--color-ink-50, #F7F9FA)' }}
  >
    {/* Concentric Loader Centerpiece */}
    <div className="relative flex items-center justify-center">
      {/* Soft Ambient Radiance */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 160,
          height: 160,
          background: 'var(--color-brand-mid, #0D6B5F)',
          opacity: 0.08,
          filter: 'blur(32px)',
        }}
      />

      {/* Concentric Circular SVG Spinner */}
      <svg
        className="dlh-orbit-spin"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: 124, height: 124, transformOrigin: 'center' }}
      >
        {/* Subtle base track */}
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="var(--color-ink-100, #EDF1F3)"
          strokeWidth="2.5"
        />
        {/* Animated accent arc */}
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="url(#dlh-spinner-gradient)"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeDasharray="264"
          strokeDashoffset="170"
        />
        <defs>
          <linearGradient id="dlh-spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-brand-mid, #0D6B5F)" />
            <stop offset="100%" stopColor="var(--color-brand-light, #14957F)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Central Circular Emblem Disc */}
      <div
        className="absolute rounded-full bg-white flex items-center justify-center p-3"
        style={{
          width: 74,
          height: 74,
          boxShadow: '0 4px 20px -2px rgba(13, 107, 95, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(226, 232, 240, 0.85)',
        }}
      >
        <img
          src="/logo-dlh.png"
          alt="DLH Lumajang"
          className="w-full h-full object-contain"
        />
      </div>
    </div>

    {/* Brand Title & Department Typography */}
    <div className="mt-6 flex flex-col items-center gap-1 text-center">
      <span
        className="text-sm font-bold uppercase"
        style={{
          letterSpacing: '0.22em',
          color: 'var(--color-brand-deep, #0A4A42)',
        }}
      >
        E-Marisa
      </span>
      <span
        className="text-xs font-medium"
        style={{
          letterSpacing: '0.01em',
          color: 'var(--color-ink-500, #64748B)',
        }}
      >
        Dinas Lingkungan Hidup Kabupaten Lumajang
      </span>

      {/* Minimalist Indeterminate Progress Bar */}
      <div
        className="mt-3.5 rounded-full overflow-hidden relative"
        style={{
          width: 124,
          height: 3,
          backgroundColor: 'var(--color-ink-100, #EDF1F3)',
        }}
      >
        <div className="dlh-beam" />
      </div>
    </div>

    {/* Keyframe animations */}
    <style>{`
      @keyframes dlhOrbitSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .dlh-orbit-spin {
        animation: dlhOrbitSpin 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }
      @keyframes dlhBeamSlide {
        0% { transform: translateX(-48px); }
        50% { transform: translateX(54px); }
        100% { transform: translateX(130px); }
      }
      .dlh-beam {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 48px;
        border-radius: 9999px;
        background: linear-gradient(90deg, transparent, var(--color-brand-mid, #0D6B5F), transparent);
        animation: dlhBeamSlide 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }
    `}</style>
  </div>
);

export default Spinner;
