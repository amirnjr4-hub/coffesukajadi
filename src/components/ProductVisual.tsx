import React, { useState } from 'react';
import { MenuItem } from '../types';

interface ProductVisualProps {
  item: MenuItem;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProductVisual: React.FC<ProductVisualProps> = ({ item, className = '', size = 'md' }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (item.imageUrl && !imageError) {
    return (
      <div className={`relative overflow-hidden bg-[#16191D] ${className}`}>
        {/* Placeholder skeleton while loading */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-[#1A1D22] animate-pulse flex items-center justify-center">
            <span className="text-[10px] font-mono text-[#D49B58]/60 uppercase tracking-widest">
              Foto Asli Menu...
            </span>
          </div>
        )}

        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => setImageError(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-108 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Ambient moody vignette & contrast gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1113]/85 via-[#0F1113]/20 to-transparent pointer-events-none" />

        {/* Authentic category label badge */}
        <div className="absolute bottom-2.5 left-3 z-10 text-[10px] uppercase tracking-wider font-mono text-[#E2E8F0] bg-[#0F1113]/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 pointer-events-none">
          {item.category}
        </div>
      </div>
    );
  }

  // Domain-curated SVG vector visuals based on coffee shop aesthetic
  return (
    <div
      className={`relative overflow-hidden select-none flex items-center justify-center transition-all duration-300 ${
        getCategoryBg(item.category, item.imageType)
      } ${className}`}
    >
      {/* Subtle background grain & warm organic radial glow */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.2),transparent_70%)]" />

      {/* Domain Vector Iconography */}
      <div className="relative z-10 transform transition-transform duration-300 group-hover:scale-110 flex flex-col items-center justify-center">
        {renderArtisanGraphic(item.imageType, size)}
      </div>

      {/* Category watermark tag */}
      <div className="absolute bottom-2.5 left-3 z-10 text-[10px] uppercase tracking-wider font-mono text-white/70 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded">
        {item.category}
      </div>
    </div>
  );
};

function getCategoryBg(category: string, type: string): string {
  switch (type) {
    case 'kopi-susu':
      return 'bg-gradient-to-br from-[#382417] via-[#4D3322] to-[#1C1109] text-[#F1E8DF]';
    case 'espresso':
      return 'bg-gradient-to-br from-[#1B120C] via-[#2A1C14] to-[#100A06] text-[#D8B48F]';
    case 'latte':
      return 'bg-gradient-to-br from-[#3D291C] via-[#523826] to-[#21140C] text-[#FBF6EE]';
    case 'manual-brew':
      return 'bg-gradient-to-br from-[#2E1F15] via-[#3E2B1E] to-[#170E08] text-[#E0C7A9]';
    case 'matcha':
      return 'bg-gradient-to-br from-[#18261C] via-[#243528] to-[#101912] text-[#D7EADE]';
    case 'chocolate':
      return 'bg-gradient-to-br from-[#24150E] via-[#352016] to-[#140A06] text-[#E7CBB3]';
    case 'mocktail':
      return 'bg-gradient-to-br from-[#5E2616] via-[#75301D] to-[#331208] text-[#FDEBD9]';
    case 'iced-tea':
      return 'bg-gradient-to-br from-[#542B10] via-[#6B3714] to-[#2E1606] text-[#FDE8C7]';
    case 'pastry':
    case 'toast':
      return 'bg-gradient-to-br from-[#4A301A] via-[#614022] to-[#28180A] text-[#FAF0DB]';
    case 'snack':
      return 'bg-gradient-to-br from-[#3D2817] via-[#523720] to-[#21140A] text-[#F8E8D0]';
    default:
      return 'bg-gradient-to-br from-[#301F14] to-[#150C07] text-[#E8D4BE]';
  }
}

function renderArtisanGraphic(type: string, size: 'sm' | 'md' | 'lg') {
  const scale = size === 'sm' ? 0.75 : size === 'lg' ? 1.25 : 1;

  switch (type) {
    case 'kopi-susu':
      return (
        <svg
          width={72 * scale}
          height={86 * scale}
          viewBox="0 0 72 86"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          {/* Glass Cup */}
          <path d="M12 10L18 76C18.5 80 22 83 26 83H46C50 83 53.5 80 54 76L60 10H12Z" fill="rgba(255,255,255,0.08)" stroke="currentColor" strokeWidth="2" />
          {/* Gula Aren bottom layer */}
          <path d="M19 72L18.2 75C18.5 78 21.5 81 25.5 81H46.5C50.5 81 53.5 78 53.8 75L53 72C48 74 38 74 19 72Z" fill="#3D1C06" />
          {/* Fresh Milk layer */}
          <path d="M16 48L19 72C38 74 48 74 53 72L56 48C45 50 28 47 16 48Z" fill="#F8EFE4" fillOpacity="0.85" />
          {/* Espresso Top Layer */}
          <path d="M13 18L16 48C28 47 45 50 56 48L59 18C47 20 25 17 13 18Z" fill="#422213" />
          {/* Ice Cubes */}
          <rect x="22" y="24" width="13" height="13" rx="2" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="1" transform="rotate(12 22 24)" />
          <rect x="36" y="32" width="12" height="12" rx="2" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="1" transform="rotate(-8 36 32)" />
          {/* Straw */}
          <line x1="48" y1="4" x2="38" y2="78" stroke="#D19B68" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'latte':
      return (
        <svg
          width={80 * scale}
          height={66 * scale}
          viewBox="0 0 80 66"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          {/* Saucer */}
          <ellipse cx="40" cy="58" rx="36" ry="6" fill="rgba(0,0,0,0.2)" stroke="currentColor" strokeWidth="1.5" />
          {/* Cup */}
          <path d="M18 18C18 38 27 50 40 50C53 50 62 38 62 18H18Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
          {/* Handle */}
          <path d="M60 22C67 22 72 26 72 32C72 38 65 42 58 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* Coffee surface */}
          <ellipse cx="40" cy="18" rx="22" ry="7" fill="#4B2816" stroke="currentColor" strokeWidth="1.5" />
          {/* Tulip Latte Art */}
          <path d="M40 14C37 16 35 18 40 21C45 18 43 16 40 14Z" fill="#FFF5EA" />
          <path d="M40 17C35 19 33 21 40 23C47 21 45 19 40 17Z" fill="#FFF5EA" />
          <circle cx="40" cy="23.5" r="1.5" fill="#FFF5EA" />
        </svg>
      );

    case 'espresso':
      return (
        <svg
          width={70 * scale}
          height={60 * scale}
          viewBox="0 0 70 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          {/* Saucer */}
          <ellipse cx="35" cy="52" rx="28" ry="5" fill="rgba(0,0,0,0.2)" stroke="currentColor" strokeWidth="1.5" />
          {/* Demi Cup */}
          <path d="M20 20C20 34 26 44 35 44C44 44 50 34 50 20H20Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
          {/* Handle */}
          <path d="M48 24C53 24 57 27 57 31C57 35 52 38 46 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* Rich Crema surface */}
          <ellipse cx="35" cy="20" rx="15" ry="4.5" fill="#884F25" stroke="currentColor" strokeWidth="1.5" />
          {/* Crema swirl */}
          <ellipse cx="33" cy="20" rx="9" ry="2.5" fill="#B7733E" />
          {/* Steam */}
          <path d="M32 14C31 10 35 8 34 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <path d="M38 13C37 9 41 7 40 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      );

    case 'manual-brew':
      return (
        <svg
          width={72 * scale}
          height={86 * scale}
          viewBox="0 0 72 86"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          {/* V60 Cone Dripper */}
          <path d="M18 10L36 38L54 10H18Z" stroke="currentColor" strokeWidth="2" fill="rgba(255,255,255,0.08)" />
          {/* Dripper Base plate */}
          <line x1="12" y1="38" x2="60" y2="38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          {/* Glass Server Carafe */}
          <path d="M26 44L18 78C18 82 22 84 26 84H46C50 84 54 82 54 78L46 44H26Z" stroke="currentColor" strokeWidth="2" fill="rgba(255,255,255,0.05)" />
          {/* Amber Coffee Extract */}
          <path d="M20 68L18.5 77C18.5 80 22 82 26 82H46C50 82 53.5 80 53.5 77L52 68C42 70 30 67 20 68Z" fill="#A8622A" />
          {/* Carafe Handle */}
          <path d="M50 48C58 48 62 54 62 62C62 70 56 74 48 74" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* Drop */}
          <circle cx="36" cy="48" r="2" fill="#D38847" />
        </svg>
      );

    case 'matcha':
      return (
        <svg
          width={76 * scale}
          height={66 * scale}
          viewBox="0 0 76 66"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          <ellipse cx="38" cy="58" rx="34" ry="5.5" fill="rgba(0,0,0,0.2)" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 18C16 38 25 50 38 50C51 50 60 38 60 18H16Z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" />
          <path d="M58 22C65 22 70 26 70 32C70 38 63 42 56 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="38" cy="18" rx="22" ry="7" fill="#3A6A4C" stroke="currentColor" strokeWidth="1.5" />
          {/* Matcha frothy center */}
          <ellipse cx="38" cy="18" rx="14" ry="4" fill="#589B70" />
          {/* Leaf garnish */}
          <path d="M38 16C42 14 44 18 41 20C38 21 35 18 38 16Z" fill="#A7E4BC" />
        </svg>
      );

    case 'mocktail':
    case 'iced-tea':
      return (
        <svg
          width={70 * scale}
          height={86 * scale}
          viewBox="0 0 70 86"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          {/* Highball Glass */}
          <path d="M18 10L22 78C22.5 81 25 83 29 83H41C45 83 47.5 81 48 78L52 10H18Z" stroke="currentColor" strokeWidth="2" fill="rgba(255,255,255,0.06)" />
          {/* Drink fill */}
          <path d="M20 24L22.5 78C22.7 80 25 81 29 81H41C45 81 47.3 80 47.5 78L50 24H20Z" fill={type === 'mocktail' ? '#9F2E14' : '#A45D18'} fillOpacity="0.75" />
          {/* Lemon Wheel garnish on rim */}
          <circle cx="20" cy="16" r="10" fill="#EAB308" stroke="#FEF08A" strokeWidth="1.5" />
          <line x1="20" y1="6" x2="20" y2="26" stroke="#FEF08A" strokeWidth="1" />
          <line x1="10" y1="16" x2="30" y2="16" stroke="#FEF08A" strokeWidth="1" />
          {/* Mint Leaves */}
          <path d="M22 6C26 3 28 8 25 10C22 11 20 8 22 6Z" fill="#4ADE80" />
          {/* Straw */}
          <line x1="42" y1="4" x2="35" y2="76" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'pastry':
      return (
        <svg
          width={84 * scale}
          height={66 * scale}
          viewBox="0 0 84 66"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          {/* Plate */}
          <ellipse cx="42" cy="50" rx="38" ry="8" fill="rgba(0,0,0,0.2)" stroke="currentColor" strokeWidth="1.5" />
          {/* Croissant Crescent */}
          <path
            d="M14 44C16 34 26 22 42 22C58 22 68 34 70 44C66 43 58 35 42 35C26 35 18 43 14 44Z"
            fill="#C98236"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          {/* Pastry ridges */}
          <path d="M30 25C34 29 36 33 36 35" stroke="#9A5618" strokeWidth="2" strokeLinecap="round" />
          <path d="M42 22C43 27 43 31 42 35" stroke="#9A5618" strokeWidth="2" strokeLinecap="round" />
          <path d="M54 25C50 29 48 33 48 35" stroke="#9A5618" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'toast':
    case 'snack':
    default:
      return (
        <svg
          width={80 * scale}
          height={66 * scale}
          viewBox="0 0 80 66"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          <ellipse cx="40" cy="52" rx="36" ry="7" fill="rgba(0,0,0,0.2)" stroke="currentColor" strokeWidth="1.5" />
          <rect x="22" y="16" width="36" height="34" rx="6" fill="#B87635" stroke="currentColor" strokeWidth="2" />
          <path d="M20 18C20 13 28 10 40 10C52 10 60 13 60 18H20Z" fill="#C98236" stroke="currentColor" strokeWidth="2" />
          <path d="M26 24L34 44" stroke="#784214" strokeWidth="2" strokeLinecap="round" />
          <path d="M38 24L46 44" stroke="#784214" strokeWidth="2" strokeLinecap="round" />
          <circle cx="48" cy="22" r="3" fill="#FDE047" />
        </svg>
      );
  }
}
