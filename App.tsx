
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MapPin, 
  ChevronRight, 
  Home, 
  BookOpen, 
  FileText, 
  Calendar, 
  Settings, 
  Bell, 
  Loader2, 
  ExternalLink, 
  Search, 
  RefreshCw, 
  Clock, 
  Compass, 
  ArrowLeft, 
  ChevronLeft 
} from 'lucide-react';
import { QUICK_MENUS } from './constants';
import FullMenuModal from './components/FullMenuModal';
import QuranPage from './components/QuranPage';
import PrayerPage from './components/PrayerPage';
import HaditsPage from './components/HaditsPage';
import KiblatPage from './components/KiblatPage';
import HalalPage from './components/HalalPage';

export interface NewsItem {
  title: string;
  category: string;
  imageUrl: string;
  date: string;
  url: string;
}

export interface PrayerSchedule {
  subuh: string;
  terbit: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  tanggal: string;
}

const SplashScreen: React.FC = () => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#00827f] overflow-hidden islamic-bg">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
    <div className="relative flex flex-col items-center animate-in fade-in zoom-in duration-700">
      <div className="w-32 h-32 bg-white rounded-full p-4 shadow-2xl flex items-center justify-center mb-6">
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Logo-MUI-Jakarta.png" alt="Logo" className="w-full h-full object-contain" />
      </div>
      <h1 className="text-white text-2xl font-bold tracking-widest uppercase shadow-black drop-shadow-lg">MUI JAKARTA</h1>
      <Loader2 className="animate-spin text-white/50 mt-12" size={24} />
    </div>
  </div>
);

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPrayerPageOpen, setIsPrayerPageOpen] = useState(false);
  const [isQuranOpen, setIsQuranOpen] = useState(false);
  const [isHaditsOpen, setIsHaditsOpen] = useState(false);
  const [isKiblatOpen, setIsKiblatOpen] = useState(false);
  const [isHalalOpen, setIsHalalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [locationName, setLocationName] = useState("Palmerah, Jakarta Barat");
  const [prayerSchedule, setPrayerSchedule] = useState<PrayerSchedule | null>(null);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchPrayerSchedule = useCallback(async (cityName: string) => {
    try {
      const cleanCityName = cityName.split(',')[0].trim() || "Jakarta Barat";
      const cityRes = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${cleanCityName}`);
      const cityData = await cityRes.json();
      
      if (cityData.status && cityData.data.length > 0) {
        const cityId = cityData.data[0].id;
        const now = new Date();
        const scheduleRes = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`);
        const scheduleData = await scheduleRes.json();
        if (scheduleData.status) setPrayerSchedule(scheduleData.data.jadwal);
      }
    } catch (err) {
      console.error("Prayer API error:", err);
    }
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.county || "Jakarta Barat";
          setLocationName(city);
          fetchPrayerSchedule(city);
        } catch (err) {
          console.warn("Location detection fallback to default.");
          fetchPrayerSchedule("Jakarta Barat");
        }
      }, () => fetchPrayerSchedule("Jakarta Barat"));
    } else {
      fetchPrayerSchedule("Jakarta Barat");
    }
  }, [fetchPrayerSchedule]);

  const nextPrayer = useMemo(() => {
    if (!prayerSchedule) return { name: 'Maghrib', time: '18:00' };
    const now = new Date();
    const currentStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const schedule = [
      { name: 'Subuh', time: prayerSchedule.subuh },
      { name: 'Terbit', time: prayerSchedule.terbit },
      { name: 'Dzuhur', time: prayerSchedule.dzuhur },
      { name: 'Ashar', time: prayerSchedule.ashar },
      { name: 'Maghrib', time: prayerSchedule.maghrib },
      { name: 'Isya', time: prayerSchedule.isya },
    ];
    const next = schedule.find(p => p.time > currentStr);
    return next || schedule[0]; 
  }, [prayerSchedule]);

  const countdown = useMemo(() => {
    if (!prayerSchedule || nextPrayer.time === '18:00') return "00:00:00";
    const [h, m] = nextPrayer.time.split(':').map(Number);
    const target = new Date(currentTime);
    target.setHours(h, m, 0, 0);
    if (target < currentTime) target.setDate(target.getDate() + 1);
    const diff = target.getTime() - currentTime.getTime();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(Math.floor(diff / 3600000))}:${pad(Math.floor((diff % 3600000) / 60000))}:${pad(Math.floor((diff % 60000) / 1000))}`;
  }, [nextPrayer, prayerSchedule, currentTime]);

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(splashTimer);
  }, []);

  const fetchNewsFromWP = useCallback(async () => {
    setLoading(true);
    try {
      // Mengambil 50 berita terbaru dari API WordPress MUI Jakarta
      const wpApiUrl = "https://muijakarta.or.id/wp-json/wp/v2/posts?_embed&per_page=50";
      
      const response = await fetch(wpApiUrl);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const formattedNews: NewsItem[] = data.map((item: any) => {
          // Extract Image
          let img = "https://muijakarta.or.id/wp-content/uploads/2023/11/WhatsApp-Image-2023-11-20-at-10.45.28-1024x683.jpeg";
          if (item._embedded && item._embedded['wp:featuredmedia'] && item._embedded['wp:featuredmedia'][0]) {
             img = item._embedded['wp:featuredmedia'][0].source_url;
          }

          // Extract Category if available
          let cat = "BERITA";
          if (item._embedded && item._embedded['wp:term'] && item._embedded['wp:term'][0] && item._embedded['wp:term'][0][0]) {
            cat = item._embedded['wp:term'][0][0].name;
          }

          return {
            title: item.title.rendered.replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"'),
            category: cat.toUpperCase(),
            imageUrl: img,
            date: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            url: item.link
          };
        });
        setAllNews(formattedNews);
        setCurrentPage(1);
      } else {
        throw new Error("Gagal mengambil data dari WP API");
      }
    } catch (err) {
      console.error("News Fetch Error:", err);
      // Fallback data jika API down atau terblokir CORS
      setAllNews([
        {
          title: "MUI Jakarta Tegaskan Pentingnya Menjaga Ukhuwah Islamiyah",
          category: "BERITA",
          imageUrl: "https://muijakarta.or.id/wp-content/uploads/2023/11/WhatsApp-Image-2023-11-20-at-10.45.28-1024x683.jpeg",
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          url: "https://muijakarta.or.id/"
        },
        {
          title: "Fatwa MUI Tentang Penggunaan Media Sosial",
          category: "FATWA",
          imageUrl: "https://muijakarta.or.id/wp-content/uploads/2023/11/WhatsApp-Image-2023-11-20-at-10.45.28-1024x683.jpeg",
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          url: "https://muijakarta.or.id/"
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!showSplash) fetchNewsFromWP();
  }, [fetchNewsFromWP, showSplash]);

  const pagedNews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return allNews.slice(start, start + itemsPerPage);
  }, [allNews, currentPage]);

  const totalPages = Math.ceil(allNews.length / itemsPerPage);

  if (showSplash) return <SplashScreen />;

  return (
    <div className="max-w-md mx-auto bg-[#f8fafc] min-h-screen pb-28 relative shadow-2xl overflow-x-hidden">
      {/* Header Background */}
      <div className="absolute top-0 left-0 right-0 h-[420px] islamic-bg z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-teal-900/60 to-[#f8fafc]"></div>
      </div>

      <div className="relative z-10 pt-4 flex flex-col items-center">
        <div className="w-full px-6 flex justify-between items-center mb-6 relative z-20">
          <button className="bg-white/10 p-2.5 rounded-2xl text-white backdrop-blur-md border border-white/10 shadow-lg active:scale-95 transition-transform"><Search size={22} /></button>
          <button className="bg-white/10 p-2.5 rounded-2xl text-white backdrop-blur-md relative border border-white/10 shadow-lg active:scale-95 transition-transform">
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        <div className="w-full flex flex-col items-center pb-8 pt-4 px-6 relative z-20">
          <div className="mb-6">
             <div className="w-24 h-24 bg-white rounded-full p-2.5 shadow-2xl flex items-center justify-center border-4 border-white active:scale-105 transition-transform overflow-hidden">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Logo-MUI-Jakarta.png" alt="MUI" className="w-full h-full object-contain" />
             </div>
          </div>

          <div className="flex items-center space-x-2 mb-4 bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
            <MapPin size={14} className="text-red-400 fill-red-400" />
            <span className="text-sm font-black text-white tracking-tight">{locationName}</span>
            <button className="text-sm font-bold text-orange-400 active:scale-95 transition-transform px-1">(Ganti)</button>
          </div>

          <div className="text-center mb-2">
            <h2 className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">
              {nextPrayer.name}' {nextPrayer.time} <span className="text-sm font-bold opacity-70">WIB</span>
            </h2>
          </div>

          <div className="text-sm font-bold text-white/90 mb-6 bg-black/30 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/5 flex items-center shadow-lg">
            <span className="mr-2 text-orange-400 font-black">-</span> {countdown}
          </div>

          {/* Date display (Hijri and Gregorian) */}
          <div className="text-[10px] font-black text-white tracking-wider bg-white/20 backdrop-blur-md px-6 py-2.5 rounded-full uppercase border border-white/20 shadow-xl flex items-center justify-center whitespace-nowrap overflow-hidden">
            <span className="shrink-0">
              {currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="opacity-40 font-normal mx-2 text-[12px]">|</span>
            <span className="shrink-0">
              {new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' })
                .format(currentTime)
                .replace(/AH|H/gi, '')
                .trim()} H
            </span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-[#f8fafc] rounded-t-[40px] px-5 pt-8 -mt-6 relative z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
        {/* Menu Grid */}
        <div className="grid grid-cols-4 gap-x-3 gap-y-8 pb-10">
          {QUICK_MENUS.map((menu) => (
            <button 
              key={menu.id} 
              onClick={() => {
                if (menu.id === 'halal') setIsHalalOpen(true);
                if (menu.id === 'lainnya') setIsMenuOpen(true);
                if (menu.id === 'jadwal') setIsPrayerPageOpen(true);
                if (menu.id === 'quran') setIsQuranOpen(true);
                if (menu.id === 'hadits') setIsHaditsOpen(true);
                if (menu.id === 'kiblat') setIsKiblatOpen(true);
              }}
              className="flex flex-col items-center group active:scale-95 transition-all duration-200"
            >
              <div className={`w-[62px] h-[62px] rounded-2xl flex items-center justify-center ${menu.color} shadow-sm border border-gray-100/30 mb-2 group-hover:shadow-md transition-shadow`}>
                {React.cloneElement(menu.icon as React.ReactElement, { size: 28 })}
              </div>
              <span className="text-[10px] font-bold text-gray-500 text-center leading-tight tracking-tight uppercase px-1">{menu.label}</span>
            </button>
          ))}
        </div>

        {/* Headline Section */}
        <div className="pb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-gray-800 border-l-4 border-orange-500 pl-3">Berita Terbaru</h2>
            <button onClick={fetchNewsFromWP} disabled={loading} className="text-teal-600 text-[10px] font-black uppercase tracking-widest bg-teal-50 px-4 py-2 rounded-full border border-teal-100 active:bg-teal-100 transition-all flex items-center">
              <RefreshCw size={14} className={`inline mr-2 ${loading ? 'animate-spin' : ''}`} /> {loading ? 'Memuat' : 'Update'}
            </button>
          </div>

          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center">
               <Loader2 className="animate-spin text-teal-600" size={40} />
               <p className="text-[10px] text-gray-400 mt-6 font-black uppercase tracking-[0.2em]">Mengambil Berita...</p>
             </div>
          ) : (
            <>
              <div className="space-y-6">
                {pagedNews.map((item, idx) => (
                  <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="block bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 group active:scale-[0.98] transition-all">
                    <div className="relative h-48 overflow-hidden">
                      <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute top-4 left-4 bg-orange-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase shadow-lg tracking-widest">{item.category}</div>
                      <div className="absolute bottom-4 left-4 text-white text-[10px] font-bold flex items-center opacity-90 uppercase tracking-tighter">
                        <Calendar size={12} className="mr-2 text-orange-400" /> {item.date}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-gray-800 leading-snug line-clamp-2 mb-3 group-hover:text-teal-700 transition-colors text-[15px]" dangerouslySetInnerHTML={{ __html: item.title }} />
                      <div className="flex items-center justify-between">
                        <div className="text-teal-600 text-[10px] font-black uppercase flex items-center tracking-widest group-hover:underline decoration-teal-300 underline-offset-4">Selengkapnya <ChevronRight size={14} className="ml-1 transition-transform" /></div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100"><ExternalLink size={12} className="text-gray-400" /></div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Pagination */}
              {allNews.length > itemsPerPage && (
                <div className="mt-10 flex items-center justify-center space-x-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-3 rounded-2xl bg-white border border-gray-100 shadow-sm disabled:opacity-30 active:scale-90 transition-transform text-teal-600"><ChevronLeft size={20} /></button>
                  <div className="flex space-x-1 overflow-x-auto max-w-[200px] no-scrollbar">
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i} onClick={() => setCurrentPage(i + 1)} className={`min-w-[40px] h-10 rounded-xl font-bold text-xs transition-all ${currentPage === i + 1 ? 'bg-teal-600 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}>{i + 1}</button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-3 rounded-2xl bg-white border border-gray-100 shadow-sm disabled:opacity-30 active:scale-90 transition-transform text-teal-600"><ChevronRight size={20} /></button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-gray-100/50 flex justify-around items-center py-5 px-6 z-40 rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.08)]">
        <NavButton icon={<Home size={22} />} label="Beranda" active />
        <NavButton icon={<BookOpen size={22} />} label="Al-Quran" onClick={() => setIsQuranOpen(true)} />
        <NavButton icon={<FileText size={22} />} label="Fatwa" />
        <NavButton icon={<Calendar size={22} />} label="Event" />
        <NavButton icon={<Settings size={22} />} label="Profil" />
      </nav>

      <FullMenuModal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <PrayerPage isOpen={isPrayerPageOpen} onClose={() => setIsPrayerPageOpen(false)} schedule={prayerSchedule} location={locationName} nextPrayer={nextPrayer} />
      <QuranPage isOpen={isQuranOpen} onClose={() => setIsQuranOpen(false)} />
      <HaditsPage isOpen={isHaditsOpen} onClose={() => setIsHaditsOpen(false)} />
      <KiblatPage isOpen={isKiblatOpen} onClose={() => setIsKiblatOpen(false)} />
      <HalalPage isOpen={isHalalOpen} onClose={() => setIsHalalOpen(false)} />
    </div>
  );
};

const NavButton: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center space-y-1.5 group ${active ? 'text-teal-600' : 'text-gray-300'} active:scale-95 transition-all`}>
    <div className={`transition-all duration-300 p-2.5 rounded-2xl ${active ? 'bg-teal-600 text-white shadow-xl shadow-teal-200 scale-110' : 'hover:bg-gray-50'}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-black uppercase tracking-widest transition-opacity ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

export default App;
