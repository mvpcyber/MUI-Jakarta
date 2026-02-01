import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Bell, Send, Trash2, LogOut, CheckCircle, Smartphone, 
  Settings, Database, Save, Users, Home, 
  Menu, X, MapPin, Loader2, Clock, Map as MapIcon, 
  Search, ChevronDown, Monitor, Cpu, Globe, Activity,
  Filter, ExternalLink,
  // Fix: Add missing ShieldCheck import from lucide-react
  ShieldCheck
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserData | null>(null);
  
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

  // Status Counts for Sidebar
  const stats = useMemo(() => {
    const now = Date.now();
    const online = users.filter(u => now - new Date(u.lastActive || 0).getTime() < 300000);
    const idle = users.filter(u => {
        const diff = now - new Date(u.lastActive || 0).getTime();
        return diff >= 300000 && diff < 1800000;
    });
    const offline = users.filter(u => now - new Date(u.lastActive || 0).getTime() >= 1800000);
    
    return { online, idle, offline, total: users.length };
  }, [users]);

  // Init & Update Map
  useEffect(() => {
    if (activeTab === 'tracking' && mapContainerRef.current && !mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current, {
            zoomControl: false
        }).setView([-6.2088, 106.8456], 12);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(mapRef.current);

        L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }

    if (activeTab === 'tracking' && mapRef.current) {
        users.forEach(user => {
            if (user.latitude && user.longitude) {
                const now = Date.now();
                const lastActiveTime = new Date(user.lastActive || 0).getTime();
                const diff = now - lastActiveTime;
                
                let statusColor = '#9ca3af'; // Offline
                let isPulse = false;
                
                if (diff < 300000) { // < 5 min
                    statusColor = '#22c55e'; // Online
                    isPulse = true;
                } else if (diff < 1800000) { // < 30 min
                    statusColor = '#f59e0b'; // Idle
                }

                const iconHtml = isPulse 
                    ? `<div class="online-pulse" style="background: ${statusColor}; width: 22px; height: 22px;"></div>` 
                    : `<div style="background: ${statusColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`;
                
                const customIcon = L.divIcon({
                    html: iconHtml,
                    className: 'custom-div-icon',
                    iconSize: [22, 22],
                    iconAnchor: [11, 11]
                });

                if (markersRef.current[user.id]) {
                    markersRef.current[user.id].setLatLng([user.latitude, user.longitude]);
                    markersRef.current[user.id].setIcon(customIcon);
                } else {
                    const marker = L.marker([user.latitude, user.longitude], { icon: customIcon })
                        .addTo(mapRef.current)
                        .on('click', () => setSelectedUserDetail(user));
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

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
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
            <button onClick={() => { setActiveTab('tracking'); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'tracking' ? 'bg-white text-[#00827f] shadow-lg' : 'text-white/80 hover:bg-white/10'}`}><MapIcon size={18} /><span>Map Tracking</span></button>
            <button onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-white text-[#00827f] shadow-lg' : 'text-white/80 hover:bg-white/10'}`}><Users size={18} /><span>Data Pengguna</span></button>
            <button onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'settings' ? 'bg-white text-[#00827f] shadow-lg' : 'text-white/80 hover:bg-white/10'}`}><Settings size={18} /><span>Pengaturan DB</span></button>
         </nav>
         <div className="absolute bottom-0 left-0 w-full p-6 bg-[#006e6b]"><button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 bg-black/20 px-4 py-3 rounded-xl text-xs font-bold hover:bg-black/30 transition-colors"><LogOut size={14} /><span>Keluar</span></button></div>
      </aside>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-[90] md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      <main className="flex-1 min-w-0">
        <header className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-50">
           <div className="flex items-center space-x-3">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 md:hidden"><Menu size={24} /></button>
              <h2 className="font-bold text-gray-800 uppercase text-sm tracking-widest">{activeTab === 'tracking' ? 'Map Live' : activeTab}</h2>
           </div>
           <div className="flex items-center space-x-4">
              <button onClick={onLogout} className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors">
                 <LogOut size={18} /> <span className="text-xs font-bold hidden md:block uppercase">Logout</span>
              </button>
           </div>
        </header>

        <div className="p-0">
            {activeTab === 'notifications' && (
                <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Notification Form & History (Existing logic) */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="bg-orange-100 p-3 rounded-full text-orange-600"><Send size={24} /></div>
                                <h2 className="text-xl font-bold text-gray-800">Broadcast Pesan</h2>
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
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 ml-2">Riwayat Broadcast</h2>
                        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
                            {history.length === 0 ? <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed">Belum ada riwayat</div> : 
                                history.map((item) => (
                                    <div key={item.firebaseKey} className="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-[#00a896]">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-800 text-sm truncate pr-4">{item.title}</h3>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-[9px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{item.time}</span>
                                                <button onClick={(e) => handleDeleteNotification(item.firebaseKey!, e)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'tracking' && (
                <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
                    {/* Map Live Layout */}
                    <div className="relative flex-1 bg-white border-b border-gray-200 min-h-[400px]">
                        {/* Map Container */}
                        <div ref={mapContainerRef} className="absolute inset-0 z-0"></div>

                        {/* Status Laporan Overlay (Side) */}
                        <div className="absolute top-6 left-6 z-10 w-64 hidden lg:block">
                            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-800 flex items-center">
                                        <Activity size={14} className="mr-2 text-teal-600" /> Status User
                                    </h3>
                                    <ChevronDown size={14} className="text-gray-400" />
                                </div>
                                <div className="p-2 space-y-1">
                                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-900 text-white shadow-lg">
                                        <span className="text-xs font-bold">Semua Aktif</span>
                                        <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px] font-black">{stats.total}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                            <span className="text-xs font-bold text-gray-600">Online</span>
                                        </div>
                                        <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-md text-[10px] font-black">{stats.online.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                            <span className="text-xs font-bold text-gray-600">Idle (5m+)</span>
                                        </div>
                                        <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md text-[10px] font-black">{stats.idle.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
                                            <span className="text-xs font-bold text-gray-600">Offline</span>
                                        </div>
                                        <span className="bg-gray-50 text-gray-400 px-2 py-0.5 rounded-md text-[10px] font-black">{stats.offline.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom User List (Laporan Style) */}
                    <div className="h-2/5 bg-white flex flex-col min-h-[300px]">
                        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
                            <div>
                                <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Daftar User Live</h3>
                                <p className="text-[10px] text-gray-400">Klik item untuk menuju lokasi user.</p>
                            </div>
                            
                            <div className="flex items-center space-x-4 w-full md:w-auto">
                                <div className="relative flex-1 md:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Cari user, platform, atau lokasi..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                </div>
                                <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap">
                                    {filteredUsers.length} User Terdeteksi
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto p-4 overflow-y-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
                                {filteredUsers.map((user) => {
                                    const now = Date.now();
                                    const diff = now - new Date(user.lastActive || 0).getTime();
                                    const isOnline = diff < 300000;
                                    const isIdle = diff >= 300000 && diff < 1800000;
                                    
                                    return (
                                        <div 
                                            key={user.id} 
                                            onClick={() => {
                                                if(mapRef.current && user.latitude) {
                                                    mapRef.current.flyTo([user.latitude, user.longitude], 16);
                                                }
                                            }}
                                            className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-start space-x-3"
                                        >
                                            <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative">
                                                {user.platform.toLowerCase().includes('iphone') ? (
                                                    <Smartphone size={24} className="text-gray-400" />
                                                ) : (
                                                    <Monitor size={24} className="text-gray-400" />
                                                )}
                                                {isOnline && <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white online-pulse !w-2.5 !h-2.5"></div>}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${isOnline ? 'bg-green-50 text-green-600' : isIdle ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                                                        {isOnline ? 'Online' : isIdle ? 'Idle' : 'Offline'}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-red-500 flex items-center">
                                                        <Clock size={8} className="mr-1" /> {new Date(user.lastActive || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                                <h4 className="text-xs font-black text-gray-800 truncate mb-0.5">{user.name || "Guest User"}</h4>
                                                <div className="flex items-center text-[9px] text-gray-400">
                                                    <MapPin size={8} className="mr-1" /> {user.location || "Lokasi tidak diketahui"}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="max-w-6xl mx-auto p-4 md:p-8 bg-white rounded-3xl m-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Users size={24} /></div>
                        <div><h2 className="text-xl font-bold text-gray-800">Manajemen Pengguna</h2><p className="text-xs text-gray-500">Total: {users.length}</p></div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50"><tr className="text-[10px] text-gray-400 uppercase tracking-widest"><th className="py-3 px-4">User</th><th className="py-3 px-4">Lokasi</th><th className="py-3 px-4">Platform</th><th className="py-3 px-4">Status</th></tr></thead>
                            <tbody className="text-sm">
                                {users.map((u) => (
                                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-4 px-4 font-bold text-gray-800">{u.name || "Guest"}</td>
                                        <td className="py-4 px-4 text-gray-500">{u.location || "-"}</td>
                                        <td className="py-4 px-4 text-[10px] font-medium text-gray-400 uppercase">{u.platform}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${Date.now() - new Date(u.lastActive || 0).getTime() < 300000 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {Date.now() - new Date(u.lastActive || 0).getTime() < 300000 ? 'Online' : 'Offline'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="max-w-2xl mx-auto p-4 md:p-8 bg-white rounded-3xl m-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-8 text-[#00827f]">
                        <Database size={32} />
                        <h2 className="text-2xl font-black">Database Settings</h2>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); saveFirebaseConfig(configForm); alert("Config Disimpan!"); window.location.reload(); }} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Firebase API Key</label>
                            <input type="text" value={configForm.apiKey} onChange={(e) => setConfigForm({...configForm, apiKey: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-[#00827f] outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 tracking-widest">RTDB URL</label>
                            <input type="text" value={configForm.databaseURL} onChange={(e) => setConfigForm({...configForm, databaseURL: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-[#00827f] outline-none" />
                        </div>
                        <button type="submit" className="w-full bg-[#00827f] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-teal-100 flex items-center justify-center space-x-2">
                            <Save size={20} /><span>Save & Apply</span>
                        </button>
                    </form>
                </div>
            )}
        </div>
      </main>

      {/* USER DETAIL MODAL (MODERN CARD) */}
      {selectedUserDetail && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                  <div className="bg-[#00827f] p-8 text-white relative">
                      <button 
                        onClick={() => setSelectedUserDetail(null)}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                      >
                          <X size={18} />
                      </button>
                      <div className="flex flex-col items-center text-center">
                          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[24px] flex items-center justify-center mb-4 border border-white/20">
                              <UserAvatar platform={selectedUserDetail.platform} size={40} />
                          </div>
                          <h3 className="text-2xl font-black">{selectedUserDetail.name || "Guest User"}</h3>
                          <div className="flex items-center space-x-2 text-teal-100 text-[10px] font-bold mt-2 uppercase tracking-widest bg-black/10 px-4 py-1.5 rounded-full">
                              <Globe size={12} /> <span>{selectedUserDetail.location || "Jakarta Pusat"}</span>
                          </div>
                      </div>
                  </div>

                  <div className="p-8 space-y-6 bg-white">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-2xl">
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center"><Monitor size={10} className="mr-1"/> Platform</p>
                              <p className="text-xs font-black text-gray-700">{selectedUserDetail.platform}</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-2xl">
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center"><ShieldCheck size={10} className="mr-1"/> Security</p>
                              <p className="text-xs font-black text-teal-600">Active Session</p>
                          </div>
                      </div>

                      <div className="space-y-3">
                          <div className="flex items-start space-x-4 p-4 border border-gray-100 rounded-2xl">
                              <Cpu className="text-gray-400 mt-1" size={20} />
                              <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">User Agent String</p>
                                  <p className="text-[10px] text-gray-600 leading-relaxed italic">{selectedUserDetail.userAgent}</p>
                              </div>
                          </div>
                          <div className="flex items-center space-x-4 p-4 border border-gray-100 rounded-2xl">
                              <Clock className="text-gray-400" size={20} />
                              <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">Terakhir Aktif</p>
                                  <p className="text-xs font-black text-gray-700">{new Date(selectedUserDetail.lastActive || '').toLocaleString('id-ID')}</p>
                              </div>
                          </div>
                      </div>

                      <div className="pt-2">
                          <button 
                            onClick={() => {
                                if(selectedUserDetail.latitude) {
                                    window.open(`https://www.google.com/maps?q=${selectedUserDetail.latitude},${selectedUserDetail.longitude}`, '_blank');
                                }
                            }}
                            className="w-full bg-[#00827f] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-teal-100 flex items-center justify-center space-x-2 active:scale-95 transition-all"
                          >
                              <ExternalLink size={18} /> <span>Buka Google Maps</span>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const UserAvatar: React.FC<{ platform: string, size: number }> = ({ platform, size }) => {
    if (platform.toLowerCase().includes('iphone')) return <Smartphone size={size} />;
    if (platform.toLowerCase().includes('mac') || platform.toLowerCase().includes('windows')) return <Monitor size={size} />;
    return <Users size={size} />;
};

export default AdminDashboard;