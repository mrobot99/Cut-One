import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'db.json');

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Use service role for admin operations
const supabase = createClient(supabaseUrl, supabaseKey);

const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

// Initial Data Structure (for local fallback)
const INITIAL_DB = {
  shops: [
    {
      id: '1',
      name: 'PZ Barbershop',
      slug: 'pz-barbershop',
      description: 'Panel Administrativo Premium',
      address: 'Calle 123, Bogotá',
      phone: '+57 300 000 0000',
      logo: 'https://placehold.co/100x100?text=PZ',
      plan: 'premium',
      theme: {
        primary: '#FFFFFF',
        accent: '#000000'
      },
      services: [
        { id: 's1', name: 'Corte de Cabello', price: 35000, duration: 45, icon: 'scissors' },
        { id: 's2', name: 'Tinte Completo', price: 120000, duration: 120, icon: 'palette' },
        { id: 's3', name: 'Manicure', price: 25000, duration: 30, icon: 'sparkles' },
      ],
      barbers: [
        { id: 'b1', name: 'Felipe Zapata', photo: 'https://i.pravatar.cc/150?u=felipe', commission: 60 },
        { id: 'b2', name: 'Santiago Giraldo', photo: 'https://i.pravatar.cc/150?u=santiago', commission: 50 },
      ],
      hours: {
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: { open: '08:00', close: '20:00' },
        saturday: { open: '08:00', close: '18:00' },
        sunday: { open: 'off', close: 'off' },
      }
    },
    {
      id: '2',
      name: 'The Cut Barbers',
      slug: 'the-cut',
      description: 'Tu estilo, nuestra pasión',
      address: 'Carrera 45, Medellín',
      phone: '+57 311 111 1111',
      logo: 'https://placehold.co/100x100?text=TC',
      plan: 'basic',
      theme: {
        primary: '#EAB308',
        accent: '#000000'
      },
      services: [
        { id: 's1', name: 'Corte Clásico', price: 30000, duration: 40, icon: 'scissors' },
        { id: 's2', name: 'Barba', price: 20000, duration: 20, icon: 'user' },
      ],
      barbers: [
        { id: 'b1', name: 'Carlos Mario', photo: 'https://i.pravatar.cc/150?u=carlos', commission: 50 },
      ],
      hours: {
        monday: { open: '09:00', close: '21:00' },
        tuesday: { open: '09:00', close: '21:00' },
        wednesday: { open: '09:00', close: '21:00' },
        thursday: { open: '09:00', close: '21:00' },
        friday: { open: '09:00', close: '21:00' },
        saturday: { open: '09:00', close: '21:00' },
        sunday: { open: '10:00', close: '16:00' },
      }
    }
  ],
  appointments: []
};

function getDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DB, null, 2));
    }
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    if (!content || content.trim() === '') {
      return INITIAL_DB;
    }
    return JSON.parse(content);
  } catch (error) {
    console.error('Database Error:', error);
    return INITIAL_DB;
  }
}

function saveDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(express.static('public'));

  // Request Logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (isSupabaseConfigured) {
      // Check for Super Admin first
      if (username === 'juanceo' && password === '1357+-') {
        return res.json({ 
          success: true, 
          role: 'superadmin'
        });
      }

      // Check shop specific credentials (new way)
      const { data: shopsByCreds } = await supabase
        .from('shops')
        .select('*');
      
      const shop = shopsByCreds?.find(s => 
        (s.admin_username === username && s.admin_password === password) ||
        (s.theme?.admin_username === username && s.theme?.admin_password === password) ||
        (s.slug === username && password === 'admin')
      );

      if (shop) {
        return res.json({ 
          success: true, 
          shopId: shop.id,
          shopSlug: shop.slug,
          plan: shop.plan 
        });
      }

      // Root admin check (fallback)
      if (username === 'admin' && password === 'admin') {
        const { data: shops } = await supabase.from('shops').select('*').limit(1);
        if (shops && shops[0]) {
          return res.json({ 
            success: true, 
            shopId: shops[0].id,
            shopSlug: shops[0].slug,
            plan: shops[0].plan 
          });
        }
      }
    } else {
      const db = getDb();
      
      // Super Admin check
      if (username === 'juanceo' && password === '1357+-') {
        return res.json({ 
          success: true, 
          role: 'superadmin'
        });
      }

      const shop = db.shops.find((s: any) => 
        (s.admin_username === username && s.admin_password === password) ||
        (s.slug === username && password === 'admin')
      );
      
      if (shop) {
        return res.json({ 
          success: true, 
          shopId: shop.id,
          shopSlug: shop.slug,
          plan: shop.plan 
        });
      }

      if (username === 'admin' && password === 'admin') {
          return res.json({ 
              success: true, 
              shopId: db.shops[0].id,
              shopSlug: db.shops[0].slug,
              plan: db.shops[0].plan 
          });
      }
    }

    res.status(401).json({ error: 'Credenciales inválidas' });
  });

  // NEW: Registration endpoint for new customers
  app.post('/api/register', async (req, res) => {
    const { shopName, slug, email, plan } = req.body;
    
    const password = Math.random().toString(36).slice(-8); // Generate random password
    const shopId = crypto.randomUUID();
    const defaultData: any = {
      id: shopId,
      name: shopName,
      slug: slug.toLowerCase(),
      plan: plan || 'basic',
      logo: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
      theme: { 
        primary: '#FFFFFF', 
        accent: '#000000',
        admin_username: email,
        admin_password: password
      },
      services: [
        { id: 's1', name: 'Corte Clásico', price: 25000, duration: 45, icon: 'scissors' },
        { id: 's2', name: 'Barba Pro', price: 15000, duration: 30, icon: 'zap' }
      ],
      barbers: [
        { id: 'b1', name: 'Master Barbero', photo: 'https://i.pravatar.cc/150?u=admin', commission: 50 }
      ],
      hours: {
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: { open: '08:00', close: '20:00' },
        saturday: { open: '08:00', close: '18:00' },
        sunday: { open: 'off', close: 'off' },
      }
    };
    
    try {
      console.log('Registering shop with data:', JSON.stringify(defaultData, null, 2));
      if (isSupabaseConfigured) {
        const { data: newShop, error: shopError } = await supabase
          .from('shops')
          .insert([defaultData])
          .select('id, name, slug, plan, theme, services, barbers, hours')
          .single();

        if (shopError) {
          console.error('Supabase Insertion Error:', JSON.stringify(shopError, null, 2));
          throw shopError;
        }

        res.json({ 
          success: true, 
          credentials: {
            username: email,
            password: password,
            loginUrl: `/login` 
          }
        });
      } else {
        const db = getDb();
        const newShop = {
          id: Math.random().toString(36).substr(2, 9),
          ...defaultData
        };
        db.shops.push(newShop);
        saveDb(db);
        res.json({ 
          success: true, 
          credentials: {
            username: email,
            password: password,
            loginUrl: `/login`
          }
        });
      }
    } catch (err: any) {
      console.error('Full Registration Error:', err);
      const errorMessage = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      res.status(500).json({ 
        error: `Error en el registro: ${errorMessage}.` 
      });
    }
  });

  // Admin Middleware for Shop Identification
  const adminMiddleware = (req: any, res: any, next: any) => {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      return res.status(401).json({ error: 'Falta identificación de tienda' });
    }
    req.shopId = shopId;
    next();
  };

  // SUPER ADMIN ROUTES
  app.get('/api/superadmin/stats', async (req, res) => {
    if (isSupabaseConfigured) {
      try {
        const [shopsRes, appointmentsRes] = await Promise.all([
          supabase.from('shops').select('id, name, plan, services, barbers'),
          supabase.from('appointments').select('*')
        ]);

        const shops = shopsRes.data || [];
        const appointments = appointmentsRes.data || [];

        // Aggregate statistics
        const totalShops = shops.length;
        const totalAppointments = appointments.length;
        const premiumShops = shops.filter(s => s.plan === 'premium').length;
        
        let totalRevenue = 0;
        appointments.forEach((app: any) => {
          const shop = shops.find(s => s.id === app.shop_id);
          if (shop && shop.services) {
            const service = shop.services.find((s: any) => s.id === app.service_id);
            if (service) {
              totalRevenue += Number(service.price || 0);
            }
          }
        });

        return res.json({
          totalShops,
          totalAppointments,
          premiumShops,
          totalRevenue,
          recentAppointments: appointments.slice(-5).reverse().map(app => {
            const shop = shops.find(s => s.id === app.shop_id);
            return {
              ...app,
              shopName: shop?.name || 'Unknown'
            };
          })
        });
      } catch (err) {
        return res.status(500).json({ error: 'Failed to fetch stats' });
      }
    }
    
    // Local DB fallback
    const db = getDb();
    const totalShops = db.shops.length;
    const totalAppointments = db.appointments.length;
    const premiumShops = db.shops.filter((s: any) => s.plan === 'premium').length;
    
    return res.json({
      totalShops,
      totalAppointments,
      premiumShops,
      totalRevenue: 0, // Simplified for local
      recentAppointments: db.appointments.slice(-5).reverse()
    });
  });

  app.get('/api/superadmin/shops', async (req, res) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('shops').select('*');
      const mapped = (data || []).map((s: any) => ({
        ...s,
        admin_username: s.admin_username || s.theme?.admin_username,
        admin_password: s.admin_password || s.theme?.admin_password
      }));
      return res.json(mapped);
    }
    const db = getDb();
    res.json(db.shops);
  });

  app.post('/api/superadmin/shops/:id/plan', async (req, res) => {
    const { id } = req.params;
    const { plan } = req.body;
    
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('shops')
        .update({ plan })
        .eq('id', id)
        .select()
        .single();
      
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, shop: data });
    }

    const db = getDb();
    const shopIndex = db.shops.findIndex((s: any) => s.id === id);
    if (shopIndex !== -1) {
      db.shops[shopIndex].plan = plan;
      saveDb(db);
      res.json({ success: true, shop: db.shops[shopIndex] });
    } else {
      res.status(404).json({ error: 'Shop not found' });
    }
  });

  // API ROUTES
  app.get('/api/shops/:slug', async (req, res) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('slug', req.params.slug)
        .single();
      
      if (!data) return res.status(404).json({ error: 'Shop not found' });
      return res.json(data);
    }
    const db = getDb();
    const shop = db.shops.find((s: any) => s.slug === req.params.slug);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    res.json(shop);
  });

  app.get('/api/admin/shop', adminMiddleware, async (req: any, res) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', req.shopId)
        .single();
      
      if (!data) return res.status(404).json({ error: 'Shop not found' });
      return res.json(data);
    }
    const db = getDb();
    const shop = db.shops.find((s: any) => s.id === req.shopId);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    res.json(shop);
  });

  app.get('/api/admin/appointments', adminMiddleware, async (req: any, res) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('shop_id', req.shopId)
        .order('date', { ascending: true });
      
      if (error) return res.status(500).json({ error: error.message });
      
      // Map snake_case to camelCase for frontend
      const mapped = (data || []).map((a: any) => ({
        ...a,
        shopId: a.shop_id,
        serviceId: a.service_id,
        barberId: a.barber_id,
        clientName: a.client_name,
        clientPhone: a.client_phone,
        clientEmail: a.client_email,
        createdAt: a.created_at
      }));
      return res.json(mapped);
    }
    const db = getDb();
    const appointments = db.appointments.filter((a: any) => a.shopId === req.shopId);
    res.json(appointments);
  });

  app.patch('/api/admin/appointments/:id', adminMiddleware, async (req: any, res) => {
    if (isSupabaseConfigured) {
      // Map camelCase to snake_case for Supabase
      const updateData: any = { ...req.body };
      if (updateData.serviceId) { updateData.service_id = updateData.serviceId; delete updateData.serviceId; }
      if (updateData.barberId) { updateData.barber_id = updateData.barberId; delete updateData.barberId; }
      if (updateData.clientName) { updateData.client_name = updateData.clientName; delete updateData.clientName; }
      if (updateData.clientPhone) { updateData.client_phone = updateData.clientPhone; delete updateData.clientPhone; }

      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', req.params.id)
        .eq('shop_id', req.shopId)
        .select()
        .single();
      
      if (error) return res.status(500).json({ error: error.message });
      
      // Map back to camelCase
      const mapped = {
        ...data,
        shopId: data.shop_id,
        serviceId: data.service_id,
        barberId: data.barber_id,
        clientName: data.client_name,
        clientPhone: data.client_phone,
        createdAt: data.created_at
      };
      return res.json(mapped);
    }
    const db = getDb();
    const index = db.appointments.findIndex((a: any) => a.id === req.params.id && a.shopId === req.shopId);
    if (index !== -1) {
      db.appointments[index] = { ...db.appointments[index], ...req.body };
      saveDb(db);
      res.json(db.appointments[index]);
    } else {
      res.status(404).json({ error: 'Appointment not found' });
    }
  });

  app.patch('/api/admin/shop', adminMiddleware, async (req: any, res) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('shops')
        .update(req.body)
        .eq('id', req.shopId)
        .select()
        .single();
      
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    const db = getDb();
    const index = db.shops.findIndex((s: any) => s.id === req.shopId);
    if (index !== -1) {
      db.shops[index] = { ...db.shops[index], ...req.body };
      saveDb(db);
      res.json(db.shops[index]);
    } else {
      res.status(404).json({ error: 'Shop not found' });
    }
  });

  app.post('/api/admin/services', adminMiddleware, async (req: any, res) => {
    if (isSupabaseConfigured) {
      const { data: shop } = await supabase.from('shops').select('services').eq('id', req.shopId).single();
      if (!shop) return res.status(404).json({ error: 'Shop not found' });
      
      const newService = { id: 's' + Date.now(), ...req.body };
      const services = [...(shop.services || []), newService];
      
      const { data, error } = await supabase
        .from('shops')
        .update({ services })
        .eq('id', req.shopId)
        .select()
        .single();
        
      if (error) return res.status(500).json({ error: error.message });
      return res.json(newService);
    }
    const db = getDb();
    const index = db.shops.findIndex((s: any) => s.id === req.shopId);
    if (index !== -1) {
      const newService = { id: 's' + Date.now(), ...req.body };
      db.shops[index].services.push(newService);
      saveDb(db);
      res.json(newService);
    } else {
      res.status(404).json({ error: 'Shop not found' });
    }
  });

  app.patch('/api/admin/services/:id', adminMiddleware, async (req: any, res) => {
    const { id } = req.params;
    if (isSupabaseConfigured) {
      const { data: shop } = await supabase.from('shops').select('services').eq('id', req.shopId).single();
      if (!shop) return res.status(404).json({ error: 'Shop not found' });
      
      const services = shop.services.map((s: any) => s.id === id ? { ...s, ...req.body } : s);
      const { data, error } = await supabase.from('shops').update({ services }).eq('id', req.shopId).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(services.find((s: any) => s.id === id));
    }
    const db = getDb();
    const shopIndex = db.shops.findIndex((s: any) => s.id === req.shopId);
    if (shopIndex !== -1) {
      const serviceIndex = db.shops[shopIndex].services.findIndex((s: any) => s.id === id);
      if (serviceIndex !== -1) {
        db.shops[shopIndex].services[serviceIndex] = { ...db.shops[shopIndex].services[serviceIndex], ...req.body };
        saveDb(db);
        res.json(db.shops[shopIndex].services[serviceIndex]);
      } else {
        res.status(404).json({ error: 'Service not found' });
      }
    } else {
      res.status(404).json({ error: 'Shop not found' });
    }
  });

  app.delete('/api/admin/services/:id', adminMiddleware, async (req: any, res) => {
    if (isSupabaseConfigured) {
      const { data: shop } = await supabase.from('shops').select('services').eq('id', req.shopId).single();
      if (!shop) return res.status(404).json({ error: 'Shop not found' });
      
      const services = shop.services.filter((s: any) => s.id !== req.params.id);
      const { error } = await supabase.from('shops').update({ services }).eq('id', req.shopId);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }
    const db = getDb();
    const index = db.shops.findIndex((s: any) => s.id === req.shopId);
    if (index !== -1) {
      db.shops[index].services = db.shops[index].services.filter((s: any) => s.id !== req.params.id);
      saveDb(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Shop not found' });
    }
  });

  app.post('/api/admin/barbers', adminMiddleware, async (req: any, res) => {
    if (isSupabaseConfigured) {
      const { data: shop } = await supabase.from('shops').select('barbers').eq('id', req.shopId).single();
      if (!shop) return res.status(404).json({ error: 'Shop not found' });
      
      const newBarber = { id: 'b' + Date.now(), ...req.body };
      const barbers = [...(shop.barbers || []), newBarber];
      const { error } = await supabase.from('shops').update({ barbers }).eq('id', req.shopId);
      if (error) return res.status(500).json({ error: error.message });
      return res.json(newBarber);
    }
    const db = getDb();
    const index = db.shops.findIndex((s: any) => s.id === req.shopId);
    if (index !== -1) {
      const newBarber = { id: 'b' + Date.now(), ...req.body };
      db.shops[index].barbers.push(newBarber);
      saveDb(db);
      res.json(newBarber);
    } else {
      res.status(404).json({ error: 'Shop not found' });
    }
  });

  app.delete('/api/admin/barbers/:id', adminMiddleware, async (req: any, res) => {
    if (isSupabaseConfigured) {
      const { data: shop } = await supabase.from('shops').select('barbers').eq('id', req.shopId).single();
      if (!shop) return res.status(404).json({ error: 'Shop not found' });
      
      const barbers = shop.barbers.filter((b: any) => b.id !== req.params.id);
      const { error } = await supabase.from('shops').update({ barbers }).eq('id', req.shopId);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }
    const db = getDb();
    const index = db.shops.findIndex((s: any) => s.id === req.shopId);
    if (index !== -1) {
      db.shops[index].barbers = db.shops[index].barbers.filter((b: any) => b.id !== req.params.id);
      saveDb(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Shop not found' });
    }
  });

  app.patch('/api/admin/barbers/:id', adminMiddleware, async (req: any, res) => {
    const { id } = req.params;
    if (isSupabaseConfigured) {
      const { data: shop } = await supabase.from('shops').select('barbers').eq('id', req.shopId).single();
      if (!shop) return res.status(404).json({ error: 'Shop not found' });
      
      const barbers = shop.barbers.map((b: any) => b.id === id ? { ...b, ...req.body } : b);
      const { error } = await supabase.from('shops').update({ barbers }).eq('id', req.shopId);
      if (error) return res.status(500).json({ error: error.message });
      return res.json(barbers.find((b: any) => b.id === id));
    }
    const db = getDb();
    const shopIndex = db.shops.findIndex((s: any) => s.id === req.shopId);
    if (shopIndex !== -1) {
      const barberIndex = db.shops[shopIndex].barbers.findIndex((b: any) => b.id === id);
      if (barberIndex !== -1) {
        db.shops[shopIndex].barbers[barberIndex] = { ...db.shops[shopIndex].barbers[barberIndex], ...req.body };
        saveDb(db);
        res.json(db.shops[shopIndex].barbers[barberIndex]);
      } else {
        res.status(404).json({ error: 'Barber not found' });
      }
    } else {
      res.status(404).json({ error: 'Shop not found' });
    }
  });

  app.post('/api/bookings', async (req, res) => {
    if (isSupabaseConfigured) {
      const { shopId, serviceId, barberId, clientName, clientPhone, clientEmail, ...rest } = req.body;
      const newAppointment = {
        id: Math.random().toString(36).substr(2, 9),
        shop_id: shopId,
        service_id: serviceId,
        barber_id: barberId,
        client_name: clientName,
        client_phone: clientPhone,
        client_email: clientEmail,
        ...rest,
        status: 'confirmed',
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('appointments').insert(newAppointment).select().single();
      if (error) return res.status(500).json({ error: error.message });
      
      // Map back to camelCase
      const mapped = {
        ...data,
        shopId: data.shop_id,
        serviceId: data.service_id,
        barberId: data.barber_id,
        clientName: data.client_name,
        clientPhone: data.client_phone,
        createdAt: data.created_at
      };
      return res.json(mapped);
    }
    const db = getDb();
    const newAppointment = {
      id: Math.random().toString(36).substr(2, 9),
      ...req.body,
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    };
    db.appointments.push(newAppointment);
    saveDb(db);
    res.json(newAppointment);
  });

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server Error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  // VITE MIDDLEWARE
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
