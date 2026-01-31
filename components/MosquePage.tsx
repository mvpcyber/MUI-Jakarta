
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Navigation, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

interface Mosque {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distance: number;
  type: string;
}

interface MosquePageProps {
  isOpen: boolean;
  onClose: () => void;
}

const MosquePage: React.FC<MosquePageProps> = ({ isOpen, onClose }) => {
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);

  // Fungsi menghitung jarak (Haversine Formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius bumi dalam km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Jarak dalam km
  };

  const fetchMosques = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);

    // Menggunakan Overpass API dengan 'out center' untuk mendapatkan koordinat pusat dari way (bangunan)
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${lat},${lon});
        way["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${lat},${lon});
      );
      out center;
    `;

    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Server API Error: ${response.status}`);
      }

      const data = await response.json();
      const results: Mosque[] = [];

      if (data.elements) {
        data.elements.forEach((el: any) => {
          // Check tags existence
          if (el.tags) {
             // Get coordinates (node uses lat/lon, way uses center.lat/center.lon because of 'out center')
             const mLat = el.lat || el.center?.lat;
             const mLon = el.lon || el.center?.lon;
             const mName = el.tags.name || el.tags.alt_name || "Masjid/Musholla";

             if(mLat && mLon) {
                 const dist = calculateDistance(lat, lon, mLat, mLon);
                 results.push({
                   id: el.id,
                   name: mName,
                   lat: mLat,
                   lon: mLon,
                   distance: dist,
                   type: el.tags.mosque_type || 'mosque'
                 });
             }
          }
        });
      }

      // Urutkan berdasarkan jarak terdekat
      results.sort((a, b) => a.distance - b.distance);
      
      if (results.length === 0) {
        // Jika kosong, mungkin API berhasil tapi tidak ada data
        // Kita tidak set error, tapi biarkan list kosong handle UI nya
      }

      setMosques(results);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Gagal memuat data masjid. Periksa koneksi internet Anda atau coba sesaat lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lon: longitude });
            fetchMosques(latitude, longitude);
          },
          (err) => {
            console.error(err);
            setError("Izin lokasi diperlukan untuk mencari masjid terdekat.");
            setLoading(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setError("Perangkat tidak mendukung Geolocation.");
        setLoading(false);
      }
    }
  }, [isOpen]);

  const handleNavigate = (lat: number, lon: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
  };

  const handleRetry = () => {
    if (userLocation) {
      fetchMosques(userLocation.lat, userLocation.lon);
    } else {
      // Jika lokasi belum ada, coba reload lokasi trigger useEffect
      window.location.reload(); 
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] bg-[#f8fafc] flex flex-col animate-in slide-in-from-right duration-300">
      <div 
        className="pt-12 pb-8 px-6 relative overflow-hidden shadow-lg bg-[#00a896]"
        style={{ 
          backgroundImage: 'url(https://img.freepik.com/premium-vector/islamic-background-green-pattern_650032-387.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
        <div className="relative z-10 flex items-center justify-between">
          <button 
            onClick={onClose} 
            className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md text-white active:scale-90 transition-transform"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white tracking-tight">Masjid Terdekat</h2>
            <span className="text-[10px] font-black text-[#5eead4] uppercase tracking-[0.2em]">Radius 3 KM</span>
          </div>
          <button 
            onClick={handleRetry}
            className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md text-white active:scale-90 transition-transform"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#00a896] mb-4" size={40} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mencari Masjid...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
               <AlertCircle size={32} className="text-red-400" />
            </div>
            <p className="text-sm font-bold text-gray-600 mb-2">{error}</p>
            <button 
               onClick={handleRetry}
               className="mt-4 px-8 py-3 bg-[#00a896] text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-100 active:scale-95 transition-all"
            >
               Coba Lagi
            </button>
          </div>
        ) : mosques.length === 0 ? (
          <div className="text-center py-20">
             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} className="text-gray-300" />
             </div>
             <h3 className="text-gray-600 font-bold mb-1">Tidak Ditemukan</h3>
             <p className="text-gray-400 text-xs">Belum ada data masjid di radius 3km dari lokasi Anda.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-20">
            {mosques.map((mosque) => (
              <div key={mosque.id} className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
                 <div className="flex items-center space-x-4 overflow-hidden">
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0">
                       <img src="https://m.muijakarta.or.id/img/masjid.png" alt="Icon" className="w-8 h-8 object-contain" />
                    </div>
                    <div className="min-w-0">
                       <h3 className="text-sm font-black text-gray-800 truncate">{mosque.name}</h3>
                       <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[10px] font-bold text-[#00a896] bg-teal-50 px-2 py-0.5 rounded-md shrink-0">
                             {mosque.distance < 1 ? `${Math.round(mosque.distance * 1000)} m` : `${mosque.distance.toFixed(1)} km`}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wide truncate">
                             {mosque.type === 'mosque' ? 'Masjid Jami' : 'Musholla'}
                          </span>
                       </div>
                    </div>
                 </div>
                 
                 <button 
                   onClick={() => handleNavigate(mosque.lat, mosque.lon)}
                   className="w-10 h-10 bg-[#00a896] text-white rounded-xl flex items-center justify-center shadow-lg shadow-teal-200 active:scale-90 transition-transform shrink-0"
                 >
                    <Navigation size={18} fill="currentColor" />
                 </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MosquePage;
