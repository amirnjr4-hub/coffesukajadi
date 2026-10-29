import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Plus, Trash2, Check, SlidersHorizontal, Coffee, Store, ShieldAlert, Sparkles, KeyRound, Lock, ShieldCheck, AlertTriangle, CreditCard, Eye, EyeOff } from 'lucide-react';
import { BusinessInfo, MenuItem, MenuCategory } from '../types';
import { formatRupiah } from '../utils/formatters';

interface OwnerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessInfo: BusinessInfo;
  menuItems: MenuItem[];
  onSaveBusinessInfo: (info: BusinessInfo) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onAddMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
  onResetToDefault: () => void;
}

const CATEGORIES: MenuCategory[] = [
  'Espresso Based',
  'Kopi Susu',
  'Manual Brew',
  'Non-Coffee',
  'Minuman Dingin',
  'Makanan dan Camilan',
];

const PIN_STORAGE_KEY = 'kopi_sukajadi_admin_pin_hash_v2';
const MASTER_KEY_STORAGE = 'kopi_sukajadi_master_recovery_key';
const DEFAULT_MASTER_KEY = 'SUKAJADI2026';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

// SHA-256 secure hash calculation using standard Web Crypto API
async function computePinHash(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin.trim() + '_salt_kopi_sukajadi_ciamis_2026');
  const buffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const OwnerSettingsModal: React.FC<OwnerSettingsModalProps> = ({
  isOpen,
  onClose,
  businessInfo,
  menuItems,
  onSaveBusinessInfo,
  onUpdateMenuItem,
  onAddMenuItem,
  onDeleteMenuItem,
  onResetToDefault,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'menu' | 'add' | 'security'>('info');

  // Form state for business info
  const [formData, setFormData] = useState<BusinessInfo>({ ...businessInfo });
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Device configuration status (has this device been activated with a private PIN?)
  const [isDeviceConfigured, setIsDeviceConfigured] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(PIN_STORAGE_KEY));
    } catch {
      return false;
    }
  });

  // First-Time Device Activation State (Prevents unauthorized stranger access on any new device)
  const [activationMasterKey, setActivationMasterKey] = useState('');
  const [activationPhone, setActivationPhone] = useState('');
  const [activationNewPin, setActivationNewPin] = useState('');
  const [activationConfirmPin, setActivationConfirmPin] = useState('');
  const [activationError, setActivationError] = useState('');

  // Hidden admin PIN security & rate-limiting
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Secure Recovery & Forgot PIN state (Owner Verification Only)
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [recoverySecretKey, setRecoverySecretKey] = useState('');
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [recoveryNewPin, setRecoveryNewPin] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryNotice, setRecoveryNotice] = useState('');

  // Master recovery key update state in Security Tab
  const [currentMasterKey, setCurrentMasterKey] = useState<string>(() => {
    try {
      return localStorage.getItem(MASTER_KEY_STORAGE) || DEFAULT_MASTER_KEY;
    } catch {
      return DEFAULT_MASTER_KEY;
    }
  });
  const [showMasterKeySecret, setShowMasterKeySecret] = useState(false);
  const [customMasterKeyInput, setCustomMasterKeyInput] = useState('');
  const [masterKeyMessage, setMasterKeyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Change PIN state
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeMessage, setPinChangeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state for adding new menu
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuCategory, setNewMenuCategory] = useState<MenuCategory>('Kopi Susu');
  const [newMenuPrice, setNewMenuPrice] = useState<number>(20000);
  const [newMenuDesc, setNewMenuDesc] = useState('');
  const [newMenuBadge, setNewMenuBadge] = useState('');
  const [newMenuImageType, setNewMenuImageType] = useState<MenuItem['imageType']>('kopi-susu');
  const [newMenuImageUrl, setNewMenuImageUrl] = useState('');

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          setPinError('');
          setRecoveryError('');
          setActivationError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  // Keyboard shortcut: Press Escape to close modal immediately back to Beranda
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSecureClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Reset authentication and inputs when modal closes (Auto-Lock)
  const handleSecureClose = () => {
    setIsAuthenticated(false);
    setPinInput('');
    setPinError('');
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setPinChangeMessage(null);
    setShowForgotPin(false);
    setRecoverySecretKey('');
    setRecoveryPhone('');
    setRecoveryNewPin('');
    setRecoveryError('');
    setRecoveryNotice('');
    setMasterKeyMessage(null);
    setActivationMasterKey('');
    setActivationPhone('');
    setActivationNewPin('');
    setActivationConfirmPin('');
    setActivationError('');
    onClose();
  };

  // First-Time Activation for New Devices
  const handleActivateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError('');

    if (lockoutTimer > 0) {
      setActivationError(`Sistem dibekukan sementara. Tunggu ${lockoutTimer} detik.`);
      return;
    }

    const storedMasterKey = localStorage.getItem(MASTER_KEY_STORAGE) || DEFAULT_MASTER_KEY;
    const enteredMasterKey = activationMasterKey.trim();

    const storePhoneClean = businessInfo.whatsappNumber.replace(/\D/g, '');
    const enteredPhoneClean = activationPhone.replace(/\D/g, '');

    if (!enteredMasterKey || !enteredPhoneClean || !activationNewPin.trim() || !activationConfirmPin.trim()) {
      setActivationError('Semua kolom verifikasi dan PIN wajib diisi.');
      return;
    }

    if (enteredMasterKey !== storedMasterKey) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        setLockoutTimer(LOCKOUT_SECONDS);
        setActivationError(`Kunci Rahasia Pemilik Salah (${newAttempts}x)! Sistem dibekukan selama ${LOCKOUT_SECONDS} detik untuk proteksi.`);
      } else {
        setActivationError(`Kunci Rahasia Pemilik Salah! Sisa percobaan: ${MAX_FAILED_ATTEMPTS - newAttempts} kali.`);
      }
      return;
    }

    const phoneMatches =
      enteredPhoneClean === storePhoneClean ||
      (storePhoneClean.startsWith('62') && enteredPhoneClean === '0' + storePhoneClean.slice(2)) ||
      (enteredPhoneClean.startsWith('62') && storePhoneClean === '0' + enteredPhoneClean.slice(2)) ||
      (storePhoneClean.endsWith(enteredPhoneClean.slice(-8)));

    if (!phoneMatches) {
      setActivationError(`Nomor WhatsApp tidak cocok dengan nomor resmi terdaftar (${businessInfo.whatsappNumber}). Akses ditolak.`);
      return;
    }

    if (activationNewPin.trim().length < 4) {
      setActivationError('PIN baru minimal harus 4 digit angka.');
      return;
    }

    if (activationNewPin.trim() !== activationConfirmPin.trim()) {
      setActivationError('Konfirmasi PIN baru tidak sesuai.');
      return;
    }

    const newHash = await computePinHash(activationNewPin.trim());
    try {
      localStorage.setItem(PIN_STORAGE_KEY, newHash);
    } catch (err) {
      console.warn('Failed to store new PIN', err);
    }

    setIsDeviceConfigured(true);
    setIsAuthenticated(true);
    setFailedAttempts(0);
    setLockoutTimer(0);
    setActivationMasterKey('');
    setActivationPhone('');
    setActivationNewPin('');
    setActivationConfirmPin('');
    setActivationError('');
  };

  // Verified Owner PIN Recovery (Requires Secret Master Key & Registered WhatsApp Phone)
  const handleVerifyOwnerRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    if (lockoutTimer > 0) {
      setRecoveryError(`Sistem dibekukan sementara. Tunggu ${lockoutTimer} detik.`);
      return;
    }

    const storedMasterKey = localStorage.getItem(MASTER_KEY_STORAGE) || DEFAULT_MASTER_KEY;
    const enteredMasterKey = recoverySecretKey.trim();

    // Clean phone numbers (digits only)
    const storePhoneClean = businessInfo.whatsappNumber.replace(/\D/g, '');
    const enteredPhoneClean = recoveryPhone.replace(/\D/g, '');

    if (!enteredMasterKey || !enteredPhoneClean || !recoveryNewPin.trim()) {
      setRecoveryError('Semua kolom verifikasi pemilik wajib diisi.');
      return;
    }

    if (enteredMasterKey !== storedMasterKey) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        setLockoutTimer(LOCKOUT_SECONDS);
        setRecoveryError(`Kunci Rahasia Pemilik Salah (${newAttempts}x)! Sistem dibekukan selama ${LOCKOUT_SECONDS} detik untuk proteksi.`);
      } else {
        setRecoveryError(`Kunci Rahasia Pemilik Salah! Sisa percobaan: ${MAX_FAILED_ATTEMPTS - newAttempts} kali.`);
      }
      return;
    }

    const phoneMatches =
      enteredPhoneClean === storePhoneClean ||
      (storePhoneClean.startsWith('62') && enteredPhoneClean === '0' + storePhoneClean.slice(2)) ||
      (enteredPhoneClean.startsWith('62') && storePhoneClean === '0' + enteredPhoneClean.slice(2)) ||
      (storePhoneClean.endsWith(enteredPhoneClean.slice(-8)));

    if (!phoneMatches) {
      setRecoveryError(`Nomor WhatsApp tidak cocok dengan nomor terdaftar kedai ini (${businessInfo.whatsappNumber}). Akses ditolak.`);
      return;
    }

    if (recoveryNewPin.trim().length < 4) {
      setRecoveryError('PIN baru minimal harus 4 digit angka.');
      return;
    }

    // Verified! Save new PIN
    const newHash = await computePinHash(recoveryNewPin.trim());
    try {
      localStorage.setItem(PIN_STORAGE_KEY, newHash);
    } catch (err) {
      console.warn('Failed to store new PIN', err);
    }

    setIsDeviceConfigured(true);
    setLockoutTimer(0);
    setFailedAttempts(0);
    setRecoverySecretKey('');
    setRecoveryPhone('');
    setRecoveryNewPin('');
    setRecoveryError('');
    setShowForgotPin(false);
    setRecoveryNotice('Identitas Pemilik Berhasil Diverifikasi! PIN baru telah disimpan. Silakan masuk menggunakan PIN baru.');
  };

  // Change Master Recovery Key in Tab 4
  const handleSaveCustomMasterKey = (e: React.FormEvent) => {
    e.preventDefault();
    setMasterKeyMessage(null);
    if (!customMasterKeyInput.trim() || customMasterKeyInput.trim().length < 6) {
      setMasterKeyMessage({ type: 'error', text: 'Kunci Rahasia minimal harus 6 karakter.' });
      return;
    }
    const newKey = customMasterKeyInput.trim();
    try {
      localStorage.setItem(MASTER_KEY_STORAGE, newKey);
      setCurrentMasterKey(newKey);
      setCustomMasterKeyInput('');
      setMasterKeyMessage({ type: 'success', text: 'Kunci Rahasia Pemulihan berhasil diperbarui!' });
    } catch (err) {
      console.warn('Failed to save master key', err);
      setMasterKeyMessage({ type: 'error', text: 'Gagal menyimpan ke penyimpanan lokal.' });
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutTimer > 0) {
      setPinError(`Sistem terkunci sementara. Coba lagi dalam ${lockoutTimer} detik atau gunakan opsi Pemulihan PIN.`);
      return;
    }

    if (!pinInput.trim()) {
      setPinError('Masukkan PIN terlebih dahulu.');
      return;
    }

    // Verify against custom hashed PIN
    const storedHash = localStorage.getItem(PIN_STORAGE_KEY);
    if (!storedHash) {
      setIsDeviceConfigured(false);
      setPinError('Perangkat ini belum diaktivasi oleh pengelola.');
      return;
    }

    const inputHash = await computePinHash(pinInput);
    if (inputHash === storedHash) {
      setIsAuthenticated(true);
      setPinError('');
      setFailedAttempts(0);
      setPinInput('');
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        setLockoutTimer(LOCKOUT_SECONDS);
        setPinError(`Terlalu banyak percobaan salah (${newAttempts}x). Akses dibekukan selama ${LOCKOUT_SECONDS} detik untuk mencegah peretasan brute-force.`);
      } else {
        const remaining = MAX_FAILED_ATTEMPTS - newAttempts;
        setPinError(`PIN salah! Sisa percobaan sebelum terkunci: ${remaining} kali.`);
      }
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeMessage(null);

    if (!currentPinInput.trim() || !newPinInput.trim() || !confirmPinInput.trim()) {
      setPinChangeMessage({ type: 'error', text: 'Semua kolom PIN wajib diisi.' });
      return;
    }

    if (newPinInput.length < 4) {
      setPinChangeMessage({ type: 'error', text: 'PIN baru minimal harus 4 digit angka.' });
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinChangeMessage({ type: 'error', text: 'Konfirmasi PIN baru tidak sesuai.' });
      return;
    }

    // Verify current PIN first
    const storedHash = localStorage.getItem(PIN_STORAGE_KEY);
    if (!storedHash) {
      setPinChangeMessage({ type: 'error', text: 'PIN belum dikonfigurasi pada perangkat ini.' });
      return;
    }

    const currentHash = await computePinHash(currentPinInput);
    if (currentHash !== storedHash) {
      setPinChangeMessage({ type: 'error', text: 'PIN Saat Ini salah. Verifikasi identitas gagal.' });
      return;
    }

    // Save new hashed PIN
    const newHash = await computePinHash(newPinInput);
    localStorage.setItem(PIN_STORAGE_KEY, newHash);

    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setPinChangeMessage({ type: 'success', text: 'PIN rahasia baru berhasil disimpan dengan enkripsi SHA-256!' });
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBusinessInfo(formData);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const handleAddNewMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName.trim() || newMenuPrice <= 0) return;

    const newItem: MenuItem = {
      id: `custom-${Date.now()}`,
      name: newMenuName.trim(),
      category: newMenuCategory,
      price: Number(newMenuPrice),
      description: newMenuDesc.trim() || 'Racikan menu nikmat dari kedai kami.',
      isAvailable: true,
      badge: newMenuBadge.trim() || undefined,
      imageType: newMenuImageType,
      imageUrl: newMenuImageUrl.trim() || undefined,
    };

    onAddMenuItem(newItem);
    setNewMenuName('');
    setNewMenuDesc('');
    setNewMenuBadge('');
    setNewMenuImageUrl('');
    setActiveTab('menu');
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleSecureClose}
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs transition-opacity cursor-pointer"
      aria-label="Kembali ke Beranda"
      title="Klik di luar untuk kembali ke Beranda"
    >
      {/* If not authenticated, show discreet PIN login or verified owner recovery dialog */}
      {!isAuthenticated ? (
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-sm bg-[#121417] text-[#F0F2F5] rounded-2xl shadow-2xl border border-[#262B33] p-6 text-center space-y-4 animate-scale-in cursor-default"
        >
          {/* Top-Right Close Button to Return to Home Page */}
          <button
            type="button"
            onClick={handleSecureClose}
            className="absolute top-4 right-4 p-1.5 text-[#8C95A3] hover:text-[#F0F2F5] hover:bg-[#1A1D22] rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup dan kembali ke beranda"
            title="Tutup & Kembali ke Beranda"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-[#14171A] text-[#D49B58] border border-[#D49B58]/40 p-1.5 flex items-center justify-center mx-auto shadow-md overflow-hidden">
            <img
              src={businessInfo.logoUrl || '/assets/aistudio/Logo_Kopi_NYT_Elegan_Premium_601e053d.png'}
              alt={`${businessInfo.shopName} Logo`}
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg text-[#F0F2F5]">
              {!isDeviceConfigured ? 'Aktivasi Perangkat Pengelola' : 'Portal Pengelola Kedai'}
            </h3>
            <p className="text-xs text-[#8C95A3] mt-1">
              {!isDeviceConfigured
                ? 'Perangkat ini belum diaktivasi. Masukkan Kunci Rahasia Pemilik & WhatsApp kedai untuk membuat PIN akses.'
                : 'Khusus pengelola Kedai Sukajadi untuk mengatur menu, nomor WhatsApp, dan sistem kedai.'}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#16191D] border border-[#262B33] text-[11px] text-[#A3E0C1]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#A3E0C1]" />
              <span>Enkripsi SHA-256 & Proteksi Pemilik Terverifikasi</span>
            </div>
          </div>

          {/* Recovery Success Banner */}
          {recoveryNotice && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2 text-left">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{recoveryNotice}</span>
            </div>
          )}

          {/* STATE 1: UNCONFIGURED DEVICE (First-time device activation, prevents random strangers from entering) */}
          {!isDeviceConfigured ? (
            <div className="space-y-3 pt-1 text-left bg-[#16191D] p-4 rounded-xl border border-[#262B33]">
              <div className="flex items-center justify-between pb-1 border-b border-[#262B33]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D49B58]">
                  <KeyRound className="w-4 h-4 text-[#D49B58]" />
                  <span>Aktivasi Perangkat Pemilik</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                  Perangkat Baru
                </span>
              </div>

              <p className="text-[11px] text-[#9DA7B3] leading-relaxed">
                Untuk mencegah orang lain merusak data kedai, perangkat baru wajib diverifikasi dengan <strong>Kunci Rahasia Pemilik</strong> dan <strong>Nomor WhatsApp Resmi</strong> kedai.
              </p>

              {activationError && (
                <div className="p-2.5 bg-red-950/90 border border-red-800 rounded-xl text-[11px] text-red-200 flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{activationError}</span>
                </div>
              )}

              <form onSubmit={handleActivateDevice} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#F0F2F5] mb-1">
                    Kunci Rahasia Pemilik <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan Kunci Rahasia Pemilik"
                    value={activationMasterKey}
                    onChange={(e) => {
                      setActivationMasterKey(e.target.value);
                      if (activationError) setActivationError('');
                    }}
                    className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs border border-[#2C323B] focus:ring-1 focus:ring-[#D49B58] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#F0F2F5] mb-1">
                    Nomor WhatsApp Kedai Resmi <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 085324345678"
                    value={activationPhone}
                    onChange={(e) => {
                      setActivationPhone(e.target.value);
                      if (activationError) setActivationError('');
                    }}
                    className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs font-mono border border-[#2C323B] focus:ring-1 focus:ring-[#D49B58] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#F0F2F5] mb-1">
                      Buat PIN Baru <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      maxLength={12}
                      required
                      placeholder="Min. 4 Digit"
                      value={activationNewPin}
                      onChange={(e) => {
                        setActivationNewPin(e.target.value);
                        if (activationError) setActivationError('');
                      }}
                      className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs font-mono border border-[#2C323B] focus:ring-1 focus:ring-[#D49B58] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#F0F2F5] mb-1">
                      Konfirmasi PIN <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      maxLength={12}
                      required
                      placeholder="Ulangi PIN"
                      value={activationConfirmPin}
                      onChange={(e) => {
                        setActivationConfirmPin(e.target.value);
                        if (activationError) setActivationError('');
                      }}
                      className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs font-mono border border-[#2C323B] focus:ring-1 focus:ring-[#D49B58] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#D49B58] hover:bg-[#E5B074] text-[#0F1113] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Verifikasi Pemilik & Aktifkan Akses
                  </button>

                  <button
                    type="button"
                    onClick={handleSecureClose}
                    className="w-full py-2 text-xs font-medium text-red-300 hover:text-white rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 transition-colors cursor-pointer text-center"
                  >
                    ✕ Tutup ke Beranda
                  </button>
                </div>
              </form>
            </div>
          ) : showForgotPin ? (
            /* STATE 2: VERIFIED OWNER PIN RECOVERY */
            <div className="space-y-3 pt-1 text-left bg-[#16191D] p-4 rounded-xl border border-[#262B33]">
              <div className="flex items-center justify-between pb-1 border-b border-[#262B33]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D49B58]">
                  <KeyRound className="w-4 h-4 text-[#D49B58]" />
                  <span>Verifikasi Identitas Pemilik</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800">
                  Proteksi Rahasia
                </span>
              </div>
              
              <p className="text-[11px] text-[#9DA7B3] leading-relaxed">
                Untuk mencegah orang lain mereset PIN kedai Anda, pemulihan wajib memasukkan <strong>Kunci Rahasia Pemilik</strong> dan <strong>Nomor WhatsApp Terdaftar</strong> kedai.
              </p>

              {recoveryError && (
                <div className="p-2.5 bg-red-950/90 border border-red-800 rounded-xl text-[11px] text-red-200 flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{recoveryError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOwnerRecovery} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#F0F2F5] mb-1">
                    Kunci Rahasia Pemilik <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan Kunci Rahasia Pemilik"
                    value={recoverySecretKey}
                    onChange={(e) => {
                      setRecoverySecretKey(e.target.value);
                      if (recoveryError) setRecoveryError('');
                    }}
                    className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs border border-[#2C323B] focus:ring-1 focus:ring-[#D49B58] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#F0F2F5] mb-1">
                    Nomor WhatsApp Kedai Terdaftar <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nomor WA Kedai Resmi (Contoh: 085324345678)"
                    value={recoveryPhone}
                    onChange={(e) => {
                      setRecoveryPhone(e.target.value);
                      if (recoveryError) setRecoveryError('');
                    }}
                    className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs font-mono border border-[#2C323B] focus:ring-1 focus:ring-[#D49B58] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#F0F2F5] mb-1">
                    Buat PIN Baru (Minimal 4 Digit) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    maxLength={12}
                    required
                    placeholder="Contoh PIN Baru: 8829"
                    value={recoveryNewPin}
                    onChange={(e) => {
                      setRecoveryNewPin(e.target.value);
                      if (recoveryError) setRecoveryError('');
                    }}
                    className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs font-mono border border-[#2C323B] focus:ring-1 focus:ring-[#D49B58] focus:outline-hidden"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#D49B58] hover:bg-[#E5B074] text-[#0F1113] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Verifikasi Pemilik & Simpan PIN Baru
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPin(false);
                        setRecoveryError('');
                      }}
                      className="flex-1 py-2 text-xs font-medium text-[#8C95A3] hover:text-[#F0F2F5] rounded-xl bg-[#1A1D22] hover:bg-[#252A33] border border-[#2C323B] transition-colors cursor-pointer text-center"
                    >
                      ← Kembali Masuk
                    </button>
                    <button
                      type="button"
                      onClick={handleSecureClose}
                      className="flex-1 py-2 text-xs font-medium text-red-300 hover:text-white rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 transition-colors cursor-pointer text-center"
                    >
                      ✕ Tutup ke Beranda
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* STATE 3: STANDARD DISCREET PIN LOGIN */
            <form onSubmit={handleVerifyPin} className="space-y-3 pt-1">
              {lockoutTimer > 0 ? (
                <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 space-y-2">
                  <div className="flex items-center justify-center gap-1.5 font-bold text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Akses Dibekukan Sementara</span>
                  </div>
                  <p className="text-[11px]">
                    Terlalu banyak percobaan gagal. Silakan tunggu{' '}
                    <strong className="text-white font-mono text-xs">{lockoutTimer}</strong> detik lagi, atau gunakan verifikasi rahasia pemilik:
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPin(true);
                      setRecoveryError('');
                    }}
                    className="w-full py-1.5 bg-red-900/60 hover:bg-red-900 text-red-100 rounded-lg text-xs font-semibold border border-red-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-red-300" />
                    <span>Verifikasi Kunci Rahasia Pemilik</span>
                  </button>
                </div>
              ) : pinError ? (
                <div className="text-[11px] text-red-300 bg-red-950/80 p-2 rounded-lg border border-red-800">
                  {pinError}
                </div>
              ) : null}

              <div>
                <input
                  type="password"
                  maxLength={12}
                  disabled={lockoutTimer > 0}
                  autoFocus
                  placeholder={lockoutTimer > 0 ? 'Terkunci...' : 'Masukkan PIN Keamanan Admin'}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError('');
                  }}
                  className={`w-full text-center px-4 py-2.5 bg-[#1A1D22] border rounded-xl text-sm font-mono tracking-widest text-[#F0F2F5] focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden ${
                    lockoutTimer > 0 ? 'opacity-50 cursor-not-allowed border-red-800' : 'border-[#2C323B]'
                  }`}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSecureClose}
                  className="flex-1 py-2 text-xs font-medium text-[#8C95A3] hover:text-[#F0F2F5] rounded-xl hover:bg-[#1A1D22] transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={lockoutTimer > 0}
                  className={`flex-1 py-2 bg-[#D49B58] hover:bg-[#E5B074] text-[#0F1113] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${
                    lockoutTimer > 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Masuk
                </button>
              </div>

              {/* Secure Forgot PIN trigger */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPin(true);
                    setRecoveryError('');
                  }}
                  className="text-[11px] text-[#D49B58] hover:text-[#E5B074] hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Lupa PIN? Verifikasi Identitas Pemilik</span>
                </button>
              </div>

              {/* Explicit, Unmistakable Return to Home Button */}
              <div className="pt-2 border-t border-[#262B33]">
                <button
                  type="button"
                  onClick={handleSecureClose}
                  className="w-full py-2.5 bg-[#16191D] hover:bg-[#1E232A] border border-[#262B33] text-xs font-semibold text-[#D1D5DB] hover:text-white rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>← Tutup & Kembali ke Beranda Pelanggan</span>
                </button>
              </div>
            </form>
          )}

        </div>
      ) : (
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-3xl bg-[#121417] text-[#F0F2F5] rounded-2xl shadow-2xl border border-[#262B33] overflow-hidden flex flex-col max-h-[90vh] animate-scale-in cursor-default"
      >
        
        {/* Modal Header with Secure Logout Button */}
        <div className="px-6 py-4 bg-[#16191D] border-b border-[#262B33] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#14171A] text-white flex items-center justify-center border border-[#D49B58]/40 p-1 overflow-hidden shrink-0 shadow-xs">
              <img
                src={businessInfo.logoUrl || '/assets/aistudio/Logo_Kopi_NYT_Elegan_Premium_601e053d.png'}
                alt="Logo Kedai"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#F0F2F5]">
                Portal Admin Kedai Kopi Sukajadi
              </h2>
              <p className="text-xs text-[#8C95A3]">
                Kelola informasi kedai, nomor WhatsApp pesanan, daftar menu, dan keamanan PIN.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSecureClose}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1A1D22] hover:bg-[#252A33] border border-[#2C323B] text-xs text-[#8C95A3] hover:text-[#D49B58] transition-colors cursor-pointer"
              title="Kunci Sesi & Keluar"
            >
              <Lock className="w-3.5 h-3.5 text-[#D49B58]" />
              <span className="hidden sm:inline">Kunci Sesi</span>
            </button>
            <button
              onClick={handleSecureClose}
              className="p-1.5 text-[#8C95A3] hover:text-[#F0F2F5] hover:bg-[#1A1D22] rounded-lg transition-colors cursor-pointer"
              title="Tutup Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#262B33] bg-[#14171A] px-6 pt-2 gap-2 text-xs font-medium overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-3 border-b-2 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-[#D49B58] text-[#D49B58]'
                : 'border-transparent text-[#8C95A3] hover:text-[#F0F2F5]'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Pengaturan Kedai & WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`pb-3 px-3 border-b-2 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'menu'
                ? 'border-[#D49B58] text-[#D49B58]'
                : 'border-transparent text-[#8C95A3] hover:text-[#F0F2F5]'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Kelola Menu ({menuItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`pb-3 px-3 border-b-2 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'add'
                ? 'border-[#D49B58] text-[#D49B58]'
                : 'border-transparent text-[#8C95A3] hover:text-[#F0F2F5]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Menu</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-3 border-b-2 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-[#D49B58] text-[#D49B58]'
                : 'border-transparent text-[#8C95A3] hover:text-[#F0F2F5]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Keamanan & Ubah PIN</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: BUSINESS INFO & WHATSAPP SETTINGS */}
          {activeTab === 'info' && (
            <form onSubmit={handleSaveInfo} className="space-y-4">
              
              {saveSuccessNotice && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Perubahan informasi kedai berhasil disimpan ke penyimpanan browser!</span>
                </div>
              )}

              {/* Dedicated Info Demonstrasi Card inside Admin Portal */}
              <div className="p-4 bg-[#16191D] border border-[#262B33] rounded-2xl space-y-3">
                <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-[#262B33]">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#D49B58]" />
                    <span className="font-semibold text-xs text-[#F0F2F5]">
                      Info Demonstrasi (Tersimpan di Portal Admin)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E3329] text-[#A3E0C1] border border-[#2D4D3D]">
                    {formData.isDemoMode ? 'Mode Demonstrasi Aktif' : 'Mode Publikasi Aktif'}
                  </span>
                </div>

                <p className="text-xs text-[#9DA7B3] leading-relaxed">
                  Pemberitahuan demonstrasi disimpan di portal pengelola ini agar halaman utama pelanggan tetap bersih, rapi, dan tidak mengganggu proses pemesanan. Nomor WhatsApp ({formData.whatsappNumber}) dan harga saat ini merupakan contoh peraga.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                  <div className="text-[11px] text-[#8C95A3]">
                    Ganti nomor WhatsApp dan nama kedai di bawah ini saat kedai resmi beroperasi.
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#D49B58] select-none shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.isDemoMode}
                      onChange={(e) => setFormData({ ...formData, isDemoMode: e.target.checked })}
                      className="rounded text-[#D49B58] focus:ring-[#D49B58] border-[#2C323B] bg-[#1A1D22]"
                    />
                    <span>Tandai Masih Mode Demonstrasi</span>
                  </label>
                </div>
              </div>

              {/* Logo Kedai Preview & Edit */}
              <div className="p-3.5 bg-[#16191D] rounded-xl border border-[#262B33] flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#121417] border border-[#D49B58]/40 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                  <img
                    src={formData.logoUrl || '/assets/aistudio/Logo_Kopi_NYT_Elegan_Premium_601e053d.png'}
                    alt="Logo Kedai Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 w-full space-y-1">
                  <label className="block text-xs font-semibold text-[#F0F2F5]">
                    URL / Path File Logo Kedai
                  </label>
                  <input
                    type="text"
                    value={formData.logoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="/assets/aistudio/Logo_Kopi_NYT_Elegan_Premium_601e053d.png"
                    className="w-full px-3 py-1.5 bg-[#1A1D22] text-[#F0F2F5] rounded-lg text-xs border border-[#2C323B] font-mono focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden"
                  />
                  <span className="text-[10px] text-[#8C95A3] block">
                    File logo aktif: Logo Resmi NYT Coffee Shop Elegan
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                    Nama Coffee Shop
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-sm border border-[#2C323B] focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                    Nomor WhatsApp Pesanan <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="Contoh: 6281234567890"
                    className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-sm border border-[#2C323B] font-mono focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden"
                  />
                  <span className="text-[10px] text-[#8C95A3] mt-1 block">
                    Gunakan format 62... (tanpa spasi atau tanda hubung)
                  </span>
                </div>

              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                  Slogan / Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-sm border border-[#2C323B] focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                  Deskripsi Kedai
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs border border-[#2C323B] focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                    Alamat Lengkap
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs border border-[#2C323B] focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                    Jam Operasional
                  </label>
                  <input
                    type="text"
                    value={formData.openingHours}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs border border-[#2C323B] focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                    Username Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.instagramHandle}
                    onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs border border-[#2C323B] focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                    Link Google Maps
                  </label>
                  <input
                    type="text"
                    value={formData.googleMapsUrl}
                    onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs border border-[#2C323B] focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Pengaturan Rekening Bank & QRIS Kedai */}
              <div className="p-4 bg-[#16191D] border border-[#262B33] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[#262B33]">
                  <CreditCard className="w-4 h-4 text-[#D49B58]" />
                  <span className="font-semibold text-xs text-[#F0F2F5]">
                    Pengaturan Rekening Bank & QRIS untuk Pembayaran Langsung
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                      Nama Bank / E-Wallet
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: BCA / BRI / Bank BJB"
                      value={formData.bankName || ''}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs border border-[#2C323B] focus:ring-1 focus:ring-[#D49B58] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                      Nomor Rekening
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 0541234567"
                      value={formData.bankAccountNumber || ''}
                      onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs font-mono border border-[#2C323B] focus:ring-1 focus:ring-[#D49B58] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                      Atas Nama Rekening
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Kopi Sukajadi / Amir"
                      value={formData.bankAccountName || ''}
                      onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs border border-[#2C323B] focus:ring-1 focus:ring-[#D49B58] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                      NMID QRIS (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: ID102026884920"
                      value={formData.qrisNmid || ''}
                      onChange={(e) => setFormData({ ...formData, qrisNmid: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs font-mono border border-[#2C323B] focus:ring-1 focus:ring-[#D49B58] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                      Catatan Pembayaran QRIS / E-Wallet
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Menerima GoPay, OVO, Dana, ShopeePay, BCA"
                      value={formData.qrisNote || ''}
                      onChange={(e) => setFormData({ ...formData, qrisNote: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs border border-[#2C323B] focus:ring-1 focus:ring-[#D49B58] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#262B33]">
                <button
                  type="button"
                  onClick={onResetToDefault}
                  className="px-3 py-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ke Data Demonstrasi Awal</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#D49B58] hover:bg-[#E5B074] text-[#0F1113] text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Informasi</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: MANAGE MENU ITEMS & AVAILABILITY */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#8C95A3]">
                <span>Ubah status ketersediaan (Tersedia / Habis) atau edit harga produk langsung:</span>
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-3 py-1 bg-[#D49B58] text-[#0F1113] font-bold rounded-lg flex items-center gap-1 text-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Menu</span>
                </button>
              </div>

              <div className="divide-y divide-[#262B33] bg-[#1A1D22] rounded-xl border border-[#262B33] overflow-hidden">
                {menuItems.map((item) => (
                  <div key={item.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      {/* Photo Thumbnail */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[#121417] border border-[#262B33] shadow-xs">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-[#8C95A3] font-mono">
                            Grafis
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-[#D49B58] bg-[#16191D] px-1.5 py-0.5 rounded border border-[#2C323B]">
                            {item.category}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] text-[#A3E0C1] font-semibold">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#F0F2F5] mt-0.5">
                          {item.name}
                        </h4>
                        <p className="text-xs text-[#8C95A3] line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Price and Availability Controls */}
                    <div className="flex items-center gap-3 shrink-0">
                      
                      {/* Price editor */}
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono text-[#D49B58]">Rp</span>
                        <input
                          type="number"
                          step="1000"
                          value={item.price}
                          onChange={(e) => {
                            const newPrice = Number(e.target.value);
                            onUpdateMenuItem({ ...item, price: newPrice });
                          }}
                          className="w-20 px-2 py-1 text-xs font-mono font-bold text-[#F0F2F5] bg-[#16191D] border border-[#2C323B] rounded-lg text-right focus:outline-hidden focus:ring-1 focus:ring-[#D49B58]"
                        />
                      </div>

                      {/* Availability Toggle */}
                      <button
                        type="button"
                        onClick={() => onUpdateMenuItem({ ...item, isAvailable: !item.isAvailable })}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          item.isAvailable
                            ? 'bg-[#1E3329] text-[#A3E0C1] hover:bg-[#264436] border border-[#2D4D3D]'
                            : 'bg-[#3A1818] text-[#FCA5A5] hover:bg-[#4D2020] border border-[#522020]'
                        }`}
                      >
                        {item.isAvailable ? 'Tersedia' : 'Habis'}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onDeleteMenuItem(item.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Menu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ADD NEW MENU ITEM */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddNewMenu} className="space-y-4">
              <h3 className="font-serif font-bold text-base text-[#F0F2F5]">
                Tambah Menu Baru ke Katalog
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                    Nama Menu <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newMenuName}
                    onChange={(e) => setNewMenuName(e.target.value)}
                    placeholder="Contoh: Kopi Filter Priangan Madu"
                    className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-sm border border-[#2C323B] focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                    Kategori <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={newMenuCategory}
                    onChange={(e) => setNewMenuCategory(e.target.value as MenuCategory)}
                    className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-sm border border-[#2C323B] focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#1A1D22] text-[#F0F2F5]">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                    Harga (Rupiah) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={newMenuPrice}
                    onChange={(e) => setNewMenuPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-sm border border-[#2C323B] font-mono focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                    Badge Khusus (Opsional)
                  </label>
                  <input
                    type="text"
                    value={newMenuBadge}
                    onChange={(e) => setNewMenuBadge(e.target.value)}
                    placeholder="Contoh: New, Signature, Favorit"
                    className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-sm border border-[#2C323B] focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden"
                  />
                </div>

              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                  Deskripsi Menu
                </label>
                <textarea
                  rows={2}
                  value={newMenuDesc}
                  onChange={(e) => setNewMenuDesc(e.target.value)}
                  placeholder="Jelaskan aroma, rasa, atau bahan olahan menu ini..."
                  className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs border border-[#2C323B] focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                    Gaya Ilustrasi Grafis
                  </label>
                  <select
                    value={newMenuImageType}
                    onChange={(e) => setNewMenuImageType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-sm border border-[#2C323B]"
                  >
                    <option value="kopi-susu" className="bg-[#1A1D22] text-[#F0F2F5]">Kopi Susu Dingin Gula Aren</option>
                    <option value="latte" className="bg-[#1A1D22] text-[#F0F2F5]">Caffe Latte / Hot Drink</option>
                    <option value="espresso" className="bg-[#1A1D22] text-[#F0F2F5]">Espresso Solo / Crema</option>
                    <option value="manual-brew" className="bg-[#1A1D22] text-[#F0F2F5]">Manual Brew V60 Filter</option>
                    <option value="matcha" className="bg-[#1A1D22] text-[#F0F2F5]">Matcha Latte / Green Tea</option>
                    <option value="chocolate" className="bg-[#1A1D22] text-[#F0F2F5]">Cokelat Murni</option>
                    <option value="mocktail" className="bg-[#1A1D22] text-[#F0F2F5]">Mocktail Buah Segar</option>
                    <option value="iced-tea" className="bg-[#1A1D22] text-[#F0F2F5]">Es Teh Segar</option>
                    <option value="pastry" className="bg-[#1A1D22] text-[#F0F2F5]">Croissant / Roti Panggang</option>
                    <option value="snack" className="bg-[#1A1D22] text-[#F0F2F5]">Camilan Goreng / Snack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                    URL Foto Kustom (Opsional)
                  </label>
                  <input
                    type="url"
                    value={newMenuImageUrl}
                    onChange={(e) => setNewMenuImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs border border-[#2C323B]"
                  />
                </div>

              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#262B33]">
                <button
                  type="button"
                  onClick={() => setActiveTab('menu')}
                  className="px-4 py-2 text-xs font-medium text-[#8C95A3] hover:text-[#F0F2F5] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#D49B58] hover:bg-[#E5B074] text-[#0F1113] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambahkan ke Katalog</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 4: SECURITY & CHANGE PIN */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              
              {/* Security Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#16191D] rounded-xl border border-[#262B33] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#A3E0C1]">
                    <ShieldCheck className="w-4 h-4 text-[#A3E0C1]" />
                    <span>Enkripsi SHA-256</span>
                  </div>
                  <p className="text-[11px] text-[#8C95A3] leading-relaxed">
                    PIN tidak disimpan dalam teks biasa melainkan di-hash dengan salt kriptografi browser.
                  </p>
                </div>

                <div className="p-3.5 bg-[#16191D] rounded-xl border border-[#262B33] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#D49B58]">
                    <AlertTriangle className="w-4 h-4 text-[#D49B58]" />
                    <span>Anti Brute-Force</span>
                  </div>
                  <p className="text-[11px] text-[#8C95A3] leading-relaxed">
                    Sistem otomatis membekukan akses selama 60 detik jika ada 5 kali kesalahan beruntun.
                  </p>
                </div>

                <div className="p-3.5 bg-[#16191D] rounded-xl border border-[#262B33] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#7EA4E0]">
                    <Lock className="w-4 h-4 text-[#7EA4E0]" />
                    <span>Auto-Lock Sesi</span>
                  </div>
                  <p className="text-[11px] text-[#8C95A3] leading-relaxed">
                    Sesi langsung terkunci seketika jendela ditutup atau saat tombol Kunci Sesi ditekan.
                  </p>
                </div>
              </div>

              {/* Change PIN Form */}
              <div className="p-5 bg-[#16191D] rounded-2xl border border-[#262B33] space-y-4">
                <div className="border-b border-[#262B33] pb-3">
                  <h3 className="font-serif font-bold text-base text-[#F0F2F5] flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#D49B58]" />
                    <span>Ganti PIN Rahasia Admin Kedai</span>
                  </h3>
                  <p className="text-xs text-[#8C95A3] mt-0.5">
                    Ganti PIN keamanan akses Anda secara berkala agar pengelola lain atau pihak luar tidak dapat mengakses sistem.
                  </p>
                </div>

                {pinChangeMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      pinChangeMessage.type === 'success'
                        ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                        : 'bg-red-950/80 border border-red-800 text-red-300'
                    }`}
                  >
                    {pinChangeMessage.type === 'success' ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{pinChangeMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePin} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    <div>
                      <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                        PIN Saat Ini <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={12}
                        placeholder="Masukkan PIN saat ini"
                        value={currentPinInput}
                        onChange={(e) => setCurrentPinInput(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs font-mono border border-[#2C323B] focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                        PIN Baru (Min 4 Digit) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={12}
                        placeholder="Contoh: 8829"
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs font-mono border border-[#2C323B] focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                        Ulangi PIN Baru <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={12}
                        placeholder="Ketik ulang PIN baru"
                        value={confirmPinInput}
                        onChange={(e) => setConfirmPinInput(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs font-mono border border-[#2C323B] focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden"
                      />
                    </div>

                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#D49B58] hover:bg-[#E5B074] text-[#0F1113] text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan PIN Baru</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Master Recovery Key Management */}
              <div className="p-5 bg-[#16191D] rounded-2xl border border-[#262B33] space-y-4">
                <div className="border-b border-[#262B33] pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base text-[#F0F2F5] flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#D49B58]" />
                      <span>Kunci Rahasia Pemulihan Pemilik (Master Key)</span>
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Khusus Pemilik Sah
                    </span>
                  </div>
                  <p className="text-xs text-[#8C95A3] mt-0.5">
                    Kunci rahasia ini adalah proteksi tingkat tertinggi untuk mereset PIN jika Anda lupa. Pengunjung biasa tidak bisa mereset PIN tanpa kunci ini.
                  </p>
                </div>

                <div className="p-3 bg-[#1A1D22] rounded-xl border border-[#2C323B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div>
                      <span className="text-[#8C95A3] text-[11px] block">Kunci Rahasia Saat Ini:</span>
                      <span className="font-mono font-bold text-sm text-[#D49B58] tracking-wider">
                        {showMasterKeySecret ? currentMasterKey : '••••••••••••'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMasterKeySecret(!showMasterKeySecret)}
                      className="p-1.5 rounded-lg bg-[#252A33] hover:bg-[#2F3642] text-[#8C95A3] hover:text-[#F0F2F5] transition-colors cursor-pointer"
                      title={showMasterKeySecret ? 'Sembunyikan Kunci' : 'Tampilkan Kunci'}
                    >
                      {showMasterKeySecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-[11px] text-[#A3E0C1] bg-[#16291E] px-2.5 py-1 rounded-md border border-[#264432] self-start sm:self-auto">
                    ✓ Kunci Aktif Tersimpan di Perangkat Ini
                  </div>
                </div>

                {masterKeyMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      masterKeyMessage.type === 'success'
                        ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                        : 'bg-red-950/80 border border-red-800 text-red-300'
                    }`}
                  >
                    {masterKeyMessage.type === 'success' ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{masterKeyMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleSaveCustomMasterKey} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-[#F0F2F5] mb-1">
                      Ubah Kunci Rahasia Pemulihan (Minimal 6 Karakter)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Contoh: KEDAI-SUKAJADI-RAHASIA"
                        value={customMasterKeyInput}
                        onChange={(e) => setCustomMasterKeyInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#1A1D22] text-[#F0F2F5] rounded-xl text-xs font-mono border border-[#2C323B] focus:ring-2 focus:ring-[#D49B58] focus:outline-hidden"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#252A33] hover:bg-[#D49B58] hover:text-[#0F1113] text-[#F0F2F5] text-xs font-bold rounded-xl border border-[#363E4B] transition-colors cursor-pointer shrink-0"
                      >
                        Ganti Kunci
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#8C95A3]">
                    Catatan Penting: Simpan kunci ini di buku catatan pribadi atau pesan tersimpan WhatsApp Anda. Jangan pernah memberitahukannya kepada pelanggan.
                  </p>
                </form>
              </div>

              {/* Anti-Hacking & Architecture FAQ */}
              <div className="p-4 bg-[#14171A] rounded-xl border border-[#262B33] text-xs space-y-3">
                <h4 className="font-semibold text-[#F0F2F5] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#D49B58]" />
                  <span>Bagaimana Sistem Ini Mencegah Akses Liar & Pembajakan?</span>
                </h4>
                <ul className="space-y-2 text-[11px] text-[#8C95A3] list-disc list-inside leading-relaxed pl-1">
                  <li>
                    <strong className="text-[#D1D5DB]">Tidak Ada Tombol Reset Bebas:</strong> Fitur "Lupa PIN" tidak lagi bisa di-reset dengan 1 klik sembarangan. Setiap pemulihan PIN wajib memasukkan <strong>Kunci Rahasia Pemilik</strong> dan <strong>Nomor WhatsApp Kedai</strong> yang cocok. Pengunjung umum tidak mungkin bisa membukanya.
                  </li>
                  <li>
                    <strong className="text-[#D1D5DB]">Perlindungan Anti Brute-Force:</strong> Jika seseorang mencoba menebak PIN atau Kunci Rahasia secara berulang-ulang, sistem akan langsung <strong>membekukan akses selama 60 detik</strong> setelah 5 kali salah.
                  </li>
                  <li>
                    <strong className="text-[#D1D5DB]">Isolasi Sandbox Browser:</strong> Data menu dan PIN berjalan di Sandbox Storage browser perangkat Anda. Pengunjung lain yang membuka web ini dari ponsel mereka memiliki ruang penyimpanan terpisah dan sama sekali tidak bisa mengubah data asli di HP Anda ataupun merusak menu kedai.
                  </li>
                  <li>
                    <strong className="text-[#D1D5DB]">Aktivasi Khusus Perangkat Baru:</strong> Di perangkat baru yang belum pernah diaktivasi, sistem tidak lagi menerima sembarang PIN. Diperlukan Kunci Rahasia Pemilik dan Nomor WhatsApp resmi untuk mengaktifkan izin kelola.
                  </li>
                  <li>
                    <strong className="text-[#D1D5DB]">Sinkronisasi Cloud Terpusat (Opsional):</strong> Jika Anda menghendaki 1 kali edit menu di HP Anda otomatis terupdate secara langsung ke SELURUH HP pengunjung di mana pun, sistem dapat dihubungkan ke Cloud Database (Firebase Firestore) menggunakan login akun Google resmi pemilik.
                  </li>
                  <li>
                    <strong className="text-[#D1D5DB]">Auto-Lock Seketika:</strong> Sesi admin otomatis terkunci begitu panel ditutup, jendela browser direfresh, atau tombol Kunci Sesi ditekan.
                  </li>
                  <li>
                    <strong className="text-[#D1D5DB]">Kemudahan Navigasi Kembali:</strong> Anda dan pengunjung kapan saja dapat menutup panel dan kembali ke beranda toko dengan tombol "Tutup", mengeklik area gelap luar, atau menekan tombol Escape (ESC) pada keyboard.
                  </li>
                </ul>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#16191D] border-t border-[#262B33] flex items-center justify-between text-[11px] text-[#8C95A3]">
          <span>Data dan PIN tersimpan aman di browser Anda.</span>
          <button
            onClick={handleSecureClose}
            className="font-semibold text-[#D49B58] hover:underline cursor-pointer"
          >
            Tutup Panel
          </button>
        </div>

      </div>
      )}

    </div>
  );
};
