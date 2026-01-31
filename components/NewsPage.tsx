
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Loader2, 
  Calendar, 
  ChevronRight, 
  ChevronLeft,
  Newspaper,
  RefreshCw
} from 'lucide-react';
import NewsDetailModal, { NewsDetailData } from './NewsDetailModal';

interface NewsItem extends NewsDetailData {
  excerpt: string;
}

interface NewsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewsPage: React.FC<NewsPageProps> = ({ isOpen, onClose }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Detail Modal State
  const [selectedNews, setSelectedNews] = useState<NewsDetailData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Mengambil 20 berita terbaru untuk mendukung 4 halaman (5 item/halaman)
      const response = await fetch("https://muijakarta.or.id/wp-json/wp/v2/posts?_embed&per_page=20");
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const formattedNews: NewsItem[] = data.map((item: any) => {
          let img = "https://muijakarta.or.id/wp-content/uploads/2023/11/WhatsApp-Image-2023-11-20-at-10.45.28-1024x683.jpeg";
          if (item._embedded && item._embedded['wp:featuredmedia'] && item._embedded['wp:featuredmedia'][0]) {
             img = item._embedded['wp:featuredmedia'][0].source_url;
          }

          let cat = "BERITA";
          if (item._embedded && item._embedded['wp:term'] && item._embedded['wp:term'][0] && item._embedded['wp:term'][0][0]) {
            cat = item._embedded['wp:term'][0][0].name;
          }

          // Clean category name (&amp; -> Dan)
          cat = cat.replace(/&amp;/gi, 'Dan').replace(/&/g, 'Dan');

          let authorName = "Admin";
          if (item._embedded && item._embedded['author'] && item._embedded['author'][0]) {
              authorName = item._embedded['author'][0].name;
          }

          return {
            id: item.id,
            title: item.title.rendered.replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"'),
            excerpt: item.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0, 100) + "...",
            content: item.content.rendered, // Ambil Full Content
            category: cat.toUpperCase(),
            imageUrl: img,
            date: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            url: item.link,
            author: authorName
          };
        });
        setNews(formattedNews);
      }
    } catch (err) {
      console.error("News Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && news.length === 0) {
      fetchNews();
    }
  }, [isOpen]);

  const pagedNews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return news.slice(start, start + itemsPerPage);
  }, [news, currentPage]);

  const totalPages = Math.ceil(news.length / itemsPerPage);

  const handleNewsClick = (item: NewsItem) => {
      setSelectedNews(item);
      setIsDetailOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
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
            <h2 className="text-xl font-bold text-white tracking-tight">Berita Terkini</h2>
            <span className="text-[10px] font-black text-[#5eead4] uppercase tracking-[0.2em]">MUI DKI Jakarta</span>
          </div>
          <button onClick={fetchNews} className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md text-white active:scale-90 transition-transform">
             <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#00a896] mb-4" size={40} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mengambil Berita...</p>
          </div>
        ) : (
          /* Mengubah pb-20 menjadi pb-40 agar pagination naik di atas floating button */
          <div className="space-y-6 pb-40">
            {pagedNews.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleNewsClick(item)}
                className="block bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 group active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-teal-700 text-[9px] font-black px-3 py-1.5 rounded-full uppercase shadow-lg tracking-widest border border-teal-100">
                    {item.category}
                  </div>
                </div>
                <div className="p-5">
                   <div className="flex items-center text-gray-400 mb-2">
                      <Calendar size={12} className="mr-1.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{item.date}</span>
                   </div>
                   <h3 className="font-bold text-gray-800 leading-snug mb-2 line-clamp-2 text-lg group-hover:text-[#00a896] transition-colors" dangerouslySetInnerHTML={{ __html: item.title }} />
                   <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
                   
                   <div className="flex items-center text-[#00a896] text-[11px] font-black uppercase tracking-widest">
                      Baca Selengkapnya <ChevronRight size={14} className="ml-1" />
                   </div>
                </div>
              </div>
            ))}

            {news.length === 0 && (
               <div className="text-center py-10">
                 <Newspaper size={48} className="text-gray-200 mx-auto mb-4" />
                 <p className="text-gray-400 font-bold">Tidak ada berita ditemukan</p>
               </div>
            )}

            {/* Pagination */}
            {news.length > itemsPerPage && (
              <div className="flex items-center justify-center space-x-2 pt-4">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                  disabled={currentPage === 1} 
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm disabled:opacity-30 active:scale-90 transition-transform text-teal-600"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentPage(i + 1)} 
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-xs transition-all ${currentPage === i + 1 ? 'bg-[#00a896] text-white shadow-lg shadow-teal-200' : 'bg-white text-gray-400 border border-gray-200'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                  disabled={currentPage === totalPages} 
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm disabled:opacity-30 active:scale-90 transition-transform text-teal-600"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    
    <NewsDetailModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        news={selectedNews}
    />
    </>
  );
};

export default NewsPage;
