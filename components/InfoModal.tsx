
import React from 'react';
import { Info, X, Construction } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-teal-500"></div>
        
        <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-orange-100">
          <Construction size={32} />
        </div>
        
        <h3 className="text-xl font-black text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {message}
        </p>
        
        <button 
          onClick={onClose}
          className="w-full py-3.5 bg-[#00a896] text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-teal-100 active:scale-95 transition-transform"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
};

export default InfoModal;
