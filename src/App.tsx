import React, { useState, useEffect } from 'react';
import { ShoppingBag, MessageCircle, ArrowUp } from 'lucide-react';
import { MenuItem, CartItem, BusinessInfo } from './types';
import { INITIAL_BUSINESS_INFO, INITIAL_MENU_ITEMS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturedSection } from './components/FeaturedSection';
import { MenuCatalog } from './components/MenuCatalog';
import { BusinessInfoSection } from './components/BusinessInfoSection';
import { CartDrawer } from './components/CartDrawer';
import { OwnerSettingsModal } from './components/OwnerSettingsModal';
import { Footer } from './components/Footer';
import { formatRupiah } from './utils/formatters';

const STORAGE_KEYS = {
  BIZ: 'kopi_sukajadi_business_info_v1',
  MENU: 'kopi_sukajadi_menu_items_v1',
  CART: 'kopi_sukajadi_cart_v1',
};

export default function App() {
  // Business Info with localStorage persistence
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BIZ);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Auto-migrate address, landmark, and Google Maps URL to new shortlink and embed
        if (
          !parsed.landmark ||
          !parsed.address.includes('NJR Cell') ||
          parsed.googleMapsUrl !== INITIAL_BUSINESS_INFO.googleMapsUrl ||
          !parsed.logoUrl
        ) {
          const updated = {
            ...parsed,
            address: INITIAL_BUSINESS_INFO.address,
            landmark: INITIAL_BUSINESS_INFO.landmark,
            googleMapsUrl: INITIAL_BUSINESS_INFO.googleMapsUrl,
            googleMapsEmbedUrl: INITIAL_BUSINESS_INFO.googleMapsEmbedUrl,
            kecamatanKabupaten: INITIAL_BUSINESS_INFO.kecamatanKabupaten,
            description: INITIAL_BUSINESS_INFO.description,
            bankName: parsed.bankName || INITIAL_BUSINESS_INFO.bankName,
            bankAccountNumber: parsed.bankAccountNumber || INITIAL_BUSINESS_INFO.bankAccountNumber,
            bankAccountName: parsed.bankAccountName || INITIAL_BUSINESS_INFO.bankAccountName,
            logoUrl: INITIAL_BUSINESS_INFO.logoUrl,
          };
          localStorage.setItem(STORAGE_KEYS.BIZ, JSON.stringify(updated));
          return updated;
        }
        return {
          ...parsed,
          logoUrl: parsed.logoUrl || INITIAL_BUSINESS_INFO.logoUrl,
        };
      }
      return INITIAL_BUSINESS_INFO;
    } catch {
      return INITIAL_BUSINESS_INFO;
    }
  });

  // Menu items with localStorage persistence & auto-migration for authentic photos
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MENU);
      if (saved) {
        const parsed: MenuItem[] = JSON.parse(saved);
        // Ensure all default items receive their authentic photos even if cached previously
        let hasChanges = false;
        const updated = parsed.map((item) => {
          const defaultItem = INITIAL_MENU_ITEMS.find((init) => init.id === item.id);
          if (defaultItem?.imageUrl && (!item.imageUrl || item.imageUrl !== defaultItem.imageUrl)) {
            hasChanges = true;
            return { ...item, imageUrl: defaultItem.imageUrl };
          }
          return item;
        });
        if (hasChanges) {
          localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(updated));
        }
        return updated;
      }
      return INITIAL_MENU_ITEMS;
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  });

  // Cart with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BIZ, JSON.stringify(businessInfo));
    } catch (e) {
      console.warn('Unable to save business info', e);
    }
  }, [businessInfo]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuItems));
    } catch (e) {
      console.warn('Unable to save menu items', e);
    }
  }, [menuItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.warn('Unable to save cart', e);
    }
  }, [cart]);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cart calculations
  const cartTotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Cart Handlers
  const handleAddToCart = (item: MenuItem) => {
    if (!item.isAvailable) return;
    setCart((prev) => {
      const existingIndex = prev.findIndex((c) => c.menuItem.id === item.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        return next;
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((c) => {
          if (c.menuItem.id === itemId) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Owner Management Handlers
  const handleSaveBusinessInfo = (updatedInfo: BusinessInfo) => {
    setBusinessInfo(updatedInfo);
  };

  const handleUpdateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    // Also update any reference inside cart if present
    setCart((prev) =>
      prev.map((c) => (c.menuItem.id === updatedItem.id ? { ...c, menuItem: updatedItem } : c))
    );
  };

  const handleAddMenuItem = (newItem: MenuItem) => {
    setMenuItems((prev) => [newItem, ...prev]);
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
    setCart((prev) => prev.filter((c) => c.menuItem.id !== id));
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset semua data kembali ke contoh demonstrasi awal?')) {
      setBusinessInfo(INITIAL_BUSINESS_INFO);
      setMenuItems(INITIAL_MENU_ITEMS);
      setCart([]);
      localStorage.removeItem(STORAGE_KEYS.BIZ);
      localStorage.removeItem(STORAGE_KEYS.MENU);
      localStorage.removeItem(STORAGE_KEYS.CART);
      setIsSettingsOpen(false);
    }
  };

  const scrollToMenu = () => {
    const el = document.getElementById('katalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F1113] text-[#F0F2F5] font-sans antialiased selection:bg-[#D49B58]/30 selection:text-[#FFFFFF]">
      
      {/* Top Navbar */}
      <Navbar
        businessInfo={businessInfo}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          businessInfo={businessInfo}
          onScrollToMenu={scrollToMenu}
        />

        {/* Featured Section (Menu Favorit Barista) */}
        <FeaturedSection
          items={menuItems}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
        />

        {/* Full Menu Catalog (6 Categories + Search + Filter) */}
        <MenuCatalog
          items={menuItems}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
        />

        {/* Business Info Section (Address, Hours, WhatsApp, Maps) */}
        <BusinessInfoSection
          businessInfo={businessInfo}
        />
      </main>

      {/* Footer - The ONLY entry point for Admin Portal */}
      <Footer
        businessInfo={businessInfo}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Slide-over Cart & WhatsApp Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        businessInfo={businessInfo}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Owner Management Modal (Mode Pemilik / Admin) */}
      {isSettingsOpen && (
        <OwnerSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          businessInfo={businessInfo}
          menuItems={menuItems}
          onSaveBusinessInfo={handleSaveBusinessInfo}
          onUpdateMenuItem={handleUpdateMenuItem}
          onAddMenuItem={handleAddMenuItem}
          onDeleteMenuItem={handleDeleteMenuItem}
          onResetToDefault={handleResetToDefault}
        />
      )}

      {/* Floating Mobile Sticky Cart Bar (visible only when cart has items) */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-30 md:hidden animate-fade-in">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#16191D] text-[#F0F2F5] py-3.5 px-5 rounded-2xl shadow-2xl border border-[#2C323B] flex items-center justify-between font-medium cursor-pointer backdrop-blur-md"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#23272E] border border-[#2C323B] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#D49B58]" />
              </div>
              <span className="text-sm font-semibold">{cartCount} Item Terpilih</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-[#D49B58]">{formatRupiah(cartTotal)}</span>
              <span className="text-xs bg-[#1E3329] border border-[#2D4D3D] px-2.5 py-1 rounded-md text-[#A3E0C1] font-semibold">
                Pesan WA →
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-20 hidden md:flex items-center justify-center w-11 h-11 bg-[#16191D]/90 hover:bg-[#1E2227] text-[#F0F2F5] border border-[#2C323B] rounded-full shadow-lg transition-all cursor-pointer hover:border-[#D49B58]"
          aria-label="Kembali ke atas"
        >
          <ArrowUp className="w-5 h-5 text-[#D49B58]" />
        </button>
      )}

    </div>
  );
}
