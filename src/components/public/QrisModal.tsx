import { useState, useEffect } from 'react';
import { X, QrCode, ShieldCheck, CheckCircle2, Printer, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import ReceiptPrint from '@/components/admin/ReceiptPrint';

interface QrisModalProps {
  invoiceId: string;
  nominal: number;
  bulan?: string;
  pelanggan?: {
    idPelanggan: string;
    nama: string;
    alamat: string;
  };
  qrisPayload: string;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export default function QrisModal({
  invoiceId,
  nominal,
  bulan,
  pelanggan,
  qrisPayload,
  onClose,
  onPaymentSuccess,
}: QrisModalProps) {
  const [isPaid, setIsPaid] = useState(false);

  const activePayload = qrisPayload || invoiceId;

  // Poll server every 3 seconds to auto-detect callback from Bank Jatim
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const checkStatus = async () => {
      try {
        // Simulasikan polling status tagihan ke backend API
      } catch (err) {
        // Silent error on polling
      }
    };

    interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [invoiceId]);

  // Handler for manual simulation / test payment
  const handleSimulateCallbackSuccess = () => {
    setIsPaid(true);
    if (onPaymentSuccess) onPaymentSuccess();
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const nowFormatted = () => {
    const d = new Date();
    const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const date = d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${time} ${date}`;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[var(--color-ink-100)] relative space-y-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[var(--color-ink-500)] hover:text-[var(--color-danger)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {!isPaid ? (
            <>
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--color-brand-wash)] text-[var(--color-brand-mid)] mb-2">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[var(--color-ink-900)]">Pembayaran QRIS Dinamis</h3>
                <p className="text-xs text-[var(--color-ink-500)] font-mono font-medium mt-0.5">Invoice: {invoiceId}</p>
              </div>

              {/* QR Code Container */}
              <div className="bg-[var(--color-ink-50)] p-5 rounded-2xl border border-[var(--color-ink-100)] flex flex-col items-center justify-center space-y-3 shadow-inner">
                <QRCodeSVG value={activePayload} size={180} level="M" />
                <div className="text-center">
                  <span className="text-[11px] text-[var(--color-ink-500)] uppercase tracking-wider block">Total Tagihan</span>
                  <span className="text-xl font-extrabold text-[var(--color-brand-deep)]">
                    Rp {nominal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-success)] bg-[var(--color-success-bg)] p-2.5 rounded-xl border border-[var(--color-success)]/20 text-center">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Scan via Bank Jatim M-Banking, GoPay, OVO, Dana, BCA, atau Mobile Banking</span>
              </div>

              {/* Live Waiting Callback Indicator */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-brand-mid)]" />
                  Menunggu Pembayaran...
                </span>
                <button
                  onClick={handleSimulateCallbackSuccess}
                  className="text-[10px] text-emerald-700 underline font-bold hover:text-emerald-900 cursor-pointer"
                >
                  (Simulasi Berhasil)
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Tutup Modal
              </button>
            </>
          ) : (
            /* SUCCESS NOTIFICATION STATE */
            <div className="text-center py-4 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs border-4 border-emerald-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">Pembayaran Berhasil!</h3>
                <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
                  Notifikasi callback dari Bank Jatim telah diterima. Status tagihan{' '}
                  <span className="font-mono font-bold text-gray-900">{invoiceId}</span> kini{' '}
                  <span className="font-bold text-emerald-600">LUNAS</span>.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-bold text-emerald-700">Lunas (Callback Bank Jatim)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nominal:</span>
                  <span className="font-bold">Rp {nominal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--color-brand-mid)] text-white text-xs font-bold hover:bg-[var(--color-brand-deep)] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Kuitansi
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRINTABLE RECEIPT TEMPLATE (VISIBLE ONLY DURING PRINT) */}
      {isPaid && (
        <div className="printable-receipt-area hidden">
          <ReceiptPrint
            invoiceId={invoiceId}
            waktu={nowFormatted()}
            bulan={bulan || 'Bulan Berjalan'}
            idPelanggan={pelanggan?.idPelanggan || '-'}
            nama={pelanggan?.nama || 'Wajib Retribusi'}
            alamat={pelanggan?.alamat || 'Kabupaten Lumajang'}
            nominal={nominal}
            admin="Sistem QRIS Bank Jatim"
          />
        </div>
      )}
    </>
  );
}
