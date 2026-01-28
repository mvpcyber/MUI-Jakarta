
import React from 'react';
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

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <button 
          onClick={onClose}
          className="p-2 -ml-2 text-gray-600 active:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 text-center">
            <span className="text-xs font-black text-[#00a896] uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full">
                {news.category}
            </span>
        </div>
        <button 
          onClick={handleShare}
          className="p-2 -mr-2 text-gray-600 active:bg-gray-100 rounded-full transition-colors"
        >
          <Share2 size={20} />
        </button>
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
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
        )}

        <div className="px-6 py-6 -mt-6 relative bg-white rounded-t-[32px]">
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
            {/* Menggunakan Tailwind arbitrary values dan CSS standar untuk styling konten HTML dari WP */}
            <div 
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4 [&>p]:mb-4 [&>img]:rounded-xl [&>img]:w-full [&>img]:shadow-sm [&>ul]:list-disc [&>ul]:pl-5 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mt-6 [&>h2]:mb-2 [&>blockquote]:border-l-4 [&>blockquote]:border-teal-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:bg-gray-50 [&>blockquote]:p-2 [&>blockquote]:rounded-r-lg"
                dangerouslySetInnerHTML={{ __html: news.content }}
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
