
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
  { id: 'quran', label: 'Al-Quran', icon: <BookOpen className="text-teal-600" />, color: 'bg-teal-50' },
  { id: 'hadits', label: 'Hadits', icon: <Library className="text-orange-600" />, color: 'bg-orange-50' },
  { id: 'jadwal', label: 'Jadwal Shalat', icon: <Clock className="text-blue-500" />, color: 'bg-blue-50' },
  { id: 'kiblat', label: 'Kiblat', icon: <Compass className="text-emerald-700" />, color: 'bg-emerald-50' },
  { id: 'fatwa', label: 'Fatwa', icon: <ScrollText className="text-indigo-600" />, color: 'bg-indigo-50' },
  { id: 'berita', label: 'Berita', icon: <Newspaper className="text-red-500" />, color: 'bg-red-50' },
  { id: 'zakat', label: 'Zakat & Donasi', icon: <Calculator className="text-pink-500" />, color: 'bg-pink-50' },
  { id: 'halal', label: 'Halal', icon: <ShieldCheck className="text-emerald-600" />, color: 'bg-emerald-50' },
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
