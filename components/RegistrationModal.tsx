import React, { useState } from 'react';
import { User, Phone, MapPin, ChevronRight, Loader2, ShieldCheck } from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onSubmit: (name: string, phone: string, coords: {lat: number, lng: number} | null) => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onSubmit }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setLoading(true);
    setStatus('Mendeteksi lokasi Anda...');

    // Try to get location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setStatus('Menyimpan data...');
          onSubmit(name, phone, { lat: latitude, lng: longitude });
          // Loading state will be handled by parent or unmount
        },
        (error) => {
          console.error("Location error:", error);
          // Still submit even if location denied
          setStatus('Menyimpan data (Tanpa Lokasi)...');
          onSubmit(name, phone, null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      onSubmit(name, phone, null);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#00827f] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/arabesque.png")' }}></div>
      
      <div className="w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-6">
           <div className="w-20 h-20 bg-white border-4 border-teal-50 rounded-full shadow-lg flex items-center justify-center mb-4 -mt-16">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Logo-MUI-Jakarta.png" alt="MUI" className="w-12 h-12 object-contain" />
           </div>
           <h2 className="text-xl font-black text-gray-800 text-center">Selamat Datang</h2>
           <p className="text-xs text-gray-500 text-center mt-1">Lengkapi data diri untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-2">Nama Lengkap</label>
              <div className="relative">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input 
                   type="text" 
                   required
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#00827f] focus:bg-white transition-all placeholder:text-gray-300"
                   placeholder="Nama Anda"
                 />
              </div>
           </div>

           <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-2">Nomor WhatsApp / HP</label>
              <div className="relative">
                 <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input 
                   type="tel" 
                   required
                   value={phone}
                   onChange={(e) => setPhone(e.target.value)}
                   className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#00827f] focus:bg-white transition-all placeholder:text-gray-300"
                   placeholder="Contoh: 08123456789"
                 />
              </div>
           </div>

           <div className="bg-blue-50 p-3 rounded-xl flex items-start space-x-2 border border-blue-100 mt-2">
              <MapPin size={14} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-blue-800 leading-relaxed">
                 Aplikasi akan meminta izin lokasi untuk menyesuaikan <strong>Jadwal Sholat</strong> dan <strong>Arah Kiblat</strong> di daerah Anda.
              </p>
           </div>

           <button 
             type="submit"
             disabled={loading}
             className="w-full bg-[#00827f] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-teal-200 active:scale-95 transition-all flex items-center justify-center space-x-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
           >
             {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{status}</span>
                </>
             ) : (
                <>
                  <span>Mulai Aplikasi</span>
                  <ChevronRight size={18} />
                </>
             )}
           </button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-1.5 opacity-50">
           <ShieldCheck size={12} className="text-gray-400" />
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Privasi Anda Aman</span>
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;