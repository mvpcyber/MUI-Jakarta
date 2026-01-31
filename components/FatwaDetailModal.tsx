
import React from 'react';
import { ArrowLeft, Calendar, FileText, Download, Share2 } from 'lucide-react';

export interface FatwaDetailData {
  id: number;
  title: string;
  nomor: string;
  tahun: string;
  tentang: string;
  content?: string; // HTML Content
  url: string; // Original URL for PDF download if needed
  date_formatted: string;
}

interface FatwaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  fatwa: FatwaDetailData | null;
}

const FatwaDetailModal: React.FC<FatwaDetailModalProps> = ({ isOpen, onClose, fatwa }) => {
  if (!isOpen || !fatwa) return null;

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
            <h2 className="text-lg font-bold text-white tracking-tight">Detail Fatwa</h2>
            <span className="text-[10px] font-black text-[#5eead4] uppercase tracking-widest">
                Majelis Ulama Indonesia
            </span>
          </div>
          <button 
            className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md text-white active:scale-90 transition-transform"
            onClick={() => {
               // Fallback share
               if(navigator.share) {
                   navigator.share({ title: fatwa.title, url: fatwa.url });
               }
            }}
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white p-6">
         {/* Metadata Card */}
         <div className="bg-indigo-50 rounded-2xl p-5 mb-6 border border-indigo-100">
            <h1 className="text-xl font-black text-gray-900 leading-tight mb-4">
               {fatwa.title}
            </h1>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Nomor</p>
                  <p className="text-sm font-bold text-indigo-700">{fatwa.nomor}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Tahun</p>
                  <p className="text-sm font-bold text-indigo-700">{fatwa.tahun}</p>
               </div>
               <div className="col-span-2">
                   <p className="text-[10px] font-bold text-gray-500 uppercase">Tanggal Penetapan</p>
                   <div className="flex items-center text-gray-700 font-medium text-sm">
                      <Calendar size={14} className="mr-2 text-gray-400" />
                      {fatwa.date_formatted}
                   </div>
               </div>
            </div>
         </div>

         {/* Content Body */}
         <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed mb-8">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Tentang Fatwa</h3>
            {fatwa.content ? (
                <div 
                  className="space-y-4 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: fatwa.content }} 
                />
            ) : (
                <p>{fatwa.tentang}</p>
            )}
         </div>

         {/* Download Option if URL exists */}
         {fatwa.url && (
             <a 
               href={fatwa.url} 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center justify-center w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-sm space-x-2 active:scale-95 transition-transform"
             >
                <Download size={18} />
                <span>Unduh Dokumen Lengkap (PDF)</span>
             </a>
         )}

         <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-400">Sumber: Komisi Fatwa MUI</p>
         </div>
      </div>
    </div>
  );
};

export default FatwaDetailModal;
