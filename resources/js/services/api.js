import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const AUTH_LOGOUT_EVENT = 'pl:auth-logout';

const emitAuthLogout = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
  }
};

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pl_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pl_token');
      localStorage.removeItem('pl_user');
      emitAuthLogout();
    }
    return Promise.reject(error);
  }
);

export const endpoints = {
  slots: '/tickets/slots',
  ticketTypes: '/tickets/types',
  weather: '/weather',
  register: '/auth/register',
  login: '/auth/login',
  profile: '/auth/me',
  profileUpdate: '/auth/profile',
  orders: '/orders',
  orderDetail: '/orders/show',
  createOrder: '/orders',
  paymentToken: '/payments/token',
  paymentVerify: '/payments/verify',
  adminOverview: '/admin/overview',
  adminOrders: '/admin/orders',
  adminSlots: '/admin/slots',
  adminTicket: '/tickets',
  adminSlot: '/admin/slots',
  adminOperators: '/admin/operators',
  adminUsers: '/admin/users',
  exportTransactions: '/admin/transactions/export',
  operatorTickets: '/operator/tickets',
  operatorStats: '/operator/stats',
  operatorValidate: '/operator/validate',
};

export default api;


