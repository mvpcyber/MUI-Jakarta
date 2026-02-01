
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Send, Trash2, LogOut, CheckCircle, Smartphone, AlertCircle, Settings, Database, Save, RotateCcw, Users, Home, Menu, X, Globe, Calendar, MapPin, Phone, User, Info, Loader2, RefreshCw, Clock } from 'lucide-react';
import { NotificationItem } from './NotificationModal';
import { ref, push, onValue, remove, set, DataSnapshot, update, query, orderByKey, limitToLast } from 'firebase/database';
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

interface AdminNotificationItem extends NotificationItem {
  firebaseKey?: string;
  receipts?: Record<string, string>; // userId -> timestamp
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'users' | 'settings'>(!isConfigured ? 'settings' : 'notifications');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Notification State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<AdminNotificationItem[]>([]);
  const [success, setSuccess] = useState('');
  const [dbStatus, setDbStatus] = useState(isConfigured);
  const [selectedBroadcastKey, setSelectedBroadcastKey] = useState<string | null>(null);

  // Users State
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Config & WP Sync State
  const [configForm, setConfigForm] = useState<FirebaseConfigType>(getFirebaseConfig());
  const [isWpSyncing, setIsWpSyncing] = useState(false);
  const lastPostIdRef = useRef<number>(0);

  // Load Data from Firebase
  useEffect(() => {
    if (!dbStatus || !db) return;

    // 1. Fetch Notifications & Receipts
    const historyRef = ref(db, 'notifications');
    const unsubscribeNotif = onValue(historyRef, (snapshot) => {
       const data = snapshot.val();
       if (data) {
          const list = Object.entries(data).map(([key, value]) => ({
              ...(value as any),
              firebaseKey: key
          }));
          list.sort((a, b) => b.id - a.id);
          setHistory(list);
       } else setHistory([]);
    });

    // 2. Fetch Users
    const usersRef = ref(db, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
       const data = snapshot.val();
       if (data) {
           const userList = Object.values(data) as UserData[];
           userList.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
           setUsers(userList);
       } else setUsers([]);
    });

    return () => { unsubscribeNotif(); unsubscribeUsers(); };
  }, [dbStatus]);

  // --- AUTOMATIC WORDPRESS MONITORING ---
  useEffect(() => {
    if (!dbStatus || !db || isWpSyncing) return;

    const checkNewWpPosts = async () => {
      try {
        const response = await fetch("https://muijakarta.or.id/wp-json/wp/v2/posts?per_page=1");
        const posts = await response.json();
        
        if (Array.isArray(posts) && posts.length > 0) {
          const latestPost = posts[0];
          
          // Get stored last post ID from local storage or DB
          const storedLastId = parseInt(localStorage.getItem('mui_wp_last_id') || '0');
          
          if (storedLastId !== 0 && latestPost.id > storedLastId) {
             console.log("New WP post detected! Automating notification...");
             
             // Trigger Broadcast
             const newNotif: any = {
                id: Date.now(),
                type: 'news',
                title: 'BERITA BARU',
                desc: latestPost.title.rendered.replace(/&#[0-9]+;/g, '').replace(/<[^>]+>/g, ''),
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                read: false,
                wp_post_id: latestPost.id
             };
             
             await push(ref(db!, 'notifications'), newNotif);
          }
          
          localStorage.setItem('mui_wp_last_id', latestPost.id.toString());
        }
      } catch (e) {
        console.error("WP Sync error", e);
      }
    };

    // Poll every 60 seconds while admin dashboard is open
    const interval = setInterval(checkNewWpPosts, 60000);
    checkNewWpPosts(); // Initial check

    return () => clearInterval(interval);
  }, [dbStatus, isWpSyncing]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message || !db) return;

    const newNotif: any = {
      id: Date.now(),
      type: 'news',
      title,
      desc: message,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      receipts: {} // Init empty receipts
    };

    try {
       await push(ref(db, 'notifications'), newNotif);
       setSuccess('Notifikasi Terbroadcast!');
       setTitle(''); setMessage('');
       setTimeout(() => setSuccess(''), 3000);
    } catch (err) { alert("Gagal mengirim."); }
  };

  const selectedBroadcast = history.find(h => h.firebaseKey === selectedBroadcastKey);
  const receiptsCount = selectedBroadcast?.receipts ? Object.keys(selectedBroadcast.receipts).length : 0;
  const totalUsersCount = users.length;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#00827f] text-white shadow-2xl z-[100] transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
         <div className="p-6 border-b border-teal-600 flex items-center justify-between">
            <div className="flex items-center space-x-3">
               <div className="bg-white/20 p-2 rounded-lg"><Smartphone size={20} /></div>
               <div><h1 className="font-bold text-lg leading-none">Admin</h1><p className="text-[10px] opacity-80 uppercase tracking-wider">MUI Jakarta</p></div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 bg-black/20 rounded-lg"><X size={18} /></button>
         </div>
         <nav className="p-4 space-y-2">
            <button onClick={() => { setActiveTab('notifications'); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'notifications' ? 'bg-white text-[#00827f] shadow-lg' : 'text-white/80 hover:bg-white/10'}`}><Bell size={18} /><span>Push Notifikasi</span></button>
            <button onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-white text-[#00827f] shadow-lg' : 'text-white/80 hover:bg-white/10'}`}><Users size={18} /><span>Data Pengguna</span></button>
            <button onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'settings' ? 'bg-white text-[#00827f] shadow-lg' : 'text-white/80 hover:bg-white/10'}`}><Settings size={18} /><span>Pengaturan DB</span></button>
         </nav>
         <div className="absolute bottom-0 left-0 w-full p-6 bg-[#006e6b]"><button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 bg-black/20 px-4 py-3 rounded-xl text-xs font-bold hover:bg-black/30 transition-colors"><LogOut size={14} /><span>Keluar</span></button></div>
      </aside>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-[90] md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      <main className="flex-1 min-w-0">
        <header className="bg-white p-4 shadow-sm md:hidden flex items-center justify-between sticky top-0 z-50">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600"><Menu size={24} /></button>
           <h2 className="font-bold text-gray-800 uppercase text-xs tracking-widest">{activeTab}</h2>
           <div className="w-10"></div>
        </header>

        <div className="max-w-6xl mx-auto p-4 md:p-8">
            {activeTab === 'notifications' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* FORM BROADCAST */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-orange-100 p-3 rounded-full text-orange-600"><Send size={24} /></div>
                                    <h2 className="text-xl font-bold text-gray-800">Broadcast Pesan</h2>
                                </div>
                                <div className="flex items-center space-x-2 bg-teal-50 px-3 py-1 rounded-full">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-black text-teal-700 uppercase">WP Sync Active</span>
                                </div>
                            </div>

                            <form onSubmit={handleSend} className="space-y-4">
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:border-[#00827f] outline-none font-bold" placeholder="Judul (Contoh: Info Majelis)" />
                                <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:border-[#00827f] outline-none" placeholder="Isi pesan lengkap..." />
                                {success && <div className="bg-green-100 text-green-700 p-3 rounded-xl flex items-center text-sm font-bold"><CheckCircle size={16} className="mr-2" /> {success}</div>}
                                <button type="submit" className="w-full bg-[#00827f] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-teal-200 active:scale-95 transition-all flex items-center justify-center space-x-2">
                                    <Send size={18} /><span>Kirim Sekarang</span>
                                </button>
                            </form>
                        </div>

                        {/* DETAIL STATUS TERKIRIM */}
                        {selectedBroadcast && (
                            <div className="bg-white rounded-[32px] p-6 shadow-xl border-2 border-[#00a896] animate-in zoom-in-95">
                                <div className="flex justify-between items-start mb-4">
                                   <h3 className="font-bold text-gray-800">Status Pengiriman Detail</h3>
                                   <button onClick={() => setSelectedBroadcastKey(null)} className="p-1 bg-gray-100 rounded-full"><X size={14}/></button>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-teal-50 p-4 rounded-2xl text-center">
                                        <p className="text-2xl font-black text-teal-700">{receiptsCount}</p>
                                        <p className="text-[9px] font-bold text-teal-600 uppercase">Diterima Device</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl text-center">
                                        <p className="text-2xl font-black text-gray-400">{totalUsersCount - receiptsCount}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">Pending / Offline</p>
                                    </div>
                                </div>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {users.map(u => {
                                        const received = selectedBroadcast.receipts && selectedBroadcast.receipts[u.id];
                                        return (
                                            <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-[10px] font-medium">
                                                <div className="flex items-center space-x-2">
                                                    {received ? <CheckCircle size={12} className="text-green-500" /> : <Clock size={12} className="text-gray-300" />}
                                                    <span className="text-gray-700">{u.name || "Guest"} ({u.location})</span>
                                                </div>
                                                <span className="text-gray-400">{received ? "Diterima" : "Pending"}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* HISTORY BROADCAST */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 ml-2">Riwayat Broadcast</h2>
                        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
                            {history.length === 0 ? <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed">Belum ada riwayat</div> : 
                                history.map((item) => {
                                    const rCount = item.receipts ? Object.keys(item.receipts).length : 0;
                                    const percentage = totalUsersCount > 0 ? Math.round((rCount / totalUsersCount) * 100) : 0;
                                    return (
                                        <div key={item.firebaseKey} onClick={() => setSelectedBroadcastKey(item.firebaseKey!)} className={`bg-white p-4 rounded-2xl border shadow-sm cursor-pointer transition-all hover:border-[#00a896] ${selectedBroadcastKey === item.firebaseKey ? 'ring-2 ring-[#00a896]' : 'border-gray-100'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-800 text-sm">{item.title}</h3>
                                                <span className="text-[9px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{item.time}</span>
                                            </div>
                                            <div className="flex items-center space-x-3 mt-3">
                                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#00a896]" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                                <span className="text-[10px] font-black text-[#00a896]">{rCount}/{totalUsersCount}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Users size={24} /></div>
                            <div><h2 className="text-xl font-bold text-gray-800">Daftar Pengguna Aktif</h2><p className="text-xs text-gray-500">Total: {users.length}</p></div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead><tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-100"><th className="py-3 px-4">Nama</th><th className="py-3 px-4">Lokasi</th><th className="py-3 px-4">Bergabung</th><th className="py-3 px-4">Status</th></tr></thead>
                            <tbody className="text-xs text-gray-600">
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-bold text-gray-800">{user.name || "Guest User"}</td>
                                        <td className="py-3 px-4">{user.location || "Unknown"}</td>
                                        <td className="py-3 px-4">{new Date(user.joinedAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${Date.now() - new Date(user.lastActive || 0).getTime() < 300000 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{Date.now() - new Date(user.lastActive || 0).getTime() < 300000 ? 'Online' : 'Offline'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="bg-teal-100 p-3 rounded-full text-teal-700"><Database size={24} /></div>
                        <h2 className="text-xl font-bold text-gray-800">Konfigurasi Firebase</h2>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); saveFirebaseConfig(configForm); alert("Disimpan!"); window.location.reload(); }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="text-[10px] font-bold text-gray-400 uppercase">API Key</label><input type="text" value={configForm.apiKey} onChange={(e) => setConfigForm({...configForm, apiKey: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs" /></div>
                            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Database URL</label><input type="text" value={configForm.databaseURL} onChange={(e) => setConfigForm({...configForm, databaseURL: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs" /></div>
                        </div>
                        <button type="submit" className="w-full bg-[#00a896] text-white py-3 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center shadow-lg"><Save size={18} className="mr-2" /> Simpan</button>
                    </form>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
