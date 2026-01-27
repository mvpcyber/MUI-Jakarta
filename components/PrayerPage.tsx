
import React from 'react';
import { ArrowLeft, Clock, MapPin, Loader2, RefreshCw } from 'lucide-react';
import { PrayerSchedule } from '../App';

interface PrayerPageProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: PrayerSchedule | null;
  location: string;
  nextPrayer: { name: string; time: string };
}

const PrayerPage: React.FC<PrayerPageProps> = ({ isOpen, onClose, schedule, location, nextPrayer }) => {
  if (!isOpen) return null;

  const times = schedule ? [
    { label: 'Subuh', time: schedule.subuh, icon: '🌅', color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Terbit', time: schedule.terbit, icon: '☀️', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Dzuhur', time: schedule.dzuhur, icon: '🌤️', color: 'bg-blue-50 text-blue-600' },
    { label: 'Ashar', time: schedule.ashar, icon: '🌥️', color: 'bg-orange-50 text-orange-600' },
    { label: 'Maghrib', time: schedule.maghrib, icon: '🌇', color: 'bg-red-50 text-red-600' },
    { label: 'Isya', time: schedule.isya, icon: '🌙', color: 'bg-slate-800 text-white' },
  ] : [];

  return (
    <div className="fixed inset-0 z-[120] bg-[#f8fafc] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header Card Style */}
      <div 
        className="pt-12 pb-24 px-6 relative rounded-b-[40px] shadow-lg bg-[#00a896] overflow-hidden"
        style={{ 
          backgroundImage: 'url(https://img.freepik.com/premium-vector/islamic-background-green-pattern_650032-387.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
        <div className="relative flex items-center justify-between mb-8 z-10">
          <button 
            onClick={onClose} 
            className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md text-white active:scale-90 transition-transform"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold text-white tracking-tight leading-none uppercase">Jadwal Shalat</h2>
            <span className="text-[9px] font-black text-[#5eead4] uppercase tracking-widest mt-1">Sesuai Kemenag RI</span>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="relative flex flex-col items-center text-center text-white z-10">
          <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center space-x-2 mb-4 border border-white/10 shadow-xl">
            <MapPin size={14} className="text-[#5eead4]" />
            <span className="text-xs font-bold uppercase tracking-tight">{location}</span>
          </div>
          
          <div className="mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#5eead4] opacity-80">Menuju Waktu</span>
            <h3 className="text-4xl font-black tracking-tighter mt-1 uppercase drop-shadow-lg">{nextPrayer.name}</h3>
          </div>
          
          <div className="flex items-center space-x-2 bg-orange-500 px-6 py-2 rounded-2xl mt-4 shadow-xl shadow-orange-500/30">
             <Clock size={16} className="text-white" />
             <span className="text-2xl font-black text-white">{nextPrayer.time}</span>
             <span className="text-[10px] font-bold opacity-60">WIB</span>
          </div>
        </div>
      </div>

      {/* Grid Content with Card View */}
      <div className="flex-1 -mt-16 px-5 pb-12 overflow-y-auto relative z-10">
        {!schedule ? (
          <div className="bg-white p-12 rounded-[32px] shadow-sm flex flex-col items-center justify-center border border-gray-100">
            <Loader2 className="animate-spin text-[#00a896] mb-4" size={32} />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sinkronisasi Data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {times.map((item, idx) => {
              const isNext = nextPrayer.name.toLowerCase() === item.label.toLowerCase();
              return (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-5 rounded-[32px] border transition-all duration-300 ${
                    isNext 
                    ? 'bg-white border-[#00a896] shadow-xl shadow-teal-100 ring-2 ring-[#00a896]/10' 
                    : 'bg-white border-gray-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 flex items-center justify-center rounded-2xl text-2xl shadow-sm ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-widest block mb-0.5 ${isNext ? 'text-[#00a896]' : 'text-gray-400'}`}>
                        {item.label}
                      </span>
                      <span className={`text-2xl font-black tracking-tighter block leading-none ${isNext ? 'text-gray-800' : 'text-gray-800'}`}>
                        {item.time}
                      </span>
                    </div>
                  </div>
                  
                  {isNext ? (
                    <div className="bg-orange-50 px-4 py-2 rounded-2xl flex flex-col items-center">
                       <span className="text-[10px] font-black text-orange-600 uppercase tracking-tighter">Waktu Sekarang</span>
                       <RefreshCw size={12} className="text-orange-400 mt-1 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                       <Clock size={16} className="text-gray-200" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        <div className="mt-8 text-center pb-10">
           <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
             <RefreshCw size={12} className="text-gray-400" />
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
               Update Terakhir: {new Date().toLocaleTimeString('id-ID')}
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerPage;
