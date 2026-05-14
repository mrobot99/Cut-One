import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, ArrowUpRight, Plus, RefreshCw, ChevronLeft, ChevronRight, Check, X as XIcon } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Appointment, Barbershop } from '../../types';
import { useOutletContext } from 'react-router-dom';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

export default function Dashboard() {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const [shop, setShop] = useState<Barbershop | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewedDate, setViewedDate] = useState(new Date());

  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appToCancel, setAppToCancel] = useState<string | null>(null);
  const [newApp, setNewApp] = useState({ clientName: '', clientPhone: '', serviceId: '', barberId: '', time: '09:00' });

  useEffect(() => {
    fetchData();
  }, [viewedDate]);

  const fetchData = async () => {
    setLoading(true);
    const shopId = localStorage.getItem('shopId');
    if (!shopId) return;

    try {
      const [shopRes, appRes] = await Promise.all([
        fetch('/api/admin/shop', { headers: { 'X-Shop-Id': shopId } }),
        fetch('/api/admin/appointments', { headers: { 'X-Shop-Id': shopId } })
      ]);

      if (!shopRes.ok || !appRes.ok) {
        throw new Error(`API match error: ${shopRes.status} / ${appRes.status}`);
      }

      const shopContentType = shopRes.headers.get('content-type');
      const appContentType = appRes.headers.get('content-type');

      if (!shopContentType?.includes('application/json') || !appContentType?.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const shopData = await shopRes.json();
      const appData = await appRes.json();
      
      setShop(shopData);
      setAppointments(appData);

      // Set default service/barber for modal
      if (shopData.services && shopData.services.length > 0) {
        setNewApp(prev => ({ 
          ...prev, 
          serviceId: shopData.services[0].id,
          barberId: shopData.barbers && shopData.barbers.length > 0 ? shopData.barbers[0].id : prev.barberId
        }));
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const shopId = localStorage.getItem('shopId');
    if (!shop || !shopId) return;
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Shop-Id': shopId 
        },
        body: JSON.stringify({
          ...newApp,
          shopId: shop.id,
          shopSlug: shop.slug,
          date: viewedDate.toISOString(),
          status: 'confirmed'
        })
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    if (status === 'cancelled') {
        setAppToCancel(id);
        setShowCancelModal(true);
        return;
    }
    
    try {
      await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'X-Shop-Id': localStorage.getItem('shopId') || ''
        },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmCancel = async () => {
    if (!appToCancel) return;
    try {
      await fetch(`/api/admin/appointments/${appToCancel}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'X-Shop-Id': localStorage.getItem('shopId') || ''
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      fetchData();
      setAppToCancel(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const appDate = new Date(a.date);
    const matchesDate = appDate.getUTCDate() === viewedDate.getUTCDate() && 
                        appDate.getUTCMonth() === viewedDate.getUTCMonth() && 
                        appDate.getUTCFullYear() === viewedDate.getUTCFullYear();
    
    if (!matchesDate) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return a.clientName.toLowerCase().includes(query) || 
             a.clientPhone.toLowerCase().includes(query);
    }
    
    return true;
  });

  const stats = [
    { label: 'Citas Hoy', value: filteredAppointments.length, color: 'text-blue-400' },
    { label: 'Confirmadas', value: filteredAppointments.filter(a => a.status === 'confirmed').length, color: 'text-green-400' },
    { label: 'Pendientes', value: filteredAppointments.filter(a => a.status === 'pending').length, color: 'text-yellow-400' },
    { label: 'Ingresos Hoy', value: `$${filteredAppointments.reduce((acc, curr) => acc + (shop?.services.find(s => s.id === curr.serviceId)?.price || 0), 0).toLocaleString()}`, color: 'text-white' },
  ];

  if (loading && !shop) return <div className="flex items-center justify-center h-full">Cargando...</div>;

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter leading-none italic">
            Agenda
          </h1>
          <p className="text-white/40 mt-4 text-lg font-medium flex items-center gap-2">
            <span className="capitalize">{format(viewedDate, 'EEEE, d MMMM yyyy', { locale: es })}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all font-medium text-sm"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> {loading ? 'Cargando...' : 'Actualizar'}
          </button>
          
          <div className="flex items-center bg-white/5 rounded-full border border-white/5 p-1">
            <button 
              onClick={() => setViewedDate(subDays(viewedDate, 1))}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 py-1 flex items-center gap-2 border-x border-white/5">
              <CalendarIcon className="w-4 h-4 text-white/40" />
              <span className="text-sm font-medium">{format(viewedDate, 'dd/MM/yyyy')}</span>
            </div>
            <button 
              onClick={() => setViewedDate(addDays(viewedDate, 1))}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={() => setViewedDate(new Date())}
            className="px-6 py-3 rounded-full bg-white text-black hover:bg-white/90 transition-all font-bold text-sm tracking-tight flex items-center gap-2"
          >
            HOY
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[32px] bg-[#0D0D0D] border border-white/5 group hover:border-white/20 transition-all relative overflow-hidden"
          >
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-4">{stat.label}</p>
            <div className="flex items-center justify-between">
              <h3 className={cn("text-4xl font-black tracking-tight", stat.color)}>{stat.value}</h3>
              <ArrowUpRight className="w-6 h-6 text-white/10 group-hover:text-white/40 transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Barbers Agenda Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {shop?.barbers.map((barber, i) => {
          const barberApps = filteredAppointments.filter(a => a.barberId === barber.id);
          return (
            <motion.div 
              key={barber.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 + 0.4 }}
              className="rounded-[24px] bg-[#0D0D0D] border border-white/5 flex flex-col overflow-hidden group hover:border-white/10 transition-all"
            >
              {/* Barber Header */}
              <div className="p-4 flex items-center gap-3 border-b border-white/5 bg-white/[0.02]">
                <img src={barber.photo} alt={barber.name} className="w-10 h-10 rounded-full border border-white/10 object-cover" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight">{barber.name}</h4>
                  <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest mt-0.5">{barberApps.length} Citas</p>
                </div>
              </div>

              {/* Barber Slots / Grid */}
              <div className="p-4 flex-1 min-h-[300px] flex flex-col space-y-3">
                {barberApps.map((app) => {
                  const service = shop.services.find(s => s.id === app.serviceId);
                  return (
                    <div 
                      key={app.id} 
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group/item relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-2 relative z-10">
                         <span className="text-[10px] font-black bg-white text-black px-2 py-0.5 rounded-full">{app.time}</span>
                         <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button 
                              onClick={() => updateAppointmentStatus(app.id, 'confirmed')}
                              className="p-1.5 bg-green-500 rounded-lg hover:scale-110 transition-all"
                              title="Confirmar"
                            >
                              <Check className="w-3 h-3 text-white" />
                            </button>
                            <button 
                              onClick={() => updateAppointmentStatus(app.id, 'cancelled')}
                              className="p-1.5 bg-red-500 rounded-lg hover:scale-110 transition-all"
                              title="Cancelar"
                            >
                              <XIcon className="w-3 h-3 text-white" />
                            </button>
                         </div>
                      </div>
                      <p className="text-xs font-black uppercase tracking-tight truncate relative z-10">{app.clientName}</p>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1 relative z-10">
                        {service?.name || 'Servicio'}
                      </p>

                      {/* Status indicator bar */}
                      <div className={cn(
                        "absolute top-0 right-0 w-1 h-full",
                        app.status === 'confirmed' ? "bg-green-500" : 
                        app.status === 'cancelled' ? "bg-red-500" : "bg-yellow-500"
                      )}></div>
                    </div>
                  );
                })}
                
                {barberApps.length === 0 && (
                  <div className="p-10 h-full rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center group-hover:border-white/20 transition-all cursor-pointer">
                    <CalendarIcon className="w-8 h-8 text-white/10 mb-3 group-hover:text-white/20" />
                    <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Sin Citas</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Quick Action Float */}
      <button 
        onClick={() => setShowModal(true)}
        className="fixed bottom-10 right-10 w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform" />
      </button>

      <DeleteConfirmationModal 
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setAppToCancel(null);
        }}
        onConfirm={confirmCancel}
        title="Cancelar Cita"
        message="¿Estás seguro de que deseas cancelar esta cita? El cliente recibirá una notificación y el espacio quedará libre."
        itemText={appointments.find(a => a.id === appToCancel)?.clientName}
      />

      {/* Manual Booking Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0D0D0D] border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-3xl font-black uppercase italic mb-8">Nueva Cita Manual</h2>
              <form onSubmit={handleManualBooking} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Barbero</label>
                    <select 
                      value={newApp.barberId}
                      onChange={(e) => setNewApp({ ...newApp, barberId: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-4 outline-none focus:border-white/20 transition-all text-sm appearance-none"
                    >
                      {shop?.barbers.map(b => (
                        <option key={b.id} value={b.id} className="bg-[#0D0D0D]">{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Hora</label>
                    <input 
                      type="time" 
                      value={newApp.time}
                      onChange={(e) => setNewApp({ ...newApp, time: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-4 outline-none focus:border-white/20 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Servicio</label>
                  <select 
                    value={newApp.serviceId}
                    onChange={(e) => setNewApp({ ...newApp, serviceId: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-4 outline-none focus:border-white/20 transition-all text-sm appearance-none"
                  >
                    {shop?.services.map(s => (
                      <option key={s.id} value={s.id} className="bg-[#0D0D0D]">{s.name} - ${s.price.toLocaleString()}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Nombre del Cliente</label>
                  <input 
                    required
                    type="text" 
                    value={newApp.clientName}
                    onChange={(e) => setNewApp({ ...newApp, clientName: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all"
                    placeholder="Ej. Andrés Gómez"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">WhatsApp / Teléfono</label>
                  <input 
                    required
                    type="tel" 
                    value={newApp.clientPhone}
                    onChange={(e) => setNewApp({ ...newApp, clientPhone: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all"
                    placeholder="+57..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 rounded-full border border-white/5 font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-xs hover:bg-white/90 transition-all shadow-xl"
                  >
                    Crear Cita
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
