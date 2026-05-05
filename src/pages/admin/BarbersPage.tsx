import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Mail, Phone, MoreVertical, Plus, Clock, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Barber, Barbershop } from '../../types';
import { useOutletContext } from 'react-router-dom';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

export default function BarbersPage() {
  const { searchQuery, shop } = useOutletContext<{ searchQuery: string, shop: Barbershop | null }>();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [barberToDelete, setBarberToDelete] = useState<string | null>(null);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    photo: '', 
    role: 'Barbero Senior',
    shiftStart: '09:00',
    shiftEnd: '20:00',
    commission: 50 // Default commission
  });

  const isPremium = shop?.plan === 'premium';

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    const res = await fetch('/api/admin/shop');
    const data = await res.json();
    setBarbers(data.barbers);
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingBarber(null);
    setFormData({ 
      name: '', 
      photo: '', 
      role: 'Barbero Senior',
      shiftStart: '09:00',
      shiftEnd: '20:00',
      commission: 50
    });
    setShowModal(true);
  };

  const handleOpenEdit = (barber: Barber) => {
    setEditingBarber(barber);
    setFormData({ 
      name: barber.name, 
      photo: barber.photo, 
      role: barber.role || 'Barbero Senior',
      shiftStart: barber.shiftStart || '09:00',
      shiftEnd: barber.shiftEnd || '20:00',
      commission: barber.commission || 50
    });
    setShowModal(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingBarber ? `/api/admin/barbers/${editingBarber.id}` : '/api/admin/barbers';
    const method = editingBarber ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      fetchBarbers();
      setShowModal(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBarberToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!barberToDelete) return;
    await fetch(`/api/admin/barbers/${barberToDelete}`, { method: 'DELETE' });
    fetchBarbers();
    setBarberToDelete(null);
  };

  const filteredBarbers = barbers.filter(b => {
    if (!searchQuery) return true;
    return b.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return <div className="p-8 text-white/50">Cargando barberos...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">Nuestro Equipo</h1>
          <p className="text-white/40 mt-4 text-base md:text-lg font-medium">Gestiona a tus colaboradores, sus turnos y sus perfiles.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="w-full md:w-auto px-8 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl"
        >
          <UserPlus className="w-5 h-5" /> Agregar Barbero
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBarbers.map((barber, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={barber.id}
            className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-8 group hover:border-white/20 transition-all relative overflow-hidden"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <img src={barber.photo} alt={barber.name} className="w-32 h-32 rounded-full border-4 border-white/5 object-cover" />
                <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-[#0D0D0D] rounded-full"></div>
              </div>
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tight">{barber.name}</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mt-1">{barber.role || 'Barbero Senior'}</p>
                <div className="flex items-center justify-center gap-1 mt-2 text-white/20">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{barber.shiftStart || '09:00'} - {barber.shiftEnd || '20:00'}</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button 
                  onClick={() => handleOpenEdit(barber)}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group/edit"
                  title="Editar Perfil"
                >
                  <Edit2 className="w-4 h-4 text-white/40 group-hover/edit:text-white" />
                </button>
                <button 
                  onClick={() => handleDelete(barber.id)}
                  className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 transition-colors group/delete"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4 text-red-500/40 group-hover/delete:text-red-500" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <DeleteConfirmationModal 
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setBarberToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Barbero"
        message="¿Estás seguro de que deseas eliminar a este barbero del equipo? Esta acción no se puede deshacer."
        itemText={barbers.find(b => b.id === barberToDelete)?.name}
      />

      {/* Modal - Add / Edit */}
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
              className="relative w-full max-w-lg bg-[#0D0D0D] border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-3xl font-black uppercase italic mb-8">
                {editingBarber ? 'Editar Barbero' : 'Nuevo Barbero'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Foto de Perfil</label>
                  <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/5 rounded-3xl group/photo relative overflow-hidden">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img 
                        src={formData.photo || 'https://via.placeholder.com/150'} 
                        alt="Preview" 
                        className="w-full h-full rounded-2xl object-cover border border-white/10"
                      />
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-2xl">
                        <Plus className="w-8 h-8 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white/60 mb-2">Haz clic para cargar una imagen</p>
                      <p className="text-[9px] text-white/20 uppercase font-black tracking-widest">Formatos: JPG, PNG, WEBP</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Nombre del Barbero</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Rol / Especialidad</label>
                  <input 
                    type="text" 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold"
                    placeholder="Ej. Barbero Senior"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Inicio de Turno</label>
                    <input 
                      type="time" 
                      value={formData.shiftStart}
                      onChange={(e) => setFormData({ ...formData, shiftStart: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Fin de Turno</label>
                    <input 
                      type="time" 
                      value={formData.shiftEnd}
                      onChange={(e) => setFormData({ ...formData, shiftEnd: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold text-white"
                    />
                  </div>
                </div>

                {isPremium && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Comisión (%)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={formData.commission}
                        onChange={(e) => setFormData({ ...formData, commission: parseInt(e.target.value) })}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold text-white"
                        placeholder="50"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 font-black">%</span>
                    </div>
                  </div>
                )}

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
                    Guardar Cambios
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

