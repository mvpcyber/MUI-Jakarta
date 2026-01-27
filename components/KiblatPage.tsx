import React, { useState, useEffect } from 'react';
import { ArrowLeft, Compass, MapPin, Loader2, Info, Navigation } from 'lucide-react';

interface KiblatPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const KiblatPage: React.FC<KiblatPageProps> = ({ isOpen, onClose }) => {
  const [qiblaDegree, setQiblaDegree] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateQibla = (lat: number, lng: number) => {
    const phiK = 21.4225 * Math.PI / 180.0;
    const lambdaK = 39.8262 * Math.PI / 180.0;
    const phi = lat * Math.PI / 180.0;
    const lambda = lng * Math.PI / 180.0;

    const psi = Math.atan2(
      Math.sin(lambdaK - lambda),
      Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda)
    );
    
    return (psi * 180.0 / Math.PI + 360) % 360;
  };

  useEffect(() => {
    if (!isOpen) return;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const degree = calculateQibla(position.coords.latitude, position.coords.longitude);
          setQiblaDegree(degree);
          setLoading(false);
        },
        (err) => {
          console.error(err);
          setError("Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.");
          setLoading(false);
        }
      );
    } else {
      setError("Browser Anda tidak mendukung geolokasi.");
      setLoading(false);
    }

    const handleOrientation = (event: any) => {
      let heading = 0;
      if (event.webkitCompassHeading) heading = event.webkitCompassHeading;
      else if (event.alpha !== null) heading = 360 - event.alpha;
      setDeviceHeading(heading);
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const needleRotation = qiblaDegree !== null ? (qiblaDegree - deviceHeading) : 0;
  const isAligned = qiblaDegree !== null && (Math.abs((deviceHeading - qiblaDegree + 360) % 360) < 5 || Math.abs((deviceHeading - qiblaDegree + 360) % 360) > 355);

  return (
    <div className="fixed inset-0 z-[170] bg-[#f8fafc] flex flex-col animate-in slide-in-from-right duration-300">
      <div 
        className="pt-12 pb-16 px-6 relative overflow-hidden shadow-lg bg-[#00a896]"
        style={{ backgroundImage: 'url(https://img.freepik.com/premium-vector/islamic-background-green-pattern_650032-387.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
        <div className="relative z-10 flex items-center justify-between">
          <button onClick={onClose} className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md text-white active:scale-90"><ArrowLeft size={24} /></button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">Arah Kiblat</h2>
            <span className="text-[10px] font-black text-[#5eead4] uppercase tracking-[0.2em]">Deteksi Posisi Ka'bah</span>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="flex-1 -mt-10 px-6 pb-10 flex flex-col relative z-20">
        <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 p-8 flex-1 flex flex-col items-center justify-center text-center">
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin text-[#00a896] mb-6" size={48} />
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Mencari Koordinat...</p>
            </div>
          ) : error ? (
            <div className="px-4">
              <Info size={48} className="text-red-500 mx-auto mb-4" />
              <p className="text-sm text-gray-500 mb-6">{error}</p>
              <button onClick={() => window.location.reload()} className="px-8 py-3 bg-[#00a896] text-white rounded-2xl font-black text-xs uppercase shadow-lg">Refresh</button>
            </div>
          ) : (
            <>
              <div className={`inline-flex items-center space-x-2 px-5 py-2 rounded-full border-2 mb-10 transition-all ${isAligned ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                <Navigation size={14} className={isAligned ? 'animate-bounce' : ''} />
                <span className="text-[10px] font-black uppercase tracking-widest">{isAligned ? 'Arah Tepat Ke Ka\'bah!' : 'Putar HP Anda'}</span>
              </div>

              <div className="relative w-72 h-72 mb-10 flex items-center justify-center">
                <div className="absolute inset-0 border-[12px] border-gray-50 rounded-full shadow-inner"></div>
                <div className="absolute inset-[15px] border-2 border-dashed border-gray-100 rounded-full"></div>
                
                <span className="absolute top-6 font-black text-gray-300 text-[10px]">NORTH</span>
                <span className="absolute bottom-6 font-black text-gray-300 text-[10px]">SOUTH</span>
                <span className="absolute left-6 font-black text-gray-300 text-[10px] -rotate-90">WEST</span>
                <span className="absolute right-6 font-black text-gray-300 text-[10px] rotate-90">EAST</span>

                <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out" style={{ transform: `rotate(${needleRotation}deg)` }}>
                  <div className="relative w-full h-full flex flex-col items-center">
                    <div className="absolute top-0 w-14 h-14 bg-white rounded-full shadow-2xl border-2 border-teal-100 flex items-center justify-center z-20 overflow-hidden">
                      <img src="https://img.icons8.com/color/96/kaaba.png" className="w-10 h-10 object-contain" alt="Kaaba" />
                    </div>
                    <div className="w-1.5 h-1/2 bg-gradient-to-t from-transparent via-teal-500 to-[#00a896] rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>

              <div className="bg-teal-50 rounded-[32px] p-5 w-full border border-teal-100">
                <div className="flex justify-around">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-teal-600 uppercase mb-1">Sudut Ka'bah</p>
                    <p className="text-xl font-black text-gray-800 tracking-tighter">{Math.round(qiblaDegree || 0)}°</p>
                  </div>
                  <div className="w-px h-10 bg-teal-200"></div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-teal-600 uppercase mb-1">Arah HP</p>
                    <p className="text-xl font-black text-gray-800 tracking-tighter">{Math.round(deviceHeading)}°</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default KiblatPage;