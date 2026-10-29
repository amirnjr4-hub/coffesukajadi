import React from 'react';
import { Coffee, MapPin, Phone, Instagram, SlidersHorizontal, Heart } from 'lucide-react';
import { BusinessInfo } from '../types';
import { buildWhatsAppLink } from '../utils/formatters';

interface FooterProps {
  businessInfo: BusinessInfo;
  onOpenSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({ businessInfo, onOpenSettings }) => {
  const whatsappUrl = buildWhatsAppLink(
    businessInfo.whatsappNumber,
    `Halo ${businessInfo.shopName}, saya pengunjung website ingin menanyakan informasi kedai di Sukajadi, Ciamis.`
  );

  return (
    <footer className="bg-[#0B0D0F] text-[#F0F2F5] pt-14 pb-10 border-t border-[#262B33]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#262B33]">
          
          {/* Col 1: Brand & Slogan */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#14171A] text-[#D49B58] border border-[#D49B58]/40 p-1 flex items-center justify-center shadow-md overflow-hidden shrink-0">
                <img
                  src={businessInfo.logoUrl || '/assets/aistudio/Logo_Kopi_NYT_Elegan_Premium_601e053d.png'}
                  alt={`${businessInfo.shopName} Logo`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-serif font-bold text-[#F0F2F5] tracking-tight block">
                  {businessInfo.shopName}
                </span>
                <span className="text-[11px] text-[#D49B58] tracking-widest uppercase font-semibold">
                  NYT Coffee Shop · Sukajadi
                </span>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-[#8C95A3] max-w-sm leading-relaxed font-light">
              {businessInfo.tagline}. Ruang santai menikmati seduhan kopi berkualitas dan kehangatan kebersamaan di Sukajadi, Kabupaten Ciamis, Jawa Barat.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-[#16191D] hover:bg-[#D49B58] text-[#8C95A3] hover:text-[#0F1113] rounded-xl transition-colors border border-[#262B33]"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>

              <a
                href={businessInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-[#16191D] hover:bg-[#D49B58] text-[#8C95A3] hover:text-[#0F1113] rounded-xl transition-colors border border-[#262B33]"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href={businessInfo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-[#16191D] hover:bg-[#D49B58] text-[#8C95A3] hover:text-[#0F1113] rounded-xl transition-colors border border-[#262B33]"
                aria-label="Google Maps"
              >
                <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigasi Cepat */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D49B58]">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2 text-xs text-[#8C95A3]">
              <li>
                <a href="#beranda" className="hover:text-[#F0F2F5] transition-colors">
                  Beranda & Promo
                </a>
              </li>
              <li>
                <a href="#favorit" className="hover:text-[#F0F2F5] transition-colors">
                  Menu Favorit Pelanggan
                </a>
              </li>
              <li>
                <a href="#katalog" className="hover:text-[#F0F2F5] transition-colors">
                  Katalog Lengkap (6 Kategori)
                </a>
              </li>
              <li>
                <a href="#lokasi" className="hover:text-[#F0F2F5] transition-colors">
                  Lokasi & Jam Buka Kedai
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Informasi Operasional & Lokasi */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D49B58]">
              Kedai Sukajadi, Ciamis
            </h4>
            <div className="space-y-2 text-xs text-[#8C95A3]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D49B58] shrink-0 mt-0.5" />
                <span className="text-[#D1D5DB]">{businessInfo.address}</span>
              </div>
              <div className="text-[11px] text-[#8C95A3] pl-5">
                Patokan: Dekat NJR Cell & MAN 4 Ciamis
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A3E0C1]" />
                <span className="text-[#D1D5DB]">{businessInfo.openingHours}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Single Discreet/Hidden Admin Portal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B7480]">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} {businessInfo.shopName}. Sukajadi, Ciamis, Jawa Barat.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#6B7480]">
            <span>Pemesanan Praktis via WhatsApp</span>
            <span aria-hidden="true" className="opacity-40">·</span>
            
            {/* Akses Pengelola Kedai (Discreet Stealth Icon untuk Pemilik Sah) */}
            <button
              onClick={onOpenSettings}
              className="opacity-20 hover:opacity-80 transition-opacity p-1 text-[#6B7480] hover:text-[#D49B58] cursor-pointer"
              title="Akses Pengelola Kedai"
              aria-label="Akses Pengelola"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
