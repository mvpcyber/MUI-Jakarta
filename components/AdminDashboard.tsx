
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Send, Trash2, LogOut, CheckCircle, Smartphone, 
  AlertCircle, Settings, Database, Save, Users, Home, 
  Menu, X, MapPin, Loader2, Clock, Map as MapIcon, ShieldCheck 
} from 'lucide-react';
import { NotificationItem } from './NotificationModal';
import { ref, push, onValue, remove, set, update } from 'firebase/database';
import { db, isConfigured, getFirebaseConfig, saveFirebaseConfig, FirebaseConfigType } from '../firebaseConfig';

declare const L: any; // Leaflet Global

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
  receipts?: Record<string, string>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'users' | 'tracking' | 'settings'>(!isConfigured ? 'settings' : 'notifications');
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
  
  // Map State
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, any>>({});

  // Config State
  const [configForm, setConfigForm] = useState<FirebaseConfigType>(getFirebaseConfig());

  // Load Data from Firebase
  useEffect(() => {
    if (!dbStatus || !db) return;

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

  // Init & Update Map
  useEffect(() => {
    if (activeTab === 'tracking' && mapContainerRef.current && !mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current).setView([-6.2088, 106.8456], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(mapRef.current);
    }

    if (activeTab === 'tracking' && mapRef.current) {
        // Clear old markers if users changed significantly or just update them
        users.forEach(user => {
            if (user.latitude && user.longitude) {
                const isOnline = Date.now() - new Date(user.lastActive || 0).getTime() < 300000;
                const iconHtml = isOnline ? '<div class="online-pulse"></div>' : '<div class="offline-dot"></div>';
                
                const customIcon = L.divIcon({
                    html: iconHtml,
                    className: 'custom-div-icon',
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                });

                if (markersRef.current[user.id]) {
                    markersRef.current[user.id].setLatLng([user.latitude, user.longitude]);
                    markersRef.current[user.id].setIcon(customIcon);
                } else {
                    const marker = L.marker([user.latitude, user.longitude], { icon: customIcon })
                        .addTo(mapRef.current)
                        .bindPopup(`
                            <div class="p-1">
                                <p class="font-bold text-teal-700">${user.name || 'Guest User'}</p>
                                <p class="text-[10px] text-gray-500">${user.location || 'Lokasi tidak diketahui'}</p>
                                <p class="text-[9px] mt-1 italic">${isOnline ? 'Sedang Online' : 'Terakhir aktif: ' + new Date(user.lastActive || '').toLocaleTimeString()}</p>
                            </div>
                        `);
                    markersRef.current[user.id] = marker;
                }
            }
        });
    }

    return () => {
        if (activeTab !== 'tracking' && mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
            markersRef.current = {};
        }
    };
  }, [activeTab, users]);

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
      receipts: {}
    };

    try {
       await push(ref(db, 'notifications'), newNotif);
       setSuccess('Notifikasi Terbroadcast!');
       setTitle(''); setMessage('');
       setTimeout(() => setSuccess(''), 3000);
    } catch (err) { alert("Gagal mengirim."); }
  };

  const handleDeleteNotification = async (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!db || !window.confirm("Hapus riwayat pesan ini secara permanen?")) return;
    try {
        await remove(ref(db, `notifications/${key}`));
        if (selectedBroadcastKey === key) setSelectedBroadcastKey(null);
    } catch (err) {
        alert("Gagal menghapus data.");
    }
  };

  const selectedBroadcast = history.find(h => h.firebaseKey === selectedBroadcastKey);
  const receiptsCount = selectedBroadcast?.receipts ? Object.keys(selectedBroadcast.receipts).length : 0;
  const totalUsersCount = users.length;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
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
            <button onClick={() => { setActiveTab('tracking'); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'tracking' ? 'bg-white text-[#00827f] shadow-lg' : 'text-white/80 hover:bg-white/10'}`}><MapIcon size={18} /><span>Live Tracking</span></button>
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
                    <div className="space-y-6">
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-orange-100 p-3 rounded-full text-orange-600"><Send size={24} /></div>
                                    <h2 className="text-xl font-bold text-gray-800">Broadcast Pesan</h2>
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

                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 ml-2">Riwayat Broadcast</h2>
                        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
                            {history.length === 0 ? <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed">Belum ada riwayat</div> : 
                                history.map((item) => {
                                    const rCount = item.receipts ? Object.keys(item.receipts).length : 0;
                                    const percentage = totalUsersCount > 0 ? Math.round((rCount / totalUsersCount) * 100) : 0;
                                    return (
                                        <div key={item.firebaseKey} onClick={() => setSelectedBroadcastKey(item.firebaseKey!)} className={`group bg-white p-4 rounded-2xl border shadow-sm cursor-pointer transition-all hover:border-[#00a896] ${selectedBroadcastKey === item.firebaseKey ? 'ring-2 ring-[#00a896]' : 'border-gray-100'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-800 text-sm truncate pr-4">{item.title}</h3>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-[9px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{item.time}</span>
                                                    <button 
                                                        onClick={(e) => handleDeleteNotification(item.firebaseKey!, e)}
                                                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
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

            {activeTab === 'tracking' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="bg-teal-100 p-3 rounded-full text-teal-600"><MapIcon size={24} /></div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Live User Tracking</h2>
                                    <p className="text-xs text-gray-500">Memantau persebaran pengguna aktif MUI Jakarta</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1.5 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                                    <div className="online-pulse !w-2.5 !h-2.5 !border-none"></div>
                                    <span className="text-[10px] font-bold text-green-700 uppercase">Online</span>
                                </div>
                            </div>
                        </div>

                        <div 
                            ref={mapContainerRef} 
                            className="w-full h-[500px] rounded-3xl overflow-hidden border border-gray-100 shadow-inner z-0"
                            style={{ backgroundColor: '#f3f4f6' }}
                        ></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Pengguna</h3>
                            <p className="text-3xl font-black text-gray-800">{users.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Online Sekarang</h3>
                            <p className="text-3xl font-black text-green-500">
                                {users.filter(u => Date.now() - new Date(u.lastActive || 0).getTime() < 300000).length}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Platform Terpopuler</h3>
                            <p className="text-lg font-black text-gray-800 truncate">iPhone / Android</p>
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
                            <thead><tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-100"><th className="py-3 px-4">Nama</th><th className="py-3 px-4">Lokasi</th><th className="py-3 px-4">Terakhir Aktif</th><th className="py-3 px-4">Status</th></tr></thead>
                            <tbody className="text-xs text-gray-600">
                                {users.map((user) => {
                                    const isOnline = Date.now() - new Date(user.lastActive || 0).getTime() < 300000;
                                    return (
                                        <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800">{user.name || "Guest User"}</span>
                                                    <span className="text-[10px] text-gray-400">{user.platform}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">{user.location || "Unknown"}</td>
                                            <td className="py-3 px-4 text-gray-400">{new Date(user.lastActive || '').toLocaleTimeString()}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-2">
                                                    {isOnline ? <div className="online-pulse !w-2 !h-2 !border-none"></div> : <div className="w-2 h-2 bg-gray-300 rounded-full"></div>}
                                                    <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${isOnline ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                        {isOnline ? 'Online' : 'Offline'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
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
