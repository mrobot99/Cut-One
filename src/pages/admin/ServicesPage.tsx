import { useState, useEffect } from 'react';
import { Scissors, Trash2, Clock, DollarSign, Plus, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Service } from '../../types';
import { useOutletContext } from 'react-router-dom';

export default function ServicesPage() {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newService, setNewService] = useState({ name: '', price: '', duration: '', icon: 'scissors' });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const res = await fetch('/api/admin/shop');
    const data = await res.json();
    setServices(data.services);
    setLoading(false);
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newService,
        price: Number(newService.price),
        duration: Number(newService.duration)
      })
    });
    if (res.ok) {
      fetchServices();
      setShowModal(false);
      setNewService({ name: '', price: '', duration: '', icon: 'scissors' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;
    await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
    fetchServices();
  };

  const filteredServices = services.filter(s => {
    if (!searchQuery) return true;
    return s.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return <div className="p-8 text-white/50">Cargando servicios...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">Servicios</h1>
          <p className="text-white/40 mt-4 text-base md:text-lg font-medium">Define tu menú de servicios y precios.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto px-8 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl"
        >
          <Plus className="w-5 h-5" /> Crear Servicio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={service.id}
            className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-8 group hover:border-white/20 transition-all"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="p-4 rounded-3xl bg-white/5 text-white/60 group-hover:bg-white group-hover:text-black transition-all">
                <Scissors className="w-6 h-6" />
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <Settings2 className="w-4 h-4 text-white/40" />
                </button>
                <button 
                  onClick={() => handleDelete(service.id)}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500/40" />
                </button>
              </div>
            </div>

            <h3 className="text-2xl font-black uppercase italic tracking-tight mb-2">{service.name}</h3>
            
            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <DollarSign className="w-3 h-3 text-green-500" />
                </div>
                <span className="text-xl font-black">${service.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="w-3 h-3 text-blue-400" />
                </div>
                <span className="text-sm font-bold text-white/60 uppercase">{service.duration} MINS</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              className="relative w-full max-w-lg bg-[#0D0D0D] border border-white/10 rounded-[40px] p-10 shadow-2xl"
            >
              <h2 className="text-3xl font-black uppercase italic mb-8">Nuevo Servicio</h2>
              <form onSubmit={handleAddService} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Nombre del Servicio</label>
                  <input 
                    required
                    type="text" 
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all"
                    placeholder="Ej. Corte y Barba"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Precio ($)</label>
                    <input 
                      required
                      type="number" 
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all"
                      placeholder="35000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Duración (min)</label>
                    <input 
                      required
                      type="number" 
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all"
                      placeholder="45"
                    />
                  </div>
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
                    className="flex-1 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-xs hover:bg-white/90 transition-all"
                  >
                    Guardar Servicio
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
