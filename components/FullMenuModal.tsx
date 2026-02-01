
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

  return (
    <div className="fixed inset-0 z-[250] bg-white overflow-y-auto animate-in slide-in-from-bottom duration-300">
      <div className="sticky top-0 bg-white border-b px-4 py-4 flex justify-between items-center z-10">
        <h2 className="text-lg font-bold text-gray-800">Semua Menu</h2>
        <button onClick={onClose} className="p-2 rounded-full bg-gray-100">
          <X size={24} className="text-gray-600" />
        </button>
      </div>
      
      <div className="p-4 grid grid-cols-3 gap-4 pb-20">
        {FULL_MENU_ITEMS.map((item, index) => (
          <button 
            key={index} 
            onClick={() => {
              onNavigate(item.id);
              onClose();
            }}
            className="flex flex-col items-center text-center space-y-2 group active:scale-95 transition-transform"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${item.color} shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow`}>
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
