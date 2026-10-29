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
              
              {/* Artistic Coffee Illustration */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <svg
                  className="w-full h-full max-h-56 opacity-85 drop-shadow-2xl"
                  viewBox="0 0 400 300"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Travertine / Slate Counter */}
                  <rect x="20" y="220" width="360" height="60" rx="6" fill="#1A1D22" />
                  <rect x="20" y="220" width="360" height="8" fill="#2C323B" />

                  {/* Espresso Machine Silhouette with Amber Crema Accents */}
                  <rect x="50" y="100" width="130" height="120" rx="8" fill="#0F1113" stroke="#2C323B" strokeWidth="2" />
                  <rect x="65" y="115" width="100" height="30" rx="4" fill="#1A1D22" />
                  {/* Machine Pressure Gauges */}
                  <circle cx="85" cy="130" r="8" fill="#D49B58" stroke="#1A1D22" strokeWidth="1" />
                  <circle cx="115" cy="130" r="8" fill="#D49B58" stroke="#1A1D22" strokeWidth="1" />
                  <circle cx="145" cy="130" r="8" fill="#D49B58" stroke="#1A1D22" strokeWidth="1" />
                  {/* Portafilter */}
                  <rect x="80" y="150" width="22" height="18" rx="2" fill="#D49B58" />
                  <path d="M102 158H122" stroke="#F0F2F5" strokeWidth="3" strokeLinecap="round" />
                  <path d="M91 168V185" stroke="#9DA7B3" strokeWidth="2" strokeLinecap="round" />

                  {/* Ceramic Latte Cup on counter */}
                  <ellipse cx="230" cy="225" rx="34" ry="6" fill="#0A0C0E" />
                  <path d="M210 185C210 205 218 218 230 218C242 218 250 205 250 185H210Z" fill="#F0F2F5" />
                  <path d="M248 190C255 190 260 194 260 200C260 206 254 210 246 210" stroke="#F0F2F5" strokeWidth="2.5" strokeLinecap="round" />
                  <ellipse cx="230" cy="185" rx="20" ry="6" fill="#362214" />
                  <ellipse cx="230" cy="184" rx="12" ry="3.5" fill="#D49B58" />

                  {/* Glass Cold Brew / Kopi Susu Aren */}
                  <path d="M285 160L290 220C290.5 224 294 227 298 227H318C322 227 325.5 224 326 220L331 160H285Z" fill="rgba(255,255,255,0.08)" stroke="#8C95A3" strokeWidth="1.5" />
                  {/* Brown Sugar Base */}
                  <path d="M291 216L290 220C290.5 223 293.5 225 297.5 225H318.5C322.5 225 325.5 223 325.8 220L325 216C320 217 300 217 291 216Z" fill="#3D1C06" />
                  {/* Milk & Coffee layer */}
                  <path d="M288 185L291 216C300 217 320 217 325 216L328 185H288Z" fill="#E8DEC9" fillOpacity="0.8" />
                  <path d="M286 166L288 185H328L330 166H286Z" fill="#382417" />
                  {/* Ice cubes in glass */}
                  <rect x="296" y="174" width="10" height="10" rx="2" fill="white" fillOpacity="0.35" />
                  <rect x="310" y="180" width="9" height="9" rx="2" fill="white" fillOpacity="0.25" />

                  {/* Rising steam waves */}
                  <path d="M224 172C220 160 228 152 224 140" stroke="#D49B58" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                  <path d="M236 170C232 158 240 150 236 138" stroke="#D49B58" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

                  {/* Warm hanging lamp lights */}
                  <line x1="120" y1="0" x2="120" y2="60" stroke="#3A404D" strokeWidth="1.5" />
                  <circle cx="120" cy="65" r="8" fill="#D49B58" fillOpacity="0.85" />
                  <line x1="280" y1="0" x2="280" y2="45" stroke="#3A404D" strokeWidth="1.5" />
                  <circle cx="280" cy="50" r="8" fill="#D49B58" fillOpacity="0.85" />
                </svg>
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
