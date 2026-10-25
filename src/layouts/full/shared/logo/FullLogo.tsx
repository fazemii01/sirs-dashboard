import { Link } from 'react-router';

const FullLogo = () => {
  return (
    <Link to="/dashboard" className="flex items-center gap-2 select-none group">
      {/* Highlighted Emblem Box */}
      <div className="size-9 rounded-xl bg-card border border-border shadow-xs flex items-center justify-center p-1 shrink-0 transition-transform group-hover:scale-105">
        <img
          src="/logo-dlh.png"
          alt="DLH Lumajang"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left justify-center leading-none">
        <span className="text-sm font-bold tracking-tight text-foreground">
          E-Marisa
        </span>
        <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase mt-1">
          DLH Lumajang
        </span>
      </div>
    </Link>
  );
};

export default FullLogo;
