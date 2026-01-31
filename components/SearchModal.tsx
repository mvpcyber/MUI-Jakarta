
import React, { useState } from 'react';
import { Search, ChevronRight, X, ArrowRight } from 'lucide-react';
import { QUICK_MENUS } from '../constants';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (menuId: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  // Filter menu berdasarkan query
  const filteredMenus = QUICK_MENUS.filter(menu => 
    menu.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[250] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md mx-4 rounded-[24px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
          <Search className="text-gray-400" size={20} />
          <input 
            type="text" 
            autoFocus
            placeholder="Cari fitur, berita, atau layanan..." 
            className="flex-1 outline-none text-gray-700 font-medium placeholder:text-gray-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-1 bg-gray-100 rounded-full">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query === '' && (
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 py-3">Pencarian Populer</p>
          )}

          {filteredMenus.map((menu) => (
            <button 
              key={menu.id}
              onClick={() => {
                onNavigate(menu.id);
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${menu.color}`}>
                  {menu.icon}
                </div>
                <span className="text-sm font-bold text-gray-700">{menu.label}</span>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-[#00a896]" />
            </button>
          ))}

          {filteredMenus.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">Tidak ada hasil ditemukan.</p>
            </div>
          )}

          {query !== '' && (
            <div className="mt-2 border-t border-gray-50 pt-2">
               <button className="w-full py-3 text-xs font-bold text-[#00a896] flex items-center justify-center">
                  Cari "{query}" di Google <ArrowRight size={12} className="ml-1" />
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
