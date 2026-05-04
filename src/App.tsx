import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Dashboard from './pages/admin/Dashboard';
import BarbersPage from './pages/admin/BarbersPage';
import ServicesPage from './pages/admin/ServicesPage';
import FinancesPage from './pages/admin/FinancesPage';
import SettingsPage from './pages/admin/SettingsPage';
import BookingPage from './pages/client/BookingPage';
import LandingPage from './pages/LandingPage';
import AdminLayout from './layouts/AdminLayout';

export default function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Landing */}
          <Route path="/" element={<LandingPage />} />

          {/* Client Booking Route */}
          <Route path="/b/:slug" element={<BookingPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="agenda" element={<Dashboard />} />
            <Route path="barberos" element={<BarbersPage />} />
            <Route path="servicios" element={<ServicesPage />} />
            <Route path="finanzas" element={<FinancesPage />} />
            <Route path="ajustes" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}
