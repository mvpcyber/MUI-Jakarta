import React, { useState, useEffect } from 'react';
import { Bell, Send, Trash2, LogOut, CheckCircle, Smartphone, AlertCircle, Settings, Database, Save, RotateCcw, Users, Home, Menu, X, Globe, Calendar, MapPin, Phone, User } from 'lucide-react';
import { NotificationItem } from './NotificationModal';
import { ref, push, onValue, remove, set, DataSnapshot } from 'firebase/database';
import { db, isConfigured, getFirebaseConfig, saveFirebaseConfig, resetFirebaseConfig, FirebaseConfigType } from '../firebaseConfig';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface UserData {
  id: string;
  name?: string;
  phoneNumber?: string;
  platform: string;
  userAgent: string;
  joinedAt: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  lastActive?: string;
}

// Extend NotificationItem to include firebase key for deletion
interface AdminNotificationItem extends NotificationItem {
  firebaseKey?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'users' | 'settings'>(!isConfigured ? 'settings' : 'notifications');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle
  
  // Notification State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<AdminNotificationItem[]>([]);
  const [success, setSuccess] = useState('');
  const [dbStatus, setDbStatus] = useState(isConfigured);

  // Users State
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Config State
  const [configForm, setConfigForm] = useState<FirebaseConfigType>(getFirebaseConfig());

  // Load Data from Firebase
  useEffect(() => {
    if (!dbStatus || !db) return;

    // 1. Fetch Notifications
    try {
        const historyRef = ref(db, 'notifications');
        const unsubscribeNotif = onValue(historyRef, (snapshot: DataSnapshot) => {
           const data = snapshot.val();
           if (data) {
              const list = Object.entries(data).map(([key, value]) => ({
                  ...(value as NotificationItem),
                  firebaseKey: key
              }));
              list.sort((a, b) => b.id - a.id);
              setHistory(list);
           } else {
              setHistory([]);
           }
        }, (error) => console.error("Firebase read error", error));

        // 2. Fetch Users
        if (activeTab === 'users') {
            setLoadingUsers(true);
            const usersRef = ref(db, 'users');
            const unsubscribeUsers = onValue(usersRef, (snapshot: DataSnapshot) => {
               const data = snapshot.val();
               if (data) {
                   const userList = Object.values(data) as UserData[];
                   // Sort by join date descending
                   userList.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
                   setUsers(userList);
               } else {
                   setUsers([]);
               }
               setLoadingUsers(false);
            });
            return () => {
                unsubscribeNotif();
                unsubscribeUsers();
            };
        }

        return () => unsubscribeNotif();
    } catch (e) {
        console.error("Error connecting to DB listener", e);
    }
  }, [dbStatus, activeTab]);

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

  const handleDeleteOne = async (firebaseKey: string) => {
      if(confirm('Hapus notifikasi ini dari database? (User tidak akan melihatnya lagi setelah refresh)')) {
          if(db) {
              try {
                  await remove(ref(db, `notifications/${firebaseKey}`));
              } catch(e) {
                  alert("Gagal menghapus.");
              }
          }
      }
  };

  const clearHistory = async () => {
    if(confirm('Hapus SEMUA riwayat notifikasi di Database?')) {
        if(db) {
            await set(ref(db, 'notifications'), null);
        }
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
      e.preventDefault();
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

  // Helper to format date
  const formatDate = (isoString: string) => {
      try {
          return new Date(isoString).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'});
      } catch (e) { return isoString; }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#00827f] text-white shadow-2xl z-[100] transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
         <div className="p-6 border-b border-teal-600 flex items-center justify-between">
            <div className="flex items-center space-x-3">
               <div className="bg-white/20 p-2 rounded-lg">
                 <Smartphone size={20} />
               </div>
               <div>
                 <h1 className="font-bold text-lg leading-none">Admin</h1>
                 <p className="text-[10px] opacity-80 uppercase tracking-wider">MUI Jakarta</p>
               </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 bg-black/20 rounded-lg">
                <X size={18} />
            </button>
         </div>

         <nav className="p-4 space-y-2">
            <button 
                onClick={() => { setActiveTab('notifications'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'notifications' ? 'bg-white text-[#00827f] shadow-lg' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
            >
                <Bell size={18} />
                <span>Push Notifikasi</span>
            </button>

            <button 
                onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-white text-[#00827f] shadow-lg' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
            >
                <Users size={18} />
                <span>Data Pengguna</span>
            </button>

            <button 
                onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'settings' ? 'bg-white text-[#00827f] shadow-lg' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
            >
                <Settings size={18} />
                <span>Pengaturan DB</span>
            </button>
         </nav>

         <div className="absolute bottom-0 left-0 w-full p-6 bg-[#006e6b]">
            <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 bg-black/20 px-4 py-3 rounded-xl text-xs font-bold hover:bg-black/30 transition-colors">
              <LogOut size={14} />
              <span>Keluar Aplikasi</span>
            </button>
         </div>
      </aside>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {isSidebarOpen && (
         <div className="fixed inset-0 bg-black/50 z-[90] md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0">
        
        {/* Top Header (Mobile Only Toggle) */}
        <header className="bg-white p-4 shadow-sm md:hidden flex items-center justify-between sticky top-0 z-50">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600">
              <Menu size={24} />
           </button>
           <h2 className="font-bold text-gray-800">
              {activeTab === 'notifications' ? 'Notifikasi' : activeTab === 'users' ? 'Data Pengguna' : 'Pengaturan'}
           </h2>
           <div className="w-10"></div>
        </header>

        <div className="max-w-6xl mx-auto p-4 md:p-8">
            
            {!dbStatus && activeTab !== 'settings' && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold mb-6 flex items-start space-x-2 border border-red-100 cursor-pointer hover:bg-red-100 transition-colors" onClick={() => setActiveTab('settings')}>
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p>Database belum dikonfigurasi. Klik disini untuk menghubungkan aplikasi ke Firebase.</p>
                </div>
            )}

            {/* CONTENT: Notifications */}
            {activeTab === 'notifications' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                                <Trash2 size={14} className="mr-1" /> Bersihkan Semua
                            </button>
                        </div>
                        
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {history.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-sm">Belum ada notifikasi atau DB belum terkoneksi</p>
                                </div>
                            ) : (
                                history.map((item) => (
                                    <div key={item.firebaseKey || item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-gray-800 text-sm">{item.title}</h3>
                                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{item.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed mb-3">{item.desc}</p>
                                        <div className="flex justify-between items-center border-t border-gray-50 pt-2">
                                            <div className="text-[9px] font-bold text-teal-600 uppercase tracking-wide flex items-center">
                                                <CheckCircle size={10} className="mr-1" /> Terkirim
                                            </div>
                                            {item.firebaseKey && (
                                                <button 
                                                    onClick={() => handleDeleteOne(item.firebaseKey!)}
                                                    className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                    title="Hapus item ini"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENT: Users */}
            {activeTab === 'users' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Pengguna Terdaftar</h2>
                                    <p className="text-xs text-gray-500">Total Pengguna: {users.length}</p>
                                </div>
                            </div>
                            <button onClick={() => window.location.reload()} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                                <RotateCcw size={18} className="text-gray-500" />
                            </button>
                        </div>

                        {loadingUsers ? (
                            <div className="text-center py-20 text-gray-400">
                                <p>Memuat data...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-sm text-gray-400">Belum ada pengguna yang tercatat.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                            <th className="py-3 px-4">Nama & Kontak</th>
                                            <th className="py-3 px-4">Lokasi & Device</th>
                                            <th className="py-3 px-4">Bergabung</th>
                                            <th className="py-3 px-4">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs text-gray-600">
                                        {users.map((user) => (
                                            <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center space-x-2">
                                                            <User size={12} className="text-gray-400" />
                                                            <span className="font-bold text-gray-800">{user.name || "Tanpa Nama"}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <Phone size={12} className="text-green-500" />
                                                            <a href={`https://wa.me/${user.phoneNumber?.replace(/^0/, '62')}`} target="_blank" className="text-green-600 hover:underline">{user.phoneNumber || "-"}</a>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-col space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <MapPin size={12} className="text-red-400" />
                                                            <span>{user.location || "Unknown"}</span>
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 truncate max-w-[150px]">{user.platform}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar size={12} className="text-teal-500" />
                                                        <span>{formatDate(user.joinedAt)}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {user.latitude && user.longitude ? (
                                                        <a 
                                                            href={`https://www.google.com/maps/search/?api=1&query=${user.latitude},${user.longitude}`} 
                                                            target="_blank"
                                                            className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-100"
                                                        >
                                                            <Globe size={12} />
                                                            <span>Lacak</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-300 italic">No GPS</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* CONTENT: Settings */}
            {activeTab === 'settings' && (
                 <div className="fade-in max-w-2xl mx-auto">
                     <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
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
      </main>
    </div>
  );
};

export default AdminDashboard;