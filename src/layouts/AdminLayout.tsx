import { motion, AnimatePresence } from 'motion/react';
import { Scissors, Calendar, Users, BarChart3, Settings, LogOut, Search, Bell, ExternalLink, Copy, Menu, X, CreditCard } from 'lucide-react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import React, { useState, useEffect } from 'react';
import { Barbershop } from '../types';

const navItems = [
  { icon: Calendar, label: 'Agenda', href: '/admin/agenda' },
  { icon: Users, label: 'Barberos', href: '/admin/barberos' },
  { icon: Scissors, label: 'Servicios', href: '/admin/servicios' },
  { icon: BarChart3, label: 'Finanzas', href: '/admin/finanzas' },
  { icon: Settings, label: 'Ajustes', href: '/admin/ajustes' },
  { icon: CreditCard, label: 'Mi Suscripción', href: '/admin/suscripcion' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Barbershop | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('shopId');
    localStorage.removeItem('shopSlug');
    localStorage.removeItem('shopPlan');
    navigate('/');
  };

  useEffect(() => {
    const shopId = localStorage.getItem('shopId');
    if (!shopId) return;

    fetch('/api/admin/shop', {
      headers: {
        'X-Shop-Id': shopId
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) throw new Error('Response is not JSON');
        return res.json();
      })
      .then(setShop)
      .catch(err => console.error('Error fetching shop in layout:', err));
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const bookingUrl = shop ? `${window.location.origin}/b/${shop.slug}` : '';

  const copyBookingUrl = () => {
    navigator.clipboard.writeText(bookingUrl);
    alert('Link de reservas copiado al portapapeles');
  };

  const isPremium = shop?.plan === 'premium';
  const primaryColor = shop?.theme?.primary || '#FFFFFF';

  return (
    <div 
      className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-white selection:text-black"
      style={{ '--shop-primary': primaryColor } as React.CSSProperties}
    >
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[60] lg:hidden backdrop-blur-xl flex flex-col"
          >
            <div className="p-8 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: isPremium ? 'transparent' : 'white' }}
                >
                  {isPremium ? (
                    <img src={shop?.logo} className="w-full h-full object-cover" />
                  ) : (
                    <Scissors className="text-black w-6 h-6" />
                  )}
                </div>
                <div>
                  <h1 className="font-bold text-xl leading-none italic uppercase tracking-tighter">
                    {isPremium ? shop?.name : 'CUT ONE'}
                  </h1>
                  {isPremium && <span className="text-[9px] font-black bg-white text-black px-2 py-0.5 rounded-full uppercase tracking-widest mt-1 inline-block">Pro Edition</span>}
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-8 h-8" /></button>
            </div>

            <nav className="flex-1 px-8 py-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl text-xl font-bold uppercase italic tracking-tight",
                    location.pathname === item.href ? "bg-white text-black" : "text-white/40"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="p-8 border-t border-white/10">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 text-red-500 font-bold uppercase tracking-widest text-sm w-full text-left"
              >
                <LogOut className="w-5 h-5" /> Salir del Panel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/5 bg-[#0D0D0D] hidden lg:flex flex-col z-50">
        <div className="p-8 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: isPremium ? 'transparent' : 'white' }}
            >
              {isPremium ? (
                <img src={shop?.logo} className="w-full h-full object-cover" />
              ) : (
                <Scissors className="text-black w-6 h-6" />
              )}
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none italic uppercase tracking-tighter">
                {isPremium ? shop?.name : 'CUT ONE'}
              </h1>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
                {isPremium ? 'Plan Premium' : 'Powering Barbers'}
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || (item.href === '/admin/agenda' && location.pathname === '/admin');
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                  isActive 
                    ? "text-black font-bold" 
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                )}
                style={isActive ? { backgroundColor: primaryColor } : {}}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-black" : "text-white/40 group-hover:text-white")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/50 hover:bg-red-500/10 hover:text-red-500 transition-colors text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top Navbar */}
        <header className="h-20 border-b border-white/5 bg-[#0D0D0D]/80 backdrop-blur-xl sticky top-0 z-[40] flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-white/60 hover:text-white transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden sm:flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/5 focus-within:border-white/20 transition-all">
              <Search className="w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Buscar citas, clientes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-40 md:w-64 placeholder:text-white/20"
              />
            </div>
            
            {shop && (
              <div 
                className={cn(
                  "hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-lg transition-all",
                  isPremium ? "bg-black text-white border-white/20" : "bg-white text-black border-white/10"
                )}
                style={isPremium ? { borderColor: `${primaryColor}40` } : {}}
              >
                <span className={cn("text-[10px] font-black uppercase tracking-tighter", isPremium ? "text-white" : "opacity-70")}>Link: {shop.slug}</span>
                <button onClick={copyBookingUrl} className="p-1 hover:bg-white/10 rounded-md transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                <a href={bookingUrl} target="_blank" rel="noreferrer" className="p-1 hover:bg-white/10 rounded-md transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell className="w-5 h-5 text-white/40 cursor-pointer hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0D0D0D]"></span>
            </div>
            
            <div className="h-8 w-px bg-white/5"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none">Juan Pérez</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">{shop?.name || 'Administrador'}</p>
              </div>
              <img 
                src="https://i.pravatar.cc/150?u=admin" 
                alt="Avatar" 
                className="w-10 h-10 rounded-full border border-white/10"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-8">
          <Outlet context={{ searchQuery, shop }} />
        </div>
      </main>
    </div>
  );
}
