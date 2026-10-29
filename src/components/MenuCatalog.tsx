import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Filter, Sparkles, Check, AlertCircle } from 'lucide-react';
import { MenuItem, MenuCategory, CartItem } from '../types';
import { ProductVisual } from './ProductVisual';
import { formatRupiah } from '../utils/formatters';

interface MenuCatalogProps {
  items: MenuItem[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
}

const CATEGORIES: ('Semua' | MenuCategory)[] = [
  'Semua',
  'Espresso Based',
  'Kopi Susu',
  'Manual Brew',
  'Non-Coffee',
  'Minuman Dingin',
  'Makanan dan Camilan',
];

export const MenuCatalog: React.FC<MenuCatalogProps> = ({
  items,
  cart,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | MenuCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const getItemQuantity = (itemId: string) => {
    const found = cart.find((c) => c.menuItem.id === itemId);
    return found ? found.quantity : 0;
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== 'Semua' && item.category !== selectedCategory) {
        return false;
      }
      // Availability filter
      if (onlyAvailable && !item.isAvailable) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        return matchesName || matchesDesc || matchesCategory;
      }
      return true;
    });
  }, [items, selectedCategory, onlyAvailable, searchQuery]);

  return (
    <section id="katalog" className="py-16 bg-[#0F1113]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D49B58] bg-[#16191D] px-3.5 py-1.5 rounded-md border border-[#262B33]">
            <span>Katalog Lengkap</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F0F2F5] tracking-tight">
            Pilihan Menu Kedai
          </h2>
          <p className="text-sm sm:text-base text-[#9DA7B3] font-light">
            Pilih sajian kopi seduh segar, racikan minuman dingin, dan camilan hangat. Pilih menu favorit Anda dan selesaikan pesanan dengan mudah via WhatsApp.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-[#16191D] p-4 rounded-2xl border border-[#262B33] mb-8 space-y-4 shadow-sm">
          
          {/* Top Row: Search Input & Availability Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#D49B58] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kopi, matcha, cireng..."
                className="w-full pl-10 pr-4 py-2 bg-[#1A1D22] rounded-xl text-sm border border-[#2C323B] focus:outline-hidden focus:ring-2 focus:ring-[#D49B58] text-[#F0F2F5] placeholder:text-[#6B7480]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C95A3] hover:text-[#F0F2F5]"
                >
                  ✕
                </button>
              )}
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-[#9DA7B3] cursor-pointer self-start sm:self-auto select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="rounded text-[#1E3329] focus:ring-[#D49B58] border-[#2C323B] bg-[#1A1D22]"
              />
              <span>Tampilkan hanya menu yang tersedia</span>
            </label>
          </div>

          {/* Bottom Row: Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#D49B58] text-[#0F1113] font-bold shadow-xs'
                      : 'bg-[#1A1D22] text-[#8C95A3] hover:text-[#F0F2F5] border border-[#262B33]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-[#8C95A3] mb-6 px-1">
          <span>Menampilkan <strong className="text-[#F0F2F5] font-semibold">{filteredItems.length}</strong> menu</span>
          {selectedCategory !== 'Semua' && (
            <span>Kategori: <strong className="text-[#D49B58] font-semibold">{selectedCategory}</strong></span>
          )}
        </div>

        {/* Grid of Menu Cards */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-[#16191D] rounded-2xl border border-[#262B33] p-8 max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-[#D49B58] mx-auto mb-3 opacity-60" />
            <h3 className="font-serif font-bold text-lg text-[#F0F2F5] mb-1">
              Menu tidak ditemukan
            </h3>
            <p className="text-xs text-[#8C95A3] mb-4">
              Tidak ada menu yang sesuai dengan kata kunci "{searchQuery}" atau filter saat ini.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
                setOnlyAvailable(false);
              }}
              className="px-4 py-2 bg-[#D49B58] text-[#0F1113] font-bold text-xs rounded-lg hover:bg-[#E5B074] transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const qty = getItemQuantity(item.id);

              return (
                <div
                  key={item.id}
                  className={`group bg-[#1A1D22] rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 ${
                    item.isAvailable
                      ? 'border-[#262B33] hover:border-[#D49B58]/60 hover:shadow-xl'
                      : 'border-[#262B33]/60 opacity-65'
                  }`}
                >
                  {/* Image container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <ProductVisual item={item} className="w-full h-full" size="md" />

                    {/* Status Pill Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md shadow-xs ${
                          item.isAvailable
                            ? 'bg-[#1E3329] text-[#A3E0C1] border border-[#2D4D3D]'
                            : 'bg-[#3A1818] text-[#FCA5A5] border border-[#522020]'
                        }`}
                      >
                        {item.isAvailable ? 'Tersedia' : 'Habis'}
                      </span>
                      {item.isFavorite && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#0F1113]/90 text-[#D49B58] border border-[#D49B58]/40 shadow-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#D49B58]" />
                          <span>Favorit</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Quiet Unboxed Metadata: Category */}
                      <div className="text-[11px] font-medium text-[#D49B58] uppercase tracking-wider mb-1">
                        {item.category}
                      </div>

                      <h3 className="font-serif font-bold text-lg text-[#F0F2F5] group-hover:text-[#D49B58] transition-colors leading-snug">
                        {item.name}
                      </h3>

                      <p className="text-xs text-[#8C95A3] mt-1.5 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Price and Cart Action */}
                    <div className="pt-3 border-t border-[#262B33] flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] text-[#8C95A3] block leading-none">Harga</span>
                        <span className="text-base font-bold font-mono tabular-nums text-[#F0F2F5]">
                          {formatRupiah(item.price)}
                        </span>
                      </div>

                      {item.isAvailable ? (
                        qty > 0 ? (
                          <div className="flex items-center gap-1.5 bg-[#16191D] border border-[#2C323B] rounded-xl p-1 shadow-2xs">
                            <button
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#F0F2F5] hover:bg-[#23272E] transition-colors cursor-pointer"
                              aria-label={`Kurangi pesanan ${item.name}`}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold font-mono tabular-nums text-[#D49B58]">
                              {qty}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#F0F2F5] hover:bg-[#23272E] transition-colors cursor-pointer"
                              aria-label={`Tambah pesanan ${item.name}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onAddToCart(item)}
                            className="px-4 py-2 bg-[#D49B58] hover:bg-[#E5B074] text-[#0F1113] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#0F1113]" />
                            <span>Tambah Pesanan</span>
                          </button>
                        )
                      ) : (
                        <div className="text-xs font-medium text-red-300 bg-[#2C1818] px-3 py-1.5 rounded-lg border border-[#482020]">
                          Stok Habis
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
