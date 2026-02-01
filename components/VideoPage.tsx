import React from 'react';
import { ArrowLeft, ExternalLink, Play, Instagram } from 'lucide-react';

interface VideoPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoPage: React.FC<VideoPageProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const instagramUrl = "https://www.instagram.com/gusfaizsm/reels/";

  // Data Dummy untuk simulasi tampilan galeri video
  const mockVideos = [
    { id: 1, title: "Kajian Kitab Hikam", views: "1.2K", duration: "1:30" },
    { id: 2, title: "Nasihat Kehidupan", views: "3.5K", duration: "0:59" },
    { id: 3, title: "Keutamaan Sholat", views: "890", duration: "1:15" },
    { id: 4, title: "Tanya Jawab Fiqih", views: "2.1K", duration: "2:00" },
    { id: 5, title: "Kisah Para Sahabat", views: "5.4K", duration: "1:45" },
    { id: 6, title: "Amalan Harian", views: "1.8K", duration: "0:45" },
  ];

  return (
    <div className="fixed inset-0 z-[160] flex justify-center">
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
        <div className="relative z-10 flex items-center justify-between">
          <button 
            onClick={onClose} 
            className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md text-white active:scale-90 transition-transform"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-white tracking-tight">Video Kajian</h2>
            <span className="text-[10px] font-black text-[#5eead4] uppercase tracking-[0.2em]">Gus Faiz Syukron Makmun</span>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="px-5 py-6 overflow-y-auto pb-20">
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex items-center space-x-4 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 opacity-10 rounded-bl-[50px]"></div>
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden">
                   <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      <Instagram size={24} />
                   </div>
                </div>
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">@gusfaizsm</h3>
                <p className="text-xs text-gray-500">Kumpulan Video Reels & Kajian Singkat</p>
                <a 
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center mt-2 text-[10px] font-black text-white bg-[#00a896] px-3 py-1.5 rounded-full uppercase tracking-wide hover:bg-teal-700 transition-colors"
                >
                    Buka Instagram <ExternalLink size={10} className="ml-1" />
                </a>
            </div>
        </div>

        {/* Video Grid */}
        <h3 className="font-bold text-gray-800 mb-4 border-l-4 border-[#00a896] pl-3">Reels Terbaru</h3>
        
        <div className="grid grid-cols-2 gap-4">
            {mockVideos.map((video) => (
                <a 
                   key={video.id}
                   href={instagramUrl}
                   target="_blank"
                   rel="noreferrer"
                   className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative aspect-[9/16] active:scale-95 transition-transform"
                >
                   {/* Thumbnail Placeholder */}
                   <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                       <div className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/c/c0/Logo-MUI-Jakarta.png')] bg-center bg-no-repeat bg-contain transform scale-50 grayscale group-hover:grayscale-0 transition-all"></div>
                       <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/30 z-10 group-hover:scale-110 transition-transform">
                           <Play size={20} fill="currentColor" />
                       </div>
                   </div>
                   
                   {/* Info Overlay */}
                   <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent pt-10">
                       <p className="text-white text-xs font-bold line-clamp-2 leading-tight mb-1">{video.title}</p>
                       <div className="flex items-center justify-between text-[9px] text-white/80">
                           <span>{video.views} Views</span>
                           <span>{video.duration}</span>
                       </div>
                   </div>
                </a>
            ))}
        </div>
      </div>

      {/* Floating CTA */}
      <div className="absolute bottom-6 left-6 right-6 z-[170]">
            <a 
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-pink-200 flex items-center justify-center active:scale-95 transition-transform"
            >
            <Instagram size={20} className="mr-2" />
            Tonton Selengkapnya
            </a>
      </div>
      </div>
    </div>
  );
};

export default VideoPage;