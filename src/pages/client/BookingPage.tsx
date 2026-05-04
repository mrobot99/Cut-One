import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Scissors, Clock, ArrowRight, CheckCircle2, ChevronRight, Search, Phone, User, Calendar as CalendarIcon, MessageCircle, RefreshCw } from 'lucide-react';
import { format, addDays, startOfToday, setHours, setMinutes, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { Barbershop, Service, Barber } from '../../types';

export default function BookingPage() {
  const { slug } = useParams();
  const [shop, setShop] = useState<Barbershop | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);

  // Selection state
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientData, setClientData] = useState({ name: '', phone: '' });

  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    async function fetchShop() {
      try {
        const res = await fetch(`/api/shops/${slug}`);
        const data = await res.json();
        setShop(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchShop();
  }, [slug]);

  const handleBooking = async () => {
    if (!selectedService || !selectedBarber || !selectedTime) return;
    setBookingStatus('loading');
    
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: shop?.id,
          shopSlug: shop?.slug,
          serviceId: selectedService.id,
          barberId: selectedBarber.id,
          clientName: clientData.name,
          clientPhone: clientData.phone,
          date: selectedDate.toISOString(),
          time: selectedTime,
        })
      });
      setBookingStatus('success');
    } catch (err) {
      console.error(err);
      setBookingStatus('idle');
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black italic text-4xl animate-pulse">CUT ONE</div>;
  if (!shop) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Shop not found</div>;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-white selection:text-black">
      {/* Hero Header */}
      <section className="relative h-[40vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/40 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop" 
          alt="Barbershop" 
          className="w-full h-full object-cover scale-110 blur-sm brightness-50"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-col items-center gap-4 mb-4">
               <div className="w-20 h-20 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl">
                 <img src={shop.logo} className="w-full h-full object-cover" />
               </div>
               <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">{shop.name}</h1>
            </div>
            <p className="text-white/60 max-w-lg mx-auto text-sm md:text-base font-medium">
              {shop.description || "Reserva tu estilo con los mejores. Calidad premium garantizada."}
            </p>
          </motion.div>
        </div>

        {/* WhatsApp Float */}
        <a 
          href={`https://wa.me/${shop.phone}`} 
          className="absolute top-6 right-6 z-30 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all text-black"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </section>

      {/* Main Reservation Flow */}
      <main className="max-w-4xl mx-auto -mt-10 relative z-30 pb-20 px-4">
        {bookingStatus === 'success' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-12 text-center space-y-6"
          >
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle2 className="text-black w-10 h-10" />
            </div>
            <h2 className="text-4xl font-black uppercase italic">¡Reserva Exitosa!</h2>
            <p className="text-white/50">Tu cita con {selectedBarber?.name} ha sido confirmada para el {format(selectedDate, 'd MMMM', { locale: es })} a las {selectedTime}.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-8 bg-white text-black px-10 py-5 rounded-full font-black uppercase tracking-wider text-sm hover:scale-105 active:scale-95 transition-all"
            >
              Listo, gracias
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  step >= i ? "bg-white w-8" : "bg-white/10 w-4"
                )}></div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
                      <Scissors className="w-6 h-6" /> Servicios
                    </h2>
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                      <Search className="w-4 h-4 text-white/40" />
                      <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-xs w-24 placeholder:text-white/20" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shop.services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => { setSelectedService(service); setStep(2); }}
                        className={cn(
                          "group p-6 rounded-[32px] border text-left transition-all duration-300 relative overflow-hidden",
                          selectedService?.id === service.id 
                            ? "bg-white text-black border-white" 
                            : "bg-[#0D0D0D] border-white/5 hover:border-white/20"
                        )}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className={cn(
                            "p-3 rounded-2xl",
                            selectedService?.id === service.id ? "bg-black/10" : "bg-white/5 group-hover:bg-white/10"
                          )}>
                            <Scissors className="w-6 h-6" />
                          </div>
                          <span className="font-black text-xl">${service.price.toLocaleString()}</span>
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tight mb-1">{service.name}</h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-50">
                          <Clock className="w-3 h-3" /> {service.duration} MINS
                        </div>
                        
                        <div className="mt-6 flex items-center justify-between">
                           <span className={cn(
                             "px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                             selectedService?.id === service.id ? "bg-black text-white" : "bg-white text-black group-hover:px-8"
                           )}>
                             {selectedService?.id === service.id ? "SELECCIONADO" : "RESERVAR"}
                           </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <button onClick={() => setStep(1)} className="text-white/40 flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4 rotate-180" /> Volver a servicios
                  </button>

                  {/* Barber Selection */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-black uppercase italic flex items-center gap-3 px-2">
                       <User className="w-6 h-6" /> Elige tu Barbero
                    </h2>
                    <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-4 px-4">
                      {shop.barbers.map((barber) => (
                        <button
                          key={barber.id}
                          onClick={() => setSelectedBarber(barber)}
                          className={cn(
                            "flex-shrink-0 w-32 flex flex-col items-center gap-3 transition-all",
                            selectedBarber?.id === barber.id ? "scale-110" : "opacity-40 grayscale hover:opacity-100 hover:grayscale-0"
                          )}
                        >
                          <div className={cn(
                             "w-20 h-20 rounded-full border-2 p-1 transition-all",
                             selectedBarber?.id === barber.id ? "border-white" : "border-transparent"
                          )}>
                            <img src={barber.photo} className="w-full h-full rounded-full object-cover" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-tighter text-center leading-tight">{barber.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-black uppercase italic flex items-center gap-3 px-2">
                       <CalendarIcon className="w-6 h-6" /> Selecciona Fecha
                    </h2>
         <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar -mx-4 px-4">
           {Array.from({ length: 14 }).map((_, i) => {
             const date = addDays(startOfToday(), i);
             const isSelected = isSameDay(selectedDate, date);
             const dateStr = format(date, 'yyyy-MM-dd');
             const isInactive = shop.inactiveDates?.includes(dateStr);
             const dayName = format(date, 'eeee', { locale: es }).toLowerCase();
             const isClosedDay = shop.hours[dayName]?.open === 'off';

             if (isInactive || isClosedDay) return null;

             return (
               <button
                 key={i}
                 onClick={() => setSelectedDate(date)}
                 className={cn(
                   "flex-shrink-0 w-24 h-24 rounded-[24px] border flex flex-col items-center justify-center transition-all",
                   isSelected ? "bg-white text-black border-white" : "bg-white/5 border-white/5 hover:border-white/20"
                 )}
               >
                 <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{format(date, 'EEE', { locale: es })}</span>
                 <span className="text-2xl font-black leading-none">{format(date, 'dd')}</span>
               </button>
             );
           })}
         </div>
       </div>

       {/* Time Selection */}
         {selectedBarber && (
           <div className="space-y-6">
             <h2 className="text-2xl font-black uppercase italic flex items-center gap-3 px-2">
               <Clock className="w-6 h-6" /> Horarios Disponibles
             </h2>
             
             {(() => {
               const dayName = format(selectedDate, 'eeee', { locale: es }).toLowerCase();
               const shopDayHours = shop.hours[dayName];
               
               // Use shop hours but constrained by barber shift
               const startStr = selectedBarber.shiftStart || shopDayHours.open;
               const endStr = selectedBarber.shiftEnd || shopDayHours.close;
               
               if (!startStr || startStr === 'off') return <p className="text-center py-10 text-white/20 uppercase font-black tracking-widest italic">Cerrado este día</p>;

               const startH = parseInt(startStr.split(':')[0]);
               const endH = parseInt(endStr.split(':')[0]);
               
               const times: string[] = [];
               for (let h = startH; h < endH; h++) {
                 times.push(`${h.toString().padStart(2, '0')}:00`);
                 times.push(`${h.toString().padStart(2, '0')}:30`);
               }

               const morning = times.filter(t => parseInt(t.split(':')[0]) < 13);
               const afternoon = times.filter(t => parseInt(t.split(':')[0]) >= 13);

               return (
                 <div className="space-y-8">
                   {morning.length > 0 && (
                     <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-2">En la mañana</p>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {morning.map(time => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={cn(
                                "py-3 rounded-xl border text-xs font-black transition-all",
                                selectedTime === time ? "bg-white text-black border-white" : "bg-white/5 border-white/5 hover:border-white/20 text-white/60 hover:text-white"
                              )}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                     </div>
                   )}
                   {afternoon.length > 0 && (
                     <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-2">En la tarde</p>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {afternoon.map(time => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={cn(
                                "py-3 rounded-xl border text-xs font-black transition-all",
                                selectedTime === time ? "bg-white text-black border-white" : "bg-white/5 border-white/5 hover:border-white/20 text-white/60 hover:text-white"
                              )}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                     </div>
                   )}
                 </div>
               );
             })()}
           </div>
         )}

                  {selectedTime && (
                    <motion.button
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       onClick={() => setStep(3)}
                       className="w-full py-5 rounded-full bg-white text-black font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 group shadow-xl"
                    >
                      Continuar <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </motion.button>
                  )}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                   <button onClick={() => setStep(2)} className="text-white/40 flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4 rotate-180" /> Volver a horario
                  </button>

                  <div className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-8 space-y-8">
                    <h2 className="text-3xl font-black uppercase italic text-center leading-none">Tus Datos</h2>
                    
                    <div className="space-y-4">
                      <div className="space-y-2 px-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Nombre Completo</label>
                         <input 
                           type="text" 
                           value={clientData.name}
                           onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                           placeholder="Ingresa tu nombre"
                           className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-medium"
                         />
                      </div>
                      <div className="space-y-2 px-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-white/30">WhatsApp / Teléfono</label>
                         <input 
                           type="tel" 
                           value={clientData.phone}
                           onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                           placeholder="+57 300 000 0000"
                           className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-medium"
                         />
                      </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Resumen</span>
                        <span className="text-[10px] font-black bg-white text-black px-3 py-1 rounded-full">{selectedService?.name}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                           <span className="text-white/40 font-medium">Barbero</span>
                           <span className="font-bold">{selectedBarber?.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-white/40 font-medium">Fecha</span>
                           <span className="font-bold">{format(selectedDate, 'PPP', { locale: es })}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-white/40 font-medium">Hora</span>
                           <span className="font-bold">{selectedTime}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                       disabled={!clientData.name || !clientData.phone || bookingStatus === 'loading'}
                       onClick={handleBooking}
                       className="w-full py-6 rounded-full bg-white text-black font-black uppercase tracking-tighter text-xl disabled:opacity-20 transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3"
                    >
                      {bookingStatus === 'loading' ? (
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      ) : (
                        "Confirmar Reserva"
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Modern Footer Branding */}
      <footer className="py-12 border-t border-white/5 flex flex-col items-center gap-4">
         <div className="flex items-center gap-2 opacity-20">
           <Scissors className="w-5 h-5" />
           <span className="font-black uppercase tracking-widest">CUT ONE</span>
         </div>
         <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">&copy; 2026 Powered by Bukia SaaS</p>
      </footer>
    </div>
  );
}
