import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, secretKey })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        toast.success('Giriş başarılı');
        navigate('/admin');
      } else {
        toast.error(data.message || 'Giriş başarısız');
      }
    } catch (err) {
      toast.error('Sunucu hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 selection:bg-amber-500/30">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-stone-900 p-8 rounded-3xl border border-stone-800 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-amber-500 mb-2">Zirve Cafe</h1>
          <p className="text-stone-400">Yönetim Paneli Girişi</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">Kullanıcı Adı</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-3 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                placeholder="admin"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">Şifre</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-3 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">Gizli Anahtar (Secret Key)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                <KeyRound size={18} />
              </div>
              <input
                type="password"
                required
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-3 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                placeholder="Gizli anahtarınızı girin"
              />
            </div>
            <p className="text-xs text-stone-500 mt-2">Demo için: zirve-cafe-secret-2026</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
