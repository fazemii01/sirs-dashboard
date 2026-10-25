import KopSurat from './KopSurat';
import { QRCodeSVG } from 'qrcode.react';
import { APP_DOMAIN } from '@/lib/api';

interface ReceiptPrintProps {
  invoiceId: string;
  waktu: string;
  bulan: string;
  idPelanggan: string;
  nama: string;
  alamat: string;
  nominal: number;
  admin: string;
}

export default function ReceiptPrint({
  invoiceId,
  waktu,
  bulan,
  idPelanggan,
  nama,
  alamat,
  nominal,
  admin,
}: ReceiptPrintProps) {
  const publicUrl = `${APP_DOMAIN.replace(/\/$/, '')}/tagihan?id=${encodeURIComponent(idPelanggan)}&invoice=${encodeURIComponent(invoiceId)}`;

  return (
    <div className="receipt-card-container bg-white p-6 max-w-xl mx-auto text-slate-900 font-sans space-y-4 border border-slate-300 rounded-2xl shadow-xs">
      {/* Official Government Kop Surat */}
      <KopSurat subTitle="DINAS LINGKUNGAN HIDUP" />

      {/* Document Title & Invoice Number */}
      <div className="text-center bg-slate-100 border border-slate-200 rounded-xl py-2 px-3">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
          TANDA BUKTI PEMBAYARAN RETRIBUSI SAMPAH
        </h3>
        <p className="text-[11px] font-mono font-bold text-slate-600 tracking-wider mt-0.5">
          No. Invoice: {invoiceId}
        </p>
      </div>

      {/* Details Key-Value Alignment */}
      <div className="py-1">
        <table className="w-full text-xs sm:text-sm border-collapse">
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-2 w-[160px] text-slate-500 font-medium whitespace-nowrap">Waktu Bayar</td>
              <td className="py-2 w-[14px] text-center font-bold text-slate-400">:</td>
              <td className="py-2 font-semibold text-slate-900">{waktu}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 w-[160px] text-slate-500 font-medium whitespace-nowrap">Bulan Tagihan</td>
              <td className="py-2 w-[14px] text-center font-bold text-slate-400">:</td>
              <td className="py-2 font-semibold text-slate-900">{bulan}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 w-[160px] text-slate-500 font-medium whitespace-nowrap">ID Wajib Retribusi</td>
              <td className="py-2 w-[14px] text-center font-bold text-slate-400">:</td>
              <td className="py-2 font-mono font-bold text-slate-900 tracking-wider">{idPelanggan}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 w-[160px] text-slate-500 font-medium whitespace-nowrap">Nama Pelanggan</td>
              <td className="py-2 w-[14px] text-center font-bold text-slate-400">:</td>
              <td className="py-2 font-bold text-slate-900">{nama}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 w-[160px] text-slate-500 font-medium whitespace-nowrap">Alamat</td>
              <td className="py-2 w-[14px] text-center font-bold text-slate-400">:</td>
              <td className="py-2 font-medium text-slate-800 leading-snug">{alamat}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Total Amount Container */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex justify-between items-center shadow-2xs">
        <span className="text-slate-600 font-bold uppercase tracking-wide text-xs">Total Bayar</span>
        <span className="text-lg font-black text-emerald-800">Rp {nominal.toLocaleString('id-ID')}</span>
      </div>

      {/* QR Code & Signature Block */}
      <div className="pt-3 grid grid-cols-2 gap-4 items-end border-t border-slate-200">
        <div className="flex flex-col items-center justify-center text-center space-y-1.5">
          <QRCodeSVG value={publicUrl} size={85} level="M" />
          <p className="text-[9px] text-slate-500 leading-tight">
            Bukti Resmi Pembayaran Retribusi Sampah DLH Kab. Lumajang.
          </p>
        </div>
        <div className="text-right text-xs space-y-8 min-w-[200px] whitespace-nowrap">
          <div>
            <p className="font-semibold text-slate-700">Petugas / Admin Penerima,</p>
          </div>
          <div>
            <p className="font-bold underline text-slate-900 uppercase">
              ( {admin || 'Petugas Loket DLH'} )
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">DLH Kab. Lumajang</p>
          </div>
        </div>
      </div>
    </div>
  );
}
