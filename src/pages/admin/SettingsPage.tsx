import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, Globe, Phone, MapPin, Clock, Camera, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { Barbershop } from '../../types';
import { cn } from '../../lib/utils';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

export default function SettingsPage() {
  const { searchQuery, shop: layoutShop } = useOutletContext<{ searchQuery: string, shop: Barbershop | null }>();
  const [shop, setShop] = useState<Barbershop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dateToDelete, setDateToDelete] = useState<string | null>(null);

  const isPremium = shop?.plan === 'premium';

  useEffect(() => {
    fetch('/api/admin/shop')
      .then(res => res.json())
      .then(data => {
        setShop(data);
        setLoading(false);
      });
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPremium) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setShop(prev => prev ? { ...prev, logo: reader.result as string } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    setSaving(true);
    const res = await fetch('/api/admin/shop', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shop)
    });
    if (res.ok) {
      alert('Configuración guardada correctamente');
    }
    setSaving(false);
  };

  if (loading || !shop) return <div className="p-8 text-white/50">Cargando ajustes...</div>;

  const bookingUrl = `${window.location.origin}/b/${shop.slug}`;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-6xl font-black uppercase tracking-tighter leading-none italic">Ajustes</h1>
        <p className="text-white/40 mt-4 text-lg font-medium">Personaliza tu perfil público y configuración de negocio.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Public Profile Section */}
        <section className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-10 space-y-8">
          <div className="flex items-center gap-6">
            <div className={cn(
              "relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-white/10",
              !isPremium && "cursor-not-allowed opacity-50"
            )}>
              <img src={shop.logo} className="w-24 h-24 object-cover transition-all" />
              {isPremium ? (
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                  <Camera className="w-6 h-6" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-all">
                  <Lock className="w-5 h-5 text-white/40" />
                </div>
              )}
            </div>
            <div>
               <h2 className="text-xl font-black uppercase italic tracking-tight">Logo del Negocio</h2>
               <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">
                 {isPremium ? 'Haz clic en la imagen para cambiar el logo' : 'Mejora a Premium para habilitar logo personalizado'}
               </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Nombre Comercial</label>
              <input 
                type="text" 
                value={shop.name}
                onChange={(e) => setShop({ ...shop, name: e.target.value })}
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Slug (URL de reservas)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 text-sm font-medium">/b/</span>
                <input 
                  type="text" 
                  value={shop.slug}
                  onChange={(e) => setShop({ ...shop, slug: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-white/20 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Descripción</label>
              <textarea 
                value={shop.description}
                onChange={(e) => setShop({ ...shop, description: e.target.value })}
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all h-32 resize-none"
              />
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-10 space-y-8">
           <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
             <Phone className="w-6 h-6" /> Contacto y Ubicación
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">WhatsApp / Teléfono</label>
                <input 
                  type="text" 
                  value={shop.phone}
                  onChange={(e) => setShop({ ...shop, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Dirección</label>
                <input 
                  type="text" 
                  value={shop.address}
                  onChange={(e) => setShop({ ...shop, address: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold"
                />
             </div>
           </div>
        </section>

        {/* Plan & Customization */}
        <section className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-10 space-y-8 relative overflow-hidden">
           <div className="flex justify-between items-center">
             <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
               <Globe className="w-6 h-6" /> Plan y Personalización
             </h2>
             <select 
               value={shop.plan || 'basic'}
               onChange={(e) => setShop({ ...shop, plan: e.target.value as 'basic' | 'premium' })}
               className="bg-white text-black text-[10px] font-black uppercase px-4 py-2 rounded-full outline-none cursor-pointer"
             >
               <option value="basic">Plan Básico</option>
               <option value="premium">Plan Premium</option>
             </select>
           </div>

           <div className={cn(
             "grid grid-cols-1 md:grid-cols-2 gap-8 transition-all",
             shop.plan !== 'premium' && "opacity-20 pointer-events-none grayscale"
           )}>
             <div className="space-y-4">
               <div>
                 <h4 className="text-sm font-black uppercase italic tracking-tight">Colores de Marca</h4>
                 <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Define los colores de tu página de reservas.</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Color Principal</label>
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                      <input 
                        type="color" 
                        value={shop.theme?.primary || '#FFFFFF'}
                        onChange={(e) => setShop({ ...shop, theme: { ...(shop.theme || { primary: '#FFFFFF', accent: '#000000' }), primary: e.target.value } })}
                        className="w-8 h-8 rounded-lg overflow-hidden bg-transparent border-none cursor-pointer"
                      />
                      <span className="text-xs font-mono uppercase">{shop.theme?.primary || '#FFFFFF'}</span>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Color de Acento</label>
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                      <input 
                        type="color" 
                        value={shop.theme?.accent || '#000000'}
                        onChange={(e) => setShop({ ...shop, theme: { ...(shop.theme || { primary: '#FFFFFF', accent: '#000000' }), accent: e.target.value } })}
                        className="w-8 h-8 rounded-lg overflow-hidden bg-transparent border-none cursor-pointer"
                      />
                      <span className="text-xs font-mono uppercase">{shop.theme?.accent || '#000000'}</span>
                    </div>
                 </div>
               </div>
             </div>

             <div className="flex items-center justify-center border border-dashed border-white/10 rounded-3xl p-8 bg-white/[0.02]">
               <div className="text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">Vista Previa Premium</p>
                 <div 
                   className="w-32 h-12 rounded-full flex items-center justify-center font-black text-[10px] uppercase tracking-tighter italic shadow-xl"
                   style={{ backgroundColor: shop.theme?.primary || '#FFFFFF', color: shop.theme?.accent || '#000000' }}
                 >
                   Confirmar Cita
                 </div>
               </div>
             </div>
           </div>

           {shop.plan !== 'premium' && (
             <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <div className="text-center p-8 bg-[#0D0D0D] border border-white/10 rounded-3xl shadow-2xl">
                  <p className="text-xs font-black uppercase tracking-[0.2em] italic">Funcionalidad Premium</p>
                  <p className="text-[10px] text-white/40 mt-2">Personaliza colores y branding con el plan Pro.</p>
                </div>
             </div>
           )}
        </section>

        {/* Business Hours */}
        <section className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-10 space-y-8">
           <div className="flex justify-between items-center">
             <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
               <Clock className="w-6 h-6" /> Horario de Atención
             </h2>
             <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded-full text-white/40 uppercase tracking-widest">Global</span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Hora de Apertura</label>
                <input 
                  type="time" 
                  value={(Object.values(shop.hours)[0] as any)?.open || '08:00'}
                  onChange={(e) => {
                    const newHours = { ...shop.hours };
                    Object.keys(newHours).forEach(day => {
                      if (newHours[day].open !== 'off') newHours[day].open = e.target.value;
                    });
                    setShop({ ...shop, hours: newHours });
                  }}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Hora de Cierre</label>
                <input 
                  type="time" 
                  value={(Object.values(shop.hours)[0] as any)?.close || '20:00'}
                  onChange={(e) => {
                    const newHours = { ...shop.hours };
                    Object.keys(newHours).forEach(day => {
                      if (newHours[day].close !== 'off') newHours[day].close = e.target.value;
                    });
                    setShop({ ...shop, hours: newHours });
                  }}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold"
                />
             </div>
           </div>

           <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Días Inactivos (Cierres Especiales)</label>
             <div className="flex gap-2">
               <input 
                 type="date"
                 id="inactive-date-picker"
                 className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold text-white/60"
               />
               <button 
                type="button"
                onClick={() => {
                  const picker = document.getElementById('inactive-date-picker') as HTMLInputElement;
                  if (picker.value) {
                    const current = shop.inactiveDates || [];
                    if (!current.includes(picker.value)) {
                      setShop({ ...shop, inactiveDates: [...current, picker.value] });
                    }
                    picker.value = '';
                  }
                }}
                className="px-6 rounded-2xl bg-white/5 border border-white/5 text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all"
               >
                 Agregar
               </button>
             </div>
             <div className="flex flex-wrap gap-2">
               {(shop.inactiveDates || []).map(date => (
                 <span key={date} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase flex items-center gap-2 group">
                   {date}
                   <button 
                    type="button"
                    onClick={() => {
                      setDateToDelete(date);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-500/40 group-hover:text-red-500 transition-colors"
                   >
                     ✕
                   </button>
                 </span>
               ))}
               {(shop.inactiveDates || []).length === 0 && <p className="text-[10px] text-white/20 uppercase font-bold italic py-2">No hay días inactivos configurados</p>}
             </div>
           </div>
        </section>

        {/* Public Link Card */}
        <section className="p-8 rounded-[40px] bg-white text-black space-y-4">
           <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tight">Tu página de reservas</h3>
                <p className="text-xs font-bold uppercase opacity-50 tracking-wider">Comparte este link en tus redes sociales</p>
              </div>
              <Globe className="w-10 h-10 opacity-20" />
           </div>
           <div className="flex gap-2">
              <input 
                readOnly
                value={bookingUrl}
                className="flex-1 bg-black/5 border border-black/10 rounded-2xl px-6 py-4 outline-none font-bold text-sm"
              />
              <button 
                type="button"
                onClick={() => { navigator.clipboard.writeText(bookingUrl); alert('Copiado!'); }}
                className="px-6 rounded-2xl bg-black text-white font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all"
              >
                Copiar
              </button>
           </div>
        </section>

        <div className="flex justify-end gap-4 pb-20">
           <button 
             type="submit"
             disabled={saving}
             className="px-12 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50"
           >
             {saving ? 'Guardando...' : <><Save className="w-5 h-5" /> Guardar Cambios</>}
           </button>
        </div>

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDateToDelete(null);
          }}
          onConfirm={() => {
            if (dateToDelete && shop) {
              setShop({ ...shop, inactiveDates: shop.inactiveDates?.filter(d => d !== dateToDelete) });
              setDateToDelete(null);
            }
          }}
          title="Eliminar Fecha"
          message="¿Estás seguro de que deseas eliminar este día de inactividad? El negocio volverá a estar disponible en esta fecha."
          itemText={dateToDelete || ''}
        />
      </form>
    </div>
  );
}
