
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Loader2, 
  FileText, 
  Download,
  ChevronRight,
  ChevronLeft,
  ScrollText,
  AlertCircle
} from 'lucide-react';

interface FatwaItem {
  id: number;
  title: string;
  nomor: string;
  tahun: string;
  tentang: string;
  url: string;
  date_formatted: string;
}

interface FatwaPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const FatwaPage: React.FC<FatwaPageProps> = ({ isOpen, onClose }) => {
  const [fatwas, setFatwas] = useState<FatwaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [usingFallback, setUsingFallback] = useState(false);

  // Data Fallback (Jika API CORS Blocked)
  const fallbackFatwas: FatwaItem[] = [
    { id: 1, title: "Hukum Dukungan terhadap Perjuangan Palestina", nomor: "83", tahun: "2023", tentang: "Fatwa tentang Hukum Dukungan terhadap Perjuangan Palestina", url: "https://mui.or.id/wp-content/uploads/2023/11/Fatwa-MUI-Nomor-83-Tahun-2023-tentang-Hukum-Dukungan-terhadap-Perjuangan-Palestina.pdf", date_formatted: "08 November 2023" },
    { id: 2, title: "Hukum YouTuber, Selebgram, dan Pelaku Ekonomi Kreatif", nomor: "24", tahun: "2017", tentang: "Hukum dan Pedoman Bermuamalah Melalui Media Sosial", url: "https://mui.or.id/", date_formatted: "12 Mei 2017" },
    { id: 3, title: "Panduan Penyelenggaraan Ibadah di Bulan Ramadhan", nomor: "Kep-28", tahun: "2022", tentang: "Panduan Ibadah Ramadhan dan Idul Fitri", url: "https://mui.or.id/", date_formatted: "01 April 2022" },
    { id: 4, title: "Hukum Cryptocurrency (Uang Kripto)", nomor: "09", tahun: "2021", tentang: "Penggunaan Cryptocurrency Sebagai Mata Uang Hukumnya Haram", url: "https://mui.or.id/", date_formatted: "11 November 2021" },
    { id: 5, title: "Hukum Pinjaman Online (Pinjol)", nomor: "P-12", tahun: "2021", tentang: "Penyelenggaraan Pinjaman Online", url: "https://mui.or.id/", date_formatted: "20 Agustus 2021" },
    { id: 6, title: "Hukum Vaksin COVID-19 Produksi Sinovac", nomor: "02", tahun: "2021", tentang: "Produk Vaksin Covid-19 dari Sinovac Life Sciences Co. Ltd", url: "https://mui.or.id/", date_formatted: "11 Januari 2021" },
    { id: 7, title: "Penyelenggaraan Ibadah Saat Wabah COVID-19", nomor: "14", tahun: "2020", tentang: "Penyelenggaraan Ibadah dalam Situasi Terjadi Wabah COVID-19", url: "https://mui.or.id/", date_formatted: "16 Maret 2020" },
  ];

  const fetchFatwas = async () => {
    setLoading(true);
    setUsingFallback(false);
    try {
      // Mencoba fetch dari API MUI Pusat (mui.or.id)
      // Note: Seringkali mui.or.id memblokir akses Cross-Origin (CORS) dari domain lain.
      // Kita gunakan timeout agar tidak menunggu terlalu lama jika blocked.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("https://mui.or.id/wp-json/wp/v2/posts?search=fatwa&per_page=20", {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const formatted: FatwaItem[] = data.map((item: any) => ({
          id: item.id,
          title: item.title.rendered.replace(/&#8217;/g, "'"),
          nomor: "Info",
          tahun: new Date(item.date).getFullYear().toString(),
          tentang: item.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0, 80) + "...",
          url: item.link,
          date_formatted: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        }));
        setFatwas(formatted);
      } else {
        throw new Error("No data");
      }
    } catch (err) {
      console.warn("Gagal mengambil data Fatwa Live (CORS/Network), menggunakan data statis.", err);
      setFatwas(fallbackFatwas);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && fatwas.length === 0) {
      fetchFatwas();
    }
  }, [isOpen]);

  const pagedFatwas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return fatwas.slice(start, start + itemsPerPage);
  }, [fatwas, currentPage]);

  const totalPages = Math.ceil(fatwas.length / itemsPerPage);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] bg-[#f8fafc] flex flex-col animate-in slide-in-from-right duration-300">
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
            <h2 className="text-xl font-bold text-white tracking-tight">Kumpulan Fatwa</h2>
            <span className="text-[10px] font-black text-[#5eead4] uppercase tracking-[0.2em]">Majelis Ulama Indonesia</span>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#00a896] mb-4" size={40} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mengambil Data Fatwa...</p>
          </div>
        ) : (
          <div className="space-y-4 pb-20">
            {usingFallback && (
               <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start space-x-3 mb-4">
                  <AlertCircle size={16} className="text-orange-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-orange-700 leading-relaxed">
                    Mode Offline: Menampilkan data arsip pilihan karena server MUI Pusat sedang sibuk/tidak dapat dijangkau.
                  </p>
               </div>
            )}

            {pagedFatwas.map((item) => (
              <div key={item.id} className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm relative group hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                   <div className="bg-indigo-50 text-indigo-700 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      Fatwa {item.tahun}
                   </div>
                   <span className="text-[10px] font-bold text-gray-400">{item.date_formatted}</span>
                </div>
                
                <h3 className="text-base font-bold text-gray-800 leading-tight mb-3 group-hover:text-indigo-700 transition-colors">
                  {item.title}
                </h3>
                
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {item.tentang}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                   <a 
                     href={item.url} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="flex-1 bg-[#00a896] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center uppercase tracking-wider active:scale-95 transition-transform"
                   >
                     <FileText size={14} className="mr-2" /> Buka Detail
                   </a>
                   <button className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center active:bg-indigo-100">
                      <Download size={16} />
                   </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {fatwas.length > itemsPerPage && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                  disabled={currentPage === 1} 
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm disabled:opacity-30 active:scale-90 transition-transform text-indigo-600"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentPage(i + 1)} 
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-xs transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-400 border border-gray-200'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                  disabled={currentPage === totalPages} 
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm disabled:opacity-30 active:scale-90 transition-transform text-indigo-600"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FatwaPage;
