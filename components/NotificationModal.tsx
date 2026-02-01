import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCheck, Clock, FileText, Trash2, BellOff, BellRing, ChevronRight, ExternalLink, Info } from 'lucide-react';

export interface NotificationItem {
  id: number;
  type: 'prayer' | 'news';
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onRemove: (id: number) => void;
  onMarkAllRead: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ 
  isOpen, 
  onClose, 
  notifications,
  onRemove,
  onMarkAllRead
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [selectedNotifDetail, setSelectedNotifDetail] = useState<NotificationItem | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [isOpen]);

  const requestPermission = () => {
    if (!('Notification' in window)) return;
    Notification.requestPermission().then((perm) => {
      setPermission(perm);
      if (perm === 'granted') {
         new Notification("Notifikasi Aktif", { body: "Jazakumullah Khairan, Anda akan menerima pengingat waktu sholat." });
      }
    });
  };

  // Helper to detect and linkify URLs in description
  const renderDescription = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 underline break-all inline-flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {part} <ExternalLink size={10} className="ml-1" />
          </a>
        );
      }
      return part;
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[250] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-16 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-md mx-4 rounded-[24px] overflow-hidden shadow-2xl animate-in slide-in-from-top-5 duration-300 flex flex-col max-h-[80vh]">
          <div className="bg-[#00a896] p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-2 text-white">
              <Bell size={20} />
              <h3 className="font-bold uppercase text-xs tracking-widest">Pusat Notifikasi</h3>
            </div>
            <button onClick={onClose} className="p-1 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors">
              <X size={18} />
            </button>
          </div>
          
          {permission !== 'granted' && (
             <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-start space-x-3 shrink-0">
                <div className="p-2 bg-orange-100 rounded-full text-orange-600 shrink-0">
                   <BellRing size={18} />
                </div>
                <div className="flex-1">
                   <h4 className="text-xs font-bold text-gray-800 mb-1">Aktifkan Pengingat Sholat</h4>
                   <p className="text-[10px] text-gray-500 mb-2">Izinkan browser mengirim notifikasi agar Anda tidak ketinggalan waktu sholat.</p>
                   <button 
                     onClick={requestPermission}
                     className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm"
                   >
                      Izinkan Notifikasi
                   </button>
                </div>
             </div>
          )}

          <div className="overflow-y-auto bg-[#f8fafc] flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border border-gray-200">
                  <BellOff size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-bold text-sm">Tidak ada notifikasi</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Pesan baru akan muncul di sini</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 border-b border-gray-100 flex space-x-3 transition-all cursor-pointer group hover:bg-gray-50 ${notif.read ? 'bg-white opacity-80' : 'bg-teal-50/40 border-l-4 border-l-[#00a896]'}`}
                  onClick={() => setSelectedNotifDetail(notif)}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-active:scale-95 ${notif.type === 'prayer' ? 'bg-orange-100 text-orange-600' : 'bg-teal-100 text-teal-600'}`}>
                     {notif.type === 'prayer' ? <Clock size={22} /> : <FileText size={22} />}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm font-black truncate ${notif.read ? 'text-gray-600' : 'text-gray-900'}`}>{notif.title}</h4>
                      <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded-full ml-2 border border-gray-100">{notif.time}</span>
                    </div>
                    
                    <p className={`text-xs text-gray-500 leading-relaxed line-clamp-2`}>
                      {notif.desc}
                    </p>
                    
                    <div className="mt-2 flex items-center text-[10px] font-bold text-[#00a896] uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                      Klik untuk detail <ChevronRight size={10} className="ml-1" />
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(notif.id);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-500 active:scale-90 transition-all shrink-0 self-start"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 bg-white border-t border-gray-100 shrink-0">
              <button 
                onClick={onMarkAllRead}
                className="text-[10px] font-black text-[#00a896] uppercase tracking-widest flex items-center justify-center w-full py-3 hover:bg-teal-50 rounded-xl transition-colors active:scale-95 border border-transparent hover:border-teal-100"
              >
                <CheckCheck size={14} className="mr-2" /> Tandai semua dibaca
              </button>
            </div>
          )}
        </div>
      </div>

      {/* NOTIFICATION DETAIL POPUP (Pesan Lengkap) */}
      {selectedNotifDetail && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
              <div className={`p-6 flex flex-col items-center text-center relative ${selectedNotifDetail.type === 'prayer' ? 'bg-orange-50' : 'bg-teal-50'}`}>
                 <button 
                    onClick={() => setSelectedNotifDetail(null)}
                    className="absolute top-4 right-4 p-2 bg-white/50 rounded-full text-gray-500"
                 >
                    <X size={16} />
                 </button>

                 <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 shadow-lg ${selectedNotifDetail.type === 'prayer' ? 'bg-orange-500 text-white shadow-orange-200' : 'bg-[#00a896] text-white shadow-teal-200'}`}>
                    {selectedNotifDetail.type === 'prayer' ? <Clock size={32} /> : <Info size={32} />}
                 </div>

                 <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${selectedNotifDetail.type === 'prayer' ? 'text-orange-600' : 'text-teal-600'}`}>
                    {selectedNotifDetail.type === 'prayer' ? 'Waktu Ibadah' : 'Informasi Ummat'}
                 </span>
                 <h2 className="text-xl font-black text-gray-900 leading-tight">
                    {selectedNotifDetail.title}
                 </h2>
              </div>

              <div className="p-8 bg-white flex-1">
                 <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                    <Clock size={12} className="mr-1.5" /> {selectedNotifDetail.time} WIB
                 </div>
                 
                 <div className="text-sm text-gray-700 leading-relaxed font-medium">
                    {renderDescription(selectedNotifDetail.desc)}
                 </div>

                 <div className="mt-10 border-t border-gray-50 pt-6">
                    <button 
                       onClick={() => setSelectedNotifDetail(null)}
                       className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95 ${selectedNotifDetail.type === 'prayer' ? 'bg-orange-500 text-white shadow-orange-100' : 'bg-[#00a896] text-white shadow-teal-100'}`}
                    >
                       Tutup Pesan
                    </button>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center mt-4">
                        MUI DKI Jakarta • Pelayan Ummat
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default NotificationModal;