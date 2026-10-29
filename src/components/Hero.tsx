import React from 'react';
import { MessageCircle, ArrowDown, MapPin, Clock, Sparkles, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { BusinessInfo } from '../types';
import { buildWhatsAppLink } from '../utils/formatters';

interface HeroProps {
  businessInfo: BusinessInfo;
  onScrollToMenu: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  businessInfo,
  onScrollToMenu,
}) => {
  const quickWhatsAppUrl = buildWhatsAppLink(
    businessInfo.whatsappNumber,
    `Halo ${businessInfo.shopName}, saya ingin bertanya tentang menu dan ketersediaan meja untuk hari ini di Sukajadi, Ciamis (dekat NJR Cell / MAN 4 Ciamis).`
  );

  return (
    <section id="beranda" className="relative pt-6 pb-16 lg:pt-10 lg:pb-24 overflow-hidden">
      {/* Background ambient warm accents */}
      <div className="absolute top-0 right-0 -mr-40 -mt-20 w-96 h-96 rounded-full bg-[#D49B58]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 -ml-32 w-80 h-80 rounded-full bg-[#1E3329]/20 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 2-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Slogan, Description & Actions */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D49B58] bg-[#1A1D22] px-3.5 py-1.5 rounded-md border border-[#262B33]">
              <MapPin className="w-3.5 h-3.5 text-[#D49B58]" />
              <span>Sukajadi, Ciamis · Dekat NJR Cell & MAN 4 Ciamis</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#F0F2F5] tracking-tight leading-[1.18] text-balance">
              {businessInfo.tagline}
            </h1>

            <p className="text-base sm:text-lg text-[#9DA7B3] leading-relaxed max-w-2xl font-light">
              {businessInfo.description}
            </p>

            {/* Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 pb-1">
              <div className="flex items-center gap-2 text-xs text-[#D1D5DB] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#A3E0C1] shrink-0" />
                <span>Biji Kopi Arabika Pilihan</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#D1D5DB] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#A3E0C1] shrink-0" />
                <span>Pesan Cepat via WhatsApp</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#D1D5DB] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#A3E0C1] shrink-0" />
                <span>Dine-In, Takeaway & Antar</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={onScrollToMenu}
                className="px-6 py-3.5 bg-[#D49B58] hover:bg-[#E5B074] text-[#0F1113] text-sm font-bold rounded-xl shadow-md transition-all transform active:scale-98 flex items-center gap-2.5 cursor-pointer"
              >
                <span>Lihat Daftar Menu</span>
                <ArrowDown className="w-4 h-4 text-[#0F1113]" />
              </button>

              <a
                href={quickWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-[#1E3329] hover:bg-[#254235] text-[#A3E0C1] text-sm font-semibold rounded-xl border border-[#2D4D3D] shadow-sm transition-all transform active:scale-98 flex items-center gap-2.5"
              >
                <MessageCircle className="w-4 h-4 text-[#A3E0C1]" />
                <span>Hubungi via WhatsApp</span>
              </a>
            </div>

            {/* Quick Operational Info */}
            <div className="pt-4 border-t border-[#262B33] flex flex-wrap items-center gap-6 text-xs text-[#8C95A3]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#D49B58]" />
                <span>{businessInfo.openingHours}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D49B58]" />
                <span>{businessInfo.kecamatanKabupaten}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Coffee Shop Atmosphere Banner */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden bg-[#16191D] text-[#F0F2F5] shadow-2xl border border-[#262B33] aspect-[4/3] sm:aspect-[16/11]">
              
              {/* Atmospheric Background Composition with Espresso Slate Gradients */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1A1D22] via-[#14171A] to-[#0F1113]" />
              
              {/* Premium Brand Logo Showcase */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 pb-16 text-center">
                <div className="relative max-w-[280px] sm:max-w-[320px] p-4 rounded-2xl bg-[#0F1113]/70 border border-[#D49B58]/30 shadow-2xl backdrop-blur-xs flex items-center justify-center transition-transform hover:scale-105 duration-300">
                  <img
                    src={businessInfo.logoUrl || '/assets/aistudio/Logo_Kopi_NYT_Elegan_Premium_601e053d.png'}
                    alt="Logo Resmi NYT Coffee Shop"
                    className="w-full max-h-48 object-contain drop-shadow-2xl"
                  />
                </div>
                <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1D22]/90 border border-[#262B33] text-[11px] text-[#D49B58]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D49B58] animate-pulse" />
                  <span className="font-medium tracking-wide">Logo Resmi NYT Coffee Shop Sukajadi</span>
                </div>
              </div>

              {/* Foreground card overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 bg-[#121417]/90 backdrop-blur-md rounded-xl border border-[#262B33] flex items-center justify-between text-xs">
                <div>
                  <span className="font-serif font-bold text-[#F0F2F5] block text-sm">
                    Suasana Nyaman & Hangat
                  </span>
                  <span className="text-[#D49B58] text-[11px]">
                    Biji Kopi Lokal Priangan · Seduh Manual & Espresso
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[#A3E0C1] font-medium bg-[#1E3329] border border-[#2D4D3D] px-2.5 py-1 rounded-md">
                  <Sparkles className="w-3.5 h-3.5 text-[#D49B58]" />
                  <span>Buka Hari Ini</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
