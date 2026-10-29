import React from 'react';
import { ShoppingBag, Coffee, SlidersHorizontal, MapPin, Sparkles } from 'lucide-react';
import { BusinessInfo } from '../types';
import { formatRupiah } from '../utils/formatters';

interface NavbarProps {
  businessInfo: BusinessInfo;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  businessInfo,
  cartCount,
  cartTotal,
  onOpenCart,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0F1113]/90 backdrop-blur-md border-b border-[#262B33] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        
        {/* Zone 1: Wordmark / Brand Title */}
        <a
          href="#beranda"
          className="flex items-center gap-2.5 text-[#F0F2F5] group whitespace-nowrap shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-[#1A1D22] text-[#F0F2F5] border border-[#D49B58]/30 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
            <Coffee className="w-5 h-5 text-[#D49B58]" />
          </div>
          <div>
            <span className="text-lg font-serif font-bold text-[#F0F2F5] tracking-tight block leading-tight">
              {businessInfo.shopName}
            </span>
            <span className="text-[11px] font-sans text-[#8C95A3] tracking-wide block leading-none">
              Sukajadi · Ciamis
            </span>
          </div>
        </a>

        {/* Zone 2: Clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#9DA7B3]">
          <a
            href="#beranda"
            className="hover:text-[#D49B58] transition-colors whitespace-nowrap shrink-0"
          >
            Beranda
          </a>
          <a
            href="#favorit"
            className="hover:text-[#D49B58] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D49B58]" />
            Menu Favorit
          </a>
          <a
            href="#katalog"
            className="hover:text-[#D49B58] transition-colors whitespace-nowrap shrink-0"
          >
            Daftar Menu
          </a>
          <a
            href="#lokasi"
            className="hover:text-[#D49B58] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-[#D49B58]" />
            Lokasi & Jam
          </a>
        </nav>

        {/* Zone 3: Primary action button (Cart / Order Bag) */}
        <div className="flex items-center gap-2.5 shrink-0">

          <button
            onClick={onOpenCart}
            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all shadow-xs cursor-pointer ${
              cartCount > 0
                ? 'bg-[#1E3329] text-[#A3E0C1] hover:bg-[#254235] border border-[#2D4D3D]'
                : 'bg-[#1A1D22] text-[#F0F2F5] hover:bg-[#23272E] border border-[#262B33]'
            }`}
            aria-label={`Keranjang Pesanan: ${cartCount} item`}
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-[#D49B58]" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D49B58] text-[#0F1113] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-sans">
              {cartCount > 0 ? formatRupiah(cartTotal) : 'Pesanan'}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
