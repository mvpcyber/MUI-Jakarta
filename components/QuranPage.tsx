
import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowLeft, Loader2, Book, Star, ChevronRight, Eye, EyeOff, Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

interface Surah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
}

interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: {
    [key: string]: string;
  };
}

interface SurahDetail extends Surah {
  audioFull: {
    [key: string]: string;
  };
  ayat: Ayat[];
}

interface QuranPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const toArabicDigits = (num: number) => {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => digits[parseInt(d)]).join('');
};

const QuranPage: React.FC<QuranPageProps> = ({ isOpen, onClose }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // View states
  const [showLatin, setShowLatin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  
  // State for detail view
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Audio States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [activeAyat, setActiveAyat] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen && surahs.length === 0) {
      fetchSurahs();
    }
  }, [isOpen]);

  // Clean up audio on close
  useEffect(() => {
    if (!isOpen && isPlaying) {
      stopAudio();
    }
  }, [isOpen]);

  const fetchSurahs = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://equran.id/api/v2/surat');
      const result = await response.json();
      if (result.code === 200) {
        setSurahs(result.data);
      }
    } catch (error) {
      console.error('Error fetching Quran data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSurahDetail = async (nomor: number) => {
    setLoadingDetail(true);
    try {
      const response = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
      const result = await response.json();
      if (result.code === 200) {
        setSurahDetail(result.data);
      }
    } catch (error) {
      console.error('Error fetching Surah detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSurahClick = (surah: Surah) => {
    stopAudio();
    setSelectedSurah(surah);
    fetchSurahDetail(surah.nomor);
  };

  const handleBackToList = () => {
    stopAudio();
    setSelectedSurah(null);
    setSurahDetail(null);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);
    setCurrentAudioUrl(null);
    setActiveAyat(null);
  };

  const toggleAudio = (url: string, ayatNum: number | null = null) => {
    if (currentAudioUrl === url && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else if (currentAudioUrl === url && !isPlaying) {
      audioRef.current?.play();
      setIsPlaying(true);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setCurrentAudioUrl(url);
        setIsPlaying(true);
        setActiveAyat(ayatNum);
      }
    }
  };

  const filteredSurahs = surahs.filter(s => 
    s.namaLatin.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.nomor.toString() === searchQuery
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-[#f8fafc] flex flex-col animate-in slide-in-from-right duration-300">
      <audio 
        ref={audioRef} 
        onEnded={() => {
          setIsPlaying(false);
          setActiveAyat(null);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Header Section */}
      <div 
        className="pt-12 pb-8 px-6 relative overflow-hidden shadow-lg bg-[#00a896]"
        style={{ 
          backgroundImage: 'url(https://img.freepik.com/premium-vector/islamic-background-green-pattern_650032-387.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
        <div className="relative z-10 flex items-center justify-between mb-4">
          <button 
            onClick={selectedSurah ? handleBackToList : onClose} 
            className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md text-white active:scale-90 transition-transform"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
              {selectedSurah ? selectedSurah.namaLatin : 'Al-Quranul Karim'}
            </h2>
            <div className="flex items-center justify-center mt-0.5">
               <span className="text-[10px] font-black text-[#5eead4] uppercase tracking-[0.2em]">
                 {selectedSurah ? `${selectedSurah.namaLatin.toUpperCase()} • ${selectedSurah.jumlahAyat} AYAT` : 'Mushaf Standar Kemenag RI'}
               </span>
            </div>
          </div>

          {selectedSurah && !loadingDetail && surahDetail ? (
             <button 
                onClick={() => toggleAudio(surahDetail.audioFull["01"])}
                className={`p-2.5 rounded-2xl backdrop-blur-md text-white active:scale-90 transition-transform ${isPlaying && activeAyat === null ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'bg-white/10'}`}
             >
               {isPlaying && activeAyat === null ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
             </button>
          ) : (
            <div className="w-10"></div>
          )}
        </div>

        {/* Action Controls for Detail View */}
        {selectedSurah && !loadingDetail && (
          <div className="relative z-10 flex justify-center space-x-3 mt-4">
            <button 
              onClick={() => setShowLatin(!showLatin)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-md border text-[10px] font-black uppercase tracking-wider transition-all ${showLatin ? 'bg-white/20 border-white/20 text-white' : 'bg-black/20 border-white/10 text-white/50'}`}
            >
              {showLatin ? <Eye size={14} /> : <EyeOff size={14} />}
              <span>Latin</span>
            </button>
            <button 
              onClick={() => setShowTranslation(!showTranslation)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-md border text-[10px] font-black uppercase tracking-wider transition-all ${showTranslation ? 'bg-white/20 border-white/20 text-white' : 'bg-black/20 border-white/10 text-white/50'}`}
            >
              {showTranslation ? <Eye size={14} /> : <EyeOff size={14} />}
              <span>Arti</span>
            </button>
          </div>
        )}

        {/* Search Bar (Only shown in list view) */}
        {!selectedSurah && (
          <div className="relative z-10 px-2 mt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
              <input 
                type="text" 
                placeholder="Cari surat atau nomor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#5eead4] backdrop-blur-md transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {selectedSurah ? (
          /* Detail View: Ayat-ayat Surat */
          loadingDetail ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#00a896] mb-4" size={40} />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Memuat Ayat...</p>
            </div>
          ) : surahDetail ? (
            <div className="space-y-6 pb-24">
              {/* Bismillah (if not At-Tawbah) */}
              {selectedSurah.nomor !== 1 && selectedSurah.nomor !== 9 && (
                <div className="text-center py-8">
                  <p className="text-3xl font-arabic text-gray-800" style={{ fontFamily: 'serif' }}>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
                </div>
              )}

              {surahDetail.ayat.map((a) => (
                <div 
                  key={a.nomorAyat} 
                  id={`ayat-${a.nomorAyat}`}
                  className={`bg-white rounded-[32px] p-6 border transition-all duration-300 relative overflow-hidden group ${activeAyat === a.nomorAyat ? 'border-[#00a896] shadow-xl shadow-teal-100 ring-2 ring-[#00a896]/10' : 'border-gray-100 shadow-sm'}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    {/* Verse Number in Arabic inside an Islamic frame */}
                    <div className="relative w-12 h-12 flex items-center justify-center">
                       <svg className="absolute inset-0 w-full h-full text-teal-50 group-hover:text-teal-100 transition-colors" viewBox="0 0 100 100">
                          <path d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z" fill="currentColor" />
                       </svg>
                       <span className="relative text-lg font-arabic font-bold text-[#00a896]" style={{ fontFamily: 'serif' }}>{toArabicDigits(a.nomorAyat)}</span>
                    </div>

                    <button 
                      onClick={() => toggleAudio(a.audio["01"], a.nomorAyat)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeAyat === a.nomorAyat && isPlaying ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-teal-50 hover:text-teal-600'}`}
                    >
                      {activeAyat === a.nomorAyat && isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                    </button>
                  </div>
                  
                  <div className="text-right mb-6">
                    <p className="text-3xl font-arabic leading-[2.6] text-gray-800" style={{ fontFamily: 'serif', direction: 'rtl' }}>
                      {a.teksArab}
                    </p>
                  </div>
                  
                  {(showLatin || showTranslation) && (
                    <div className="space-y-4 pt-4 border-t border-gray-50">
                      {showLatin && (
                        <p className="text-[13px] text-[#00a896] font-medium italic leading-relaxed">
                          {a.teksLatin}
                        </p>
                      )}
                      {showTranslation && (
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                          {a.teksIndonesia}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-sm font-bold text-gray-400">Gagal memuat detail surat</p>
            </div>
          )
        ) : (
          /* List View: Daftar Surat */
          loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#00a896] mb-4" size={40} />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mengunduh Mushaf...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 pb-10">
              {filteredSurahs.map((surah) => (
                <button 
                  key={surah.nomor}
                  onClick={() => handleSurahClick(surah)}
                  className="group flex items-center justify-between p-4 bg-white rounded-[28px] border border-gray-100 shadow-sm active:scale-[0.98] transition-all hover:border-[#00a896]/30 hover:shadow-md text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <div className="absolute inset-0 bg-teal-50 rounded-xl rotate-45 group-hover:bg-[#00a896] group-hover:rotate-90 transition-all duration-300"></div>
                      <span className="relative text-sm font-black text-[#00a896] group-hover:text-white">{surah.nomor}</span>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-black text-gray-800 tracking-tight group-hover:text-[#00a896] transition-colors">{surah.namaLatin}</h3>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{surah.arti}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{surah.jumlahAyat} Ayat</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="text-2xl font-arabic text-[#00a896] mb-1 leading-none tracking-normal" style={{ fontFamily: 'serif' }}>
                      {surah.nama}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="text-[8px] font-black text-orange-500 uppercase tracking-tighter bg-orange-50 px-2 py-0.5 rounded-full">{surah.tempatTurun}</span>
                    </div>
                  </div>
                </button>
              ))}

              {filteredSurahs.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-sm font-bold text-gray-400">Surat "{searchQuery}" tidak ditemukan</p>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Mini Player - Floating at bottom */}
      {currentAudioUrl && (
        <div className="fixed bottom-6 left-6 right-6 bg-white rounded-[28px] shadow-2xl border border-gray-100 p-4 flex items-center space-x-4 animate-in slide-in-from-bottom duration-500 z-[200]">
           <div className="w-12 h-12 bg-[#00a896] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-200">
              <Volume2 size={24} />
           </div>
           <div className="flex-1 overflow-hidden">
              <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider truncate">
                {activeAyat ? `Ayat ${activeAyat}` : 'Murottal Surat'}
              </h4>
              <p className="text-[10px] font-bold text-teal-600 uppercase tracking-tight">
                {selectedSurah?.namaLatin || 'Al-Quran'}
              </p>
           </div>
           <div className="flex items-center space-x-2">
              <button 
                onClick={() => {
                  if (audioRef.current) {
                    if (isPlaying) audioRef.current.pause();
                    else audioRef.current.play();
                  }
                }}
                className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              <button 
                onClick={stopAudio}
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center active:scale-90 transition-transform"
              >
                <ArrowLeft className="rotate-[270deg]" size={20} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default QuranPage;
