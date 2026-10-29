import React from 'react';
import { MapPin, Clock, Phone, Instagram, Navigation, Wifi, Coffee, Sparkles, SlidersHorizontal } from 'lucide-react';
import { BusinessInfo } from '../types';
import { buildWhatsAppLink } from '../utils/formatters';

interface BusinessInfoSectionProps {
  businessInfo: BusinessInfo;
}

export const BusinessInfoSection: React.FC<BusinessInfoSectionProps> = ({
  businessInfo,
}) => {
  const whatsappInquiryUrl = buildWhatsAppLink(
    businessInfo.whatsappNumber,
    `Halo ${businessInfo.shopName}, saya ingin menanyakan lokasi kedai di Sukajadi (dekat NJR Cell / MAN 4 Ciamis).`
  );

  return (
    <section id="lokasi" className="py-16 bg-[#121417] border-t border-[#262B33]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D49B58] bg-[#16191D] px-3.5 py-1.5 rounded-md border border-[#262B33]">
            <MapPin className="w-3.5 h-3.5 text-[#D49B58]" />
            <span>Kunjungi Kedai Kami</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F0F2F5] tracking-tight">
            Lokasi & Jam Operasional
          </h2>
          <p className="text-sm sm:text-base text-[#9DA7B3] font-light">
            Nikmati aroma kopi segar di tempat yang tenang, teduh, dan ramah untuk santai, bekerja, atau berdiskusi santai di Sukajadi, Ciamis.
          </p>
        </div>

        {/* 2-Column Grid: Details Left, Interactive Map Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Business Details Cards */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Alamat & Patokan Lokasi Card */}
            <div className="p-5 bg-[#1A1D22] rounded-2xl border border-[#262B33] shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-[#D49B58]">
                <MapPin className="w-5 h-5 text-[#D49B58]" />
                <h3 className="font-serif font-bold text-[#F0F2F5] text-base">Alamat Kedai</h3>
              </div>
              <p className="text-sm text-[#D1D5DB] leading-relaxed">
                {businessInfo.address}
              </p>

              {/* Landmark Callout */}
              <div className="p-3 bg-[#16191D] rounded-xl border border-[#262B33] text-xs text-[#9DA7B3] space-y-1">
                <span className="font-semibold text-[#D49B58] flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#D49B58]" />
                  Patokan / Landmark Lokasi:
                </span>
                <p className="text-[12px] leading-relaxed">
                  Terletak di jalur utama Sukajadi, berdampingan sangat dekat dengan <strong className="text-[#F0F2F5]">NJR Cell</strong> dan tidak jauh dari kompleks sekolah <strong className="text-[#F0F2F5]">MAN 4 Ciamis</strong>.
                </p>
              </div>

              <div className="pt-1">
                <a
                  href={businessInfo.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D49B58] hover:text-[#E5B074] transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Buka Petunjuk Arah di Google Maps</span>
                </a>
              </div>
            </div>

            {/* Jam Operasional Card */}
            <div className="p-5 bg-[#1A1D22] rounded-2xl border border-[#262B33] shadow-xs space-y-2">
              <div className="flex items-center gap-2.5 text-[#D49B58]">
                <Clock className="w-5 h-5 text-[#D49B58]" />
                <h3 className="font-serif font-bold text-[#F0F2F5] text-base">Jam Buka</h3>
              </div>
              <p className="text-sm text-[#D1D5DB]">
                {businessInfo.openingHours}
              </p>
              <p className="text-xs text-[#8C95A3]">
                Pemesanan online via WhatsApp dilayani selama jam operasional kedai.
              </p>
            </div>

            {/* Kontak & Media Sosial Card */}
            <div className="p-5 bg-[#1A1D22] rounded-2xl border border-[#262B33] shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-[#D49B58]">
                <Phone className="w-5 h-5 text-[#D49B58]" />
                <h3 className="font-serif font-bold text-[#F0F2F5] text-base">Kontak & Media Sosial</h3>
              </div>
              
              <div className="flex flex-col gap-2 pt-1">
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-[#16191D] hover:bg-[#23272E] border border-[#262B33] rounded-xl text-xs font-medium text-[#F0F2F5] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#A3E0C1]" />
                    <span>WhatsApp: {businessInfo.whatsappNumber}</span>
                  </span>
                  <span className="text-[#D49B58]">Chat Langsung →</span>
                </a>

                <a
                  href={businessInfo.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-[#16191D] hover:bg-[#23272E] border border-[#262B33] rounded-xl text-xs font-medium text-[#F0F2F5] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-[#D49B58]" />
                    <span>Instagram: {businessInfo.instagramHandle}</span>
                  </span>
                  <span className="text-[#D49B58]">Ikuti →</span>
                </a>
              </div>

              {/* Fasilitas */}
              <div className="pt-2 border-t border-[#262B33] flex flex-wrap gap-2 text-[11px] text-[#8C95A3]">
                <span className="flex items-center gap-1 bg-[#16191D] border border-[#262B33] px-2.5 py-1 rounded-md text-[#D1D5DB]">
                  <Wifi className="w-3 h-3 text-[#D49B58]" />
                  <span>WiFi Gratis</span>
                </span>
                <span className="flex items-center gap-1 bg-[#16191D] border border-[#262B33] px-2.5 py-1 rounded-md text-[#D1D5DB]">
                  <Coffee className="w-3 h-3 text-[#D49B58]" />
                  <span>Area Non-Smoking & Smoking</span>
                </span>
                <span className="flex items-center gap-1 bg-[#16191D] border border-[#262B33] px-2.5 py-1 rounded-md text-[#D1D5DB]">
                  <Sparkles className="w-3 h-3 text-[#D49B58]" />
                  <span>Musholla & Parkir</span>
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Google Maps Location View */}
          <div className="lg:col-span-7 bg-[#1A1D22] rounded-2xl border border-[#262B33] p-3 shadow-xs overflow-hidden flex flex-col h-[420px]">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#262B33] text-xs text-[#8C95A3]">
              <span className="font-semibold text-[#F0F2F5] flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#D49B58] shrink-0" />
                <span className="capitalize">tempat ngopi sukajadi</span>
              </span>
              <a
                href={businessInfo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D49B58] hover:text-[#E5B074] underline font-medium"
              >
                Buka Peta Besar
              </a>
            </div>

            <div className="relative flex-1 w-full rounded-xl overflow-hidden mt-2 bg-[#121417]">
              <iframe
                title="Peta Lokasi Kedai Sukajadi Ciamis"
                src={businessInfo.googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full opacity-90"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
