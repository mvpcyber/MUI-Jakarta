
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  MapPin, 
  Home, 
  FileText, 
  Calendar as CalendarIcon, 
  Bell, 
  Loader2, 
  Search, 
  ArrowRight,
  User,
  Clock,
  CheckCheck,
  Copy
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
import CalendarPage from './components/CalendarPage';
import VideoPage from './components/VideoPage';
import SearchModal from './components/SearchModal';
import NotificationModal, { NotificationItem } from './components/NotificationModal';
import InfoModal from './components/InfoModal';
import NewsDetailModal, { NewsDetailData } from './components/NewsDetailModal';
import InstallPwaModal from './components/InstallPwaModal';
import PermissionModal from './components/PermissionModal';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

// FIREBASE IMPORTS
import { ref, onChildAdded, limitToLast, query, push, set, update } from 'firebase/database';
import { db } from './firebaseConfig';

// Define the global version constant provided by Vite
declare const __APP_VERSION__: string;

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

const ISLAMIC_QUOTES = [
  { content: "Barangsiapa yang menempuh jalan untuk menuntut ilmu, Allah akan mudahkan baginya jalan menuju surga.", source: "HR. Muslim" },
  { content: "Senyummu di hadapan saudaramu adalah sedekah.", source: "HR. Tirmidzi" },
  { content: "Sebaik-baik manusia adalah yang paling bermanfaat bagi orang lain.", source: "HR. Ahmad" },
  { content: "Malu itu sebagian dari iman.", source: "HR. Bukhari & Muslim" },
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
  
  // Ambil versi dari konstanta global Vite yang terhubung ke package.json
  const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0';
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPrayerPageOpen, setIsPrayerPageOpen] = useState(false);
  const [isQuranOpen, setIsQuranOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false); 
  const [isHaditsOpen, setIsHaditsOpen] = useState(false);
  const [isKiblatOpen, setIsKiblatOpen] = useState(false);
  const [isHalalOpen, setIsHalalOpen] = useState(false);
  const [isFatwaOpen, setIsFatwaOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isMosqueOpen, setIsMosqueOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const [isNewsDetailOpen, setIsNewsDetailOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsDetailData | null>(null);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [locationName, setLocationName] = useState("Mendeteksi Lokasi...");
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [prayerSchedule, setPrayerSchedule] = useState<PrayerSchedule | null>(null);

  const sentNotificationsRef = useRef<Set<string>>(new Set());
  const [homeNews, setHomeNews] = useState<NewsDetailData[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  const [dailyQuote, setDailyQuote] = useState<{content: string, source: string} | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const appLaunchTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const checkVersion = async () => {
      const storedVersion = localStorage.getItem('mui_app_version');
      if (storedVersion && storedVersion !== appVersion) {
        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
          } catch (e) {}
        }
        localStorage.setItem('mui_app_version', appVersion);
        window.location.reload();
      } else if (!storedVersion) {
        localStorage.setItem('mui_app_version', appVersion);
      }
    };
    checkVersion();
  }, [appVersion]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'admin') {
      setIsAdminMode(true);
      if (localStorage.getItem('mui_admin_session') === 'true') {
        setIsAdminAuthenticated(true);
      }
    }
  }, []);

  const handleAdminLogin = () => setIsAdminAuthenticated(true);
  const handleAdminLogout = () => {
    localStorage.removeItem('mui_admin_session');
    setIsAdminAuthenticated(false);
    window.location.href = window.location.pathname;
  };

  useEffect(() => {
    if (!isAdminMode && db && !showSplash) {
       const logActivity = async () => {
          const storedUid = localStorage.getItem('mui_user_id');
          const timestamp = new Date().toISOString();
          const payload: any = {
             lastActive: timestamp,
             platform: navigator.platform || 'Unknown',
             userAgent: navigator.userAgent,
             location: locationName
          };
          if (userCoords) {
             payload.latitude = userCoords.lat;
             payload.longitude = userCoords.lng;
          }
          try {
             if (storedUid) {
                await update(ref(db, `users/${storedUid}`), payload);
             } else {
                const newUserRef = push(ref(db, 'users'));
                const uid = newUserRef.key;
                if (uid) {
                   await set(newUserRef, { ...payload, id: uid, joinedAt: timestamp, name: "Guest User", phoneNumber: "-" });
                   localStorage.setItem('mui_user_id', uid);
                }
             }
          } catch (e) {}
       };
       logActivity();
    }
  }, [isAdminMode, showSplash, locationName, userCoords]);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);
    const handleBeforeInstallPrompt = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (!isStandalone && !sessionStorage.getItem('pwa_install_dismissed') && !isAdminMode && !showSplash) {
       const timer = setTimeout(() => setIsInstallModalOpen(true), 5000);
       return () => clearTimeout(timer);
    }
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [isAdminMode, showSplash]);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') { setDeferredPrompt(null); setIsInstallModalOpen(false); }
    } else if (isIOS) setIsInstallModalOpen(true);
    else alert("Gunakan menu browser untuk Install.");
  };

  useEffect(() => {
    if (!db || isAdminMode) return;
    const userId = localStorage.getItem('mui_user_id');
    const broadcastsRef = ref(db, 'notifications');
    const unsubscribe = onChildAdded(query(broadcastsRef, limitToLast(1)), (snapshot) => {
      const data = snapshot.val();
      const firebaseKey = snapshot.key;
      if (data && firebaseKey && userId) {
        if (data.id > appLaunchTimeRef.current) {
          update(ref(db, `notifications/${firebaseKey}/receipts`), { [userId]: new Date().toISOString() });
          sendNotification(data.title, data.desc, true);
          const newNotifItem: NotificationItem = {
            id: data.id, type: 'news', title: data.title, desc: data.desc,
            time: data.time || new Date().toLocaleTimeString('id-ID'), read: false 
          };
          setNotifications(prev => {
            const updated = [newNotifItem, ...prev].sort((a,b) => b.id - a.id).slice(0, 50);
            localStorage.setItem('mui_notifications_local', JSON.stringify(updated));
            return updated;
          });
        }
      }
    });
    return () => unsubscribe();
  }, [isAdminMode]);

  const sendNotification = useCallback((title: string, body: string, isFromAdmin = false) => {
    try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {}); } catch (e) {}
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body: body, icon: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Logo-MUI-Jakarta.png", vibrate: [200, 100, 200], requireInteraction: true } as any);
    }
  }, []);

  const checkPrayerNotifications = useCallback(() => {
    if (!prayerSchedule) return;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const prayerTimesList = [
      { name: 'Subuh', time: prayerSchedule.subuh },
      { name: 'Dzuhur', time: prayerSchedule.dzuhur },
      { name: 'Ashar', time: prayerSchedule.ashar },
      { name: 'Maghrib', time: prayerSchedule.maghrib },
      { name: 'Isya', time: prayerSchedule.isya }
    ];
    prayerTimesList.forEach(prayer => {
      const [pHour, pMinute] = prayer.time.split(':').map(Number);
      if (currentHour === pHour && currentMinute === pMinute) {
         const key = `${prayer.name}-now-${now.getDate()}`;
         if (!sentNotificationsRef.current.has(key)) {
            sendNotification(`Waktu ${prayer.name} Tiba`, `Selamat menunaikan ibadah sholat ${prayer.name}.`);
            sentNotificationsRef.current.add(key);
         }
      }
    });
  }, [prayerSchedule, sendNotification]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if(!isAdminMode) checkPrayerNotifications();
    }, 1000);
    return () => clearInterval(timer);
  }, [checkPrayerNotifications, isAdminMode]);

  const fetchHomeNews = useCallback(async (page: number) => {
    setNewsLoading(true);
    try {
      const response = await fetch(`https://muijakarta.or.id/wp-json/wp/v2/posts?_embed&per_page=5&page=${page}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        const formatted: NewsDetailData[] = data.map((item: any) => ({
            id: item.id,
            title: item.title.rendered.replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"'),
            date: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            url: item.link, 
            content: item.content.rendered, 
            imageUrl: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || "https://muijakarta.or.id/wp-content/uploads/2023/11/WhatsApp-Image-2023-11-20-at-10.45.28-1024x683.jpeg", 
            author: item._embedded?.['author']?.[0]?.name || "Admin",
            category: (item._embedded?.['wp:term']?.[0]?.[0]?.name || "BERITA").toUpperCase()
        }));
        setHomeNews(formatted);
      }
    } catch (err) {} finally { setNewsLoading(false); }
  }, []);

  useEffect(() => {
    if (!showSplash && !isAdminMode) {
      fetchHomeNews(1);
      setDailyQuote(ISLAMIC_QUOTES[Math.floor(Math.random() * ISLAMIC_QUOTES.length)]);
    }
  }, [showSplash, fetchHomeNews, isAdminMode]);

  const fetchPrayerTimesByCoords = useCallback(async (lat: number, lng: number, city: string) => {
    try {
      const response = await fetch(`https://api.aladhan.com/v1/timings/${Math.floor(Date.now()/1000)}?latitude=${lat}&longitude=${lng}&method=20`);
      const data = await response.json();
      if (data.code === 200) {
        setPrayerSchedule({
          subuh: data.data.timings.Fajr, terbit: data.data.timings.Sunrise, dzuhur: data.data.timings.Dhuhr,
          ashar: data.data.timings.Asr, maghrib: data.data.timings.Maghrib, isya: data.data.timings.Isha,
          tanggal: data.data.date.readable, lokasi: city
        });
      }
    } catch (err) {}
  }, []);

  useEffect(() => {
    if(isAdminMode) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setUserCoords({ lat: latitude, lng: longitude });
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
        const data = await res.json();
        const city = data.address.city || data.address.town || "Jakarta Pusat";
        setLocationName(city);
        fetchPrayerTimesByCoords(latitude, longitude, city);
      } catch (err) { setLocationName("Jakarta Pusat"); fetchPrayerTimesByCoords(-6.2088, 106.8456, "Jakarta Pusat"); }
    }, () => { setLocationName("Jakarta Pusat"); fetchPrayerTimesByCoords(-6.2088, 106.8456, "Jakarta Pusat"); });
  }, [fetchPrayerTimesByCoords, isAdminMode]);

  const daysToRamadan = useMemo(() => {
    const today = new Date();
    let target = new Date(2025, 2, 1); 
    if (today > target) target = new Date(2026, 1, 18);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, []);

  const nextPrayer = useMemo(() => {
    if (!prayerSchedule) return { name: 'Memuat...', time: '--:--' };
    const now = new Date();
    const curMin = now.getHours() * 60 + now.getMinutes();
    const list = [
      { name: 'Subuh', time: prayerSchedule.subuh, min: parseInt(prayerSchedule.subuh.split(':')[0])*60 + parseInt(prayerSchedule.subuh.split(':')[1]) },
      { name: 'Terbit', time: prayerSchedule.terbit, min: parseInt(prayerSchedule.terbit.split(':')[0])*60 + parseInt(prayerSchedule.terbit.split(':')[1]) },
      { name: 'Dzuhur', time: prayerSchedule.dzuhur, min: parseInt(prayerSchedule.dzuhur.split(':')[0])*60 + parseInt(prayerSchedule.dzuhur.split(':')[1]) },
      { name: 'Ashar', time: prayerSchedule.ashar, min: parseInt(prayerSchedule.ashar.split(':')[0])*60 + parseInt(prayerSchedule.ashar.split(':')[1]) },
      { name: 'Maghrib', time: prayerSchedule.maghrib, min: parseInt(prayerSchedule.maghrib.split(':')[0])*60 + parseInt(prayerSchedule.maghrib.split(':')[1]) },
      { name: 'Isya', time: prayerSchedule.isya, min: parseInt(prayerSchedule.isya.split(':')[0])*60 + parseInt(prayerSchedule.isya.split(':')[1]) },
    ];
    return list.find(p => p.min > curMin) || { name: 'Subuh', time: prayerSchedule.subuh }; 
  }, [prayerSchedule, currentTime]);

  const countdown = useMemo(() => {
    if (!prayerSchedule) return "00:00:00";
    const [h, m] = nextPrayer.time.split(':').map(Number);
    const target = new Date(currentTime); target.setHours(h, m, 0, 0);
    if (target < currentTime) target.setDate(target.getDate() + 1);
    const diff = target.getTime() - currentTime.getTime();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(Math.floor(diff / 3600000))}:${pad(Math.floor((diff % 3600000) / 60000))}:${pad(Math.floor((diff % 60000) / 1000))}`;
  }, [nextPrayer, prayerSchedule, currentTime]);

  useEffect(() => { setTimeout(() => setShowSplash(false), 2000); }, []);

  const handleQuickNavigation = (menuId: string) => {
    if (menuId === 'halal') setIsHalalOpen(true);
    else if (menuId === 'lainnya') setIsMenuOpen(true);
    else if (menuId === 'jadwal') setIsPrayerPageOpen(true);
    else if (menuId === 'quran') setIsQuranOpen(true);
    else if (menuId === 'hadits') setIsHaditsOpen(true);
    else if (menuId === 'kiblat') setIsKiblatOpen(true);
    else if (menuId === 'fatwa') setIsFatwaOpen(true);
    else if (menuId === 'berita') setIsNewsOpen(true);
    else if (menuId === 'calendar') setIsCalendarOpen(true);
    else if (menuId === 'install') handleInstallApp();
  };

  const closeAllPages = () => {
    setIsQuranOpen(false); setIsFatwaOpen(false); setIsPrayerPageOpen(false);
    setIsHaditsOpen(false); setIsKiblatOpen(false); setIsHalalOpen(false);
    setIsNewsOpen(false); setIsMosqueOpen(false); setIsCalendarOpen(false);
    setIsMenuOpen(false); setIsVideoOpen(false); setIsProfileOpen(false);
  };

  if (isAdminMode) {
    if (!isAdminAuthenticated) return <AdminLogin onLogin={handleAdminLogin} />;
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }
  if (showSplash) return <SplashScreen />;

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] relative overflow-x-hidden">
      <div className="absolute top-0 left-0 right-0 h-[360px] islamic-bg z-0"><div className="absolute inset-0 bg-gradient-to-b from-black/50 via-teal-900/60 to-[#f8fafc]"></div></div>
      <div className="relative z-10 pt-14 flex flex-col items-center">
        <div className="w-full px-6 flex justify-between items-start mb-0 relative z-20 pt-2">
          <button onClick={() => setIsSearchOpen(true)} className="bg-white/10 p-2.5 rounded-2xl text-white backdrop-blur-md border border-white/10 shadow-lg active:scale-95 transition-transform"><Search size={22} /></button>
          <div className="flex flex-col items-center mt-1.5"><div className="flex items-center space-x-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10"><MapPin size={10} className="text-red-400 fill-red-400" /><span className="text-[10px] font-bold text-white tracking-wide truncate max-w-[120px]">{locationName}</span></div></div>
          <button onClick={() => setIsNotifOpen(true)} className="bg-white/10 p-2.5 rounded-2xl text-white backdrop-blur-md relative border border-white/10 shadow-lg active:scale-95 transition-transform"><Bell size={22} />{notifications.filter(n=>!n.read).length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white animate-pulse"></span>}</button>
        </div>
        <div className="w-full flex flex-col items-center pb-6 pt-0 px-6 relative z-20">
          <div className="mb-2"><div className="w-20 h-20 bg-white rounded-full p-1 shadow-2xl flex items-center justify-center border border-white overflow-hidden"><img src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Logo-MUI-Jakarta.png" alt="MUI" className="w-full h-full object-contain" /></div></div>
          <div className="text-center mb-2"><h2 className="text-3xl font-black text-white tracking-tighter drop-shadow-lg uppercase">{nextPrayer.name}' {nextPrayer.time} <span className="text-sm font-bold opacity-70">WIB</span></h2></div>
          <div className="text-sm font-bold text-white/90 mb-3 bg-black/30 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/5 flex items-center shadow-lg"><span className="mr-2 text-orange-400 font-black">-</span> {countdown}</div>
          <div className="text-[10px] font-black text-gray-900 tracking-wider bg-white/40 backdrop-blur-md px-6 py-2.5 rounded-full uppercase border border-white/20 shadow-xl flex items-center justify-center whitespace-nowrap overflow-hidden">
            <span>{currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="opacity-60 font-bold mx-2 text-[12px]">|</span>
            <span>{new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(currentTime).replace(/AH|H/gi, '').trim()} H</span>
          </div>
        </div>
      </div>

      {/* Main Home Content */}
      <div className="bg-[#f8fafc] rounded-t-[40px] px-5 pt-8 -mt-6 relative z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] pb-40">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-x-3 gap-y-8 pb-8">{QUICK_MENUS.map((menu) => (<button key={menu.id} onClick={() => handleQuickNavigation(menu.id)} className="flex flex-col items-center group active:scale-95 transition-all duration-200"><div className={`w-[62px] h-[62px] rounded-2xl flex items-center justify-center ${menu.color} shadow-sm border border-gray-100/30 mb-2 group-hover:shadow-md transition-shadow`}>{menu.icon}</div><span className="text-[10px] font-bold text-gray-500 text-center leading-tight tracking-tight uppercase px-1">{menu.label}</span></button>))}</div>
        <div className="bg-gradient-to-br from-[#00a896] to-emerald-700 rounded-[32px] p-6 shadow-xl shadow-teal-900/10 mb-6 relative overflow-hidden group"><div className="relative z-10 flex items-center justify-between"><div className="flex flex-col"><div className="flex items-center space-x-2 mb-1"><span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">1446 H</span></div><h3 className="text-white text-lg font-medium leading-tight mb-2">Menuju Bulan Suci <br/><span className="font-black text-2xl">Ramadhan</span></h3><div className="flex items-baseline space-x-1.5 mt-1"><span className="text-4xl font-black text-white tracking-tighter drop-shadow-sm">{daysToRamadan}</span><span className="text-sm font-bold text-teal-100">Hari Lagi</span></div></div><div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/10 shadow-lg relative shrink-0"><img src="https://m.muijakarta.or.id/img/puasa.png" alt="Ramadhan" className="w-16 h-16 object-contain drop-shadow-md relative z-10" /></div></div></div>
        <div onClick={() => { if (dailyQuote) { navigator.clipboard.writeText(`"${dailyQuote.content}"\n\n(${dailyQuote.source})\n\nVia Aplikasi MUI Jakarta`); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); } }} className="bg-white rounded-[32px] p-6 shadow-xl shadow-teal-900/5 mb-4 flex flex-col items-center relative overflow-hidden cursor-pointer group hover:shadow-2xl transition-all active:scale-[0.98]"><div className="w-full flex justify-between items-center mb-4 relative z-10"><div className="flex items-center space-x-2"><div className="h-6 w-1 bg-orange-500 rounded-full"></div><h3 className="font-bold text-gray-800 text-lg leading-none">Quote Hari Ini</h3></div><div className={`p-2 rounded-full transition-colors ${isCopied ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-gray-400'}`}>{isCopied ? <CheckCheck size={16} /> : <Copy size={16} />}</div></div><p className="text-base text-gray-700 font-medium italic leading-relaxed text-center relative z-10">"{dailyQuote?.content}"</p><div className="mt-4 inline-block relative z-10"><span className="text-[10px] font-black text-[#00a896] uppercase tracking-widest bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">{dailyQuote?.source}</span></div></div>
        <div className="pb-10"><div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black text-gray-800 border-l-4 border-[#00a896] pl-3">Info Terkini</h2><button onClick={() => setIsNewsOpen(true)} className="text-[#00a896] text-xs font-bold flex items-center active:opacity-70">Lihat Semua <ArrowRight size={14} className="ml-1" /></button></div>
          <div className="space-y-4">
            {newsLoading && homeNews.length === 0 ? <div className="flex flex-col items-center py-12 bg-white rounded-[32px] border border-gray-100"><Loader2 className="animate-spin text-[#00a896] mb-2" size={24} /><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Memuat Berita...</p></div> : 
              homeNews.map((item) => (<div key={item.id} onClick={() => { setSelectedNews(item); setIsNewsDetailOpen(true); }} className="flex flex-col bg-white p-3 rounded-[24px] border border-gray-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer overflow-hidden"><div className="w-full h-40 rounded-[16px] overflow-hidden mb-3 relative bg-gray-100"><img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /></div><h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 px-1 mb-1" dangerouslySetInnerHTML={{ __html: item.title }} /></div>))
            }
          </div>
        </div>
      </div>

      {/* FLOATING NAVIGATION BAR - OPTIMIZED GRID LAYOUT */}
      <div className="fixed bottom-0 left-0 right-0 z-[200] px-4 pb-[env(safe-area-inset-bottom,20px)]">
        <nav className="max-w-md mx-auto bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-[0_-15px_40px_rgba(0,0,0,0.08)] grid grid-cols-5 items-center h-[76px] px-1 rounded-[32px] mb-4 relative">
          
          {/* Ikon Video */}
          <button onClick={() => setIsVideoOpen(true)} className="flex flex-col items-center justify-center h-full group">
            <div className="p-1 rounded-xl transition-all group-active:scale-90">
              <img src="https://m.muijakarta.or.id/img/video.png" alt="Video" className="w-6 h-6 object-contain opacity-60 group-hover:opacity-100" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wide text-gray-400 mt-0.5">Video</span>
          </button>
          
          {/* Ikon Fatwa */}
          <button onClick={() => setIsFatwaOpen(true)} className="flex flex-col items-center justify-center h-full group text-gray-400">
            <div className="p-1 rounded-xl transition-all group-active:scale-90">
              <FileText size={22} className="opacity-60 group-hover:opacity-100" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wide opacity-80 mt-0.5">Fatwa</span>
          </button>

          {/* Kolom Tengah (Beranda & Versi) */}
          <div className="relative flex flex-col items-center justify-center h-full">
            <div className="absolute -top-10 w-16 h-16 bg-[#f8fafc] rounded-full flex items-center justify-center border-none">
              <button 
                onClick={closeAllPages} 
                className="w-14 h-14 bg-[#00a896] rounded-full flex items-center justify-center text-white shadow-lg shadow-teal-500/40 border-4 border-white active:scale-90 transition-transform"
              >
                <Home size={26} fill="white" />
              </button>
            </div>
            <div className="mt-8 flex flex-col items-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#00a896]">Beranda</span>
              <span className="text-[7px] font-medium text-gray-400 leading-none">V {appVersion}</span>
            </div>
          </div>

          {/* Ikon Kalender */}
          <button onClick={() => setIsCalendarOpen(true)} className="flex flex-col items-center justify-center h-full group text-gray-400">
            <div className="p-1 rounded-xl transition-all group-active:scale-90">
              <CalendarIcon size={22} className="opacity-60 group-hover:opacity-100" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wide opacity-80 mt-0.5">Kalender</span>
          </button>
          
          {/* Ikon Profil */}
          <button onClick={() => setIsProfileOpen(true)} className="flex flex-col items-center justify-center h-full group text-gray-400">
            <div className="p-1 rounded-xl transition-all group-active:scale-90">
              <User size={22} className="opacity-60 group-hover:opacity-100" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wide opacity-80 mt-0.5">Profil</span>
          </button>
        </nav>
      </div>

      <InstallPwaModal isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} onInstall={handleInstallApp} isIOS={isIOS} />
      <PermissionModal isOpen={isPermissionModalOpen} onClose={() => setIsPermissionModalOpen(false)} onPermissionsGranted={() => setIsPermissionModalOpen(false)} />
      <FullMenuModal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={handleQuickNavigation} />
      <PrayerPage isOpen={isPrayerPageOpen} onClose={() => setIsPrayerPageOpen(false)} schedule={prayerSchedule} location={locationName} nextPrayer={nextPrayer} />
      <QuranPage isOpen={isQuranOpen} onClose={() => setIsQuranOpen(false)} />
      <VideoPage isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
      <HaditsPage isOpen={isHaditsOpen} onClose={() => setIsHaditsOpen(false)} />
      <KiblatPage isOpen={isKiblatOpen} onClose={() => setIsKiblatOpen(false)} locationName={locationName} />
      <HalalPage isOpen={isHalalOpen} onClose={() => setIsHalalOpen(false)} />
      <FatwaPage isOpen={isFatwaOpen} onClose={() => setIsFatwaOpen(false)} />
      <NewsPage isOpen={isNewsOpen} onClose={() => setIsNewsOpen(false)} />
      <MosquePage isOpen={isMosqueOpen} onClose={() => setIsMosqueOpen(false)} />
      <CalendarPage isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
      <NewsDetailModal isOpen={isNewsDetailOpen} onClose={() => setIsNewsDetailOpen(false)} news={selectedNews} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={handleQuickNavigation} />
      <NotificationModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} notifications={notifications} onRemove={(id) => { const updated = notifications.filter(n=>n.id!==id); setNotifications(updated); localStorage.setItem('mui_notifications_local', JSON.stringify(updated)); }} onMarkAllRead={() => { const updated = notifications.map(n=>({...n,read:true})); setNotifications(updated); localStorage.setItem('mui_notifications_local', JSON.stringify(updated)); }} />
      <InfoModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} title="Profil Pengguna" message="Fitur Profil dan akun pengguna saat ini masih dalam tahap pengembangan." />
    </div>
  );
};

export default App;
