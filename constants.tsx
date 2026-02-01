
import React from 'react';
import { 
  BookOpen, 
  Clock, 
  Compass, 
  Heart, 
  List, 
  Calculator, 
  BookMarked, 
  Tv, 
  Video, 
  FileText, 
  Users, 
  Calendar,
  MessageCircle,
  Mic2,
  Moon,
  Star,
  Newspaper,
  ScrollText,
  Library,
  LayoutGrid,
  ShieldCheck,
  Download
} from 'lucide-react';

export const PRIMARY_COLOR = '#00827f';

export const QUICK_MENUS = [
  { 
    id: 'quran', 
    label: 'Al-Quran', 
    icon: <img src="https://m.muijakarta.or.id/img/quran.png" alt="Al-Quran" className="w-8 h-8 object-contain" />, 
    color: 'bg-teal-50' 
  },
  { 
    id: 'hadits', 
    label: 'Hadis', 
    icon: <img src="https://m.muijakarta.or.id/img/kitab.png" alt="Hadis" className="w-8 h-8 object-contain" />, 
    color: 'bg-orange-50' 
  },
  { 
    id: 'jadwal', 
    label: 'Jadwal Shalat', 
    icon: <img src="https://m.muijakarta.or.id/img/sholat.png" alt="Jadwal Shalat" className="w-8 h-8 object-contain" />, 
    color: 'bg-blue-50' 
  },
  { 
    id: 'kiblat', 
    label: 'Kiblat', 
    icon: <img src="https://m.muijakarta.or.id/img/kiblat.png" alt="Kiblat" className="w-8 h-8 object-contain" />, 
    color: 'bg-emerald-50' 
  },
  { 
    id: 'fatwa', 
    label: 'Fatwa', 
    icon: <img src="https://m.muijakarta.or.id/img/kitab2.png" alt="Fatwa" className="w-8 h-8 object-contain" />, 
    color: 'bg-indigo-50' 
  },
  { 
    id: 'berita', 
    label: 'Berita', 
    icon: <img src="https://m.muijakarta.or.id/img/new.png" alt="Berita" className="w-8 h-8 object-contain" />, 
    color: 'bg-red-50' 
  },
  { 
    id: 'zakat', 
    label: 'Zakat & Donasi', 
    icon: <img src="https://m.muijakarta.or.id/img/donasi.png" alt="Zakat & Donasi" className="w-8 h-8 object-contain" />, 
    color: 'bg-pink-50' 
  },
  { 
    id: 'halal', 
    label: 'Halal', 
    icon: <img src="https://m.muijakarta.or.id/img/halal.png" alt="Halal" className="w-8 h-8 object-contain" />, 
    color: 'bg-emerald-50' 
  },
];

export const FULL_MENU_ITEMS = [
  { id: 'quran', label: 'Al-Quran', icon: <BookOpen />, color: 'bg-teal-50' },
  { id: 'hadits', label: 'Hadits', icon: <Library />, color: 'bg-orange-50' },
  { id: 'jadwal', label: 'Jadwal Shalat', icon: <Clock />, color: 'bg-blue-50' },
  { id: 'calendar', label: 'Kalender Hijriyah', icon: <Calendar />, color: 'bg-green-50' },
  { id: 'tahlil', label: 'Tahlil & Yasin', icon: <Users />, color: 'bg-emerald-50' },
  { id: 'wirid', label: 'Wirid & Doa', icon: <Heart />, color: 'bg-orange-50' },
  { id: 'kiblat', label: 'Kiblat', icon: <Compass />, color: 'bg-teal-50' },
  { id: 'fatwa', label: 'Fatwa', icon: <ScrollText />, color: 'bg-indigo-50' },
  { id: 'berita', label: 'Berita', icon: <Newspaper />, color: 'bg-red-50' },
  { id: 'haji', label: 'Haji & Umrah', icon: <Star />, color: 'bg-yellow-50' },
  { id: 'tutorial', label: 'Tutorial Ibadah', icon: <BookMarked />, color: 'bg-blue-50' },
  { id: 'artikel', label: 'Artikel', icon: <FileText />, color: 'bg-gray-50' },
  { id: 'kalkulator', label: 'Kalkulator Zakat', icon: <Calculator />, color: 'bg-pink-50' },
  { id: 'tasbih', label: 'Tasbih Digital', icon: <List />, color: 'bg-amber-50' },
  { id: 'tafsir', label: 'Terjemah & Tafsir', icon: <BookOpen />, color: 'bg-teal-50' },
  { id: 'nupedia', label: 'NUpedia', icon: <BookMarked />, color: 'bg-emerald-50' },
  { id: 'zakat', label: 'Zakat & Donasi', icon: <Heart />, color: 'bg-pink-50' },
  { id: 'ziarah', label: 'Ziarah', icon: <Compass />, color: 'bg-gray-50' },
  { id: 'video', label: 'Video', icon: <Video />, color: 'bg-red-50' },
  { id: 'khutbah', label: 'Khutbah', icon: <Mic2 />, color: 'bg-indigo-50' },
  { id: 'kalam', label: 'Kalam', icon: <MessageCircle />, color: 'bg-sky-50' },
  { id: 'ramadhan', label: 'Ramadhan', icon: <Moon />, color: 'bg-yellow-50' },
  { id: 'maulid', label: 'Maulid', icon: <Star />, color: 'bg-teal-50' },
  { id: 'install', label: 'Install Aplikasi', icon: <Download />, color: 'bg-teal-100 border-teal-200' },
];
