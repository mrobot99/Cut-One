import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'db.json');

// Initial Data Structure
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
      plan: 'basic',
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
        { id: 'b3', name: 'Juan Guillermo', photo: 'https://i.pravatar.cc/150?u=juan', commission: 50 },
        { id: 'b4', name: 'Mauricio Osorio', photo: 'https://i.pravatar.cc/150?u=mauricio', commission: 45 },
        { id: 'b5', name: 'Manuel', photo: 'https://i.pravatar.cc/150?u=manuel', commission: 40 },
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
    }
  ],
  appointments: []
};

function getDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DB, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
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

  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = getDb();

    if (username === 'admin') {
      if (password === 'admin') {
        db.shops[0].plan = 'basic';
        saveDb(db);
        return res.json({ success: true, plan: 'basic' });
      } else if (password === 'adminpro') {
        db.shops[0].plan = 'premium';
        saveDb(db);
        return res.json({ success: true, plan: 'premium' });
      }
    }

    res.status(401).json({ error: 'Credenciales inválidas' });
  });

  // SUPER ADMIN ROUTES
  app.get('/api/superadmin/shops', (req, res) => {
    const db = getDb();
    res.json(db.shops);
  });

  app.post('/api/superadmin/shops/:id/plan', (req, res) => {
    const { id } = req.params;
    const { plan } = req.body;
    const db = getDb();
    const shopIndex = db.shops.findIndex(s => s.id === id);
    if (shopIndex !== -1) {
      db.shops[shopIndex].plan = plan;
      saveDb(db);
      res.json({ success: true, shop: db.shops[shopIndex] });
    } else {
      res.status(404).json({ error: 'Shop not found' });
    }
  });

  // API ROUTES
  app.get('/api/shops/:slug', (req, res) => {
    const db = getDb();
    const shop = db.shops.find((s: any) => s.slug === req.params.slug);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    res.json(shop);
  });

  app.get('/api/admin/shop', (req, res) => {
    // Simulated auth: just return the first shop for demo
    const db = getDb();
    res.json(db.shops[0]);
  });

  app.get('/api/admin/appointments', (req, res) => {
    const db = getDb();
    res.json(db.appointments);
  });

  app.patch('/api/admin/appointments/:id', (req, res) => {
    const db = getDb();
    const index = db.appointments.findIndex((a: any) => a.id === req.params.id);
    if (index !== -1) {
      db.appointments[index] = { ...db.appointments[index], ...req.body };
      saveDb(db);
    }
    res.json(db.appointments[index]);
  });

  app.patch('/api/admin/shop', (req, res) => {
    const db = getDb();
    db.shops[0] = { ...db.shops[0], ...req.body };
    saveDb(db);
    res.json(db.shops[0]);
  });

  app.post('/api/admin/services', (req, res) => {
    const db = getDb();
    const newService = { id: 's' + Date.now(), ...req.body };
    db.shops[0].services.push(newService);
    saveDb(db);
    res.json(newService);
  });

  app.patch('/api/admin/services/:id', (req, res) => {
    const { id } = req.params;
    const db = getDb();
    const serviceIndex = db.shops[0].services.findIndex((s: any) => s.id === id);
    if (serviceIndex !== -1) {
      db.shops[0].services[serviceIndex] = { ...db.shops[0].services[serviceIndex], ...req.body };
      saveDb(db);
      res.json(db.shops[0].services[serviceIndex]);
    } else {
      res.status(404).json({ error: 'Service not found' });
    }
  });

  app.delete('/api/admin/services/:id', (req, res) => {
    const db = getDb();
    db.shops[0].services = db.shops[0].services.filter((s: any) => s.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  app.post('/api/admin/barbers', (req, res) => {
    const db = getDb();
    const newBarber = { id: 'b' + Date.now(), ...req.body };
    db.shops[0].barbers.push(newBarber);
    saveDb(db);
    res.json(newBarber);
  });

  app.delete('/api/admin/barbers/:id', (req, res) => {
    const db = getDb();
    db.shops[0].barbers = db.shops[0].barbers.filter((b: any) => b.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  app.patch('/api/admin/barbers/:id', (req, res) => {
    const db = getDb();
    const index = db.shops[0].barbers.findIndex((b: any) => b.id === req.params.id);
    if (index !== -1) {
      db.shops[0].barbers[index] = { ...db.shops[0].barbers[index], ...req.body };
      saveDb(db);
      res.json(db.shops[0].barbers[index]);
    } else {
      res.status(404).json({ error: 'Barber not found' });
    }
  });

  app.post('/api/bookings', (req, res) => {
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

startServer();
