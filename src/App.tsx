import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Dashboard from './pages/admin/Dashboard';
import BarbersPage from './pages/admin/BarbersPage';
import ServicesPage from './pages/admin/ServicesPage';
import FinancesPage from './pages/admin/FinancesPage';
import SettingsPage from './pages/admin/SettingsPage';
import SubscriptionPage from './pages/admin/SubscriptionPage';
import BookingPage from './pages/client/BookingPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';

export default function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Admin Login as Root */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/superadmin" element={<SuperAdminDashboard />} />

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
            <Route path="suscripcion" element={<SubscriptionPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}
