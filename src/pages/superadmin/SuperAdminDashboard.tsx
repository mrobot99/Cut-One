import React, { useState, useEffect } from 'react';
import { Shield, Search, Globe, CreditCard, ChevronRight, Filter, MoreHorizontal, User, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Barbershop } from '../../types';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

export default function SuperAdminDashboard() {
  const [shops, setShops] = useState<Barbershop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'basic' | 'premium'>('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [shopToDowngrade, setShopToDowngrade] = useState<string | null>(null);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const res = await fetch('/api/superadmin/shops');
      const data = await res.json();
      setShops(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePlan = async (id: string, currentPlan: string) => {
    if (currentPlan === 'premium') {
      setShopToDowngrade(id);
      setShowConfirmModal(true);
      return;
    }
    
    await updatePlan(id, 'premium');
  };

  const updatePlan = async (id: string, newPlan: string) => {
    try {
      const res = await fetch(`/api/superadmin/shops/${id}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan })
      });
      if (res.ok) fetchShops();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDowngrade = () => {
    if (shopToDowngrade) {
      updatePlan(shopToDowngrade, 'basic');
      setShopToDowngrade(null);
    }
  };

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         shop.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || shop.plan === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans p-8 selection:bg-white selection:text-black">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center rotate-3 shadow-2xl">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter">Super Master</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Central Control Panel</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text"
                placeholder="Buscar barbería..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-3 outline-none focus:border-white/20 transition-all font-bold text-sm w-64"
              />
            </div>
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              {(['all', 'basic', 'premium'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    filter === f ? "bg-white text-black" : "text-white/40 hover:text-white"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Total Usuarios</p>
              <h3 className="text-4xl font-black italic">{shops.length}</h3>
            </div>
            <Globe className="w-12 h-12 text-white/5" />
          </div>
          <div className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Suscripciones Pro</p>
              <h3 className="text-4xl font-black italic text-green-400">{shops.filter(s => s.plan === 'premium').length}</h3>
            </div>
            <CreditCard className="w-12 h-12 text-white/5" />
          </div>
          <div className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Basic Plan</p>
              <h3 className="text-4xl font-black italic">{shops.filter(s => s.plan === 'basic').length}</h3>
            </div>
            <User className="w-12 h-12 text-white/5" />
          </div>
        </div>

        {/* Master Table */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-[40px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">Barbería</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">Plan Actual</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">Negocio</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {filteredShops.map((shop) => (
                    <motion.tr 
                      key={shop.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={shop.logo} className="w-12 h-12 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all border border-white/5" />
                          <div>
                            <p className="font-black italic uppercase text-sm">{shop.name}</p>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">/{shop.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em]",
                          shop.plan === 'premium' ? "bg-green-400/10 text-green-400" : "bg-white/10 text-white/50"
                        )}>
                          {shop.plan === 'premium' ? 'Plan Premium' : 'Básico Free'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex gap-4">
                          <div className="text-center">
                            <p className="text-xs font-black italic">{shop.barbers.length}</p>
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Barberos</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-black italic">{shop.services.length}</p>
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Servicios</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => togglePlan(shop.id, shop.plan || 'basic')}
                            className={cn(
                              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                              shop.plan === 'premium' 
                                ? "bg-white/5 text-red-400 hover:bg-red-400/10" 
                                : "bg-white text-black hover:scale-105"
                            )}
                          >
                            {shop.plan === 'premium' ? 'Bajar a Basic' : 'Mejorar a Pro'}
                          </button>
                          <a 
                            href={`/b/${shop.slug}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all"
                          >
                            <MoreHorizontal className="w-4 h-4 text-white/40" />
                          </a>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        <DeleteConfirmationModal 
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setShopToDowngrade(null);
          }}
          onConfirm={confirmDowngrade}
          title="Degradar Plan"
          message="¿Estás seguro de que deseas bajar al plan básico? El usuario perderá acceso a funciones premium inmediatamente."
          itemText={shops.find(s => s.id === shopToDowngrade)?.name}
        />

      </div>
    </div>
  );
}
