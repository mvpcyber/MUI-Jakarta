
import React, { useState, useEffect } from 'react';
import { Download, X, ShieldCheck, Share } from 'lucide-react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  isIOS: boolean;
}

const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose, onInstall, isIOS }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 animate-in fade-in duration-500">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Centered Modal Content */}
      <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 transform transition-all">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-[100px] -mr-6 -mt-6 pointer-events-none opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-50 rounded-tr-[80px] -ml-6 -mb-6 pointer-events-none opacity-60"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100 z-20 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center relative z-10 pt-2">
          <div className="w-20 h-20 bg-white rounded-[24px] shadow-lg border-2 border-teal-50 flex items-center justify-center p-2 mb-4">
             <img src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Logo-MUI-Jakarta.png" alt="MUI Logo" className="w-full h-full object-contain" />
          </div>

          <span className="text-[11px] font-bold text-[#00a896] uppercase tracking-widest mb-3 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
             Assalamualaikum
          </span>

          <h3 className="text-xl font-black text-gray-800 leading-tight mb-3">
            Install Aplikasi MUI Jakarta
          </h3>
          
          <p className="text-sm text-gray-500 leading-relaxed mb-6 px-2">
            Pasang aplikasi di layar utama HP Anda untuk akses cepat jadwal sholat, fatwa, dan layanan umat tanpa membuka browser.
          </p>

          {isIOS ? (
            <div className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs text-gray-600 leading-relaxed text-left mb-2">
               <div className="flex items-start space-x-3 mb-3">
                   <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <Share size={14} />
                   </div>
                   <span className="mt-1">Tap tombol <span className="font-bold">Share</span> di browser Safari (bawah tengah).</span>
               </div>
               <div className="flex items-start space-x-3">
                   <div className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] border border-gray-300">
                      +
                   </div>
                   <span className="mt-1">Scroll ke bawah dan pilih menu <span className="font-bold">"Add to Home Screen"</span> (Tambah ke Utama).</span>
               </div>
            </div>
          ) : (
            <div className="w-full space-y-3">
                <button 
                    onClick={onInstall}
                    className="w-full bg-[#00a896] text-white py-3.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-teal-200 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                    <Download size={18} />
                    <span>Install Sekarang</span>
                </button>
            </div>
          )}
          
          <button 
              onClick={onClose}
              className="mt-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
              Nanti Saja
          </button>

          <div className="mt-4 flex justify-center items-center space-x-1.5 opacity-80">
              <ShieldCheck size={12} className="text-teal-600" />
              <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wide">Aplikasi Resmi & Aman</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPwaModal;
