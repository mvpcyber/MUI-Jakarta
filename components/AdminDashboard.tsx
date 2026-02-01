import React, { useState, useEffect } from 'react';
import { Bell, Send, Trash2, LogOut, CheckCircle, Smartphone } from 'lucide-react';
import { NotificationItem } from './NotificationModal';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<NotificationItem[]>([]);
  const [success, setSuccess] = useState('');

  // Initial load to show history list
  useEffect(() => {
    refreshHistory();
  }, []);

  const refreshHistory = () => {
    const saved = localStorage.getItem('mui_notifications');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        setHistory([]);
      }
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    // 1. PENTING: Ambil data terbaru dari localStorage sesaat sebelum update
    // Ini mencegah Admin menimpa data notifikasi yang mungkin sudah diubah statusnya oleh user (read/unread)
    let currentData: NotificationItem[] = [];
    const saved = localStorage.getItem('mui_notifications');
    if (saved) {
      try {
        currentData = JSON.parse(saved);
      } catch (e) {
        currentData = [];
      }
    }

    const newNotif: any = {
      id: Date.now(),
      type: 'news',
      title: title,
      desc: message,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      isNewBroadcast: true // Flag untuk mentrigger push notif di sisi user
    };

    // Tambahkan notifikasi baru di paling atas
    const updatedHistory = [newNotif, ...currentData];
    
    // 2. Simpan ke LocalStorage
    localStorage.setItem('mui_notifications', JSON.stringify(updatedHistory));
    
    // 3. Update state UI Admin
    setHistory(updatedHistory);

    setSuccess('Notifikasi berhasil dikirim!');
    setTitle('');
    setMessage('');
    
    setTimeout(() => setSuccess(''), 3000);
  };

  const clearHistory = () => {
    if(confirm('Hapus semua riwayat notifikasi?')) {
        setHistory([]);
        localStorage.removeItem('mui_notifications');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-[#00827f] text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-2">
           <div className="bg-white/20 p-2 rounded-lg">
             <Smartphone size={20} />
           </div>
           <div>
             <h1 className="font-bold text-lg leading-none">Admin Panel</h1>
             <p className="text-[10px] opacity-80 uppercase tracking-wider">Push Notification Center</p>
           </div>
        </div>
        <button onClick={onLogout} className="flex items-center space-x-1 bg-black/20 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-black/30 transition-colors">
          <LogOut size={14} />
          <span>Keluar</span>
        </button>
      </nav>

      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Form Section */}
        <div>
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
             <div className="flex items-center space-x-3 mb-6">
                <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                   <Bell size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Buat Notifikasi</h2>
             </div>

             <form onSubmit={handleSend} className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Judul Notifikasi</label>
                   <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-[#00827f] font-bold"
                      placeholder="Contoh: Info Kajian Rutin"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Isi Pesan</label>
                   <textarea 
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-[#00827f]"
                      placeholder="Tulis pesan lengkap disini..."
                   />
                </div>

                {success && (
                  <div className="bg-green-100 text-green-700 p-3 rounded-xl flex items-center text-sm font-bold animate-in fade-in">
                     <CheckCircle size={16} className="mr-2" /> {success}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-[#00827f] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-teal-200 active:scale-95 transition-all flex items-center justify-center space-x-2 hover:bg-teal-700"
                >
                   <Send size={18} />
                   <span>Kirim ke Semua User</span>
                </button>
             </form>
          </div>
        </div>

        {/* History Section */}
        <div>
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 ml-2">Riwayat Terkirim</h2>
              <button onClick={clearHistory} className="text-red-500 text-xs font-bold flex items-center hover:bg-red-50 px-3 py-1 rounded-lg transition-colors">
                 <Trash2 size={14} className="mr-1" /> Bersihkan
              </button>
           </div>
           
           <div className="space-y-3 h-[500px] overflow-y-auto pr-2">
              {history.length === 0 ? (
                 <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                    <p className="text-sm">Belum ada notifikasi terkirim</p>
                 </div>
              ) : (
                 history.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group">
                       <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-gray-800">{item.title}</h3>
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{item.time}</span>
                       </div>
                       <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                       <div className="mt-2 text-[10px] font-bold text-teal-600 uppercase tracking-wide flex items-center">
                          <CheckCircle size={12} className="mr-1" /> Terkirim ke User
                       </div>
                    </div>
                 ))
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;