
import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCheck, Clock, FileText, Trash2, BellOff, BellRing } from 'lucide-react';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-16 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md mx-4 rounded-[24px] overflow-hidden shadow-2xl animate-in slide-in-from-top-5 duration-300">
        <div className="bg-[#00a896] p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-white">
            <Bell size={20} />
            <h3 className="font-bold">Notifikasi</h3>
          </div>
          <button onClick={onClose} className="p-1 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        {permission !== 'granted' && (
           <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-start space-x-3">
              <div className="p-2 bg-orange-100 rounded-full text-orange-600 shrink-0">
                 <BellRing size={18} />
              </div>
              <div className="flex-1">
                 <h4 className="text-xs font-bold text-gray-800 mb-1">Aktifkan Pengingat Sholat</h4>
                 <p className="text-[10px] text-gray-500 mb-2">Izinkan browser mengirim notifikasi agar Anda tidak ketinggalan waktu sholat.</p>
                 <button 
                   onClick={requestPermission}
                   className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider"
                 >
                    Izinkan Notifikasi
                 </button>
              </div>
           </div>
        )}

        <div className="max-h-[60vh] overflow-y-auto bg-[#f8fafc] min-h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BellOff size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-bold text-sm">Tidak ada notifikasi baru</p>
              <p className="text-xs text-gray-400 mt-1">Anda akan menerima info penting di sini.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className={`p-4 border-b border-gray-100 flex space-x-3 transition-colors ${notif.read ? 'bg-white' : 'bg-blue-50/50'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'prayer' ? 'bg-orange-100 text-orange-600' : 'bg-teal-100 text-teal-600'}`}>
                   {notif.type === 'prayer' ? <Clock size={18} /> : <FileText size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-bold truncate pr-2 ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h4>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{notif.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 pr-6">{notif.desc}</p>
                </div>
                <button 
                  onClick={() => onRemove(notif.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 active:scale-90 transition-all shrink-0 self-center"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="p-3 bg-white border-t border-gray-100">
            <button 
              onClick={onMarkAllRead}
              className="text-[10px] font-black text-[#00a896] uppercase tracking-widest flex items-center justify-center w-full py-2 hover:bg-gray-50 rounded-xl transition-colors active:scale-95"
            >
              <CheckCheck size={14} className="mr-2" /> Tandai semua dibaca
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
