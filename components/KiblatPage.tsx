
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, Loader2, RefreshCw, AlertCircle, Compass, CheckCircle, Info, MoreVertical } from 'lucide-react';

interface KiblatPageProps {
  isOpen: boolean;
  onClose: () => void;
  locationName?: string;
}

const KiblatPage: React.FC<KiblatPageProps> = ({ isOpen, onClose, locationName = "Lokasi Anda" }) => {
  // State untuk Logika Bisnis (Jarang berubah)
  const [qiblaDegree, setQiblaDegree] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState<boolean>(false);
  const [showCalibration, setShowCalibration] = useState(true);
  const [isAlignedState, setIsAlignedState] = useState(false);

  // Refs untuk Animasi & DOM (Berubah sangat cepat 60fps)
  const plateRef = useRef<HTMLDivElement>(null);
  const compassTextRef = useRef<HTMLDivElement>(null);
  
  const targetHeadingRef = useRef<number>(0);
  const currentHeadingRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  // --- 1. Perhitungan Rumus Kiblat ---
  const calculateQibla = (lat: number, lng: number) => {
    const phiK = 21.4225 * Math.PI / 180.0; // Lintang Ka'bah
    const lambdaK = 39.8262 * Math.PI / 180.0; // Bujur Ka'bah
    const phi = lat * Math.PI / 180.0;
    const lambda = lng * Math.PI / 180.0;

    const psi = Math.atan2(
      Math.sin(lambdaK - lambda),
      Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda)
    );
    
    return (psi * 180.0 / Math.PI + 360) % 360;
  };

  // --- 2. Loop Animasi High Performance ---
  const smoothAnimation = () => {
    // Hitung selisih terpendek
    let diff = targetHeadingRef.current - currentHeadingRef.current;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;

    if (Math.abs(diff) < 0.1) {
       currentHeadingRef.current = targetHeadingRef.current;
    } else {
       currentHeadingRef.current += diff * 0.15;
    }

    const heading = currentHeadingRef.current;
    
    // -- DIRECT DOM MANIPULATION --
    if (plateRef.current) {
      plateRef.current.style.transform = `rotate(${-heading}deg)`;
    }
    
    animationFrameRef.current = requestAnimationFrame(smoothAnimation);
  };

  // Check Alignment Logic
  useEffect(() => {
     if (qiblaDegree === null) return;

     const checkAlignInterval = setInterval(() => {
        const heading = currentHeadingRef.current;
        const normalizedCompass = ((heading % 360) + 360) % 360;
        const diff = Math.abs(normalizedCompass - qiblaDegree);
        const isAligned = diff < 2 || diff > 358; // Toleransi lebih ketat 2 derajat

        setIsAlignedState(prev => {
           if (prev !== isAligned) {
              if (isAligned && navigator.vibrate) navigator.vibrate(50);
              return isAligned;
           }
           return prev;
        });
     }, 200);

     return () => clearInterval(checkAlignInterval);
  }, [qiblaDegree]);


  // --- 3. Event Handler Sensor ---
  const handleOrientation = (event: any) => {
    let heading = 0;
    if (event.webkitCompassHeading) {
      heading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
      heading = 360 - event.alpha;
    }
    targetHeadingRef.current = heading;
  };

  const startCompass = () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            setNeedsPermission(false);
            window.addEventListener('deviceorientation', handleOrientation, true);
          } else {
            setError("Izin akses kompas ditolak.");
          }
        })
        .catch(console.error);
    } else {
      setNeedsPermission(false);
      const win = window as any;
      if ('ondeviceorientationabsolute' in win) {
         win.addEventListener('deviceorientationabsolute', (e: any) => {
             if (e.absolute) {
                 targetHeadingRef.current = 360 - e.alpha;
             }
         }, true);
      } else {
         window.addEventListener('deviceorientation', handleOrientation, true);
      }
    }
  };

  // --- 4. Init Lifecycle ---
  useEffect(() => {
    if (isOpen) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const degree = calculateQibla(position.coords.latitude, position.coords.longitude);
            setQiblaDegree(degree);
            setLoading(false);
          },
          (err) => {
            setError("Gagal mendapatkan lokasi GPS.");
            setLoading(false);
          },
          { enableHighAccuracy: true }
        );
      } else {
        setError("Browser tidak mendukung GPS.");
        setLoading(false);
      }

      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        setNeedsPermission(true);
      } else {
        startCompass();
      }

      animationFrameRef.current = requestAnimationFrame(smoothAnimation);
      setTimeout(() => setShowCalibration(false), 5000);
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('deviceorientation', handleOrientation);
      // @ts-ignore
      if ('ondeviceorientationabsolute' in window) {
         (window as any).removeEventListener('deviceorientationabsolute', handleOrientation);
      }
    };
  }, [isOpen]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[170] flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden" style={{ background: 'linear-gradient(to bottom, #10b981, #047857)' }}>
      {/* Background Silhouette */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/2 opacity-20 pointer-events-none"
        style={{
            backgroundImage: 'url(https://m.muijakarta.or.id/img/masjid.png)',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'bottom center',
            backgroundSize: 'contain'
        }}
      ></div>

      {/* Header */}
      <div className="pt-8 px-6 pb-4 flex items-center justify-between z-20 relative text-white">
        <button onClick={onClose} className="p-2 active:scale-90 transition-transform">
            <ArrowLeft size={28} />
        </button>
        <h2 className="text-xl font-medium">Arah kiblat</h2>
        <div className="flex space-x-2">
            <button className="p-2 active:scale-90 transition-transform">
                <Info size={24} />
            </button>
            <button className="p-2 active:scale-90 transition-transform">
                <MoreVertical size={24} />
            </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col items-center justify-start pt-10 relative z-10 text-white">
        
        {loading ? (
           <div className="flex flex-col items-center mt-20">
             <Loader2 className="animate-spin text-white mb-4" size={48} />
             <p className="text-xs font-bold uppercase tracking-widest opacity-80">Mencari Lokasi...</p>
           </div>
        ) : error ? (
           <div className="px-8 text-center mt-20">
             <AlertCircle size={48} className="text-red-200 mx-auto mb-4" />
             <p className="text-sm font-medium mb-6">{error}</p>
             <button onClick={() => window.location.reload()} className="px-6 py-3 bg-white text-teal-700 rounded-xl font-bold text-sm">Muat Ulang</button>
           </div>
        ) : needsPermission ? (
           <div className="px-8 text-center mt-20">
             <Compass size={64} className="text-white mx-auto mb-6 animate-pulse" />
             <h3 className="text-xl font-bold mb-2">Kalibrasi Kompas</h3>
             <p className="text-sm text-white/80 mb-8 leading-relaxed">
               Mohon izinkan akses sensor kompas agar aplikasi dapat bekerja akurat.
             </p>
             <button 
               onClick={startCompass}
               className="w-full py-4 bg-white text-teal-700 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
             >
               Izinkan Akses
             </button>
           </div>
        ) : (
           <>
             {/* Info Text */}
             <div className="flex flex-col items-center mb-8">
                <div className="flex items-center space-x-2 text-white/90 mb-2">
                    <MapPin size={16} className="fill-red-500 text-red-500" />
                    <span className="text-lg font-medium">{locationName}</span>
                </div>
                <p className="text-sm text-white/80 font-medium mb-1">Derajat Sudut Kiblat dari Utara</p>
                <h1 className="text-4xl font-bold tracking-tight">
                    {qiblaDegree?.toFixed(2)}°
                </h1>
             </div>

             {/* Container Kompas */}
             <div className="relative w-[320px] h-[320px] flex items-center justify-center mb-8">
                
                {/* Pointer Segitiga Merah di Tengah (Jarum Kiblat) */}
                {/* Ini adalah jarum penunjuk yang berputar bersama plate untuk menunjuk kiblat, 
                    ATAU ini adalah jarum statis jika piringan berputar.
                    Dalam desain referensi, piringan putih berputar. 
                    Jarum merah menunjuk ke arah Ka'bah relatif terhadap piringan.
                */}
                
                {/* Dial Putih */}
                <div 
                   ref={plateRef}
                   className="w-full h-full rounded-full bg-white shadow-2xl relative flex items-center justify-center transition-transform will-change-transform"
                   style={{ transform: 'rotate(0deg)' }}
                >
                    {/* Tick Marks & Degrees */}
                    {[...Array(72)].map((_, i) => {
                        const isMajor = i % 6 === 0; // Every 30 degrees (360 / 72 * 6 = 30)
                        const rotation = i * 5;
                        return (
                            <div 
                                key={i}
                                className={`absolute top-0 left-1/2 -translate-x-1/2 h-full w-[1px] pointer-events-none`}
                                style={{ transform: `rotate(${rotation}deg)` }}
                            >
                                <div className={`w-full ${isMajor ? 'h-3 bg-gray-400' : 'h-1.5 bg-gray-300'}`}></div>
                            </div>
                        )
                    })}

                    {/* Cardinal Directions */}
                    <div className="absolute top-4 text-[#00a896] font-bold text-xl">U</div>
                    <div className="absolute bottom-4 text-[#00a896] font-bold text-xl">S</div>
                    <div className="absolute left-4 text-[#00a896] font-bold text-xl">B</div>
                    <div className="absolute right-4 text-[#00a896] font-bold text-xl">T</div>

                    {/* Mandala Ornament Center */}
                    <div className="absolute w-32 h-32 opacity-10 pointer-events-none">
                         <svg viewBox="0 0 100 100" className="w-full h-full text-teal-900 fill-current">
                             <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
                             <circle cx="50" cy="50" r="20" />
                         </svg>
                    </div>

                    {/* Qibla Indicator (Red Needle & Kaaba) */}
                    {/* Posisikan pada derajat kiblat di piringan */}
                    {qiblaDegree !== null && (
                        <div 
                            className="absolute top-0 left-1/2 w-8 h-1/2 -ml-4 origin-bottom pt-2 flex flex-col items-center justify-start z-10"
                            style={{ transform: `rotate(${qiblaDegree}deg)` }}
                        >
                            {/* Icon Ka'bah dalam lingkaran */}
                            <div className={`relative transition-all duration-300 ${isAlignedState ? 'scale-110' : ''}`}>
                                <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center shadow-md overflow-hidden p-0.5">
                                    <img src="https://img.icons8.com/fluency/48/kaaba.png" alt="Kaaba" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            
                            {/* Jarum Merah Panjang */}
                            <div className="w-1.5 h-24 bg-red-500 rounded-full mt-1 relative">
                                {/* Triangle Tip */}
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-red-500"></div>
                            </div>
                        </div>
                    )}
                    
                    {/* Pivot Tengah */}
                    <div className="absolute w-4 h-4 bg-gray-200 rounded-full border border-gray-300 z-20"></div>
                </div>

                {/* Marker Statis HP (Optional, biasanya panah di atas layar) */}
                {/* Dalam desain ini, user mensejajarkan jarum merah dengan "Utara" HP atau hanya mengikuti jarum merah */}
             </div>

             {/* Tombol Kamera */}
             <div className="absolute bottom-10 px-6 w-full">
                <button 
                  className="w-full bg-white text-black font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center"
                  onClick={() => alert("Fitur AR Kamera akan segera hadir!")}
                >
                    Arahkan Kiblat dengan Kamera
                </button>
             </div>

             {/* Calibration Overlay */}
             {showCalibration && (
                <div className="absolute inset-0 z-[50] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 animate-fade-in" onClick={() => setShowCalibration(false)}>
                   <div className="w-20 h-10 border-4 border-white rounded-full flex items-center justify-center mb-4 animate-pulse opacity-80">
                      <span className="text-xl font-bold text-white">∞</span>
                   </div>
                   <p className="text-center text-white text-sm leading-relaxed mb-4">
                      Gerakkan HP membentuk angka 8 untuk kalibrasi.
                   </p>
                   <button className="px-6 py-2 bg-white/20 text-white rounded-lg text-xs font-bold">Tutup</button>
                </div>
             )}
           </>
        )}
      </div>
    </div>
  );
};

export default KiblatPage;
