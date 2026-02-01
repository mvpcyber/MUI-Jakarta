
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Info } from 'lucide-react';

interface CalendarPageProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper untuk Pasaran Jawa
// Patokan: 1 Januari 2024 adalah Senin Pahing
const PASARAN = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
const REF_DATE = new Date(2024, 0, 1); // 1 Jan 2024
const REF_PASARAN_INDEX = 1; // Pahing

const getPasaran = (date: Date) => {
  const diffTime = date.getTime() - REF_DATE.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  let index = (REF_PASARAN_INDEX + diffDays) % 5;
  if (index < 0) index += 5;
  return PASARAN[index];
};

// Helper Angka Arab
const toArabicDigits = (n: number) => {
  return n.toString().replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
};

// Mock Data Hari Besar (Contoh)
const HOLIDAYS: Record<string, { title: string; type: 'national' | 'islamic' }[]> = {
  "1-1": [{ title: "Tahun Baru Masehi", type: 'national' }],
  "8-2": [{ title: "Isra Mi'raj Nabi Muhammad SAW", type: 'islamic' }],
  "10-2": [{ title: "Tahun Baru Imlek", type: 'national' }],
  "11-3": [{ title: "Hari Nyepi", type: 'national' }],
  "29-3": [{ title: "Wafat Isa Al Masih", type: 'national' }],
  "31-3": [{ title: "Hari Paskah", type: 'national' }],
  "10-4": [{ title: "Hari Raya Idul Fitri 1445 H", type: 'islamic' }],
  "11-4": [{ title: "Cuti Bersama Idul Fitri", type: 'national' }],
  "1-5": [{ title: "Hari Buruh Internasional", type: 'national' }],
  "9-5": [{ title: "Kenaikan Isa Al Masih", type: 'national' }],
  "23-5": [{ title: "Hari Raya Waisak", type: 'national' }],
  "1-6": [{ title: "Hari Lahir Pancasila", type: 'national' }],
  "17-6": [{ title: "Hari Raya Idul Adha 1445 H", type: 'islamic' }],
  "7-7": [{ title: "Tahun Baru Islam 1446 H", type: 'islamic' }],
  "17-8": [{ title: "Hari Kemerdekaan RI", type: 'national' }],
  "16-9": [{ title: "Maulid Nabi Muhammad SAW", type: 'islamic' }],
  "25-12": [{ title: "Hari Raya Natal", type: 'national' }],
  // Tambahan dummy data sesuai gambar referensi user (Februari 2026 sebagai contoh request)
  "1-2-2026": [{ title: "Hari lahir Lembaga Falakiyah Nahdlatul Ulama", type: 'islamic' }],
  "3-2-2026": [{ title: "Nisfu Sya'ban", type: 'islamic' }],
  "20-2-2026": [{ title: "Awal Ramadhan (Estimasi)", type: 'islamic' }],
};

const CalendarPage: React.FC<CalendarPageProps> = ({ isOpen, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Reset ke tanggal hari ini saat dibuka
  useEffect(() => {
    if (isOpen) {
      setCurrentDate(new Date());
      setSelectedDate(new Date());
    }
  }, [isOpen]);

  const daysInMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  }, [currentDate]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  }, [currentDate]);

  const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long' });
  const year = currentDate.getFullYear();

  // Hijri Month Name for Header
  const hijriDateString = useMemo(() => {
      return new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', { month: 'long', year: 'numeric' })
        .format(currentDate)
        .replace(/AH|H/gi, '')
        .trim();
  }, [currentDate]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate Calendar Grid
  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();

    // Empty slots for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 bg-transparent"></div>);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const isToday = dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear();
      const isSelected = dateObj.getDate() === selectedDate.getDate() && dateObj.getMonth() === selectedDate.getMonth() && dateObj.getFullYear() === selectedDate.getFullYear();
      
      const pasaran = getPasaran(dateObj);
      
      // Get Hijri Date Number
      const hijriPart = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', { day: 'numeric' }).format(dateObj);
      // Remove 'Tahun' text if any, keep digits
      const hijriDay = toArabicDigits(parseInt(hijriPart.replace(/\D/g, '')));

      // Check Holiday
      const dateKey = `${d}-${currentDate.getMonth() + 1}`;
      const dateKeyFull = `${d}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
      const holiday = HOLIDAYS[dateKey] || HOLIDAYS[dateKeyFull];
      const isSunday = dateObj.getDay() === 0;

      days.push(
        <button 
          key={d} 
          onClick={() => setSelectedDate(dateObj)}
          className={`h-[4.5rem] relative flex flex-col items-center justify-start pt-1 rounded-xl transition-all border
            ${isSelected ? 'bg-teal-50 border-[#00a896] shadow-sm ring-1 ring-[#00a896]' : 'bg-white border-transparent hover:bg-gray-50'}
          `}
        >
          {/* Hijri Date (Top Right) */}
          <span className={`absolute top-1 right-1.5 text-[10px] font-arabic ${isSelected ? 'text-[#00a896]' : 'text-gray-400'}`}>
            {hijriDay}
          </span>

          {/* Masehi Date (Center) */}
          <span className={`text-xl font-bold mt-1 ${isToday ? 'text-white bg-[#00a896] w-8 h-8 rounded-full flex items-center justify-center shadow-md' : (isSunday || holiday) ? 'text-red-500' : 'text-gray-800'}`}>
            {d}
          </span>

          {/* Pasaran (Bottom) */}
          <span className="text-[9px] text-gray-400 font-medium mt-1 uppercase tracking-tight">
            {pasaran}
          </span>

          {/* Event Dots */}
          <div className="flex space-x-0.5 mt-1">
             {holiday && (
                 <span className={`w-1.5 h-1.5 rounded-full ${holiday[0].type === 'islamic' ? 'bg-teal-500' : 'bg-blue-500'}`}></span>
             )}
             {isSelected && !holiday && (
                 <span className="w-1.5 h-1.5 rounded-full bg-[#00a896] opacity-30"></span>
             )}
          </div>
        </button>
      );
    }
    return days;
  };

  // Get events for the selected date or month
  const currentMonthEvents = useMemo(() => {
     const events = [];
     for(let d=1; d<=daysInMonth; d++) {
         const dateKey = `${d}-${currentDate.getMonth() + 1}`;
         const dateKeyFull = `${d}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
         if(HOLIDAYS[dateKey]) {
             events.push({ day: d, ...HOLIDAYS[dateKey][0] });
         }
         if(HOLIDAYS[dateKeyFull]) {
             events.push({ day: d, ...HOLIDAYS[dateKeyFull][0] });
         }
     }
     return events;
  }, [currentDate, daysInMonth]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] bg-[#f8fafc] flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div 
        className="pt-12 pb-8 px-6 relative overflow-hidden shadow-lg bg-[#00a896]"
        style={{ 
          backgroundImage: 'url(https://img.freepik.com/premium-vector/islamic-background-green-pattern_650032-387.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
        <div className="relative z-10">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-4">
                <button 
                    onClick={onClose} 
                    className="p-2 bg-white/10 rounded-xl backdrop-blur-md text-white active:scale-90 transition-transform"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex space-x-2">
                     <button onClick={prevMonth} className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20"><ChevronLeft size={20}/></button>
                     <button onClick={nextMonth} className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20"><ChevronRight size={20}/></button>
                </div>
            </div>
            
            {/* Title Info */}
            <div className="text-center mt-2">
                <h2 className="text-2xl font-black text-white tracking-tight">{monthName} {year}</h2>
                <p className="text-sm font-medium text-teal-100 mt-1">{hijriDateString} H</p>
            </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="flex-1 overflow-y-auto">
          {/* Days Name Header */}
          <div className="grid grid-cols-7 gap-1 px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
             {['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day, i) => (
                 <div key={day} className={`text-center text-[10px] font-bold uppercase tracking-wider ${i === 0 ? 'text-red-500' : 'text-gray-500'}`}>
                    {day}
                 </div>
             ))}
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-7 gap-1 px-4 py-2 bg-white pb-6">
              {renderCalendarDays()}
          </div>

          {/* Event List Section */}
          <div className="px-5 py-6 bg-[#f8fafc]">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 border-l-4 border-[#00a896] pl-3 text-sm">Hari Besar & Libur Nasional</h3>
             </div>

             <div className="space-y-3 pb-20">
                {currentMonthEvents.length > 0 ? (
                    currentMonthEvents.map((ev, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-start space-x-4 shadow-sm">
                             <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${ev.type === 'national' ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-600'}`}>
                                 <span className="text-[10px] font-bold uppercase">{monthName.slice(0, 3)}</span>
                                 <span className="text-lg font-black leading-none">{ev.day}</span>
                             </div>
                             <div className="flex-1 pt-0.5">
                                 <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1">{ev.title}</h4>
                                 <p className="text-[10px] text-gray-400">
                                     {['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][new Date(year, currentDate.getMonth(), ev.day).getDay()]}, 
                                     {` ${ev.day} ${monthName} ${year}`}
                                     {/* Simple Hijri converter for list display could be added here */}
                                 </p>
                             </div>
                             <Info size={16} className="text-gray-300 mt-1" />
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                        <p className="text-xs text-gray-400">Tidak ada hari besar bulan ini.</p>
                    </div>
                )}
             </div>
          </div>
      </div>
    </div>
  );
};

export default CalendarPage;
