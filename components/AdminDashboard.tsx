import React, { useState, useEffect } from 'react';
import { Bell, Send, Trash2, LogOut, CheckCircle, Smartphone, AlertCircle, Settings, Database, Save, RotateCcw } from 'lucide-react';
import { NotificationItem } from './NotificationModal';
import { ref, push, onValue, remove, set, DataSnapshot } from 'firebase/database';
import { db, isConfigured, getFirebaseConfig, saveFirebaseConfig, resetFirebaseConfig, FirebaseConfigType } from '../firebaseConfig';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  // LOGIC: Default ke 'settings' jika belum dikonfigurasi
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>(!isConfigured ? 'settings' : 'notifications');
  
  // Notification State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<NotificationItem[]>([]);
  const [success, setSuccess] = useState('');
  const [dbStatus, setDbStatus] = useState(isConfigured);

  // Config State
  const [configForm, setConfigForm] = useState<FirebaseConfigType>(getFirebaseConfig());

  // Load History from Firebase if configured
  useEffect(() => {
    if (!dbStatus || !db) return;

    try {
        const historyRef = ref(db, 'notifications');
        const unsubscribe = onValue(historyRef, (snapshot: DataSnapshot) => {
           const data = snapshot.val();
           if (data) {
              const list = Object.values(data) as NotificationItem[];
              list.sort((a, b) => b.id - a.id);
              setHistory(list);
           } else {
              setHistory([]);
           }
        }, (error) => {
            console.error("Firebase read error", error);
        });
        return () => unsubscribe();
    } catch (e) {
        console.error("Error connecting to DB listener", e);
    }
  }, [dbStatus]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    if (!db) {
       alert("Firebase belum dikonfigurasi. Silakan ke menu Pengaturan.");
       setActiveTab('settings');
       return;
    }

    const newNotif: any = {
      id: Date.now(),
      type: 'news',
      title: title,
      desc: message,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    try {
       await push(ref(db, 'notifications'), newNotif);
       setSuccess('Notifikasi terkirim ke server!');
       setTitle('');
       setMessage('');
       setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
       console.error(err);
       alert("Gagal mengirim ke database.");
    }
  };

  const clearHistory = async () => {
    if(confirm('Hapus semua riwayat notifikasi di Database? (Ini akan menghapus data di sisi user juga)')) {
        if(db) {
            await set(ref(db, 'notifications'), null);
        }
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
      e.preventDefault();
      // Validasi sederhana URL
      if(!configForm.databaseURL || configForm.databaseURL.length < 10) {
          alert("Database URL tidak valid!");
          return;
      }
      saveFirebaseConfig(configForm);
      alert("Konfigurasi disimpan. Halaman akan dimuat ulang.");
      window.location.reload();
  };

  const handleResetConfig = () => {
      if(confirm("Reset konfigurasi ke default?")) {
          resetFirebaseConfig();
          window.location.reload();
      }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-[#00827f] text-white px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center space-x-3">
           <div className="bg-white/20 p-2 rounded-lg">
             <Smartphone size={20} />
           </div>
           <div>
             <h1 className="font-bold text-lg leading-none">Admin Panel</h1>
             <p className="text-[10px] opacity-80 uppercase tracking-wider">MUI Jakarta Mobile</p>
           </div>
        </div>
        <button onClick={onLogout} className="flex items-center space-x-1 bg-black/20 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-black/30 transition-colors">
          <LogOut size={14} />
          <span>Keluar</span>
        </button>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        
        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
            <button 
                onClick={() => setActiveTab('notifications')}
                className={`pb-3 px-4 text-sm font-bold flex items-center space-x-2 transition-all border-b-2 ${activeTab === 'notifications' ? 'border-[#00827f] text-[#00827f]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
                <Bell size={18} />
                <span>Push Notifikasi</span>
            </button>
            <button 
                onClick={() => setActiveTab('settings')}
                className={`pb-3 px-4 text-sm font-bold flex items-center space-x-2 transition-all border-b-2 ${activeTab === 'settings' ? 'border-[#00827f] text-[#00827f]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
                <Settings size={18} />
                <span>Pengaturan Database</span>
                {!dbStatus && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1"></span>}
            </button>
        </div>

        {!dbStatus && activeTab !== 'settings' && (
             <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold mb-6 flex items-start space-x-2 border border-red-100 cursor-pointer hover:bg-red-100 transition-colors" onClick={() => setActiveTab('settings')}>
                 <AlertCircle size={16} className="shrink-0 mt-0.5" />
                 <p>Database belum dikonfigurasi. Klik disini untuk menghubungkan aplikasi ke Firebase.</p>
             </div>
        )}

        {/* CONTENT: Notifications */}
        {activeTab === 'notifications' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 fade-in">
                {/* Form Section */}
                <div>
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                            <Send size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Kirim Pesan</h2>
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
                                disabled={!dbStatus}
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
                                disabled={!dbStatus}
                            />
                        </div>

                        {success && (
                            <div className="bg-green-100 text-green-700 p-3 rounded-xl flex items-center text-sm font-bold animate-in fade-in">
                                <CheckCircle size={16} className="mr-2" /> {success}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={!dbStatus}
                            className="w-full bg-[#00827f] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-teal-200 active:scale-95 transition-all flex items-center justify-center space-x-2 hover:bg-teal-700 disabled:opacity-50"
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
                        <h2 className="text-lg font-bold text-gray-800 ml-2">Riwayat Database</h2>
                        <button onClick={clearHistory} disabled={!dbStatus} className="text-red-500 text-xs font-bold flex items-center hover:bg-red-50 px-3 py-1 rounded-lg transition-colors disabled:opacity-50">
                            <Trash2 size={14} className="mr-1" /> Bersihkan
                        </button>
                    </div>
                    
                    <div className="space-y-3 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {history.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p className="text-sm">Belum ada notifikasi atau DB belum terkoneksi</p>
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
                                        <CheckCircle size={12} className="mr-1" /> Tersimpan di Cloud
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* CONTENT: Settings */}
        {activeTab === 'settings' && (
             <div className="fade-in">
                 <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="bg-teal-100 p-3 rounded-full text-teal-700">
                            <Database size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Konfigurasi Firebase</h2>
                            <p className="text-xs text-gray-500">Hubungkan aplikasi dengan project Firebase Anda</p>
                        </div>
                    </div>

                    <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-xs leading-relaxed mb-6 border border-blue-100">
                        <strong>Cara mendapatkan konfigurasi:</strong>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Buka <a href="https://console.firebase.google.com/" target="_blank" className="underline font-bold">Firebase Console</a></li>
                            <li>Buat Project baru / Pilih Project yang ada.</li>
                            <li>Pilih icon Web <strong>(&lt;/&gt;)</strong> untuk menambahkan aplikasi web.</li>
                            <li>Copy nilai konfigurasi yang muncul (apiKey, authDomain, dll) ke form di bawah ini.</li>
                            <li>Masuk ke menu <strong>Realtime Database</strong> &gt; <strong>Rules</strong>, set read/write ke <strong>true</strong>.</li>
                        </ul>
                    </div>

                    <form onSubmit={handleSaveConfig} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">API Key</label>
                                <input type="text" required value={configForm.apiKey} onChange={(e) => setConfigForm({...configForm, apiKey: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:border-[#00827f] outline-none font-mono" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Auth Domain</label>
                                <input type="text" required value={configForm.authDomain} onChange={(e) => setConfigForm({...configForm, authDomain: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:border-[#00827f] outline-none font-mono" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Database URL (Realtime DB)</label>
                                <input type="text" required value={configForm.databaseURL} onChange={(e) => setConfigForm({...configForm, databaseURL: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:border-[#00827f] outline-none font-mono" placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Project ID</label>
                                <input type="text" required value={configForm.projectId} onChange={(e) => setConfigForm({...configForm, projectId: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:border-[#00827f] outline-none font-mono" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Storage Bucket</label>
                                <input type="text" required value={configForm.storageBucket} onChange={(e) => setConfigForm({...configForm, storageBucket: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:border-[#00827f] outline-none font-mono" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Messaging Sender ID</label>
                                <input type="text" required value={configForm.messagingSenderId} onChange={(e) => setConfigForm({...configForm, messagingSenderId: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:border-[#00827f] outline-none font-mono" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">App ID</label>
                                <input type="text" required value={configForm.appId} onChange={(e) => setConfigForm({...configForm, appId: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:border-[#00827f] outline-none font-mono" />
                            </div>
                        </div>

                        <div className="pt-6 flex items-center space-x-3">
                            <button 
                                type="submit"
                                className="flex-1 bg-[#00a896] text-white py-3 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-teal-200 active:scale-95 transition-all flex items-center justify-center"
                            >
                                <Save size={18} className="mr-2" /> Simpan Konfigurasi
                            </button>
                            <button 
                                type="button"
                                onClick={handleResetConfig}
                                className="px-4 py-3 bg-red-50 text-red-500 rounded-xl font-bold uppercase tracking-widest hover:bg-red-100 transition-colors"
                                title="Reset ke Default"
                            >
                                <RotateCcw size={18} />
                            </button>
                        </div>
                    </form>
                 </div>
             </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;