import React, { useState, useEffect } from 'react';
import { Scissors, Trash2, Clock, DollarSign, Plus, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Service } from '../../types';
import { useOutletContext } from 'react-router-dom';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

export default function ServicesPage() {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState({ name: '', price: '', duration: '', icon: 'scissors', image: '' });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const shopId = localStorage.getItem('shopId');
    if (!shopId) return;
    
    try {
      const res = await fetch('/api/admin/shop', {
        headers: { 'X-Shop-Id': shopId }
      });
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const data = await res.json();
      setServices(data.services);
    } catch (err) {
      console.error('Fetch error in Services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewService(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingService ? `/api/admin/services/${editingService.id}` : '/api/admin/services';
    const method = editingService ? 'PATCH' : 'POST';

    const shopId = localStorage.getItem('shopId');
    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'X-Shop-Id': shopId || ''
      },
      body: JSON.stringify({
        ...newService,
        price: Number(newService.price),
        duration: Number(newService.duration)
      })
    });
    if (res.ok) {
      fetchServices();
      setShowModal(false);
      setEditingService(null);
      setNewService({ name: '', price: '', duration: '', icon: 'scissors' });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setNewService({ 
      name: service.name, 
      price: service.price.toString(), 
      duration: service.duration.toString(), 
      icon: service.icon,
      image: service.image || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setNewService({ name: '', price: '', duration: '', icon: 'scissors', image: '' });
  };

  const handleDelete = async (id: string) => {
    setServiceToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const shopId = localStorage.getItem('shopId');
    if (!serviceToDelete || !shopId) return;
    await fetch(`/api/admin/services/${serviceToDelete}`, { 
      method: 'DELETE',
      headers: { 'X-Shop-Id': shopId }
    });
    fetchServices();
    setServiceToDelete(null);
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
            <div className="relative mb-8 h-48 -mx-8 -mt-8 overflow-hidden rounded-t-[40px]">
              {service.image ? (
                <img 
                  src={service.image} 
                  alt={service.name} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                  <Scissors className="w-12 h-12 text-white/10" />
                </div>
              )}
              <div className="absolute top-6 left-6 flex gap-2">
                <div className="p-3 rounded-2xl bg-black/60 backdrop-blur-md text-white border border-white/10">
                  <Scissors className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(service)}
                  className="p-3 rounded-2xl bg-black/60 backdrop-blur-md hover:bg-white hover:text-black transition-all border border-white/10"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(service.id)}
                  className="p-3 rounded-2xl bg-red-500/20 backdrop-blur-md hover:bg-red-500 transition-all border border-red-500/20 text-red-500 hover:text-white"
                >
                  <Trash2 className="w-4 h-4" />
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

      <DeleteConfirmationModal 
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setServiceToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Servicio"
        message="¿Estás seguro de que deseas eliminar este servicio del catálogo? Esta acción no se puede deshacer."
        itemText={services.find(s => s.id === serviceToDelete)?.name}
      />

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
              <h2 className="text-3xl font-black uppercase italic mb-8">
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Foto del Servicio</label>
                  <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/5 rounded-3xl group/photo relative overflow-hidden">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img 
                        src={newService.image || 'https://via.placeholder.com/150'} 
                        alt="Preview" 
                        className="w-full h-full rounded-2xl object-cover border border-white/10"
                      />
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-2xl">
                        <Plus className="w-8 h-8 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white/60 mb-2">Haz clic para cargar una imagen</p>
                      <p className="text-[9px] text-white/20 uppercase font-black tracking-widest">Formatos: JPG, PNG, WEBP</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Nombre del Servicio</label>
                  <input 
                    required
                    type="text" 
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold text-white"
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
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold text-white"
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
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold text-white"
                      placeholder="45"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={closeModal}
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
