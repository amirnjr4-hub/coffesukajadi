import React from 'react';
import { Sparkles, Plus, Minus, Check } from 'lucide-react';
import { MenuItem, CartItem } from '../types';
import { ProductVisual } from './ProductVisual';
import { formatRupiah } from '../utils/formatters';

interface FeaturedSectionProps {
  items: MenuItem[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({
  items,
  cart,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const favoriteItems = items.filter((item) => item.isFavorite);

  if (favoriteItems.length === 0) return null;

  const getItemQuantity = (itemId: string) => {
    const found = cart.find((c) => c.menuItem.id === itemId);
    return found ? found.quantity : 0;
  };

  return (
    <section id="favorit" className="py-14 bg-[#121417] border-y border-[#262B33]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D49B58] mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D49B58]" />
              <span>Pilihan Pelanggan & Barista</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F0F2F5] tracking-tight">
              Menu Favorit Sukajadi
            </h2>
          </div>
          <p className="text-sm text-[#9DA7B3] max-w-md font-light">
            Racikan kopi andalan dan kudapan terlaris yang paling banyak dipesan warga dan pengunjung setia.
          </p>
        </div>

        {/* 3 or 4 Column Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favoriteItems.map((item) => {
            const qty = getItemQuantity(item.id);

            return (
              <div
                key={item.id}
                className="group bg-[#1A1D22] rounded-2xl border border-[#262B33] overflow-hidden flex flex-col shadow-xs hover:shadow-xl hover:border-[#D49B58]/60 transition-all duration-300"
              >
                {/* Visual Thumbnail */}
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <ProductVisual item={item} className="w-full h-full" size="md" />
                  
                  {/* Badge */}
                  {item.badge && (
                    <span className="absolute top-2.5 right-2.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#0F1113]/90 text-[#D49B58] border border-[#D49B58]/40 shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-medium text-[#D49B58] uppercase tracking-wider">
                        {item.category}
                      </span>
                      <span className={`text-[10px] font-medium ${item.isAvailable ? 'text-[#A3E0C1]' : 'text-red-400'}`}>
                        {item.isAvailable ? 'Tersedia' : 'Habis'}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-[#F0F2F5] text-base group-hover:text-[#D49B58] transition-colors leading-snug">
                      {item.name}
                    </h3>

                    <p className="text-xs text-[#8C95A3] line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Price & Add Action */}
                  <div className="pt-2 border-t border-[#262B33] flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold font-mono tabular-nums text-[#F0F2F5]">
                      {formatRupiah(item.price)}
                    </span>

                    {item.isAvailable ? (
                      qty > 0 ? (
                        <div className="flex items-center gap-1.5 bg-[#16191D] border border-[#2C323B] rounded-lg p-1">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-[#F0F2F5] hover:bg-[#23272E] transition-colors cursor-pointer"
                            aria-label="Kurangi jumlah"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-5 text-center text-xs font-semibold font-mono tabular-nums text-[#D49B58]">
                            {qty}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-[#F0F2F5] hover:bg-[#23272E] transition-colors cursor-pointer"
                            aria-label="Tambah jumlah"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onAddToCart(item)}
                          className="px-3 py-1.5 bg-[#D49B58] hover:bg-[#E5B074] text-[#0F1113] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#0F1113]" />
                          <span>Pesan</span>
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-gray-500 font-medium italic">
                        Habis
                      </span>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
