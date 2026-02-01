
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
  ShieldCheck
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
  { label: 'Al-Quran', icon: <BookOpen />, color: 'bg-teal-50' },
  { label: 'Hadits', icon: <Library />, color: 'bg-orange-50' },
  { label: 'Jadwal Shalat', icon: <Clock />, color: 'bg-blue-50' },
  { label: 'Kalender Hijriyah', icon: <Calendar />, color: 'bg-green-50' },
  { label: 'Tahlil & Yasin', icon: <Users />, color: 'bg-emerald-50' },
  { label: 'Wirid & Doa', icon: <Heart />, color: 'bg-orange-50' },
  { label: 'Kiblat', icon: <Compass />, color: 'bg-teal-50' },
  { label: 'Fatwa', icon: <ScrollText />, color: 'bg-indigo-50' },
  { label: 'Berita', icon: <Newspaper />, color: 'bg-red-50' },
  { label: 'Haji & Umrah', icon: <Star />, color: 'bg-yellow-50' },
  { label: 'Tutorial Ibadah', icon: <BookMarked />, color: 'bg-blue-50' },
  { label: 'Artikel', icon: <FileText />, color: 'bg-gray-50' },
  { label: 'Kalkulator Zakat', icon: <Calculator />, color: 'bg-pink-50' },
  { label: 'Tasbih Digital', icon: <List />, color: 'bg-amber-50' },
  { label: 'Terjemah & Tafsir', icon: <BookOpen />, color: 'bg-teal-50' },
  { label: 'NUpedia', icon: <BookMarked />, color: 'bg-emerald-50' },
  { label: 'Zakat & Donasi', icon: <Heart />, color: 'bg-pink-50' },
  { label: 'Ziarah', icon: <Compass />, color: 'bg-gray-50' },
  { label: 'Video', icon: <Video />, color: 'bg-red-50' },
  { label: 'Khutbah', icon: <Mic2 />, color: 'bg-indigo-50' },
  { label: 'Kalam', icon: <MessageCircle />, color: 'bg-sky-50' },
  { label: 'Ramadhan', icon: <Moon />, color: 'bg-yellow-50' },
  { label: 'Maulid', icon: <Star />, color: 'bg-teal-50' },
  { label: 'Topik', icon: <List />, color: 'bg-gray-50' },
];
