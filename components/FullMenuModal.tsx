
import React from 'react';
import { X } from 'lucide-react';
import { FULL_MENU_ITEMS } from '../constants';

interface FullMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (menuId: string) => void;
}

const FullMenuModal: React.FC<FullMenuModalProps> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  const handleItemClick = (label: string) => {
    // Simple mapping from Label to ID expected by App.tsx
    let menuId = '';
    const lowerLabel = label.toLowerCase();

    if (lowerLabel.includes('quran')) menuId = 'quran';
    else if (lowerLabel.includes('hadits')) menuId = 'hadits';
    else if (lowerLabel.includes('sholat')) menuId = 'jadwal';
    else if (lowerLabel.includes('kiblat')) menuId = 'kiblat';
    else if (lowerLabel.includes('fatwa')) menuId = 'fatwa';
    else if (lowerLabel.includes('berita')) menuId = 'berita';
    else if (lowerLabel.includes('kalender')) menuId = 'calendar';
    else if (lowerLabel.includes('halal')) menuId = 'halal';
    // Add more mappings if necessary or default to nothing
    
    if (menuId) {
      onClose();
      onNavigate(menuId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-in slide-in-from-bottom duration-300">
      <div className="sticky top-0 bg-white border-b px-4 py-4 flex justify-between items-center z-10">
        <h2 className="text-lg font-bold text-gray-800">Semua Menu</h2>
        <button onClick={onClose} className="p-2 rounded-full bg-gray-100">
          <X size={24} className="text-gray-600" />
        </button>
      </div>
      
      <div className="p-4 grid grid-cols-3 gap-4">
        {FULL_MENU_ITEMS.map((item, index) => (
          <button 
            key={index} 
            onClick={() => handleItemClick(item.label)}
            className="flex flex-col items-center text-center space-y-2 group active:scale-95 transition-transform"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${item.color} shadow-sm border border-gray-100 group-hover:shadow-md transition-all`}>
              {React.cloneElement(item.icon as React.ReactElement<any>, { size: 28 })}
            </div>
            <span className="text-[11px] font-medium leading-tight text-gray-700">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FullMenuModal;
