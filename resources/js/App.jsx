import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import BookingPage from './pages/BookingPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OperatorDashboard from './pages/OperatorDashboard';
import ProfilePage from './pages/ProfilePage';
import PhotoQueuePage from './pages/PhotoQueuePage';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const node = document.getElementById(targetId);
      if (node) {
        setTimeout(() => node.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/booking" element={<BookingPage />} />

        <Route element={<ProtectedRoute roles={['user']} fallback="/admin" />}>
          <Route path="/dashboard" element={<UserDashboard />} />
        </Route>

        <Route element={<ProtectedRoute roles={['admin']} fallback="/dashboard" />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route element={<ProtectedRoute roles={['operator', 'admin']} fallback="/dashboard" />}>
          <Route path="/operator" element={<OperatorDashboard />} />
        </Route>

        <Route element={<ProtectedRoute roles={['user', 'admin', 'operator']} fallback="/login" />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/photo-queue" element={<PhotoQueuePage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;




