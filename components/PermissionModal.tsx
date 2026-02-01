import React, { useState, useEffect } from 'react';
import { MapPin, Bell, ShieldCheck, CheckCircle, ChevronRight, AlertTriangle } from 'lucide-react';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionsGranted: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ isOpen, onClose, onPermissionsGranted }) => {
  const [geoStatus, setGeoStatus] = useState<PermissionState | 'unknown'>('unknown');
  const [notifStatus, setNotifStatus] = useState<NotificationPermission>('default');
  
  const [isRequesting, setIsRequesting] = useState(false);
  const [deniedError, setDeniedError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkStatuses();
    }
  }, [isOpen]);

  const checkStatuses = async () => {
    // Check Notification
    if ('Notification' in window) {
      setNotifStatus(Notification.permission);
    }

    // Check Geolocation
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const geoResult = await navigator.permissions.query({ name: 'geolocation' });
        setGeoStatus(geoResult.state);
        geoResult.onchange = () => setGeoStatus(geoResult.state);
      } catch (e) {
        setGeoStatus('prompt'); 
      }
    }
  };

  const handleRequestAll = async () => {
    setIsRequesting(true);
    setDeniedError(false);

    try {
      // 1. Request Notification
      if (notifStatus !== 'granted') {
        const res = await Notification.requestPermission();
        setNotifStatus(res);
        if (res === 'denied') setDeniedError(true);
      }

      // 2. Request Geolocation
      if (geoStatus !== 'granted') {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => { setGeoStatus('granted'); resolve(); },
            () => { setGeoStatus('denied'); setDeniedError(true); resolve(); },
            { timeout: 8000 }
          );
        });
      }

      // Final Check
      checkStatuses().then(() => {
          if (Notification.permission === 'granted' || geoStatus === 'granted') {
             onPermissionsGranted();
          } else {
             if (Notification.permission === 'denied' && geoStatus === 'denied') {
                 setDeniedError(true);
             } else {
                 setDeniedError(true);
             }
          }
      });
      
    } catch (error) {
      console.error("Permission error", error);
    } finally {
      setIsRequesting(false);
    }
  };

  const allGranted = notifStatus === 'granted' && geoStatus === 'granted';

  // Automatically close if all granted
  useEffect(() => {
      if (allGranted && isOpen) {
          setTimeout(() => onPermissionsGranted(), 500);
      }
  }, [allGranted, isOpen, onPermissionsGranted]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center px-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
        
        {/* Header Image / Decoration */}
        <div className="bg-[#00a896] p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/arabesque.png")' }}></div>
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/20 shadow-lg">
             <ShieldCheck className="text-white" size={40} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight relative z-10">Akses Diperlukan</h2>
          <p className="text-sm text-teal-100 font-medium relative z-10 mt-2 leading-relaxed">
            Aplikasi ini membutuhkan akses Lokasi dan Notifikasi untuk fitur Jadwal Sholat & Kiblat.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Location Item */}
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${geoStatus === 'granted' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {geoStatus === 'granted' ? <CheckCircle size={24} /> : <MapPin size={24} />}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-800">Lokasi & GPS</h4>
              <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Wajib untuk akurasi Waktu Sholat dan Arah Kiblat di daerah Anda.</p>
            </div>
          </div>

          {/* Notification Item */}
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${notifStatus === 'granted' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {notifStatus === 'granted' ? <CheckCircle size={24} /> : <Bell size={24} />}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-800">Notifikasi</h4>
              <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Agar Anda tidak ketinggalan waktu ibadah dan info penting.</p>
            </div>
          </div>
        </div>

        {deniedError && (
            <div className="mx-6 mb-4 bg-red-50 border border-red-100 p-3 rounded-xl flex items-start space-x-2">
                <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-red-600 font-bold leading-relaxed">
                    Akses ditolak oleh browser. Silakan aktifkan izin Lokasi dan Notifikasi melalui Pengaturan Browser (Icon Gembok di URL bar).
                </p>
            </div>
        )}

        <div className="p-6 pt-0">
          <button 
            onClick={handleRequestAll}
            disabled={isRequesting || allGranted}
            className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2
              ${allGranted 
                ? 'bg-green-600 text-white shadow-green-200' 
                : 'bg-[#00a896] text-white shadow-teal-200 hover:bg-teal-700'
              }`}
          >
            {isRequesting ? (
              <span>Memproses...</span>
            ) : allGranted ? (
              <><span>Terima Kasih</span> <CheckCircle size={18} /></>
            ) : (
              <><span>Aktifkan Semua</span> <ChevronRight size={18} /></>
            )}
          </button>
          
          <div className="mt-4 text-center">
             <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">
                MUI DKI Jakarta • Privasi Aman
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;