
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MapPin, 
  Home, 
  BookOpen, 
  FileText, 
  Calendar, 
  Settings, 
  Bell, 
  Loader2, 
  Search, 
  ArrowRight,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Quote,
  Copy,
  CheckCheck,
  Navigation
} from 'lucide-react';
import { QUICK_MENUS } from './constants';
import FullMenuModal from './components/FullMenuModal';
import QuranPage from './components/QuranPage';
import PrayerPage from './components/PrayerPage';
import HaditsPage from './components/HaditsPage';
import KiblatPage from './components/KiblatPage';
import HalalPage from './components/HalalPage';
import FatwaPage from './components/FatwaPage';
import NewsPage from './components/NewsPage';
import MosquePage from './components/MosquePage';
import SearchModal from './components/SearchModal';
import NotificationModal, { NotificationItem } from './components/NotificationModal';
import InfoModal from './components/InfoModal';
import NewsDetailModal, { NewsDetailData } from './components/NewsDetailModal';
import InstallPwaModal from './components/InstallPwaModal';

export interface PrayerSchedule {
  subuh: string;
  terbit: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  tanggal: string;
  lokasi: string;
}

// Koleksi Quote Islami Ringkas untuk Status Sosmed
const ISLAMIC_QUOTES = [
  { content: "Barangsiapa yang menempuh jalan untuk menuntut ilmu, Allah akan mudahkan baginya jalan menuju surga.", source: "HR. Muslim" },
  { content: "Senyummu di hadapan saudaramu adalah sedekah.", source: "HR. Tirmidzi" },
  { content: "Sebaik-baik manusia adalah yang paling bermanfaat bagi orang lain.", source: "HR. Ahmad" },
  { content: "Malu itu sebagian dari iman.", source: "HR. Bukhari & Muslim" },
  { content: "Dunia adalah perhiasan, dan sebaik-baik perhiasan dunia adalah wanita shalihah.", source: "HR. Muslim" },
  { content: "Kebersihan adalah sebagian dari iman.", source: "HR. Muslim" },
  { content: "Barangsiapa beriman kepada Allah dan hari akhir, hendaklah ia berkata baik atau diam.", source: "HR. Bukhari" },
  { content: "Sesungguhnya Allah itu indah dan menyukai keindahan.", source: "HR. Muslim" },
  { content: "Tidak akan masuk surga orang yang di dalam hatinya terdapat kesombongan sebiji sawi.", source: "HR. Muslim" },
  { content: "Solat adalah tiang agama.", source: "HR. Tirmidzi" },
  { content: "Tangan di atas lebih baik daripada tangan di bawah.", source: "HR. Bukhari" },
  { content: "Sabar adalah separuh dari keimanan.", source: "Al-Hadits" },
  { content: "Ridha Allah tergantung pada ridha orang tua, dan murka Allah tergantung pada murka orang tua.", source: "HR. Tirmidzi" },
  { content: "Orang yang kuat bukanlah orang yang jago gulat, tetapi orang yang mampu menahan diri ketika marah.", source: "HR. Bukhari" },
  { content: "Sedekah tidak akan mengurangi harta.", source: "HR. Muslim" }
];

// Data Awal Notifikasi
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    type: 'prayer',
    title: 'Waktu Maghrib Tiba',
    desc: 'Saatnya menunaikan sholat Maghrib untuk wilayah Jakarta Pusat dan sekitarnya.',
    time: 'Baru saja',
    read: false
  },
  {
    id: 2,
    type: 'news',
    title: 'Fatwa Terbaru MUI',
    desc: 'MUI keluarkan fatwa baru terkait dukungan perjuangan Palestina. Simak selengkapnya.',
    time: '2 jam lalu',
    read: false
  },
  {
    id: 3,
    type: 'prayer',
    title: 'Waktu Ashar Tiba',
    desc: 'Saatnya menunaikan sholat Ashar.',
    time: '4 jam lalu',
    read: true
  }
];

const SplashScreen: React.FC = () => (
  <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#00827f] overflow-hidden islamic-bg">
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
  
  // Modals States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Page States
  const [isPrayerPageOpen, setIsPrayerPageOpen] = useState(false);
  const [isQuranOpen, setIsQuranOpen] = useState(false);
  const [isHaditsOpen, setIsHaditsOpen] = useState(false);
  const [isKiblatOpen, setIsKiblatOpen] = useState(false);
  const [isHalalOpen, setIsHalalOpen] = useState(false);
  const [isFatwaOpen, setIsFatwaOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isMosqueOpen, setIsMosqueOpen] = useState(false);
  
  // News Detail State
  const [isNewsDetailOpen, setIsNewsDetailOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsDetailData | null>(null);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [locationName, setLocationName] = useState("Mendeteksi Lokasi...");
  const [prayerSchedule, setPrayerSchedule] = useState<PrayerSchedule | null>(null);

  // News State
  const [homeNews, setHomeNews] = useState<NewsDetailData[]>([]);
  const [newsPage, setNewsPage] = useState(1);
  const [newsLoading, setNewsLoading] = useState(false);

  // Quote State
  const [dailyQuote, setDailyQuote] = useState<{content: string, source: string} | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Notification State
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Logic Notifikasi
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRemoveNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
  };

  // Timer untuk jam digital
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch News from MUI Jakarta
  const fetchHomeNews = useCallback(async (page: number) => {
    setNewsLoading(true);
    try {
      // Fetch with Embed to get images and author
      const response = await fetch(`https://muijakarta.or.id/wp-json/wp/v2/posts?_embed&per_page=5&page=${page}`);
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const formatted: NewsDetailData[] = data.map((item: any) => {
          let cat = "BERITA";
          if (item._embedded && item._embedded['wp:term'] && item._embedded['wp:term'][0] && item._embedded['wp:term'][0][0]) {
            cat = item._embedded['wp:term'][0][0].name;
          }
          
          // Clean category name (&amp; -> Dan)
          cat = cat.replace(/&amp;/gi, 'Dan').replace(/&/g, 'Dan');

          let img = "https://muijakarta.or.id/wp-content/uploads/2023/11/WhatsApp-Image-2023-11-20-at-10.45.28-1024x683.jpeg";
          if (item._embedded && item._embedded['wp:featuredmedia'] && item._embedded['wp:featuredmedia'][0]) {
             img = item._embedded['wp:featuredmedia'][0].source_url;
          }

          let authorName = "Admin";
          if (item._embedded && item._embedded['author'] && item._embedded['author'][0]) {
              authorName = item._embedded['author'][0].name;
          }

          return {
            id: item.id,
            title: item.title.rendered.replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"'),
            date: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            url: item.link, // For sharing
            content: item.content.rendered, // For detail view
            imageUrl: img, // For detail view
            author: authorName,
            category: cat.toUpperCase()
          };
        });
        setHomeNews(formatted);
      }
    } catch (err) {
      console.error("News Fetch Error:", err);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!showSplash) {
      fetchHomeNews(newsPage);
      generateDailyQuote();
    }
  }, [showSplash, newsPage, fetchHomeNews]);

  // Generate Random Quote
  const generateDailyQuote = () => {
    const randomIndex = Math.floor(Math.random() * ISLAMIC_QUOTES.length);
    setDailyQuote(ISLAMIC_QUOTES[randomIndex]);
  };

  const handleCopyQuote = () => {
    if (dailyQuote) {
      const text = `"${dailyQuote.content}"\n\n(${dailyQuote.source})\n\nVia Aplikasi MUI Jakarta`;
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Fungsi mengambil jadwal sholat berdasarkan koordinat (Method 20 = Kemenag RI)
  const fetchPrayerTimesByCoords = useCallback(async (lat: number, lng: number, cityDisplayName: string) => {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const response = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=20`);
      const data = await response.json();

      if (data.code === 200 && data.data) {
        const timings = data.data.timings;
        const dateReadable = data.data.date.readable;

        setPrayerSchedule({
          subuh: timings.Fajr,
          terbit: timings.Sunrise,
          dzuhur: timings.Dhuhr,
          ashar: timings.Asr,
          maghrib: timings.Maghrib,
          isya: timings.Isha,
          tanggal: dateReadable,
          lokasi: cityDisplayName
        });
      }
    } catch (err) {
      console.error("Prayer API Error:", err);
    }
  }, []);

  // Deteksi Lokasi dan Jadwal
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.county || data.address.state || "Lokasi Anda";
            setLocationName(city);
            fetchPrayerTimesByCoords(latitude, longitude, city);
          } catch (err) {
            console.warn("Gagal mendapatkan nama lokasi, menggunakan default.");
            setLocationName("Jakarta Pusat");
            fetchPrayerTimesByCoords(-6.2088, 106.8456, "Jakarta Pusat");
          }
        }, 
        (error) => {
          console.warn("Izin lokasi ditolak/error.", error);
          setLocationName("Jakarta Pusat");
          fetchPrayerTimesByCoords(-6.2088, 106.8456, "Jakarta Pusat");
        }
      );
    } else {
      setLocationName("Jakarta Pusat");
      fetchPrayerTimesByCoords(-6.2088, 106.8456, "Jakarta Pusat");
    }
  }, [fetchPrayerTimesByCoords]);

  // Logika Waktu Sholat Berikutnya
  const nextPrayer = useMemo(() => {
    if (!prayerSchedule) return { name: 'Memuat...', time: '--:--' };
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const timeToMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const schedule = [
      { name: 'Subuh', time: prayerSchedule.subuh, minutes: timeToMinutes(prayerSchedule.subuh) },
      { name: 'Terbit', time: prayerSchedule.terbit, minutes: timeToMinutes(prayerSchedule.terbit) },
      { name: 'Dzuhur', time: prayerSchedule.dzuhur, minutes: timeToMinutes(prayerSchedule.dzuhur) },
      { name: 'Ashar', time: prayerSchedule.ashar, minutes: timeToMinutes(prayerSchedule.ashar) },
      { name: 'Maghrib', time: prayerSchedule.maghrib, minutes: timeToMinutes(prayerSchedule.maghrib) },
      { name: 'Isya', time: prayerSchedule.isya, minutes: timeToMinutes(prayerSchedule.isya) },
    ];

    const next = schedule.find(p => p.minutes > currentMinutes);
    return next || { name: 'Subuh', time: prayerSchedule.subuh }; 
  }, [prayerSchedule, currentTime]);

  // Logika Countdown
  const countdown = useMemo(() => {
    if (!prayerSchedule || nextPrayer.time === '--:--') return "00:00:00";
    const [h, m] = nextPrayer.time.split(':').map(Number);
    const target = new Date(currentTime);
    target.setHours(h, m, 0, 0);

    if (target < currentTime) {
      target.setDate(target.getDate() + 1);
    }

    const diff = target.getTime() - currentTime.getTime();
    if (diff < 0) return "00:00:00";

    const pad = (n: number) => n.toString().padStart(2, '0');
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }, [nextPrayer, prayerSchedule, currentTime]);

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(splashTimer);
  }, []);

  const handleQuickNavigation = (menuId: string) => {
    if (menuId === 'halal') setIsHalalOpen(true);
    if (menuId === 'lainnya') setIsMenuOpen(true);
    if (menuId === 'jadwal') setIsPrayerPageOpen(true);
    if (menuId === 'quran') setIsQuranOpen(true);
    if (menuId === 'hadits') setIsHaditsOpen(true);
    if (menuId === 'kiblat') setIsKiblatOpen(true);
    if (menuId === 'fatwa') setIsFatwaOpen(true);
    if (menuId === 'berita') setIsNewsOpen(true);
  };

  const handleNewsClick = (news: NewsDetailData) => {
    setSelectedNews(news);
    setIsNewsDetailOpen(true);
  };

  if (showSplash) return <SplashScreen />;

  return (
    <div className="max-w-md mx-auto bg-[#f8fafc] min-h-screen relative shadow-2xl overflow-x-hidden">
      {/* Header Background */}
      <div className="absolute top-0 left-0 right-0 h-[360px] islamic-bg z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-teal-900/60 to-[#f8fafc]"></div>
      </div>

      <div className="relative z-10 pt-4 flex flex-col items-center">
        {/* Top Bar: Search - Location - Bell */}
        <div className="w-full px-6 flex justify-between items-start mb-0 relative z-20 pt-2">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="bg-white/10 p-2.5 rounded-2xl text-white backdrop-blur-md border border-white/10 shadow-lg active:scale-95 transition-transform"
          >
            <Search size={22} />
          </button>
          
          {/* Location moved here */}
          <div className="flex flex-col items-center mt-1.5">
             <div className="flex items-center space-x-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <MapPin size={10} className="text-red-400 fill-red-400" />
                <span className="text-[10px] font-bold text-white tracking-wide truncate max-w-[120px]">{locationName}</span>
             </div>
          </div>

          <button 
            onClick={() => setIsNotifOpen(true)}
            className="bg-white/10 p-2.5 rounded-2xl text-white backdrop-blur-md relative border border-white/10 shadow-lg active:scale-95 transition-transform"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
               <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
        </div>

        <div className="w-full flex flex-col items-center pb-6 pt-0 px-6 relative z-20">
          {/* Logo with reduced border */}
          <div className="mb-2">
             <div className="w-20 h-20 bg-white rounded-full p-1 shadow-2xl flex items-center justify-center border border-white active:scale-105 transition-transform overflow-hidden">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Logo-MUI-Jakarta.png" alt="MUI" className="w-full h-full object-contain" />
             </div>
          </div>

          <div className="text-center mb-2">
            <h2 className="text-3xl font-black text-white tracking-tighter drop-shadow-lg uppercase">
              {nextPrayer.name}' {nextPrayer.time} <span className="text-sm font-bold opacity-70">WIB</span>
            </h2>
          </div>

          <div className="text-sm font-bold text-white/90 mb-3 bg-black/30 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/5 flex items-center shadow-lg">
            <span className="mr-2 text-orange-400 font-black">-</span> {countdown}
          </div>

          {/* Date display with Black Text */}
          <div className="text-[10px] font-black text-gray-900 tracking-wider bg-white/40 backdrop-blur-md px-6 py-2.5 rounded-full uppercase border border-white/20 shadow-xl flex items-center justify-center whitespace-nowrap overflow-hidden">
            <span className="shrink-0">
              {currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="opacity-60 font-bold mx-2 text-[12px]">|</span>
            <span className="shrink-0">
              {new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' })
                .format(currentTime)
                .replace(/AH|H/gi, '')
                .trim()} H
            </span>
          </div>
        </div>
      </div>

      {/* Content Container (Padding Bottom untuk Nav) */}
      <div className="bg-[#f8fafc] rounded-t-[40px] px-5 pt-8 -mt-6 relative z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] pb-32">
        {/* Menu Grid */}
        <div className="grid grid-cols-4 gap-x-3 gap-y-8 pb-8">
          {QUICK_MENUS.map((menu) => (
            <button 
              key={menu.id} 
              onClick={() => handleQuickNavigation(menu.id)}
              className="flex flex-col items-center group active:scale-95 transition-all duration-200"
            >
              <div className={`w-[62px] h-[62px] rounded-2xl flex items-center justify-center ${menu.color} shadow-sm border border-gray-100/30 mb-2 group-hover:shadow-md transition-shadow`}>
                {menu.icon}
              </div>
              <span className="text-[10px] font-bold text-gray-500 text-center leading-tight tracking-tight uppercase px-1">{menu.label}</span>
            </button>
          ))}
        </div>

        {/* Quote Hari Ini Card */}
        <div 
          onClick={handleCopyQuote}
          className="bg-white rounded-[32px] p-6 shadow-xl shadow-teal-900/5 mb-4 flex flex-col items-center relative overflow-hidden cursor-pointer group hover:shadow-2xl hover:shadow-teal-900/10 transition-all active:scale-[0.98]"
        >
           {/* Decorative Background */}
           <div className="absolute top-0 left-0 w-20 h-20 bg-teal-50 rounded-br-[80px] opacity-60 -ml-6 -mt-6 pointer-events-none"></div>
           <div className="absolute bottom-0 right-0 w-24 h-24 bg-orange-50 rounded-tl-[100px] opacity-60 -mr-8 -mb-8 pointer-events-none"></div>

           <div className="w-full flex justify-between items-center mb-4 relative z-10">
              <div className="flex items-center space-x-2">
                 <div className="h-6 w-1 bg-orange-500 rounded-full"></div>
                 <div>
                    <h3 className="font-bold text-gray-800 text-lg leading-none">Quote Hari Ini</h3>
                 </div>
              </div>
              <div className={`p-2 rounded-full transition-colors ${isCopied ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                 {isCopied ? <CheckCheck size={16} /> : <Copy size={16} />}
              </div>
           </div>
           
           <div className="relative z-10 w-full text-center py-2 px-2">
              <p className="text-base text-gray-700 font-medium italic leading-relaxed">
                 "{dailyQuote?.content}"
              </p>
              
              <div className="mt-4 inline-block">
                 <span className="text-[10px] font-black text-[#00a896] uppercase tracking-widest bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
                    {dailyQuote?.source}
                 </span>
              </div>
           </div>
        </div>

        {/* Card Masjid Terdekat */}
        <div 
          onClick={() => setIsMosqueOpen(true)}
          className="bg-gradient-to-r from-[#00a896] to-teal-700 rounded-[32px] p-5 shadow-lg shadow-teal-900/10 mb-8 flex items-center justify-between relative overflow-hidden cursor-pointer group hover:shadow-xl hover:shadow-teal-900/20 transition-all active:scale-[0.98]"
        >
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/arabesque.png")' }}></div>
          
          <div className="relative z-10 flex items-center space-x-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
               <img src="https://m.muijakarta.or.id/img/masjid.png" alt="Masjid" className="w-9 h-9 object-contain drop-shadow-md" />
            </div>
            <div>
               <h3 className="font-bold text-white text-lg leading-tight">Masjid Terdekat</h3>
               <p className="text-[10px] text-teal-100 font-medium mt-1">Temukan tempat ibadah di sekitar Anda</p>
            </div>
          </div>
          
          <div className="w-10 h-10 bg-white text-[#00a896] rounded-full flex items-center justify-center shadow-md relative z-10 group-hover:scale-110 transition-transform">
             <Navigation size={20} fill="currentColor" />
          </div>
        </div>

        {/* Info Terkini / News Section */}
        <div className="pb-10">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-black text-gray-800 border-l-4 border-[#00a896] pl-3">Info Terkini</h2>
             <button onClick={() => setIsNewsOpen(true)} className="text-[#00a896] text-xs font-bold flex items-center active:opacity-70">
               Lihat Semua <ArrowRight size={14} className="ml-1" />
             </button>
          </div>
          
          <div className="space-y-4">
            {newsLoading && homeNews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-[32px] border border-gray-50">
                <Loader2 className="animate-spin text-[#00a896] mb-2" size={24} />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Memuat Berita...</p>
              </div>
            ) : (
              <>
                {homeNews.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleNewsClick(item)}
                    className="flex flex-col bg-white p-3 rounded-[24px] border border-gray-100 shadow-sm active:scale-[0.98] transition-all hover:border-[#00a896]/30 cursor-pointer overflow-hidden"
                  >
                     {/* Image & Title Only (No Category, No Date) */}
                     <div className="w-full h-40 rounded-[16px] overflow-hidden mb-3 relative bg-gray-100">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                     </div>
                     <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 px-1 mb-1" dangerouslySetInnerHTML={{ __html: item.title }} />
                  </div>
                ))}

                {/* Pagination Controls */}
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <button 
                    onClick={() => setNewsPage(prev => Math.max(1, prev - 1))}
                    disabled={newsPage === 1 || newsLoading}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 disabled:opacity-30 active:scale-90 transition-transform"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <div className="flex space-x-1">
                     <span className="h-8 flex items-center justify-center px-3 font-bold text-xs bg-[#00a896] text-white rounded-xl shadow-md">
                        {newsPage}
                     </span>
                  </div>

                  <button 
                    onClick={() => setNewsPage(prev => prev + 1)}
                    disabled={newsLoading || homeNews.length < 5}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 disabled:opacity-30 active:scale-90 transition-transform"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Persistent Floating Bottom Nav - Fixed at Bottom */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)] flex justify-between items-end px-6 py-2 pb-5 z-[200] rounded-t-[30px]">
        
        {/* Left Side */}
        <div className="flex-1 flex justify-between pr-4 pb-1">
          <NavButton icon={<BookOpen size={20} />} label="Al-Quran" onClick={() => setIsQuranOpen(true)} />
          <NavButton icon={<FileText size={20} />} label="Fatwa" onClick={() => setIsFatwaOpen(true)} />
        </div>

        {/* Center Button (Beranda) */}
        <div className="relative -top-6 px-2 flex flex-col items-center">
           <button 
             onClick={() => {
                // Beranda logic: Close all modals to reveal main content
                setIsQuranOpen(false); setIsFatwaOpen(false); setIsPrayerPageOpen(false);
                setIsHaditsOpen(false); setIsKiblatOpen(false); setIsHalalOpen(false); setIsNewsOpen(false);
                setIsMosqueOpen(false);
             }}
             className="w-14 h-14 bg-[#00a896] rounded-full flex items-center justify-center text-white shadow-lg shadow-teal-500/40 border-4 border-[#f8fafc] active:scale-90 transition-transform"
           >
              <Home size={24} />
           </button>
           <span className="text-[9px] font-black uppercase tracking-widest text-[#00a896] mt-1">Beranda</span>
        </div>

        {/* Right Side */}
        <div className="flex-1 flex justify-between pl-4 pb-1">
          <NavButton icon={<Clock size={20} />} label="Jadwal" onClick={() => setIsPrayerPageOpen(true)} />
          <NavButton icon={<User size={20} />} label="Profil" onClick={() => setIsProfileOpen(true)} />
        </div>
      </nav>

      {/* Install PWA Modal - Auto detected */}
      <InstallPwaModal />

      {/* Modals / Pages */}
      <FullMenuModal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <PrayerPage isOpen={isPrayerPageOpen} onClose={() => setIsPrayerPageOpen(false)} schedule={prayerSchedule} location={locationName} nextPrayer={nextPrayer} />
      <QuranPage isOpen={isQuranOpen} onClose={() => setIsQuranOpen(false)} />
      <HaditsPage isOpen={isHaditsOpen} onClose={() => setIsHaditsOpen(false)} />
      <KiblatPage isOpen={isKiblatOpen} onClose={() => setIsKiblatOpen(false)} />
      <HalalPage isOpen={isHalalOpen} onClose={() => setIsHalalOpen(false)} />
      
      {/* New Pages */}
      <FatwaPage isOpen={isFatwaOpen} onClose={() => setIsFatwaOpen(false)} />
      <NewsPage isOpen={isNewsOpen} onClose={() => setIsNewsOpen(false)} />
      <MosquePage isOpen={isMosqueOpen} onClose={() => setIsMosqueOpen(false)} />
      
      <NewsDetailModal 
        isOpen={isNewsDetailOpen} 
        onClose={() => setIsNewsDetailOpen(false)} 
        news={selectedNews} 
      />
      
      {/* Utility Modals */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={handleQuickNavigation} />
      <NotificationModal 
        isOpen={isNotifOpen} 
        onClose={() => setIsNotifOpen(false)} 
        notifications={notifications}
        onRemove={handleRemoveNotification}
        onMarkAllRead={handleMarkAllRead}
      />
      <InfoModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        title="Profil Pengguna"
        message="Fitur Profil dan akun pengguna saat ini masih dalam tahap pengembangan. Nantikan pembaruan selanjutnya!"
      />
    </div>
  );
};

const NavButton: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center space-y-1 group w-14 ${active ? 'text-teal-600' : 'text-gray-400'} active:scale-95 transition-all`}>
    <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-teal-50' : 'group-hover:bg-gray-50'}`}>
      {icon}
    </div>
    <span className="text-[9px] font-bold uppercase tracking-wide opacity-80">{label}</span>
  </button>
);

export default App;
