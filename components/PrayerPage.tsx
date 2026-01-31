
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
        className="pt-6 pb-6 px-6 relative rounded-b-[32px] shadow-lg bg-[#00a896] overflow-hidden"
        style={{ 
          backgroundImage: 'url(https://img.freepik.com/premium-vector/islamic-background-green-pattern_650032-387.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
        
        {/* Navigation Bar (Absolute Positioning) */}
        <div className="absolute top-6 left-6 z-20">
            <button 
                onClick={onClose} 
                className="p-2 bg-white/10 rounded-xl backdrop-blur-md text-white active:scale-90 transition-transform"
            >
                <ArrowLeft size={20} />
            </button>
        </div>

        <div className="absolute top-6 right-6 z-20">
             <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center space-x-1.5 border border-white/10 shadow-sm">
                <MapPin size={12} className="text-[#5eead4]" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-white truncate max-w-[80px]">{location}</span>
             </div>
        </div>

        {/* Main Center Content: Menuju Waktu (Centered) */}
        <div className="relative z-10 flex flex-col items-center justify-center pt-1">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5eead4] opacity-90 mb-1">Menuju Waktu</span>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase drop-shadow-lg leading-none">
            {nextPrayer.name}
          </h2>
          
          <div className="flex items-center space-x-2 bg-orange-500 px-4 py-1.5 rounded-full mt-2 shadow-lg shadow-orange-500/30 border border-orange-400">
             <Clock size={14} className="text-white" />
             <span className="text-lg font-black text-white tracking-tight">{nextPrayer.time}</span>
             <span className="text-[10px] font-bold text-white/80">WIB</span>
          </div>
          
          <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest mt-4">Jadwal Shalat • Kemenag RI</span>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 -mt-4 px-5 pb-12 overflow-y-auto relative z-10">
        {!schedule ? (
          <div className="bg-white p-12 rounded-[32px] shadow-sm flex flex-col items-center justify-center border border-gray-100 mt-4">
            <Loader2 className="animate-spin text-[#00a896] mb-4" size={32} />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sinkronisasi Data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 pt-4">
            {times.map((item, idx) => {
              const isNext = nextPrayer.name.toLowerCase() === item.label.toLowerCase();
              return (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-4 rounded-[24px] border transition-all duration-300 ${
                    isNext 
                    ? 'bg-white border-[#00a896] shadow-xl shadow-teal-100 ring-2 ring-[#00a896]/10' 
                    : 'bg-white border-gray-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-2xl text-xl shadow-sm ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <span className={`text-[9px] font-black uppercase tracking-widest block mb-0.5 ${isNext ? 'text-[#00a896]' : 'text-gray-400'}`}>
                        {item.label}
                      </span>
                      <span className={`text-xl font-black tracking-tighter block leading-none ${isNext ? 'text-gray-800' : 'text-gray-800'}`}>
                        {item.time}
                      </span>
                    </div>
                  </div>
                  
                  {isNext ? (
                    <div className="bg-orange-50 px-3 py-1.5 rounded-xl flex flex-col items-center">
                       <span className="text-[8px] font-black text-orange-600 uppercase tracking-tighter">Sekarang</span>
                       <RefreshCw size={10} className="text-orange-400 mt-0.5 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                       <Clock size={14} className="text-gray-200" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        <div className="mt-6 text-center pb-10">
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
