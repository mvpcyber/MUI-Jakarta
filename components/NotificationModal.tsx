
import React from 'react';
import { Bell, X, CheckCheck, Clock, FileText } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      type: 'prayer',
      title: 'Waktu Maghrib Tiba',
      desc: 'Saatnya menunaikan sholat Maghrib untuk wilayah Jakarta Pusat dan sekitarnya.',
      time: 'Baru saja',
      read: false
    },
    {
      id: 2,
      type: 'news',
      title: 'Fatwa Terbaru MUI',
      desc: 'MUI keluarkan fatwa baru terkait dukungan perjuangan Palestina. Simak selengkapnya.',
      time: '2 jam lalu',
      read: true
    },
    {
      id: 3,
      type: 'prayer',
      title: 'Waktu Ashar Tiba',
      desc: 'Saatnya menunaikan sholat Ashar.',
      time: '4 jam lalu',
      read: true
    }
  ];

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
        
        <div className="max-h-[60vh] overflow-y-auto bg-[#f8fafc]">
          {notifications.map((notif) => (
            <div key={notif.id} className={`p-4 border-b border-gray-100 flex space-x-3 ${notif.read ? 'bg-white' : 'bg-blue-50/50'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'prayer' ? 'bg-orange-100 text-orange-600' : 'bg-teal-100 text-teal-600'}`}>
                 {notif.type === 'prayer' ? <Clock size={18} /> : <FileText size={18} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm font-bold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h4>
                  <span className="text-[10px] text-gray-400">{notif.time}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{notif.desc}</p>
              </div>
            </div>
          ))}
          <div className="p-3 text-center">
            <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center w-full">
              <CheckCheck size={14} className="mr-1" /> Tandai semua dibaca
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
