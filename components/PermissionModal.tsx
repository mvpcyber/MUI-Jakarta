
import React, { useState, useEffect } from 'react';
import { MapPin, Bell, ShieldCheck, CheckCircle, X, ChevronRight } from 'lucide-react';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionsGranted: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ isOpen, onClose, onPermissionsGranted }) => {
  const [geoStatus, setGeoStatus] = useState<PermissionState | 'unknown'>('unknown');
  const [notifStatus, setNotifStatus] = useState<NotificationPermission>('default');
  
  const [isRequesting, setIsRequesting] = useState(false);

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
        
        // Listen for changes
        geoResult.onchange = () => setGeoStatus(geoResult.state);
      } catch (e) {
        // Fallback for browsers that don't support query name 'geolocation'
        setGeoStatus('prompt'); 
      }
    }
  };

  const handleRequestAll = async () => {
    setIsRequesting(true);

    try {
      // 1. Request Notification
      if (notifStatus !== 'granted') {
        const res = await Notification.requestPermission();
        setNotifStatus(res);
      }

      // 2. Request Geolocation
      if (geoStatus !== 'granted') {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => { setGeoStatus('granted'); resolve(); },
            () => { setGeoStatus('denied'); resolve(); },
            { timeout: 5000 }
          );
        });
      }

      // Check if granted or user interact
      onPermissionsGranted();
      
    } catch (error) {
      console.error("Permission error", error);
    } finally {
      setIsRequesting(false);
    }
  };

  const allGranted = notifStatus === 'granted' && geoStatus === 'granted';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-sm flex items-center justify-center px-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
        
        {/* Header Image / Decoration */}
        <div className="bg-[#00a896] p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/arabesque.png")' }}></div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20">
             <ShieldCheck className="text-white" size={32} />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight relative z-10">Izin Aplikasi</h2>
          <p className="text-xs text-teal-100 font-medium relative z-10 mt-1">
            Untuk pengalaman terbaik, mohon izinkan akses berikut:
          </p>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/10 rounded-full text-white/70 hover:bg-black/20 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Location Item */}
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${geoStatus === 'granted' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {geoStatus === 'granted' ? <CheckCircle size={20} /> : <MapPin size={20} />}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-800">Lokasi & GPS</h4>
              <p className="text-[10px] text-gray-500">Untuk jadwal sholat akurat, arah kiblat, dan masjid terdekat.</p>
            </div>
          </div>

          {/* Notification Item */}
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notifStatus === 'granted' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {notifStatus === 'granted' ? <CheckCircle size={20} /> : <Bell size={20} />}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-800">Notifikasi</h4>
              <p className="text-[10px] text-gray-500">Pengingat waktu sholat dan informasi fatwa terbaru.</p>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button 
            onClick={handleRequestAll}
            disabled={isRequesting || allGranted}
            className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2
              ${allGranted 
                ? 'bg-green-600 text-white shadow-green-200' 
                : 'bg-[#00a896] text-white shadow-teal-200'
              }`}
          >
            {isRequesting ? (
              <span>Memproses...</span>
            ) : allGranted ? (
              <><span>Semua Diizinkan</span> <CheckCircle size={16} /></>
            ) : (
              <><span>Izinkan Akses</span> <ChevronRight size={16} /></>
            )}
          </button>
          
          {!allGranted && (
            <button 
              onClick={onClose}
              className="w-full mt-3 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Nanti Saja (Fitur mungkin terbatas)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
