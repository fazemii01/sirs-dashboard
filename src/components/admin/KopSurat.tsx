interface KopSuratProps {
  subTitle?: string;
  alamatLine1?: string;
  alamatLine2?: string;
  telepon?: string;
  faksimile?: string;
  website?: string;
  email?: string;
}

export default function KopSurat({
  subTitle = 'DINAS LINGKUNGAN HIDUP',
  alamatLine1 = 'Jl. Langsep No. 15, Kel. Kepuharjo, Kec. Lumajang',
  alamatLine2 = '',
  telepon = '(0334) 888358',
  faksimile = '(0334) 888358',
  website = 'dlh.lumajangkab.go.id',
  email = 'lingkungan@lumajangkab.go.id',
}: KopSuratProps) {
  return (
    <div className="w-full text-slate-900 font-sans mb-3">
      <div className="grid grid-cols-[75px_1fr] items-center gap-3 pb-2">
        {/* Logo Pemkab Lumajang */}
        <div className="w-[75px] h-[75px] flex items-center justify-center flex-shrink-0">
          <img
            src="/logo-dlh.png"
            alt="Logo Pemkab Lumajang"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.visibility = 'hidden';
            }}
          />
        </div>

        {/* Text Details */}
        <div className="text-center font-sans">
          <h2 className="text-xs sm:text-sm font-bold tracking-wider text-slate-800 uppercase leading-snug">
            PEMERINTAH KABUPATEN LUMAJANG
          </h2>
          <h1 className="text-sm sm:text-base font-black tracking-wide text-slate-900 uppercase my-0.5 leading-snug">
            {subTitle}
          </h1>
          <p className="text-[11px] text-slate-600 leading-tight">
            {alamatLine1}
          </p>
          {alamatLine2 && (
            <p className="text-[11px] text-slate-600 leading-tight">
              {alamatLine2}
            </p>
          )}
          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
            Telp {telepon} - Fax {faksimile}
          </p>
          <p className="text-[10px] text-slate-500 leading-tight">
            website : {website} - email : {email}
          </p>
        </div>
      </div>

      {/* Solid Horizontal Line Divider */}
      <div className="border-b-2 border-slate-900 my-1 w-full" />
    </div>
  );
}
