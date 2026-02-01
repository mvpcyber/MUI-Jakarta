
import React, { useState } from 'react';
import { Lock, User, ShieldCheck } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded credentials for demo
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('mui_admin_session', 'true');
      onLogin();
    } else {
      setError('Username atau Password salah!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#00827f]"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-4 text-[#00827f]">
             <ShieldCheck size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-800">Admin Panel</h2>
          <p className="text-sm text-gray-500">MUI DKI Jakarta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-800 focus:outline-none focus:border-[#00827f] transition-all"
                placeholder="Masukkan username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-800 focus:outline-none focus:border-[#00827f] transition-all"
                placeholder="Masukkan password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-[#00827f] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-teal-200 active:scale-95 transition-all mt-4"
          >
            Masuk
          </button>
        </form>
        
        <div className="mt-8 text-center">
           <a href="/" className="text-xs text-gray-400 font-bold hover:text-[#00827f]">Kembali ke Aplikasi User</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
