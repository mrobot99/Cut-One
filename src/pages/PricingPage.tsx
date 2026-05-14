import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PLANS = [
  {
    id: 'basic',
    name: 'Plan Esencial',
    price: '29',
    description: 'Perfecto para barberos independientes.',
    features: [
      'Agenda Digital Ilimitada',
      'Perfil de Barbería Público',
      'Gestión de Servicios',
      'Recordatorios por Navegador'
    ]
  },
  {
    id: 'premium',
    name: 'Plan Elite',
    price: '59',
    popular: true,
    description: 'Para barberías que buscan crecer.',
    features: [
      'Todo lo del Plan Esencial',
      'Métricas de Venta Avanzadas',
      'Prioridad en el Soporte',
      'Gestión de Múltiples Barberos',
      'Color de Marca Personalizado'
    ]
  }
];

export default function PricingPage() {
  const [step, setStep] = useState<'plans' | 'form' | 'success'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [formData, setFormData] = useState({
    shopName: '',
    slug: '',
    email: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, plan: selectedPlan.id })
      });
      const data = await res.json();
      if (data.success) {
        setCredentials(data.credentials);
        setStep('success');
      }
    } catch (err) {
      alert('Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-white/[0.02] rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-white/[0.02] rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <AnimatePresence mode="wait">
          {step === 'plans' && (
            <motion.div 
              key="plans"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              <div className="text-center space-y-4 max-w-3xl mx-auto">
                <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-[0.9]">
                  Lleva tu Barbería <br/>
                  <span className="text-white/20">al Próximo Nivel</span>
                </h1>
                <p className="text-lg text-white/40 font-medium max-w-xl mx-auto">
                  Digitaliza tu agenda, fideliza a tus clientes y aumenta tus ingresos con la plataforma más avanzada del mercado.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {PLANS.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`relative p-10 rounded-[40px] bg-[#0A0A0A] border transition-all duration-500 flex flex-col ${
                      plan.popular ? 'border-white/20 ring-1 ring-white/10' : 'border-white/5'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full rotate-1">
                        Más Recomendado
                      </div>
                    )}
                    
                    <div className="space-y-6 flex-1">
                      <div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter">{plan.name}</h3>
                        <p className="text-sm text-white/40 mt-2">{plan.description}</p>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black">$</span>
                        <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                        <span className="text-white/40 font-bold uppercase text-xs tracking-widest ml-2">/ mensual</span>
                      </div>

                      <ul className="space-y-4 pt-4">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm text-white/60">
                            <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button 
                      onClick={() => { setSelectedPlan(plan); setStep('form'); }}
                      className={`w-full mt-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all ${
                        plan.popular ? 'bg-white text-black hover:scale-[1.02]' : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      Empezar Ahora
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto"
            >
              <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                
                <button onClick={() => setStep('plans')} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">
                  ← Volver a Planes
                </button>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">Detalles de tu Barbería</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Configuración del Sistema {selectedPlan.name}</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Nombre de la Barbería</label>
                      <input 
                        required
                        value={formData.shopName}
                        onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold placeholder:text-white/10"
                        placeholder="Ej. Golden Barber"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Link de tu App (URL Slug)</label>
                      <input 
                        required
                        value={formData.slug}
                        onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-mono text-sm"
                        placeholder="golden-barber"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Email de Administración</label>
                      <input 
                        required
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold"
                        placeholder="admin@barberia.com"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/40 uppercase font-black tracking-widest text-[10px]">{selectedPlan.name}</span>
                      <span className="font-black">${selectedPlan.price}/mes</span>
                    </div>
                    <p className="text-[9px] text-center text-white/20 font-bold uppercase leading-relaxed uppercase tracking-[0.1em]">
                      Al hacer clic en "Confirmar Pago", serás redirigido a nuestra plataforma segura para activar tu cuenta instantáneamente.
                    </p>
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Confirmar y Pagar <ArrowRight className="w-5 h-5" /></>}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto text-center space-y-10"
            >
              <div className="w-24 h-24 bg-white text-black rounded-[32px] flex items-center justify-center mx-auto rotate-12 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                <Check className="w-12 h-12" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">¡Bienvenido a la Elite!</h2>
                <p className="text-lg text-white/40 font-medium">Tu sistema ha sido desplegado exitosamente. Guarda tus credenciales para acceder a tu panel.</p>
              </div>

              <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 space-y-8 text-left relative overflow-hidden">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Usuario / Email</p>
                    <p className="text-xl font-bold">{credentials.username}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Contraseña Maestra</p>
                    <p className="text-xl font-mono p-4 bg-white/5 rounded-xl border border-white/5">{credentials.password}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">URL de Gestión</p>
                    <p className="text-sm font-mono text-white/40 underline">{window.location.origin}{credentials.loginUrl}</p>
                  </div>
                </div>

                <a 
                  href={credentials.loginUrl}
                  className="block w-full bg-white text-black py-5 rounded-2xl text-center font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Ir al Panel de Barbería
                </a>
              </div>

              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10">Infraestructura Verificada</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
