import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Scissors, Lock, User, ArrowRight, Loader2, Shield } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        
        if (data.role === 'superadmin') {
          localStorage.setItem('isSuperAdmin', 'true');
          navigate('/superadmin');
          return;
        }

        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('shopId', data.shopId);
        localStorage.setItem('shopSlug', data.shopSlug);
        localStorage.setItem('shopPlan', data.plan);
        navigate('/admin/agenda');
      } else {
        const data = await res.json();
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans flex flex-col lg:flex-row selection:bg-white selection:text-black">
      {/* Decorative / Image Side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden group">
        <img 
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=2070" 
          alt="Barbershop"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-12 left-12 max-w-md">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="w-12 h-1 bg-white mb-6" />
            <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-tight">
              Toma el Control <br /> de tu Negocio.
            </h2>
            <p className="text-white/60 mt-4 font-medium leading-relaxed">
              La plataforma definitiva para barberías modernas. Gestión de citas, finanzas y barberos en un solo lugar.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Login Side */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="flex flex-col items-center lg:items-start mb-12">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-2xl rotate-3">
              <Scissors className="text-black w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Entrar al Panel</h1>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-2 text-center lg:text-left">Master Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Usuario</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-white/20 transition-all font-bold text-sm"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-white/20 transition-all font-bold text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center"
              >
                {error}
              </motion.p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white/90 active:scale-[0.98] transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group mt-8"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

        </motion.div>
      </div>
    </div>
  );
}
