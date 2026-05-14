import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminLoginPage() {
  const [username, setUsername] = useState('juanceo');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.role === 'superadmin') {
          localStorage.setItem('isSuperAdmin', 'true');
          navigate('/superadmin');
        } else {
          setError('No tienes permisos de acceso maestro.');
        }
      } else {
        setError('Acceso denegado. Código de autorización inválido.');
      }
    } catch (err) {
      setError('Error de conexión con la infraestructura.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-10 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-white to-red-500 opacity-20"></div>
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center rotate-3 shadow-2xl">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black italic uppercase italic tracking-tighter">Acceso Maestro</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Executive Level Only</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Usuario Maestro</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuario"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-white/20 transition-all font-mono text-sm uppercase tracking-widest"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Código de Autorización</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-white/20 transition-all font-mono text-sm"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest bg-red-500/10 py-3 rounded-xl border border-red-500/20"
              >
                {error}
              </motion.p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-black uppercase py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verificar Identidad
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/5 text-center">
            <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.3em]">
              Protocolo de Seguridad Nivel 7 Activado
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
