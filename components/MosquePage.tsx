
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

  const fetchMosques = (lat: number, lon: number) => {
    setLoading(true);
    setError(null);

    // Menggunakan Overpass API (OpenStreetMap) untuk mencari amenity=place_of_worship + religion=muslim
    // Radius 3000 meter (3km)
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${lat},${lon});
        way["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${lat},${lon});
      );
      out body;
      >;
      out skel qt;
    `;

    fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        const results: Mosque[] = [];
        
        data.elements.forEach((el: any) => {
          if (el.tags && el.tags.name) {
             // Untuk node langsung ada lat/lon. Untuk way (bangunan), kita ambil lat/lon center (simplifikasi: ambil node pertama ref atau center bound, tapi overpass node return lat lon)
             // Note: Query di atas mengembalikan node dan way. Untuk way, overpass 'out center' lebih baik tapi 'out body' standar.
             // Kita filter yang punya lat/lon (node) dulu untuk simplifikasi mobile.
             if(el.lat && el.lon) {
                 const dist = calculateDistance(lat, lon, el.lat, el.lon);
                 results.push({
                   id: el.id,
                   name: el.tags.name,
                   lat: el.lat,
                   lon: el.lon,
                   distance: dist,
                   type: el.tags.mosque_type || 'Masjid/Musholla'
                 });
             }
          }
        });

        // Urutkan berdasarkan jarak terdekat
        results.sort((a, b) => a.distance - b.distance);
        setMosques(results);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Gagal memuat data masjid. Periksa koneksi internet Anda.");
        setLoading(false);
      });
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
            setError("Izin lokasi diperlukan untuk mencari masjid terdekat.");
            setLoading(false);
          }
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
            onClick={() => userLocation && fetchMosques(userLocation.lat, userLocation.lon)}
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
            <AlertCircle size={40} className="text-red-400 mb-4" />
            <p className="text-sm font-bold text-gray-600 mb-2">{error}</p>
            <button 
               onClick={() => window.location.reload()}
               className="mt-4 px-6 py-2 bg-[#00a896] text-white rounded-full text-xs font-bold"
            >
               Coba Lagi
            </button>
          </div>
        ) : mosques.length === 0 ? (
          <div className="text-center py-20">
             <MapPin size={40} className="text-gray-300 mx-auto mb-4" />
             <p className="text-gray-500 font-bold">Tidak ada masjid ditemukan di sekitar Anda.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-20">
            {mosques.map((mosque) => (
              <div key={mosque.id} className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
                 <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0">
                       <img src="https://m.muijakarta.or.id/img/masjid.png" alt="Icon" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-gray-800 line-clamp-1">{mosque.name}</h3>
                       <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[10px] font-bold text-[#00a896] bg-teal-50 px-2 py-0.5 rounded-md">
                             {mosque.distance < 1 ? `${Math.round(mosque.distance * 1000)} m` : `${mosque.distance.toFixed(1)} km`}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                             {mosque.type === 'mosque' ? 'Masjid Jami' : 'Musholla'}
                          </span>
                       </div>
                    </div>
                 </div>
                 
                 <button 
                   onClick={() => handleNavigate(mosque.lat, mosque.lon)}
                   className="w-10 h-10 bg-[#00a896] text-white rounded-xl flex items-center justify-center shadow-lg shadow-teal-200 active:scale-90 transition-transform"
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
