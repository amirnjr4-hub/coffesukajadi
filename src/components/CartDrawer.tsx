import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, MessageCircle, AlertCircle, ShoppingBag, Send, ArrowRight, QrCode, CreditCard, Copy, Check, CheckCircle2 } from 'lucide-react';
import { CartItem, BusinessInfo } from '../types';
import { formatRupiah, generateWhatsAppMessage, buildWhatsAppLink, CustomerOrderDetails } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  businessInfo: BusinessInfo;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  businessInfo,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [locationDetail, setLocationDetail] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'transfer'>('cash');
  const [hasPaidDirectly, setHasPaidDirectly] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCopyAccount = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // Fallback
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const orderDetails: CustomerOrderDetails = {
    customerName,
    orderType,
    locationDetail,
    customerNotes,
    paymentMethod,
    hasPaidDirectly,
  };

  const previewMessage = generateWhatsAppMessage(businessInfo, cart, orderDetails);

  const handleSendToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setValidationError('Mohon masukkan nama pemesan terlebih dahulu.');
      return;
    }

    if (orderType === 'dine_in' && !locationDetail.trim()) {
      setValidationError('Mohon sebutkan nomor meja Anda (atau tulis "Meja Kasir").');
      return;
    }

    if (orderType === 'delivery' && !locationDetail.trim()) {
      setValidationError('Mohon sebutkan alamat pengantaran di sekitar Sukajadi, Ciamis.');
      return;
    }

    setValidationError('');

    const targetUrl = buildWhatsAppLink(businessInfo.whatsappNumber, previewMessage);

    // Explicit customer action: open WhatsApp directly
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over Content Drawer */}
      <div className="relative w-full max-w-lg bg-[#121417] text-[#F0F2F5] h-full shadow-2xl flex flex-col z-10 border-l border-[#262B33]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262B33] flex items-center justify-between bg-[#16191D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1A1D22] border border-[#D49B58]/30 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#D49B58]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#F0F2F5]">
                Keranjang Pesanan
              </h2>
              <p className="text-xs text-[#D49B58]">
                {totalCount} item · {formatRupiah(total)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C95A3] hover:text-[#F0F2F5] hover:bg-[#1A1D22] rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup keranjang"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#16191D] text-[#D49B58] border border-[#262B33] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#F0F2F5]">
                Keranjang masih kosong
              </h3>
              <p className="text-xs text-[#8C95A3] max-w-xs mx-auto font-light">
                Silakan pilih minuman segar atau camilan nikmat favorit Anda dari daftar menu.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-[#D49B58] text-[#0F1113] text-xs font-bold rounded-xl hover:bg-[#E5B074] transition-colors cursor-pointer"
              >
                Kembali ke Menu
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#D49B58] uppercase tracking-wider">
                  <span>Daftar Menu Dipilih</span>
                  <button
                    onClick={onClearCart}
                    className="text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Kosongkan</span>
                  </button>
                </div>

                <div className="divide-y divide-[#262B33] bg-[#1A1D22] rounded-xl border border-[#262B33] overflow-hidden">
                  {cart.map((item) => (
                    <div key={item.menuItem.id} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-[#F0F2F5] truncate">
                          {item.menuItem.name}
                        </h4>
                        <div className="text-xs font-mono tabular-nums text-[#D49B58] mt-0.5">
                          {formatRupiah(item.menuItem.price)} × {item.quantity} ={' '}
                          <strong className="text-[#F0F2F5]">
                            {formatRupiah(item.menuItem.price * item.quantity)}
                          </strong>
                        </div>
                      </div>

                      {/* Stepper & Delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 bg-[#16191D] rounded-lg p-0.5 border border-[#2C323B]">
                          <button
                            onClick={() => onUpdateQuantity(item.menuItem.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-[#F0F2F5] hover:bg-[#23272E] rounded transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold font-mono text-[#D49B58]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.menuItem.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-[#F0F2F5] hover:bg-[#23272E] rounded transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.menuItem.id)}
                          className="p-1.5 text-[#8C95A3] hover:text-red-400 transition-colors cursor-pointer"
                          title="Hapus menu ini"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Details */}
              <form onSubmit={handleSendToWhatsApp} className="space-y-4 pt-2">
                
                {/* Validation Banner */}
                {validationError && (
                  <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Customer Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                    Nama Pemesan <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3.5 py-2 bg-[#1A1D22] rounded-xl text-sm border border-[#2C323B] focus:outline-hidden focus:ring-2 focus:ring-[#D49B58] text-[#F0F2F5] placeholder:text-[#6B7480]"
                  />
                </div>

                {/* Order Type */}
                <div>
                  <label className="block text-xs font-semibold text-[#F0F2F5] mb-1.5">
                    Tipe Pesanan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType('dine_in')}
                      className={`py-2 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                        orderType === 'dine_in'
                          ? 'bg-[#D49B58] text-[#0F1113] font-bold border-[#D49B58]'
                          : 'bg-[#1A1D22] text-[#8C95A3] border-[#2C323B] hover:bg-[#23272E]'
                      }`}
                    >
                      Dine-In
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('takeaway')}
                      className={`py-2 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                        orderType === 'takeaway'
                          ? 'bg-[#D49B58] text-[#0F1113] font-bold border-[#D49B58]'
                          : 'bg-[#1A1D22] text-[#8C95A3] border-[#2C323B] hover:bg-[#23272E]'
                      }`}
                    >
                      Takeaway
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`py-2 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                        orderType === 'delivery'
                          ? 'bg-[#D49B58] text-[#0F1113] font-bold border-[#D49B58]'
                          : 'bg-[#1A1D22] text-[#8C95A3] border-[#2C323B] hover:bg-[#23272E]'
                      }`}
                    >
                      Antar (Delivery)
                    </button>
                  </div>
                </div>

                {/* Table or Address based on type */}
                <div>
                  <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                    {orderType === 'dine_in'
                      ? 'Nomor Meja'
                      : orderType === 'takeaway'
                      ? 'Waktu Pengambilan (Opsional)'
                      : 'Alamat Pengantaran (Sekitar Sukajadi)'}{' '}
                    {orderType !== 'takeaway' && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="text"
                    value={locationDetail}
                    onChange={(e) => setLocationDetail(e.target.value)}
                    placeholder={
                      orderType === 'dine_in'
                        ? 'Contoh: Meja 04 atau Meja Luar'
                        : orderType === 'takeaway'
                        ? 'Contoh: Diambil dalam 15 menit'
                        : 'Contoh: Jl. Sukajadi No. 12 (Dekat NJR Cell)'
                    }
                    className="w-full px-3.5 py-2 bg-[#1A1D22] rounded-xl text-sm border border-[#2C323B] focus:outline-hidden focus:ring-2 focus:ring-[#D49B58] text-[#F0F2F5] placeholder:text-[#6B7480]"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-semibold text-[#F0F2F5] mb-1.5">
                    Metode Pembayaran
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { key: 'cash', label: 'Tunai Kasir' },
                      { key: 'qris', label: 'QRIS / E-Wallet' },
                      { key: 'transfer', label: 'Transfer Bank' },
                    ].map((pm) => (
                      <button
                        key={pm.key}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(pm.key as any);
                          if (pm.key === 'cash') setHasPaidDirectly(false);
                        }}
                        className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                          paymentMethod === pm.key
                            ? 'bg-[#1E3329] text-[#A3E0C1] border-[#2D4D3D] font-semibold'
                            : 'bg-[#1A1D22] text-[#8C95A3] border-[#2C323B] hover:bg-[#23272E]'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Direct Payment Card (QRIS & Bank Transfer) */}
                {paymentMethod !== 'cash' && (
                  <div className="p-4 bg-[#16191D] rounded-2xl border border-[#2C323B] space-y-3.5 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-[#262B33]">
                      <div className="flex items-center gap-2">
                        {paymentMethod === 'qris' ? (
                          <QrCode className="w-4 h-4 text-[#D49B58]" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-[#D49B58]" />
                        )}
                        <span className="text-xs font-bold text-[#F0F2F5]">
                          {paymentMethod === 'qris' ? 'Instruksi Bayar Langsung QRIS' : 'Instruksi Transfer Bank'}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#D49B58]">
                        {formatRupiah(total)}
                      </span>
                    </div>

                    {/* QRIS View */}
                    {paymentMethod === 'qris' && (
                      <div className="space-y-3">
                        <div className="flex flex-col items-center bg-[#0F1113] p-4 rounded-xl border border-[#262B33] text-center">
                          {/* QR Code visual representation with QRIS branding */}
                          <div className="w-36 h-36 bg-white p-2 rounded-xl flex flex-col items-center justify-between shadow-md">
                            <div className="w-full text-center">
                              <span className="text-[9px] font-black tracking-widest text-[#0F1113] block font-mono">
                                QRIS
                              </span>
                            </div>
                            {/* SVG QR Code Pattern */}
                            <svg viewBox="0 0 100 100" className="w-24 h-24 text-black" fill="currentColor">
                              <rect x="5" y="5" width="25" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="5" />
                              <rect x="12" y="12" width="11" height="11" fill="currentColor" />
                              <rect x="70" y="5" width="25" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="5" />
                              <rect x="77" y="12" width="11" height="11" fill="currentColor" />
                              <rect x="5" y="70" width="25" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="5" />
                              <rect x="12" y="77" width="11" height="11" fill="currentColor" />
                              <rect x="35" y="10" width="8" height="8" />
                              <rect x="50" y="10" width="8" height="8" />
                              <rect x="40" y="25" width="6" height="6" />
                              <rect x="55" y="25" width="8" height="8" />
                              <rect x="10" y="40" width="8" height="8" />
                              <rect x="25" y="45" width="6" height="6" />
                              <rect x="40" y="40" width="20" height="20" rx="3" fill="#D49B58" />
                              <rect x="45" y="45" width="10" height="10" fill="#0F1113" />
                              <rect x="70" y="40" width="8" height="8" />
                              <rect x="85" y="45" width="6" height="6" />
                              <rect x="35" y="70" width="8" height="8" />
                              <rect x="50" y="75" width="8" height="8" />
                              <rect x="70" y="70" width="12" height="12" />
                              <rect x="85" y="75" width="8" height="8" />
                              <rect x="70" y="85" width="8" height="8" />
                            </svg>
                            <div className="w-full text-center">
                              <span className="text-[7px] font-bold text-gray-700 tracking-wider">
                                NMID: {businessInfo.qrisNmid || 'ID102026884920'}
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-[#A3E0C1] mt-2 font-medium">
                            Scan langsung via GoPay, OVO, Dana, ShopeePay, BCA, BRImo, Livin Mandiri
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Bank Transfer View */}
                    {paymentMethod === 'transfer' && (
                      <div className="space-y-2 bg-[#0F1113] p-3.5 rounded-xl border border-[#262B33]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#8C95A3]">Bank Tujuan:</span>
                          <span className="font-bold text-[#F0F2F5]">{businessInfo.bankName || 'BCA (Bank Central Asia)'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#8C95A3]">Atas Nama:</span>
                          <span className="font-semibold text-[#D1D5DB]">{businessInfo.bankAccountName || 'Kopi Sukajadi'}</span>
                        </div>
                        <div className="pt-1 flex items-center justify-between gap-2 bg-[#16191D] p-2.5 rounded-lg border border-[#262B33]">
                          <div>
                            <span className="text-[10px] text-[#8C95A3] block">Nomor Rekening:</span>
                            <span className="font-mono text-sm font-bold text-[#D49B58] tracking-wider">
                              {businessInfo.bankAccountNumber || '0541234567'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyAccount(businessInfo.bankAccountNumber || '0541234567')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              copiedText
                                ? 'bg-[#1E3329] text-[#A3E0C1] border border-[#2D4D3D]'
                                : 'bg-[#23272E] text-[#F0F2F5] hover:bg-[#D49B58] hover:text-[#0F1113] border border-[#363E4B]'
                            }`}
                          >
                            {copiedText ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#A3E0C1]" />
                                <span>Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Salin No. Rek</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Cara Menghubungkan Pembayaran / Verification Guide */}
                    <div className="p-3 bg-[#1A1D22] rounded-xl border border-[#262B33] space-y-1.5 text-[11px]">
                      <div className="flex items-center gap-1.5 font-semibold text-[#D49B58]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Cara Menghubungkan Pembayaran Langsung:</span>
                      </div>
                      <ol className="list-decimal list-inside text-[#9DA7B3] space-y-1 leading-relaxed pl-1">
                        <li>Lakukan transfer/scan sebesar <strong className="text-[#F0F2F5] font-mono">{formatRupiah(total)}</strong>.</li>
                        <li>Beri centang pada kotak di bawah jika sudah terbayar.</li>
                        <li>Klik tombol <strong>"Kirim Pesanan ke WhatsApp"</strong>.</li>
                        <li>Di chat WhatsApp yang terbuka, <strong>lampirkan foto/screenshot bukti transfer</strong> Anda agar kasir langsung memverifikasi dan pesanan segera dibuat.</li>
                      </ol>
                    </div>

                    {/* Checkbox "Saya sudah bayar" */}
                    <label className="flex items-start gap-2.5 p-2 rounded-lg bg-[#121417] border border-[#262B33] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hasPaidDirectly}
                        onChange={(e) => setHasPaidDirectly(e.target.checked)}
                        className="mt-0.5 rounded text-[#D49B58] focus:ring-[#D49B58] border-[#2C323B] bg-[#1A1D22]"
                      />
                      <span className="text-xs text-[#D1D5DB] leading-snug">
                        <strong className="text-[#A3E0C1]">Saya sudah membayar langsung.</strong> Saya akan melampirkan screenshot bukti transfer di chat WhatsApp.
                      </span>
                    </label>
                  </div>
                )}

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                    Catatan Pesanan Khusus (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Contoh: Kopi susu manis sedang (less sugar), es batu dipisah, cireng bumbu banyak."
                    className="w-full px-3.5 py-2 bg-[#1A1D22] rounded-xl text-xs border border-[#2C323B] focus:outline-hidden focus:ring-2 focus:ring-[#D49B58] text-[#F0F2F5] placeholder:text-[#6B7480]"
                  />
                </div>

                {/* WhatsApp Message Preview Accordion */}
                <div className="border border-[#262B33] rounded-xl bg-[#1A1D22] overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full px-3.5 py-2.5 bg-[#16191D] text-[#F0F2F5] font-medium flex items-center justify-between text-left hover:bg-[#20252C] transition-colors cursor-pointer"
                  >
                    <span>Pratinjau Format Pesan WhatsApp</span>
                    <span className="text-[11px] text-[#D49B58]">
                      {showPreview ? 'Sembunyikan' : 'Lihat'}
                    </span>
                  </button>
                  {showPreview && (
                    <div className="p-3 bg-[#0B0E11] text-[#98E2BA] font-mono text-[11px] whitespace-pre-wrap rounded-b-xl max-h-48 overflow-y-auto">
                      {previewMessage}
                    </div>
                  )}
                </div>

                {/* Destination WhatsApp Info */}
                <div className="p-3 bg-[#16191D] rounded-xl border border-[#262B33] text-[11px] text-[#8C95A3] flex items-center justify-between">
                  <div>
                    <span className="font-semibold block text-[#D1D5DB]">Tujuan Pesanan WhatsApp:</span>
                    <span className="font-mono text-[#D49B58] font-bold">{businessInfo.whatsappNumber}</span>
                  </div>
                  <span className="text-[10px] text-[#8C95A3]">Kedai Sukajadi</span>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#1E3329] hover:bg-[#254235] text-[#A3E0C1] font-bold text-sm rounded-xl border border-[#2D4D3D] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <MessageCircle className="w-5 h-5 text-[#A3E0C1]" />
                  <span>
                    {hasPaidDirectly
                      ? `Kirim Pesanan & Bukti Bayar ke WhatsApp (${formatRupiah(total)})`
                      : `Kirim Pesanan ke WhatsApp (${formatRupiah(total)})`}
                  </span>
                </button>

                <p className="text-[11px] text-center text-[#8C95A3] leading-normal font-light">
                  Pesan pesanan akan dibuka di aplikasi WhatsApp Anda untuk dikonfirmasi langsung dengan kasir/barista kami.
                </p>

              </form>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
