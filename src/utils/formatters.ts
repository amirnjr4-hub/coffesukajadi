import { BusinessInfo, CartItem } from '../types';

export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function sanitizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1);
  }
  return cleaned;
}

export interface CustomerOrderDetails {
  customerName: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  locationDetail: string; // Meja # atau Alamat Pengantaran
  customerNotes?: string;
  paymentMethod: 'cash' | 'qris' | 'transfer';
  hasPaidDirectly?: boolean;
}

export function generateWhatsAppMessage(
  businessInfo: BusinessInfo,
  cart: CartItem[],
  details: CustomerOrderDetails
): string {
  const total = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const orderTypeLabel =
    details.orderType === 'dine_in'
      ? 'Dine-In (Minum di Tempat)'
      : details.orderType === 'takeaway'
      ? 'Takeaway (Bawa Pulang)'
      : 'Delivery (Antar ke Alamat sekitar Sukajadi)';

  const paymentLabel =
    details.paymentMethod === 'cash'
      ? 'Tunai di Kasir (Cash)'
      : details.paymentMethod === 'qris'
      ? 'QRIS / E-Wallet (Scan Langsung)'
      : 'Transfer Bank Langsung';

  let msg = `*PESANAN BARU - ${businessInfo.shopName.toUpperCase()}*\n`;
  msg += `------------------------------------\n`;
  msg += `👤 *Nama Pemesan:* ${details.customerName.trim() || 'Pelanggan'}\n`;
  msg += `📦 *Tipe Pesanan:* ${orderTypeLabel}\n`;
  if (details.locationDetail.trim()) {
    const locTitle = details.orderType === 'dine_in' ? 'Nomor Meja' : 'Alamat / Lokasi';
    msg += `📍 *${locTitle}:* ${details.locationDetail.trim()}\n`;
  }
  msg += `💳 *Metode Pembayaran:* ${paymentLabel}\n`;

  if (details.paymentMethod !== 'cash') {
    if (details.hasPaidDirectly) {
      msg += `✅ *Status Pembayaran:* SUDAH DIBAYAR LANGSUNG\n`;
      msg += `📎 *Bukti Bayar:* Tangkapan layar / foto struk dilampirkan via chat ini\n`;
    } else {
      msg += `⏳ *Status Pembayaran:* Menunggu Transfer / Scan QRIS\n`;
    }
  } else {
    msg += `💵 *Status Pembayaran:* Bayar di Kasir Kedai\n`;
  }

  msg += `------------------------------------\n`;
  msg += `📋 *RINCIAN MENU (${totalItemsCount} item):*\n`;

  cart.forEach((item, idx) => {
    const itemSubtotal = item.menuItem.price * item.quantity;
    msg += `${idx + 1}. *${item.menuItem.name}* x${item.quantity}\n`;
    msg += `   @ ${formatRupiah(item.menuItem.price)} = ${formatRupiah(itemSubtotal)}\n`;
    if (item.notes && item.notes.trim()) {
      msg += `   _Catatan: ${item.notes.trim()}_\n`;
    }
  });

  msg += `------------------------------------\n`;
  msg += `💰 *TOTAL PEMBAYARAN:* ${formatRupiah(total)}\n`;

  if (details.customerNotes && details.customerNotes.trim()) {
    msg += `📝 *Catatan Khusus:* ${details.customerNotes.trim()}\n`;
  }

  if (details.paymentMethod !== 'cash') {
    msg += `------------------------------------\n`;
    msg += `ℹ️ _Bagi pesanan non-tunai, mohon kirimkan screenshot/foto bukti transfer di obrolan ini agar barista segera memproses._\n`;
  }

  msg += `------------------------------------\n`;
  msg += `_Pesan dibuat melalui website resmi ${businessInfo.shopName}_`;

  return msg;
}

export function buildWhatsAppLink(
  whatsappNumber: string,
  messageText: string
): string {
  const sanitized = sanitizePhoneNumber(whatsappNumber);
  const encoded = encodeURIComponent(messageText);
  return `https://wa.me/${sanitized}?text=${encoded}`;
}
