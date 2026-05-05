import React from 'react';
import { motion } from 'motion/react';
import { CreditCard, CheckCircle2, ShieldCheck, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { Barbershop } from '../../types';
import { cn } from '../../lib/utils';

export default function SubscriptionPage() {
  const { shop } = useOutletContext<{ shop: Barbershop | null }>();
  const isPremium = shop?.plan === 'premium';

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white">Mi Suscripción</h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-2 ml-1">Estado y Gestión de Plan Cut One</p>
        </div>
        <div className={cn(
          "px-6 py-3 rounded-2xl border font-black uppercase tracking-widest text-xs flex items-center gap-3 italic",
          isPremium ? "bg-white text-black border-white" : "bg-white/5 text-white/40 border-white/10"
        )}>
          {isPremium ? <Zap className="w-4 h-4 fill-current" /> : <ShieldCheck className="w-4 h-4" />}
          Plan Actual: {isPremium ? 'Premium' : 'Básico'}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Status Card */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-white/10 transition-all duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center rotate-3 border border-white shadow-2xl">
                  <CreditCard className="text-black w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Detalles del Servicio</h3>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center py-4 border-b border-white/5">
                  <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Próximo Pago</span>
                  <span className="font-bold text-white uppercase italic">15 de Junio, 2024</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-white/5">
                  <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Monto Mensual</span>
                  <span className="font-black text-2xl text-white italic tracking-tighter">$45.000 COP</span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Método de Pago</span>
                  <span className="font-bold text-white/60 uppercase text-[10px]">Pendiente de vinculación</span>
                </div>
              </div>

              {/* Payment Bridge Button */}
              <button 
                onClick={() => alert('Integrando ePayco...')}
                className="w-full mt-12 py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl group/btn"
              >
                Pagar Suscripción
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Plan Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-[32px] bg-white text-black">
              <h4 className="text-xl font-black italic uppercase mb-6">Beneficios Base</h4>
              <ul className="space-y-3">
                {['Gestión de Citas', 'Panel de Barberos', 'Catálogo de Servicios', 'Soporte Básico'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 group hover:border-white/20 transition-all">
              <h4 className="text-xl font-black italic uppercase mb-6 text-white group-hover:text-white transition-colors flex items-center gap-2">
                <Zap className="w-5 h-5 fill-current text-white" />
                Premium Plus
              </h4>
              <ul className="space-y-3">
                {['Reportes Financieros', 'IA para Optimización', 'Página Web Personalizada', 'Soporte 24/7'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/60 transition-colors">
                    <CheckCircle2 className="w-3 h-3" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-[40px] p-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-6">Seguridad</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="mt-1 w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 text-white/40" />
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed font-bold">
                  Tus transacciones están protegidas por encriptación de grado bancario.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 border-dashed">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">¿Necesitas Ayuda?</h4>
            <p className="text-xs font-bold text-white/60 mb-6">Si tienes problemas con tu factura escríbenos.</p>
            <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all">
              Contactar Soporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
