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
  // Track which token was used for this request to avoid forced logout
  // when a stale request returns 401 after a new login.
  config.__authToken = token || null;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentToken = localStorage.getItem('pl_token');
      const requestToken = error.config?.__authToken ?? null;
      const requestUrl = error.config?.url || '';

      // Never auto-logout on auth endpoints (login/register), let callers handle errors.
      if (requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register')) {
        return Promise.reject(error);
      }

      // If the request wasn't authenticated (no token used), don't force logout.
      if (!requestToken || !currentToken) {
        return Promise.reject(error);
      }

      // Only force logout if the 401 corresponds to the currently active token.
      // If the request used an older token (race condition), ignore logout.
      if (currentToken && requestToken && currentToken !== requestToken) {
        return Promise.reject(error);
      }

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
  adminPhotoPoints: '/admin/photo-points',
  exportTransactions: '/admin/transactions/export',
  operatorTickets: '/operator/tickets',
  operatorStats: '/operator/stats',
  operatorValidate: '/operator/validate',
  operatorSnapshot: '/operator/snapshot',
  operatorValidateBatch: '/operator/validate/batch',
  // Photo queue
  photoPoints: '/photo/points',
  photoQueueList: '/photo/queue',
  photoCallNext: '/photo/queue/call-next',
  photoMarkShooting: '/photo/queue/mark-shooting',
  photoComplete: '/photo/queue/complete',
  photoSkip: '/photo/queue/skip',
  photoRecall: '/photo/queue/recall',
  photoUpload: '/photo/upload',
  photoMyAssets: '/photo/my-assets',
  photoEnqueue: '/photo-queue/enqueue',
  photoStatus: '/photo-queue/status',
};

export default api;
