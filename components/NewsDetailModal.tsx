
import React, { useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, Share2, User } from 'lucide-react';

export interface NewsDetailData {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  date: string;
  category: string;
  author?: string;
  url: string; // Original URL for sharing
}

interface NewsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  news: NewsDetailData | null;
}

const NewsDetailModal: React.FC<NewsDetailModalProps> = ({ isOpen, onClose, news }) => {
  // Ref untuk container konten agar bisa memanipulasi DOM di dalamnya
  const contentRef = useRef<HTMLDivElement>(null);

  // Effect untuk menyembunyikan gambar yang error/broken ATAU placeholder
  useEffect(() => {
    if (isOpen && news && contentRef.current) {
      const images = contentRef.current.querySelectorAll('img');
      
      // Placeholder spesifik yang menyebabkan blank space
      const PLACEHOLDER_GIF = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

      const hideElement = (img: HTMLImageElement) => {
        // Sembunyikan gambar
        img.style.display = 'none';
        
        // Cek parent
        const parent = img.parentElement;
        if (parent) {
           const parentTag = parent.tagName.toLowerCase();
           
           // Jika parent adalah figure, sembunyikan total
           if (parentTag === 'figure') {
             parent.style.display = 'none';
           }
           // Jika parent adalah P dan teksnya kosong (hanya berisi gambar tadi), sembunyikan
           else if (parentTag === 'p' && parent.textContent?.trim() === '') {
             parent.style.display = 'none';
           }
           // Jika parent adalah div wrapper gambar (biasa di WP)
           else if (parent.classList.contains('wp-caption') || parentTag === 'div') {
             // Cek jika div hanya berisi gambar ini
             if (parent.textContent?.trim() === '') {
                 parent.style.display = 'none';
             }
           }
        }
      };

      const handleError = (e: Event) => hideElement(e.target as HTMLImageElement);

      images.forEach(img => {
        // Cek 1: Apakah src adalah placeholder base64?
        if (img.src === PLACEHOLDER_GIF || img.src.includes("R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==")) {
            hideElement(img);
            return; // Stop processing this image
        }

        // Cek 2: Pasang listener untuk gambar error (broken link)
        img.addEventListener('error', handleError);
        
        // Cek 3: Cek manual jika gambar sudah selesai load tapi width 0 atau sangat kecil (1px)
        if (img.complete && (img.naturalWidth === 0 || (img.naturalWidth === 1 && img.naturalHeight === 1))) {
           hideElement(img);
        }
      });

      return () => {
        images.forEach(img => img.removeEventListener('error', handleError));
      };
    }
  }, [isOpen, news]);

  if (!isOpen || !news) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
          text: "Baca berita ini di Aplikasi MUI Jakarta",
          url: news.url
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      // Fallback copy to clipboard
      navigator.clipboard.writeText(news.url);
      alert("Link berita disalin ke clipboard!");
    }
  };

  // Fungsi membersihkan konten dari paragraf kosong dan elemen mengganggu
  const cleanContent = (html: string) => {
    if (!html) return "";
    
    let cleaned = html;

    // 1. Hapus tag IMG yang src-nya adalah placeholder secara spesifik via String replace (Backup layer)
    cleaned = cleaned.replace(/<img[^>]*src=["']data:image\/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==["'][^>]*>/gi, "");

    // 2. Hapus tag <p> yang kosong, hanya spasi, &nbsp;, atau <br>
    cleaned = cleaned.replace(/<p[^>]*>(?:\s|&nbsp;|&#160;|<br\s*\/?>)*<\/p>/gi, "");

    // 3. Hapus multiple <br> yang berurutan
    cleaned = cleaned.replace(/(<br\s*\/?>\s*){2,}/gi, "<br/>");
    
    // 4. Hapus figure kosong (jika ada sisa dari backend)
    cleaned = cleaned.replace(/<figure[^>]*>\s*<\/figure>/gi, "");

    return cleaned;
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header - New Style */}
      <div 
        className="pt-12 pb-6 px-6 relative overflow-hidden shadow-lg bg-[#00a896] shrink-0"
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
            <h2 className="text-lg font-bold text-white tracking-tight">Detail Berita</h2>
            <span className="text-[10px] font-black text-[#5eead4] uppercase tracking-widest">
                {news.category}
            </span>
          </div>
          <button 
            onClick={handleShare}
            className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md text-white active:scale-90 transition-transform"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        {/* Featured Image */}
        {news.imageUrl && (
            <div className="w-full h-64 relative">
                <img 
                    src={news.imageUrl} 
                    alt={news.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Hide featured image if broken
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
        )}

        <div className={`px-6 py-6 relative bg-white ${news.imageUrl ? '-mt-6 rounded-t-[32px]' : ''}`}>
            {/* Meta Data */}
            <div className="flex items-center space-x-4 text-gray-400 text-xs font-bold mb-4">
                <div className="flex items-center">
                    <Calendar size={14} className="mr-1.5" />
                    {news.date}
                </div>
                {news.author && (
                    <div className="flex items-center">
                        <User size={14} className="mr-1.5" />
                        {news.author}
                    </div>
                )}
            </div>

            {/* Title */}
            <h1 
                className="text-2xl font-black text-gray-800 leading-tight mb-6"
                dangerouslySetInnerHTML={{ __html: news.title }} 
            />

            {/* Content Body */}
            <div 
                ref={contentRef}
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed 
                [&_p]:mb-3
                [&_p:empty]:hidden
                [&_a]:text-[#00a896] [&_a]:underline [&_a]:font-bold
                [&_img]:rounded-xl [&_img]:w-full [&_img]:h-auto [&_img]:shadow-sm [&_img]:my-4 
                [&_figure]:m-0 [&_figure]:w-full [&_figure]:my-4
                [&_iframe]:w-full [&_iframe]:max-w-full [&_iframe]:rounded-xl [&_iframe]:shadow-sm [&_iframe]:my-4
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4
                [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-gray-900
                [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-gray-900
                [&_blockquote]:border-l-4 [&_blockquote]:border-teal-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:bg-gray-50 [&_blockquote]:p-4 [&_blockquote]:rounded-r-lg [&_blockquote]:mb-4"
                dangerouslySetInnerHTML={{ __html: cleanContent(news.content) }}
            />
            
            <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-400">Copyright © Majelis Ulama Indonesia DKI Jakarta</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailModal;
