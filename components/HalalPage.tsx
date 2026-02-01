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
  X
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
  const [businessName, setBusinessName] = useState('');
  const [certNumber, setCertNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<HalalProduct[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Expanded "Smart Database" to simulate a better API experience
  const smartDatabase: HalalProduct[] = [
    { nama_produk: "Indomie Mi Instan Rasa Ayam Bawang", nama_perusahaan: "PT. Indofood CBP Sukses Makmur Tbk", nomor_sertifikat: "ID00410000000550121", tgl_berlaku: "20-12-2026", kategori: "Makanan & Minuman" },
    { nama_produk: "Indomie Goreng", nama_perusahaan: "PT. Indofood CBP Sukses Makmur Tbk", nomor_sertifikat: "ID00410000000550122", tgl_berlaku: "20-12-2026", kategori: "Makanan & Minuman" },
    { nama_produk: "Sedaap Mie Instan Goreng", nama_perusahaan: "PT. Prakarsa Alam Segar", nomor_sertifikat: "ID00410000012345622", tgl_berlaku: "15-05-2027", kategori: "Makanan & Minuman" },
    { nama_produk: "Aqua Air Minum Dalam Kemasan (AMDK)", nama_perusahaan: "PT. Tirta Investama", nomor_sertifikat: "ID00410000001230422", tgl_berlaku: "15-01-2027", kategori: "Minuman" },
    { nama_produk: "Le Minerale Air Mineral", nama_perusahaan: "PT. Tirta Fresindo Jaya", nomor_sertifikat: "ID00410000023456721", tgl_berlaku: "10-10-2026", kategori: "Minuman" },
    { nama_produk: "Teh Botol Sosro", nama_perusahaan: "PT. Sinar Sosro", nomor_sertifikat: "ID00410000033344455", tgl_berlaku: "22-02-2027", kategori: "Minuman" },
    { nama_produk: "Wardah Exclusive Matte Lipcream", nama_perusahaan: "PT. Paragon Technology and Innovation", nomor_sertifikat: "ID00410000098765423", tgl_berlaku: "05-03-2028", kategori: "Kosmetik" },
    { nama_produk: "Wardah Lightening Day Cream", nama_perusahaan: "PT. Paragon Technology and Innovation", nomor_sertifikat: "ID00410000098765424", tgl_berlaku: "05-03-2028", kategori: "Kosmetik" },
    { nama_produk: "KFC Fried Chicken", nama_perusahaan: "PT. Fast Food Indonesia Tbk", nomor_sertifikat: "ID00410000011122221", tgl_berlaku: "12-12-2025", kategori: "Restoran" },
    { nama_produk: "McDonald's Indonesia Menu", nama_perusahaan: "PT. Rekso Nasional Food", nomor_sertifikat: "ID00410000033344422", tgl_berlaku: "18-09-2026", kategori: "Restoran" },
    { nama_produk: "Burger King", nama_perusahaan: "PT. Sari Burger Indonesia", nomor_sertifikat: "ID00410000055566677", tgl_berlaku: "11-11-2026", kategori: "Restoran" },
    { nama_produk: "Pizza Hut", nama_perusahaan: "PT. Sarimelati Kencana Tbk", nomor_sertifikat: "ID00410000077788899", tgl_berlaku: "01-01-2027", kategori: "Restoran" },
    { nama_produk: "Starbucks Coffee", nama_perusahaan: "PT. Sari Coffee Indonesia", nomor_sertifikat: "ID00410000099900011", tgl_berlaku: "30-06-2026", kategori: "Restoran/Kafe" },
    { nama_produk: "Chitato Sapi Panggang", nama_perusahaan: "PT. Indofood Fortuna Makmur", nomor_sertifikat: "ID00410000011223344", tgl_berlaku: "14-04-2027", kategori: "Makanan Ringan" },
    { nama_produk: "Oreo", nama_perusahaan: "PT. Mondelez Indonesia Manufacturing", nomor_sertifikat: "ID00410000022334455", tgl_berlaku: "25-08-2026", kategori: "Makanan Ringan" },
    { nama_produk: "SilverQueen Chocolate", nama_perusahaan: "PT. Perusahaan Industri Ceres", nomor_sertifikat: "ID00410000044556677", tgl_berlaku: "09-09-2026", kategori: "Makanan Ringan" },
    { nama_produk: "Ultra Milk Full Cream", nama_perusahaan: "PT. Ultrajaya Milk Industry & Trading Company Tbk", nomor_sertifikat: "ID00410000066778899", tgl_berlaku: "03-03-2027", kategori: "Minuman" },
    { nama_produk: "Yakult", nama_perusahaan: "PT. Yakult Indonesia Persada", nomor_sertifikat: "ID00410000088990011", tgl_berlaku: "07-07-2026", kategori: "Minuman" }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow search if at least one field has value
    if (!productName.trim() && !businessName.trim() && !certNumber.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setProducts([]);
    
    // Simulate API network delay
    setTimeout(() => {
      const results = smartDatabase.filter(p => {
        const matchProduct = !productName || p.nama_produk.toLowerCase().includes(productName.toLowerCase().trim());
        const matchBusiness = !businessName || p.nama_perusahaan.toLowerCase().includes(businessName.toLowerCase().trim());
        const matchCert = !certNumber || p.nomor_sertifikat.toLowerCase().includes(certNumber.toLowerCase().trim());
        
        return matchProduct && matchBusiness && matchCert;
      });
      setProducts(results);
      setLoading(false);
    }, 1500);
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
        {/* Tab Navigation */}
        <div className="flex items-center space-x-6 mb-8 overflow-x-auto no-scrollbar border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('lokal')}
            className={`whitespace-nowrap pb-3 text-[13px] font-bold transition-all relative ${activeTab === 'lokal' ? 'text-[#00a896]' : 'text-gray-400'}`}
          >
            Cek Produk Halal
            {activeTab === 'lokal' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00a896]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('luar')}
            className={`whitespace-nowrap pb-3 text-[13px] font-bold transition-all relative ${activeTab === 'luar' ? 'text-[#00a896]' : 'text-gray-400'}`}
          >
            Cek Registrasi Sertifikat Halal Luar Negeri
            {activeTab === 'luar' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00a896]"></div>}
          </button>
        </div>

        {/* Input Fields Grid */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Nama Produk (Contoh: Indomie, Wardah)"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-white border border-[#6b21a8]/30 rounded-lg py-3 px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6b21a8]/50 transition-all shadow-sm"
            />
            <input 
              type="text" 
              placeholder="Pelaku Usaha"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-white border border-[#6b21a8]/30 rounded-lg py-3 px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6b21a8]/50 transition-all shadow-sm"
            />
            <input 
              type="text" 
              placeholder="Nomor Sertifikat"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              className="w-full bg-white border border-[#6b21a8]/30 rounded-lg py-3 px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6b21a8]/50 transition-all shadow-sm"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-[#6b21a8] text-white py-3.5 rounded-lg font-bold text-sm uppercase tracking-widest shadow-lg shadow-purple-100 active:scale-[0.98] transition-all"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto bg-[#f8fafc] px-5 py-6">
        {!hasSearched ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-4 border border-teal-100">
              <ShieldCheck size={32} className="text-[#00a896]" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Cek Produk Halal</h3>
            <p className="text-xs text-gray-500 max-w-[240px] leading-relaxed">
              Masukkan nama produk atau perusahaan untuk memverifikasi sertifikat halal.
            </p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#00a896] mb-3" size={32} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Menghubungkan ke BPJPH...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-4 pb-20">
            <div className="flex justify-between items-center px-1 mb-2">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hasil Pencarian ({products.length})</span>
            </div>
            {products.map((product, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative group active:scale-[0.99] transition-all">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex-1 pr-3">
                      <span className="text-[9px] font-black text-[#00a896] uppercase bg-teal-50 px-2 py-0.5 rounded-md mb-1.5 inline-block">{product.kategori}</span>
                      <h4 className="text-[15px] font-bold text-gray-800 leading-snug">{product.nama_produk}</h4>
                   </div>
                   <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
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
                            <p className="text-[9px] font-bold text-gray-400 uppercase">Masa Berlaku</p>
                            <p className="text-[11px] font-bold text-orange-600">{product.tgl_berlaku}</p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-50 flex space-x-2">
                   <button 
                     onClick={() => window.open(`https://info.halal.go.id/detail-produk?id=${product.nomor_sertifikat}`, '_blank')}
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
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
              <Info size={32} />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Data Tidak Ditemukan</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Produk dengan kata kunci tersebut tidak tersedia di database cepat kami.
            </p>
            <button 
              onClick={openOfficialSihalal}
              className="w-full py-3.5 bg-[#00a896] text-white rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-teal-100"
            >
              Cari di Portal Resmi BPJPH
            </button>
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="p-6 bg-white border-t border-gray-50">
         <div className="flex items-center space-x-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <Info size={16} className="text-blue-500 shrink-0" />
            <p className="text-[10px] text-blue-800 font-bold leading-relaxed">
              Hasil pencarian ini adalah simulasi. Untuk verifikasi resmi, selalu gunakan situs halal.go.id.
            </p>
         </div>
      </div>
      </div>
    </div>
  );
};

export default HalalPage;