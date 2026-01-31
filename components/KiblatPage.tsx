
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, Loader2, Navigation, Compass, AlertCircle, RefreshCw } from 'lucide-react';

interface KiblatPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const KiblatPage: React.FC<KiblatPageProps> = ({ isOpen, onClose }) => {
  const [qiblaDegree, setQiblaDegree] = useState<number | null>(null);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [needsPermission, setNeedsPermission] = useState<boolean>(false);
  
  // Smoothing refs
  const targetHeadingRef = useRef<number>(0);
  const currentHeadingRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  // Perhitungan Rumus Haversine untuk sudut Kiblat
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

  // Loop animasi untuk pergerakan halus (Smoothing)
  const smoothAnimation = () => {
    let diff = targetHeadingRef.current - currentHeadingRef.current;
    
    // Logika agar putaran memilih jalan terdekat (tidak memutar 360 derajat penuh saat melewati Utara)
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;

    // Interpolasi (0.1 adalah faktor kecepatan smoothing)
    currentHeadingRef.current += diff * 0.15; 
    setCompassHeading(currentHeadingRef.current);

    animationFrameRef.current = requestAnimationFrame(smoothAnimation);
  };

  const handleOrientation = (event: any) => {
    let heading = 0;
    
    // iOS Device
    if (event.webkitCompassHeading) {
      heading = event.webkitCompassHeading;
    } 
    // Android / Non-iOS
    else if (event.alpha !== null) {
       // alpha: putaran pada sumbu Z (0-360)
       // Perlu kompensasi karena alpha Android defaultnya 0 saat device boot, 
       // kecuali menggunakan 'deviceorientationabsolute'
       heading = 360 - event.alpha;
    }
    
    targetHeadingRef.current = heading;
  };

  const startCompass = () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      // iOS 13+ requires permission
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            setPermissionGranted(true);
            setNeedsPermission(false);
            window.addEventListener('deviceorientation', handleOrientation, true);
          } else {
            setError("Izin akses sensor kompas ditolak.");
          }
        })
        .catch(console.error);
    } else {
      // Non-iOS or older devices
      setPermissionGranted(true);
      setNeedsPermission(false);
      // Coba event absolute dulu untuk Android Chrome terbaru
      // Menggunakan (window as any) untuk menghindari TypeScript narrowing ke 'never'
      if ('ondeviceorientationabsolute' in (window as any)) {
        window.addEventListener('deviceorientationabsolute' as any, (e: any) => {
             // Absolute true north for Android
             if(e.absolute) {
                 const heading = 360 - e.alpha;
                 targetHeadingRef.current = heading;
             }
        }, true);
      } else {
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    }
  };

  // Cek apakah perlu izin manual saat mount
  useEffect(() => {
    if (isOpen) {
      // Get Location First
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const degree = calculateQibla(position.coords.latitude, position.coords.longitude);
            setQiblaDegree(degree);
            setLoading(false);
          },
          (err) => {
            console.error(err);
            setError("Gagal mendapatkan lokasi GPS. Pastikan GPS aktif.");
            setLoading(false);
          },
          { enableHighAccuracy: true }
        );
      } else {
        setError("Browser tidak mendukung GPS.");
        setLoading(false);
      }

      // Check for iOS permission requirement
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        setNeedsPermission(true);
      } else {
        startCompass();
      }

      // Start Animation Loop
      animationFrameRef.current = requestAnimationFrame(smoothAnimation);
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('deviceorientation', handleOrientation);
      // @ts-ignore
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
    };
  }, [isOpen]);

  // Haptic Feedback saat lurus
  useEffect(() => {
    if (qiblaDegree !== null) {
      // Normalisasi sudut agar perbandingan akurat
      const normalizedCompass = ((compassHeading % 360) + 360) % 360;
      const diff = Math.abs(normalizedCompass - qiblaDegree);
      
      // Jika selisih sudut sangat kecil (kurang dari 2 derajat), getarkan HP
      if (diff < 2 || diff > 358) {
        if (navigator.vibrate) navigator.vibrate(10);
      }
    }
  }, [compassHeading, qiblaDegree]);

  if (!isOpen) return null;

  // Hitung rotasi piringan. Piringan berputar berlawanan dengan heading device.
  // Jika device menghadap Timur (90), piringan harus diputar -90 agar "Utara" tetap di atas (relatif terhadap bumi)
  // Namun, karena kita ingin jarum statis di atas layar menunjuk arah HP, maka:
  // Piringan Utara harus selalu menunjuk Utara bumi.
  const plateRotation = -compassHeading;
  
  // Status apakah sudah menghadap kiblat
  const isAligned = qiblaDegree !== null && 
    (Math.abs(((compassHeading - qiblaDegree + 360) % 360)) < 3 || 
     Math.abs(((compassHeading - qiblaDegree + 360) % 360)) > 357);

  return (
    <div className="fixed inset-0 z-[170] bg-[#1e293b] flex flex-col animate-in slide-in-from-right duration-300 text-white overflow-hidden">
      
      {/* Header */}
      <div className="pt-8 px-6 pb-4 flex items-center justify-between z-20">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full backdrop-blur-md active:scale-90 transition-transform">
            <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold uppercase tracking-widest">Arah Kiblat</h2>
            {qiblaDegree && (
                <span className="text-[10px] font-black text-teal-400 bg-teal-900/30 px-2 py-0.5 rounded border border-teal-500/30">
                    {qiblaDegree.toFixed(1)}° DARI UTARA
                </span>
            )}
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        
        {loading ? (
           <div className="flex flex-col items-center">
             <Loader2 className="animate-spin text-teal-400 mb-4" size={48} />
             <p className="text-xs font-bold uppercase tracking-widest opacity-70">Mencari Lokasi...</p>
           </div>
        ) : error ? (
           <div className="px-8 text-center">
             <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
             <p className="text-sm font-medium mb-6">{error}</p>
             <button onClick={() => window.location.reload()} className="px-6 py-3 bg-teal-500 rounded-xl font-bold text-sm">Coba Lagi</button>
           </div>
        ) : needsPermission && !permissionGranted ? (
           <div className="px-8 text-center z-30">
             <Compass size={64} className="text-teal-400 mx-auto mb-6 animate-pulse" />
             <h3 className="text-xl font-bold mb-2">Kalibrasi Kompas</h3>
             <p className="text-sm text-gray-400 mb-8 leading-relaxed">
               Untuk menggunakan fitur ini secara akurat di perangkat iOS, kami memerlukan izin akses ke sensor gerakan (Kompas).
             </p>
             <button 
               onClick={startCompass}
               className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-teal-500/30 active:scale-95 transition-all"
             >
               Izinkan Sensor Kompas
             </button>
           </div>
        ) : (
           <>
             {/* Status Indikator di Atas */}
             <div className={`absolute top-4 z-20 px-6 py-2 rounded-full border transition-all duration-300 ${isAligned ? 'bg-green-500 border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.6)]' : 'bg-white/5 border-white/10'}`}>
                <p className={`text-xs font-black uppercase tracking-widest flex items-center ${isAligned ? 'text-white' : 'text-gray-400'}`}>
                    {isAligned ? (
                        <>LURUS KE KA'BAH <RefreshCw size={12} className="ml-2 animate-spin" /></>
                    ) : (
                        "PUTAR PERANGKAT ANDA"
                    )}
                </p>
             </div>

             {/* Container Kompas */}
             <div className="relative w-[320px] h-[320px] flex items-center justify-center">
                
                {/* Garis Penunjuk Statis (Selalu di atas layar) */}
                <div className="absolute -top-10 z-20 flex flex-col items-center space-y-1">
                   <div className={`w-1 h-8 rounded-full transition-colors duration-300 ${isAligned ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-red-500'}`}></div>
                   <MapPin size={24} className={`transition-colors duration-300 ${isAligned ? 'text-green-500 fill-green-500' : 'text-red-500'}`} />
                </div>

                {/* Lingkaran Luar (Hiasan) */}
                <div className="absolute inset-0 border-[2px] border-white/10 rounded-full"></div>
                <div className="absolute inset-4 border border-dashed border-white/5 rounded-full"></div>

                {/* PIRINGAN KOMPAS YANG BERPUTAR */}
                {/* Rotasi berdasarkan heading negatif agar utara tetap di utara */}
                <div 
                   className="w-full h-full rounded-full relative transition-transform duration-100 ease-linear will-change-transform"
                   style={{ transform: `rotate(${plateRotation}deg)` }}
                >
                    {/* Arah Mata Angin */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-red-500 font-black text-xl">N</div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/50 font-bold">S</div>
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/50 font-bold">W</div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 font-bold">E</div>

                    {/* Garis-garis Derajat */}
                    {[...Array(12)].map((_, i) => (
                        <div 
                           key={i} 
                           className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-transparent"
                           style={{ transform: `rotate(${i * 30}deg)` }}
                        >
                           <div className="w-full h-3 bg-white/20"></div>
                           <div className="w-full h-3 bg-white/20 absolute bottom-0"></div>
                        </div>
                    ))}

                    {/* ICON KA'BAH (Pointer Kiblat) */}
                    {/* Ditempelkan pada piringan di sudut qiblaDegree */}
                    {qiblaDegree !== null && (
                        <div 
                           className="absolute top-0 left-1/2 w-16 h-1/2 origin-bottom -ml-8 flex flex-col items-center justify-start pt-10"
                           style={{ transform: `rotate(${qiblaDegree}deg)` }}
                        >
                            <div className={`flex flex-col items-center space-y-1 transition-all duration-300 ${isAligned ? 'scale-125' : 'scale-100 opacity-80'}`}>
                                <div className="w-12 h-12 bg-[#00a896] rounded-xl flex items-center justify-center shadow-lg border-2 border-white/20">
                                   <img src="https://img.icons8.com/fluency/96/kaaba.png" className="w-8 h-8 object-contain" alt="Kaaba" />
                                </div>
                                <div className="w-0.5 h-16 bg-gradient-to-b from-[#00a896] to-transparent"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Center Point */}
                <div className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white] z-10"></div>
                <div className="absolute w-[1px] h-full bg-white/5 z-0 pointer-events-none"></div>
                <div className="absolute w-full h-[1px] bg-white/5 z-0 pointer-events-none"></div>

             </div>

             <div className="mt-12 text-center text-white/50 text-[10px] max-w-[200px] leading-relaxed">
                Jauhkan dari magnet atau benda logam untuk akurasi maksimal. <br/>
                Sudut Heading: {Math.round(compassHeading)}°
             </div>
           </>
        )}
      </div>
    </div>
  );
};

export default KiblatPage;
