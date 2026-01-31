
import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, ShieldCheck } from 'lucide-react';

const InstallPwaModal: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Cek apakah ini iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 2. Cek apakah sudah mode standalone (sudah diinstall)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isStandalone) {
      return; // Jangan tampilkan jika sudah diinstall
    }

    // 3. Handler untuk Android/Chrome (Native Install Prompt)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Tampilkan modal setelah delay sedikit agar tidak mengganggu loading awal
      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Logika Khusus iOS (Tampilkan instruksi manual karena iOS tidak support beforeinstallprompt)
    if (isIosDevice && !isStandalone) {
        // Tampilkan modal setelah delay
        setTimeout(() => setIsVisible(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[250] animate-in slide-in-from-bottom duration-700">
      <div className="bg-white rounded-[24px] p-5 shadow-2xl border border-teal-100 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none"></div>

        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100"
        >
          <X size={16} />
        </button>

        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center shrink-0 p-1">
             <img src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Logo-MUI-Jakarta.png" alt="MUI Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 pr-6">
            <h3 className="text-sm font-black text-gray-800 leading-tight mb-1">
              Install Aplikasi MUI Jakarta
            </h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Akses jadwal sholat, fatwa, dan berita lebih cepat tanpa membuka browser.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-3">
          {isIOS ? (
            <div className="w-full bg-gray-50 rounded-xl p-3 border border-gray-100 text-[10px] text-gray-600 leading-relaxed">
               Untuk menginstall di iOS: Tap tombol <span className="font-bold">Share</span> di browser Safari, lalu pilih <span className="font-bold">"Add to Home Screen"</span>.
            </div>
          ) : (
            <button 
                onClick={handleInstallClick}
                className="flex-1 bg-[#00a896] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-200 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
                <Download size={16} />
                <span>Install Sekarang</span>
            </button>
          )}
        </div>
        
        {!isIOS && (
            <div className="mt-3 flex justify-center items-center space-x-1.5">
                <ShieldCheck size={10} className="text-teal-600" />
                <span className="text-[9px] font-bold text-teal-600 uppercase tracking-wide">Aplikasi Resmi & Aman</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default InstallPwaModal;
