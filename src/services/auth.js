import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://open-api.delcom.org/api/v1';

// Buat instance axios global
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor untuk menambahkan token di setiap request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk handle token expired (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ Token expired atau tidak valid, logout otomatis...');
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // ===================== LOGIN =====================
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success && response.data.data.token) {
        const token = response.data.data.token;
        const user = response.data.data.user;

        // Simpan token dan user di localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Tambahkan waktu expired 2 jam ke depan
        const expirationTime = new Date().getTime() + 2 * 60 * 60 * 1000; // 2 jam
        localStorage.setItem('token_expiration', expirationTime.toString());
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // ===================== REGISTER =====================
  register: async (name, email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // ===================== LOGOUT =====================
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expiration');
  },

  // ===================== GET CURRENT USER =====================
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // ===================== GET TOKEN =====================
  getToken: () => {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('token_expiration');

    if (!token || !expiration) return null;

    const now = new Date().getTime();
    if (now > parseInt(expiration, 10)) {
      console.warn(' Token telah kedaluwarsa, logout otomatis.');
      authService.logout();
      window.location.href = '/login';
      return null;
    }

    return token;
  },

  // ===================== CHECK AUTH =====================
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('token_expiration');

    if (!token || !expiration) return false;

    const now = new Date().getTime();
    if (now > parseInt(expiration, 10)) {
      console.warn(' Sesi login berakhir.');
      authService.logout();
      return false;
    }

    return true;
  },
};

// Export juga apiClient agar bisa digunakan service lain
export { apiClient };
