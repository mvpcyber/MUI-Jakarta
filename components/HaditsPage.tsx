import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Loader2, 
  Book, 
  Share2, 
  Copy, 
  CircleAlert,
  RefreshCw,
  WifiOff
} from 'lucide-react';

interface HadithBook {
  name: string;
  slug: string;
  total: number;
}

interface HadithItem {
  number: number;
  arab: string;
  id: string; // Terjemahan Indonesia
}

interface HaditsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const HaditsPage: React.FC<HaditsPageProps> = ({ isOpen, onClose }) => {
  const [selectedBook, setSelectedBook] = useState<HadithBook | null>(null);
  const [hadiths, setHadiths] = useState<HadithItem[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const staticBooks: HadithBook[] = [
    { name: "Imam Bukhari", slug: "bukhari", total: 7008 },
    { name: "Imam Muslim", slug: "muslim", total: 5362 },
    { name: "Imam Abu Daud", slug: "abu-dawud", total: 4419 },
    { name: "Imam Tirmidzi", slug: "tirmidzi", total: 3625 },
    { name: "Imam Nasai", slug: "nasai", total: 5364 },
    { name: "Imam Ibnu Majah", slug: "ibnu-majah", total: 4285 }, 
    { name: "Imam Malik", slug: "malik", total: 1594 },
    { name: "Imam Ahmad", slug: "ahmad", total: 26363 },
    { name: "Imam Darimi", slug: "darimi", total: 3367 },
  ];

  // Data dummy untuk mode offline
  const getMockHadiths = (p: number, limit: number): HadithItem[] => {
     return Array.from({ length: limit }).map((_, i) => ({
        number: (p - 1) * limit + i + 1,
        arab: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
        id: "Sesungguhnya setiap amalan tergantung pada niatnya. (Data ditampilkan dari mode offline karena server sedang sibuk/tidak dapat dijangkau)."
     }));
  };

  const fetchHadiths = async (slug: string, p: number = 1) => {
    setLoadingDetail(true);
    setError(null);
    setIsOfflineMode(false);
    
    let success = false;
    let newItems: HadithItem[] = [];

    try {
      // ---------------------------------------------------------
      // PERCOBAAN 1: API Utama (hadis-api-id.vercel.app)
      // ---------------------------------------------------------
      try {
        const response = await fetch(`https://hadis-api-id.vercel.app/hadith/${slug}?page=${p}&limit=20`);
        if (response.ok) {
          const result = await response.json();
          if (result.items && Array.isArray(result.items)) {
            newItems = result.items.map((item: any) => ({
              number: item.number,
              arab: item.arab,
              id: item.id
            }));
            success = true;
          }
        }
      } catch (err) {
        console.warn("API Utama gagal, mencoba server cadangan...", err);
      }

      // ---------------------------------------------------------
      // PERCOBAAN 2: API Cadangan (api.hadith.gading.dev)
      // ---------------------------------------------------------
      if (!success) {
        try {
          const limit = 20;
          const start = (p - 1) * limit + 1;
          const end = p * limit;
          
          const response = await fetch(`https://api.hadith.gading.dev/books/${slug}?range=${start}-${end}`);
          if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.hadiths) {
              newItems = result.data.hadiths.map((item: any) => ({
                number: item.number,
                arab: item.arab,
                id: item.id
              }));
              success = true;
            }
          }
        } catch (err) {
           console.warn("API Cadangan juga gagal.", err);
        }
      }

      // ---------------------------------------------------------
      // PERCOBAAN 3: Fallback Offline (Mock Data)
      // ---------------------------------------------------------
      if (!success) {
         console.warn("Semua server gagal. Menggunakan data offline.");
         newItems = getMockHadiths(p, 20);
         success = true;
         setIsOfflineMode(true);
      }

      // ---------------------------------------------------------
      // UPDATE STATE
      // ---------------------------------------------------------
      if (success) {
        if (p === 1) setHadiths(newItems);
        else setHadiths(prev => [...prev, ...newItems]);
      } else {
        throw new Error("Gagal mengambil data dari semua server.");
      }

    } catch (err: any) {
      console.error('Hadith Fetch Error:', err);
      setError("Maaf, terjadi kendala saat mengambil data hadits. Silakan coba lagi nanti.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBookClick = (book: HadithBook) => {
    setSelectedBook(book);
    setHadiths([]);
    setPage(1);
    fetchHadiths(book.slug, 1);
  };

  const handleBackToList = () => {
    setSelectedBook(null);
    setHadiths([]);
    setPage(1);
    setError(null);
    setIsOfflineMode(false);
  };

  const loadMore = () => {
    if (selectedBook && !loadingDetail) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHadiths(selectedBook.slug, nextPage);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Hadits berhasil disalin!');
    }
  };

  const filteredBooks = staticBooks.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160]">
      <div className="w-full h-full bg-[#f8fafc] flex flex-col animate-in slide-in-from-right duration-300 relative">
      {/* Header */}
      <div 
        className="pt-12 pb-8 px-6 relative overflow-hidden shadow-lg bg-[#00a896]"
        style={{ 
          backgroundImage: 'url(https://img.freepik.com/premium-vector/islamic-background-green-pattern_650032-387.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
        <div className="relative z-10 flex items-center justify-between mb-4">
          <button 
            onClick={selectedBook ? handleBackToList : onClose} 
            className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md text-white active:scale-90 transition-transform"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
              {selectedBook ? selectedBook.name : 'Ensiklopedia Hadits'}
            </h2>
            <div className="flex items-center justify-center mt-0.5">
               <span className="text-[10px] font-black text-[#5eead4] uppercase tracking-[0.2em]">
                 {selectedBook ? `KITAB ${selectedBook.name.toUpperCase()}` : 'Kumpulan Hadits Shahih'}
               </span>
            </div>
          </div>
          <div className="w-10"></div>
        </div>

        {!selectedBook && (
          <div className="relative z-10 mt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
              <input 
                type="text" 
                placeholder="Cari perawi (Bukhari, Ahmad...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#5eead4] backdrop-blur-md transition-all"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 bg-white">
        {selectedBook ? (
          <div className="space-y-6 pb-20">
            {/* Offline Mode Indicator */}
            {isOfflineMode && (
               <div className="flex items-center justify-between bg-orange-50 px-4 py-3 rounded-xl border border-orange-100">
                  <div className="flex items-center space-x-2">
                     <WifiOff size={16} className="text-orange-500" />
                     <p className="text-[10px] font-bold text-orange-700">Mode Offline (Server Sibuk)</p>
                  </div>
                  <button onClick={() => fetchHadiths(selectedBook.slug, page)} className="text-[10px] font-black text-orange-600 underline">Coba Lagi</button>
               </div>
            )}

            {error ? (
              <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
                  <CircleAlert className="text-red-500" size={40} strokeWidth={2} />
                </div>
                <h3 className="text-gray-800 font-bold mb-2">Gagal Memuat Data</h3>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-xs">
                  {error}
                </p>
                <button 
                  onClick={() => fetchHadiths(selectedBook.slug, page)}
                  className="px-8 py-3 bg-[#00a896] text-white rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all shadow-md hover:shadow-lg hover:bg-[#008f80] flex items-center"
                >
                  <RefreshCw size={14} className="mr-2" /> COBA LAGI
                </button>
              </div>
            ) : loadingDetail && page === 1 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#00a896] mb-4" size={40} />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Membuka Kitab...</p>
              </div>
            ) : (
              <>
                {hadiths.map((h, i) => (
                  <div key={`${h.number}-${i}`} className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-center mb-6">
                       <div className="bg-teal-50 px-4 py-1.5 rounded-full border border-teal-100">
                          <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest">No. {h.number}</span>
                       </div>
                       <div className="flex space-x-1">
                          <button 
                            onClick={() => copyToClipboard(`${h.arab}\n\nArtinya:\n${h.id}`)}
                            className="p-2.5 rounded-xl bg-gray-50 text-gray-400 active:bg-teal-50 active:text-teal-600 transition-colors"
                          >
                            <Copy size={16} />
                          </button>
                          <button className="p-2.5 rounded-xl bg-gray-50 text-gray-400"><Share2 size={16} /></button>
                       </div>
                    </div>
                    <p className="text-2xl font-arabic text-right leading-[2.2] text-gray-800 mb-6" style={{ direction: 'rtl', fontFamily: 'serif' }}>{h.arab}</p>
                    <div className="pt-5 border-t border-gray-50">
                       <p className="text-sm text-gray-700 leading-relaxed font-medium">{h.id}</p>
                    </div>
                  </div>
                ))}
                {hadiths.length > 0 && (
                  <button 
                    onClick={loadMore} 
                    disabled={loadingDetail}
                    className="w-full py-5 bg-white rounded-[24px] border-2 border-dashed border-gray-200 text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 flex items-center justify-center transition-all active:bg-gray-50"
                  >
                    {loadingDetail ? <><Loader2 size={16} className="animate-spin mr-3" /> Memuat...</> : "Tampilkan Lebih Banyak"}
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-10">
            {filteredBooks.map((book, idx) => (
              <button 
                key={idx}
                onClick={() => handleBookClick(book)}
                className="group flex flex-col items-center p-6 bg-white rounded-[28px] border border-gray-100 shadow-sm active:scale-[0.95] transition-all hover:border-[#00a896]/30 text-center relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 w-20 h-20 bg-teal-50 rounded-bl-[40px] -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                 
                 <div className="relative w-14 h-14 flex items-center justify-center mb-4">
                    <div className="absolute inset-0 bg-teal-50 rounded-[20px] group-hover:bg-[#00a896] transition-all duration-300"></div>
                    <Book className="relative text-[#00a896] group-hover:text-white transition-colors" size={24} />
                 </div>
                 
                 <h3 className="text-sm font-black text-gray-800 mb-1 leading-tight">{book.name}</h3>
                 <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-full">{book.total.toLocaleString('id-ID')} Hadits</span>
              </button>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default HaditsPage;