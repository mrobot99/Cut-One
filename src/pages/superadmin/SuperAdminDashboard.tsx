import React, { useState, useEffect } from 'react';
import { Shield, Search, Globe, CreditCard, ChevronRight, Filter, MoreHorizontal, User, Calendar, TrendingUp, DollarSign, Activity, LogOut, Plus, X, Copy, Check as CheckIcon, Loader2, Key, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Barbershop } from '../../types';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

interface Stats {
  totalShops: number;
  totalAppointments: number;
  premiumShops: number;
  totalRevenue: number;
  recentAppointments: any[];
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [shops, setShops] = useState<Barbershop[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'basic' | 'premium'>('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [shopToDowngrade, setShopToDowngrade] = useState<string | null>(null);
  const [showCredsId, setShowCredsId] = useState<string | null>(null);
  
  // Registration States
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regSuccessData, setRegSuccessData] = useState<any>(null);
  const [regForm, setRegForm] = useState({
    shopName: '',
    slug: '',
    email: '',
    plan: 'basic' as 'basic' | 'premium'
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
    if (!isSuperAdmin) {
      navigate('/');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shopsRes, statsRes] = await Promise.all([
        fetch('/api/superadmin/shops'),
        fetch('/api/superadmin/stats')
      ]);

      if (!shopsRes.ok || !statsRes.ok) {
        throw new Error('Server response not ok');
      }

      const [shopsData, statsData] = await Promise.all([
        shopsRes.json(),
        statsRes.json()
      ]);
      setShops(Array.isArray(shopsData) ? shopsData : []);
      setStats(statsData);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: any) => {
    try {
      if (!dateStr) return '--:--';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '--:--';
      return format(d, 'HH:mm');
    } catch (e) {
      return '--:--';
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
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDowngrade = () => {
    if (shopToDowngrade) {
      updatePlan(shopToDowngrade, 'basic');
      setShowConfirmModal(false);
      setShopToDowngrade(null);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error en el despliegue');
      }

      if (data.success) {
        setRegSuccessData(data.credentials);
        await fetchData(); // Refresh list to see the new shop immediately
      }
    } catch (err: any) {
      console.error('Registration Error:', err);
      alert(err.message || 'Error al conectar con el servidor');
    } finally {
      setIsRegistering(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         shop.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || shop.plan === filter;
    return matchesSearch && matchesFilter;
  });

  const chartData = [
    { name: 'Total', value: stats?.totalShops || 0, color: '#FFFFFF' },
    { name: 'Premium', value: stats?.premiumShops || 0, color: '#4ADE80' },
    { name: 'Basic', value: (stats?.totalShops || 0) - (stats?.premiumShops || 0), color: '#3B82F6' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center space-y-8">
        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center animate-pulse">
          <Shield className="w-10 h-10 text-white/20" />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-xl font-black italic uppercase tracking-tighter animate-pulse">Iniciando Protocolo</p>
          <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-full h-full bg-white/20"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans p-8 selection:bg-white selection:text-black">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white text-black rounded-[24px] flex items-center justify-center rotate-3 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-5xl font-black italic uppercase tracking-tight leading-none">Super Master</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/30 mt-2">Executive Admin Infrastructure</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="lg:hidden p-4 bg-white/5 rounded-2xl text-red-500 border border-red-500/10 active:scale-95 transition-all"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>

            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="flex items-center gap-2 px-6 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                <Plus className="w-4 h-4" />
                Registrar Barbería
              </button>
              <button 
                onClick={handleLogout}
              className="hidden lg:flex items-center gap-3 px-6 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 border border-red-500/10 hover:bg-red-500/10 transition-all mr-4"
            >
              <LogOut className="w-4 h-4" />
              Terminar Sesión
            </button>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text"
                placeholder="Buscar barbería..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-white/20 transition-all font-bold text-sm min-w-[300px]"
              />
            </div>
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              {(['all', 'basic', 'premium'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    filter === f ? "bg-white text-black" : "text-white/40 hover:text-white"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Total Partners</p>
              <h3 className="text-5xl font-black italic leading-none mb-2">{stats?.totalShops || 0}</h3>
              <div className="flex items-center gap-2 text-green-400 text-[10px] font-black uppercase">
                <TrendingUp className="w-3 h-3" />
                <span>+12% Growth</span>
              </div>
            </div>
            <Globe className="absolute -right-4 -bottom-4 w-32 h-32 text-white/[0.02] group-hover:text-white/[0.05] transition-all rotate-12" />
          </div>

          <div className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Total Appointments</p>
              <h3 className="text-5xl font-black italic leading-none mb-2">{stats?.totalAppointments || 0}</h3>
              <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase">
                <Activity className="w-3 h-3" />
                <span>Active Network</span>
              </div>
            </div>
            <Calendar className="absolute -right-4 -bottom-4 w-32 h-32 text-white/[0.02] group-hover:text-white/[0.05] transition-all -rotate-12" />
          </div>

          <div className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Estimated Revenue</p>
              <h3 className="text-5xl font-black italic leading-none mb-2 font-mono">
                ${stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}
              </h3>
              <div className="flex items-center gap-2 text-yellow-400 text-[10px] font-black uppercase">
                <DollarSign className="w-3 h-3" />
                <span>Transaction Vol.</span>
              </div>
            </div>
            <CreditCard className="absolute -right-4 -bottom-4 w-32 h-32 text-white/[0.02] group-hover:text-white/[0.05] transition-all rotate-45" />
          </div>

          <div className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Conversion Rate</p>
              <h3 className="text-5xl font-black italic leading-none mb-2">
                {stats?.totalShops ? Math.round((stats.premiumShops / stats.totalShops) * 100) : 0}%
              </h3>
              <div className="flex items-center gap-2 text-purple-400 text-[10px] font-black uppercase">
                <TrendingUp className="w-3 h-3" />
                <span>Basic to Pro</span>
              </div>
            </div>
            <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 text-white/[0.02] group-hover:text-white/[0.05] transition-all" />
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#0D0D0D] border border-white/5 rounded-[40px] p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-xl font-black italic uppercase italic">Network Distribution</h4>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Shops by Plan Type</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 900 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff', fontWeight: 700 }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.2} stroke={entry.color} strokeWidth={2} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-xl font-black italic uppercase italic">Recent Activity</h4>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Live Platform Feed</p>
              </div>
            </div>
            <div className="space-y-6">
              {stats?.recentAppointments.map((app, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-white/20 transition-all">
                    <Activity className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black italic uppercase truncate">{app.clientName || app.client_name}</p>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest truncate">en {app.shopName}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-[9px] font-black text-white/50">{formatDate(app.date || app.created_at)}</p>
                  </div>
                </div>
              ))}
              {!stats?.recentAppointments.length && (
                <div className="text-center py-12 text-white/20">
                  <p className="text-xs font-black uppercase">Waiting for activity...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Master Table */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-[40px] overflow-hidden">
          <div className="px-8 py-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-2xl font-black italic uppercase italic leading-none mb-1">Partners Index</h4>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Complete Directory Management</p>
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[10px] font-black uppercase text-white/40 italic">Showing {filteredShops.length} entities</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">Barbería</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">Configuración</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">Carga Operativa</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {filteredShops.map((shop) => (
                    <React.Fragment key={shop.id}>
                      <motion.tr 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <img src={shop.logo} className="w-14 h-14 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all border border-white/5 ring-4 ring-black" />
                            {shop.plan === 'premium' && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center shadow-lg border-2 border-black">
                                <Shield className="w-3 h-3 fill-current" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-black italic uppercase text-lg leading-none mb-1">{shop.name}</p>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">PLATFORM_NODE: /{shop.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <span className={cn(
                            "inline-flex px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.1em]",
                            shop.plan === 'premium' ? "bg-green-400/10 text-green-400 border border-green-400/20" : "bg-white/5 text-white/30 border border-white/5"
                          )}>
                            {shop.plan === 'premium' ? 'TIER_PREMIUM' : 'TIER_BASIC'}
                          </span>
                          <div className="flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                            <Globe className="w-3 h-3" />
                            <span>Public access active</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex gap-8">
                          <div className="">
                            <p className="text-xl font-black italic italic leading-none">{shop.barbers?.length || 0}</p>
                            <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">Staff</p>
                          </div>
                          <div className="h-8 w-px bg-white/5"></div>
                          <div className="">
                            <p className="text-xl font-black italic italic leading-none">{shop.services?.length || 0}</p>
                            <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">Srvs</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => togglePlan(shop.id, shop.plan || 'basic')}
                            className={cn(
                              "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl",
                              shop.plan === 'premium' 
                                ? "bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-black" 
                                : "bg-white text-black hover:scale-105 active:scale-95"
                            )}
                          >
                            {shop.plan === 'premium' ? 'REVOKE_PRO' : 'GRANT_PRO'}
                          </button>

                          <button 
                            onClick={() => setShowCredsId(showCredsId === shop.id ? null : shop.id)}
                            className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                            title="Ver Credenciales"
                          >
                            {showCredsId === shop.id ? <EyeOff className="w-5 h-5" /> : <Key className="w-5 h-5" />}
                          </button>

                          <a 
                            href={`/b/${shop.slug}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all"
                          >
                            <ChevronRight className="w-4 h-4 text-white/40" />
                          </a>
                        </div>
                      </td>
                    </motion.tr>

                    {/* Credentials Row */}
                    <AnimatePresence>
                      {showCredsId === shop.id && (
                        <motion.tr 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-white/[0.01]"
                        >
                          <td colSpan={4} className="px-8 py-4">
                            <div className="flex items-center gap-8 p-4 rounded-2xl border border-white/5 bg-black/50 overflow-hidden">
                              <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Admin Username</p>
                                <div className="flex items-center gap-3">
                                  <p className="text-xs font-bold text-white/80">{shop.admin_username || 'N/A'}</p>
                                  {shop.admin_username && (
                                    <button onClick={() => copyToClipboard(shop.admin_username!)} className="text-white/20 hover:text-white transition-colors">
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="w-px h-8 bg-white/10 shrink-0"></div>
                              <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Master Password</p>
                                <div className="flex items-center gap-3">
                                  <p className="text-xs font-mono text-white/80">{shop.admin_password || '********'}</p>
                                  {shop.admin_password && (
                                    <button onClick={() => copyToClipboard(shop.admin_password!)} className="text-white/20 hover:text-white transition-colors">
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="ml-auto hidden sm:flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/10 italic">
                                <Shield className="w-3 h-3" />
                                <span>Security Protocol Active</span>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filteredShops.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-white/20 font-black uppercase italic tracking-widest">No entities found matching search criteria</p>
              </div>
            )}
          </div>
        </div>

        <DeleteConfirmationModal 
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setShopToDowngrade(null);
          }}
          onConfirm={confirmDowngrade}
          title="Security Override: Revoke Access"
          message="Attention: This action will immediately downgrade the selected entity to the Basic Tier. All premium modules will be locked. Proceed?"
          itemText={shops.find(s => s.id === shopToDowngrade)?.name}
        />

        {/* Manual Registration Modal */}
        <AnimatePresence>
          {showRegisterModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-xl bg-[#0D0D0D] border border-white/5 rounded-[40px] p-10 relative shadow-2xl"
              >
                <button 
                  onClick={() => { setShowRegisterModal(false); setRegSuccessData(null); }}
                  className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                {!regSuccessData ? (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-black italic uppercase tracking-tighter">Nueva Entidad</h2>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Protocolo de Onboarding Maestro</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Nombre Comercial</label>
                          <input 
                            required
                            value={regForm.shopName}
                            onChange={e => setRegForm({...regForm, shopName: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold placeholder:text-white/10"
                            placeholder="Ej. Legendary Barber Shop"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">URL_NODE (Slug)</label>
                            <input 
                              required
                              value={regForm.slug}
                              onChange={e => setRegForm({...regForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                              className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-mono text-sm"
                              placeholder="legendary"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Suscripción</label>
                            <select 
                              value={regForm.plan}
                              onChange={e => setRegForm({...regForm, plan: e.target.value as any})}
                              className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-black uppercase text-[10px]"
                            >
                              <option value="basic">Suscripción Básica</option>
                              <option value="premium">Suscripción Premium</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Email de Contacto</label>
                          <input 
                            required
                            type="email"
                            value={regForm.email}
                            onChange={e => setRegForm({...regForm, email: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold"
                            placeholder="contacto@shop.com"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={isRegistering}
                        className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                      >
                        {isRegistering ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Desplegando...</span>
                          </>
                        ) : 'Desplegar Infraestructura'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-8 py-4">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-20 h-20 bg-green-500 text-black rounded-[32px] flex items-center justify-center rotate-12 glow-green shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                        <CheckIcon className="w-10 h-10" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Entidad Activada</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Credenciales maestras generadas</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Email / Registro</span>
                            <button onClick={() => copyToClipboard(regSuccessData.username)} className="text-white/20 hover:text-white"><Copy className="w-3 h-3" /></button>
                          </div>
                          <p className="text-sm font-bold">{regSuccessData.username}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Contraseña Temporal</span>
                            <button onClick={() => copyToClipboard(regSuccessData.password)} className="text-white/20 hover:text-white"><Copy className="w-3 h-3" /></button>
                          </div>
                          <p className="text-lg font-mono p-4 bg-white/5 rounded-xl border border-white/5">{regSuccessData.password}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setShowRegisterModal(false); setRegSuccessData(null); }}
                        className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all underline underline-offset-8 decoration-white/10 hover:decoration-white"
                      >
                        Finalizar y Volver al Panel
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

