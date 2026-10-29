export type MenuCategory =
  | 'Espresso Based'
  | 'Kopi Susu'
  | 'Manual Brew'
  | 'Non-Coffee'
  | 'Minuman Dingin'
  | 'Makanan dan Camilan';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  isAvailable: boolean;
  isFavorite?: boolean;
  badge?: string;
  imageType: 'espresso' | 'latte' | 'kopi-susu' | 'manual-brew' | 'matcha' | 'chocolate' | 'iced-tea' | 'mocktail' | 'pastry' | 'toast' | 'snack';
  imageUrl?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

export interface BusinessInfo {
  shopName: string;
  tagline: string;
  description: string;
  whatsappNumber: string; // E.g. "6281234567890"
  address: string;
  landmark?: string;
  kecamatanKabupaten: string;
  openingHours: string;
  instagramHandle: string;
  instagramUrl: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
  wifiName: string;
  isDemoMode: boolean;
  // Payment Information for Direct QRIS / Transfer
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  qrisNmid?: string;
  qrisNote?: string;
  logoUrl?: string;
}
