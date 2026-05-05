import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, CreditCard, DollarSign, ArrowUpRight, Calendar as CalendarIcon, Download, Lock, PieChart as PieChartIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Barbershop, Appointment, Barber } from '../../types';
import { format, startOfMonth, endOfMonth, isWithinInterval, startOfDay, subDays, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { useOutletContext } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { cn } from '../../lib/utils';

export default function FinancesPage() {
  const { searchQuery, shop: layoutShop } = useOutletContext<{ searchQuery: string, shop: Barbershop | null }>();
  const [shop, setShop] = useState<Barbershop | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const isPremium = shop?.plan === 'premium';

  // Prepare chart data (last 7 days)
  const chartData = useMemo(() => {
    if (!appointments.length) return [];
    const last7Days = eachDayOfInterval({
      start: subDays(startOfDay(new Date()), 6),
      end: startOfDay(new Date())
    });

    return last7Days.map(day => {
      const dayApps = appointments.filter(app => startOfDay(new Date(app.date)).getTime() === day.getTime());
      const dailyRevenue = dayApps.reduce((sum, app) => {
        const service = shop?.services.find(s => s.id === app.serviceId);
        return sum + (service?.price || 0);
      }, 0);

      return {
        date: format(day, 'dd MMM', { locale: es }),
        amount: dailyRevenue
      };
    });
  }, [appointments, shop]);

  // Calculate Barber Commissions
  const barberPerformance = useMemo(() => {
    if (!shop) return [];
    return shop.barbers.map(barber => {
      const barberApps = appointments.filter(app => app.barberId === barber.id);
      const totalGenerated = barberApps.reduce((sum, app) => {
        const service = shop.services.find(s => s.id === app.serviceId);
        return sum + (service?.price || 0);
      }, 0);

      const commissionRate = barber.commission || 50; // Default 50%
      const earned = (totalGenerated * commissionRate) / 100;

      return {
        ...barber,
        totalGenerated,
        earned,
        appointmentsCount: barberApps.length
      };
    }).sort((a, b) => b.totalGenerated - a.totalGenerated);
  }, [appointments, shop]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shopRes, appRes] = await Promise.all([
        fetch('/api/admin/shop'),
        fetch('/api/admin/appointments')
      ]);
      setShop(await shopRes.json());
      setAppointments(await appRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ['Fecha', 'Cliente', 'Servicio', 'Barber', 'Precio'];
    const rows = appointments.map(app => {
      const service = shop?.services.find(s => s.id === app.serviceId);
      const barber = shop?.barbers.find(b => b.id === app.barberId);
      return [
        format(new Date(app.date), 'yyyy-MM-dd'),
        app.clientName,
        service?.name || '',
        barber?.name || '',
        service?.price || 0
      ].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bukia_finanzas_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentMonthAppointments = appointments.filter(a => {
    const date = new Date(a.date);
    return isWithinInterval(date, {
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date())
    });
  });

  const totalRevenue = appointments.reduce((acc, app) => {
    const service = shop?.services.find(s => s.id === app.serviceId);
    return acc + (service?.price || 0);
  }, 0);

  const monthRevenue = currentMonthAppointments.reduce((acc, app) => {
    const service = shop?.services.find(s => s.id === app.serviceId);
    return acc + (service?.price || 0);
  }, 0);

  const filteredAppointments = appointments.slice().reverse().filter(app => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const service = shop?.services.find(s => s.id === app.serviceId);
    const barber = shop?.barbers.find(b => b.id === app.barberId);
    
    return app.clientName.toLowerCase().includes(query) || 
           service?.name.toLowerCase().includes(query) || 
           barber?.name.toLowerCase().includes(query);
  });

  const stats = [
    { label: 'Total Histórico', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: '+12%', sub: 'Desde el inicio' },
    { label: 'Este Mes', value: `$${monthRevenue.toLocaleString()}`, icon: TrendingUp, trend: '+5.4%', sub: format(new Date(), 'MMMM', { locale: es }) },
    { label: 'Ticket Promedio', value: `$${(totalRevenue / (appointments.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: CreditCard, trend: '+2%', sub: 'Por cliente' },
  ];

  if (loading || !shop) return <div className="p-8 text-white/20 uppercase font-black tracking-widest italic animate-pulse">Cargando finanzas...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">Finanzas</h1>
          <p className="text-white/40 mt-4 text-base md:text-lg font-medium">Análisis de ingresos y rendimiento económico.</p>
        </div>
        <button 
          onClick={handleExport}
          className="w-full md:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all shadow-xl group"
        >
          <Download className="w-5 h-5 group-hover:bounce" /> Exportar Reporte
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-10 rounded-[40px] bg-[#0D0D0D] border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all shadow-lg"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 rounded-3xl bg-white/5 group-hover:bg-white group-hover:text-black transition-colors">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-xs font-bold bg-green-400/10 px-3 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" /> {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mb-2">{stat.label}</p>
              <h3 className="text-3xl md:text-4xl font-black tracking-tighter italic">{stat.value}</h3>
              <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mt-4">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0D0D0D] border border-white/5 rounded-[40px] p-8 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-white/40" /> Tendencia de Ingresos
            </h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Últimos 7 días</span>
          </div>

          <div className="h-64 w-full relative">
            {!isPremium && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl">
                <Lock className="w-8 h-8 text-white/20 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest italic">Análisis Visual Premium</p>
                <p className="text-[10px] text-white/40 mt-1 uppercase">Mejora tu plan para ver gráficas</p>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" opacity={0.05} vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#FFFFFF" 
                  opacity={0.3} 
                  fontSize={10} 
                  fontWeight="bold" 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#FFFFFF" 
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-8 relative overflow-hidden">
           <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-white/40" /> Comisiones
            </h3>
          </div>

          <div className="space-y-6 relative h-64 overflow-y-auto">
            {!isPremium && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl">
                <Lock className="w-6 h-6 text-white/20 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Cálculo Pro</p>
                <p className="text-[9px] text-white/40 mt-1 uppercase">Gestiona pagos de barberos</p>
              </div>
            )}
            {barberPerformance.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/20 transition-all">
                <div className="flex items-center gap-3">
                  <img src={b.photo} className="w-10 h-10 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">{b.name}</p>
                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{b.commission || 50}% comisión</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black italic text-green-400">${b.earned.toLocaleString()}</p>
                  <p className="text-[9px] text-white/20 font-black uppercase">{b.appointmentsCount} citas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0D0D0D] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
           <h3 className="text-xl font-black uppercase italic tracking-tight">Últimos Ingresos</h3>
           <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
             <CalendarIcon className="w-4 h-4 text-white/40" />
             <span className="text-[10px] font-black uppercase tracking-widest leading-none">Todo el tiempo</span>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30">Cliente</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30">Servicio</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30">Barbero</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30">Fecha</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAppointments.map((app) => {
                const service = shop.services.find(s => s.id === app.serviceId);
                const barber = shop.barbers.find(b => b.id === app.barberId);
                return (
                  <tr key={app.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-black text-[10px] uppercase group-hover:bg-white group-hover:text-black transition-colors">
                           {app.clientName.charAt(0)}
                         </div>
                         <span className="font-bold text-sm tracking-tight">{app.clientName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">{service?.name}</span>
                    </td>
                    <td className="px-8 py-6 text-xs text-white/40 font-medium uppercase">{barber?.name}</td>
                    <td className="px-8 py-6 text-xs text-white/40 font-medium">{format(new Date(app.date), 'dd MMM, HH:mm', { locale: es })}</td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-sm font-black italic tracking-tight text-green-400">+${service?.price.toLocaleString()}</span>
                    </td>
                  </tr>
                );
              })}
              {filteredAppointments.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-8 py-20 text-center text-white/20 uppercase text-[10px] font-black tracking-widest italic">
                     {searchQuery ? 'No se encontraron resultados para tu búsqueda' : 'No hay transacciones registradas'}
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
