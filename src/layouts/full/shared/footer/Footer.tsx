import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left py-2 border-t border-border/40 text-xs text-muted-foreground">
      <p>
        &copy; 2026 Dinas Lingkungan Hidup Kabupaten Lumajang &mdash; Sistem Informasi Retribusi Sampah (E-Marisa)
      </p>

      <div className="flex items-center gap-4 text-xs font-medium">
        <Link
          to="/"
          className="hover:text-primary transition-colors"
        >
          Portal Publik
        </Link>
        <span className="text-border">&bull;</span>
        <Link
          to="/dashboard"
          className="hover:text-primary transition-colors"
        >
          Dashboard Internal
        </Link>
        <span className="text-border">&bull;</span>
        <span className="text-muted-foreground/80 font-mono text-[11px]">
          v1.0.0
        </span>
      </div>
    </footer>
  );
}
