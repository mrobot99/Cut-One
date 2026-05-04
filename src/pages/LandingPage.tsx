import { motion } from 'motion/react';
import { Scissors, ArrowRight, Zap, Shield, Smartphone, Calendar, PieChart, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <Scissors className="text-black w-5 h-5" />
          </div>
          <span className="font-black text-xl italic uppercase tracking-tighter">CUT ONE</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <a href="#" className="hover:text-white transition-colors">Características</a>
          <a href="#" className="hover:text-white transition-colors">Precios</a>
          <a href="#" className="hover:text-white transition-colors">Demo</a>
        </div>

        <Link 
          to="/admin/agenda" 
          className="px-6 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all"
        >
          Empezar Ahora
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/60 uppercase tracking-widest"
          >
            <Zap className="w-3 h-3 text-yellow-400" /> Nuevo: Sistema de Reservas IA
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[12vw] lg:text-8xl font-black uppercase tracking-tighter leading-[0.82] italic"
          >
            Lleva tu <br /> <span className="text-white/20">Barbería</span> al <br /> Siguiente Nivel.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/40 font-medium max-w-xl leading-relaxed"
          >
            El SaaS definitivo para gestionar tu equipo, servicios y clientes con un link de reserva premium único para tu negocio.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/admin/agenda" className="px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 group shadow-2xl">
              Prueba Gratis 14 Días <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link to="/b/pz-barbershop" className="px-10 py-5 bg-white/5 border border-white/10 rounded-full font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
              Ver Demo Cliente
            </Link>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 relative"
        >
          {/* Mockup Preview */}
          <div className="relative z-10 p-4 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-3xl">
             <img 
               src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop" 
               className="rounded-[32px] w-full aspect-video object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-700"
               alt="Dashboard Preview"
             />
             {/* Floating UI Elements */}
             <div className="absolute -top-10 -right-10 p-6 rounded-3xl bg-white text-black shadow-2xl space-y-2 scale-75 md:scale-100">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Nuevos Ingresos</p>
                <p className="text-3xl font-black italic">$1,450,000</p>
             </div>
             <div className="absolute -bottom-10 -left-10 p-6 rounded-3xl bg-[#111] border border-white/10 shadow-2xl space-y-3 scale-75 md:scale-100">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-green-500">Cita Confirmada</p>
                </div>
                <div className="flex items-center gap-3">
                   <img src="https://i.pravatar.cc/100?u=test" className="w-8 h-8 rounded-full" />
                   <div>
                     <p className="text-xs font-bold">Andrés Gómez</p>
                     <p className="text-[10px] opacity-40">14:30 PM - Corte</p>
                   </div>
                </div>
             </div>
          </div>
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/5 rounded-full blur-[120px] -z-10"></div>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-8 py-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Smartphone, title: "Reserva Móvil", desc: "Link personalizado para tus clientes. Sin registros, sin fricción." },
          { icon: Calendar, title: "Agenda Inteligente", desc: "Gestiona las jornadas de tus barberos con facilidad absoluta." },
          { icon: Users, title: "Gestión de Equipo", desc: "Asigna servicios y controla el desempeño de tus colaboradores." },
          { icon: PieChart, title: "Finanzas Claras", desc: "Visualiza tus ingresos diarios y mensuales en tiempo real." }
        ].map((f, i) => (
          <div key={i} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all space-y-6 group">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-white transition-all text-white group-hover:text-black">
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase italic tracking-tight">{f.title}</h3>
            <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
