import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  Loader2, 
  Info, 
  CheckCircle, 
  ExternalLink, 
  QrCode, 
  Building2,
  Calendar,
  Hash,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';

interface HalalProduct {
  nama_produk: string;
  nama_perusahaan: string;
  nomor_sertifikat: string;
  tgl_berlaku: string;
  kategori: string;
}

interface HalalPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const HalalPage: React.FC<HalalPageProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'lokal' | 'luar'>('lokal');
  const [productName, setProductName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<HalalProduct[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (queryText: string, page: number) => {
    if (!queryText.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setError(null);
    
    try {
      // Endpoint BPJPH mengembalikan HTML, bukan JSON langsung
      const baseUrl = "https://bpjph.halal.go.id/sertifikat-halal/sertifikat";
      const targetUrl = `${baseUrl}?nama_produk=${encodeURIComponent(queryText.trim())}&page=${page}`;
      
      // Gunakan /get untuk mendapatkan konten sebagai string di dalam JSON wrapper (menghindari error Unexpected token <)
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Gagal terhubung ke proxy server");

      const wrapper = await response.json();
      const htmlContent = wrapper.contents;

      // Gunakan DOMParser untuk membedah HTML dari BPJPH
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Mencari baris data di tabel atau elemen list (Struktur BPJPH biasanya dalam tabel)
      const rows = doc.querySelectorAll('table tbody tr');
      const results: HalalProduct[] = [];

      if (rows && rows.length > 0) {
        rows.forEach((row) => {
          const cols = row.querySelectorAll('td');
          if (cols.length >= 4) {
            results.push({
              nama_produk: cols[1]?.textContent?.trim() || "N/A",
              nama_perusahaan: cols[2]?.textContent?.trim() || "N/A",
              nomor_sertifikat: cols[3]?.textContent?.trim() || "N/A",
              tgl_berlaku: cols[4]?.textContent?.trim() || "N/A",
              kategori: "Produk Terdaftar"
            });
          }
        });
      }

      setProducts(results);
      
      // Jika hasil kosong tapi tidak ada error, mungkin struktur HTML berbeda atau memang tidak ada data
      if (results.length === 0 && htmlContent.toLowerCase().includes('tidak ditemukan')) {
          setProducts([]);
      }
      
    } catch (err) {
      console.error("Halal Search Scraping Error:", err);
      setError("Sistem BPJPH sedang sibuk atau struktur data tidak terbaca. Silakan gunakan link cek manual.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    performSearch(productName, 1);
  };

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    performSearch(productName, nextPage);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      performSearch(productName, prevPage);
    }
  };

  const openOfficialSihalal = () => {
    window.open(`https://info.halal.go.id/search-produk/`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[180]">
      <div className="w-full h-full bg-[#fcfcfc] flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="pt-12 pb-4 px-6 bg-white flex items-center justify-between border-b border-gray-100">
        <button onClick={onClose} className="p-2 text-gray-400 active:scale-90 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-gray-800">Layanan Halal</h2>
        <div className="w-10"></div>
      </div>

      {/* BPJPH Layout Search Form */}
      <div className="bg-white px-6 py-8 shadow-sm">
        <div className="flex items-center space-x-6 mb-8 overflow-x-auto no-scrollbar border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('lokal')}
            className={`whitespace-nowrap pb-3 text-[13px] font-bold transition-all relative ${activeTab === 'lokal' ? 'text-[#00a896]' : 'text-gray-400'}`}
          >
            Cek Produk Halal (BPJPH)
            {activeTab === 'lokal' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00a896]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('luar')}
            className={`whitespace-nowrap pb-3 text-[13px] font-bold transition-all relative ${activeTab === 'luar' ? 'text-[#00a896]' : 'text-gray-400'}`}
          >
            Registrasi SH Luar Negeri
            {activeTab === 'luar' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00a896]"></div>}
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Masukkan Nama Produk (Contoh: Indomie, Wardah)"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-white border border-teal-600/20 rounded-lg py-4 px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a896] transition-all shadow-sm"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !productName.trim()}
            className="w-full bg-[#00a896] text-white py-4 rounded-lg font-bold text-sm uppercase tracking-widest shadow-lg shadow-teal-50 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            <span>Cari di Database BPJPH</span>
          </button>
        </form>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto bg-[#f8fafc] px-5 py-6">
        {error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 border border-red-100">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-sm font-bold text-gray-800 mb-2">Kendala Sinkronisasi</h3>
            <p className="text-[11px] text-gray-500 mb-6 leading-relaxed">
              Kami kesulitan mengambil data otomatis. Anda bisa mencoba lagi atau menggunakan tautan cek manual di bawah ini.
            </p>
            <div className="flex flex-col w-full space-y-3">
               <button 
                 onClick={() => performSearch(productName, currentPage)}
                 className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold flex items-center justify-center"
               >
                 <RefreshCw size={14} className="mr-2" /> COBA LAGI
               </button>
               <button 
                 onClick={openOfficialSihalal}
                 className="w-full py-3 bg-[#00a896] text-white rounded-xl text-xs font-bold flex items-center justify-center"
               >
                 <ExternalLink size={14} className="mr-2" /> PORTAL SIHALAL RESMI
               </button>
            </div>
          </div>
        ) : !hasSearched ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-4 border border-teal-100">
              <ShieldCheck size={32} className="text-[#00a896]" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Cek Produk Halal</h3>
            <p className="text-xs text-gray-500 max-w-[240px] leading-relaxed">
              Mencari data real-time pada sistem informasi sertifikasi halal BPJPH.
            </p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#00a896] mb-3" size={32} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Membaca Data BPJPH...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-4 pb-20">
            <div className="flex justify-between items-center px-1 mb-2">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Halaman {currentPage}</span>
               <span className="text-[10px] font-bold text-[#00a896] uppercase bg-teal-50 px-2 py-0.5 rounded-md">Live Data</span>
            </div>
            {products.map((product, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative group active:scale-[0.99] transition-all">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex-1 pr-3">
                      <span className="text-[9px] font-black text-[#00a896] uppercase bg-teal-50 px-2 py-0.5 rounded-md mb-1.5 inline-block">{product.kategori}</span>
                      <h4 className="text-[15px] font-bold text-gray-800 leading-snug">{product.nama_produk}</h4>
                   </div>
                   <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                      <CheckCircle size={22} fill="currentColor" className="text-white" />
                   </div>
                </div>
                
                <div className="space-y-2.5">
                   <div className="flex items-start space-x-2">
                      <Building2 size={14} className="text-gray-400 mt-0.5" />
                      <div>
                         <p className="text-[9px] font-bold text-gray-400 uppercase">Pelaku Usaha</p>
                         <p className="text-xs font-bold text-gray-700 leading-tight">{product.nama_perusahaan}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start space-x-2">
                         <Hash size={14} className="text-gray-400 mt-0.5" />
                         <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">No. Sertifikat</p>
                            <p className="text-[11px] font-bold text-teal-700">{product.nomor_sertifikat}</p>
                         </div>
                      </div>
                      <div className="flex items-start space-x-2">
                         <Calendar size={14} className="text-gray-400 mt-0.5" />
                         <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">Berlaku Hingga</p>
                            <p className="text-[11px] font-bold text-orange-600">{product.tgl_berlaku}</p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-50 flex space-x-2">
                   <button 
                     onClick={() => window.open(`https://info.halal.go.id/search-produk/`, '_blank')}
                     className="flex-1 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold flex items-center justify-center hover:bg-gray-100 transition-colors"
                   >
                      Cek Detail <ExternalLink size={12} className="ml-1.5" />
                   </button>
                   <button className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center border border-gray-100 active:bg-gray-100">
                      <QrCode size={18} />
                   </button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-4">
               <button 
                 onClick={handlePrevPage}
                 disabled={currentPage === 1}
                 className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-100 text-xs font-bold text-gray-600 disabled:opacity-30"
               >
                 <ChevronLeft size={16} />
                 <span>Kembali</span>
               </button>
               <button 
                 onClick={handleNextPage}
                 className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-100 text-xs font-bold text-gray-600"
               >
                 <span>Berikutnya</span>
                 <ChevronRight size={16} />
               </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
              <Info size={32} />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Data Tidak Ditemukan</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Tidak ditemukan data produk "{productName}" pada database publik BPJPH.
            </p>
            <button 
              onClick={openOfficialSihalal}
              className="w-full py-4 bg-[#00a896] text-white rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-teal-100"
            >
              Cari di Portal Sihalal (Web)
            </button>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-gray-50">
         <div className="flex items-center space-x-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <Database size={16} className="text-blue-500 shrink-0" />
            <p className="text-[10px] text-blue-800 font-bold leading-relaxed">
              Data disinkronkan langsung dari portal resmi BPJPH Kemenag RI (Sihalal).
            </p>
         </div>
      </div>
      </div>
    </div>
  );
};

export default HalalPage;