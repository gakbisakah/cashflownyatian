// frontend/src/services/api.js
import { apiClient } from "./auth"; // ✅ gunakan apiClient yang sudah ada di auth.js

/**
 * Modul ini menyatukan semua endpoint API Cash Flow.
 * Tidak membuat axios instance baru — menggunakan apiClient dari auth.js
 * agar token Bearer selalu otomatis disertakan.
 */

export const cashFlowAPI = {
  // 🔹 Ambil semua transaksi cash flow
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get("/cash-flows", { params });
      return { success: true, data: response.data?.data || [] };
    } catch (error) {
      console.error("❌ [cashFlowAPI.getAll] Error:", error.response?.data || error.message);
      return { success: false, data: [] };
    }
  },

  // 🔹 Ambil detail transaksi berdasarkan ID
  getDetail: async (id) => {
    try {
      const response = await apiClient.get(`/cash-flows/${id}`);
      return { success: true, data: response.data?.data || {} };
    } catch (error) {
      console.error("❌ [cashFlowAPI.getDetail] Error:", error.response?.data || error.message);
      return { success: false, data: {} };
    }
  },

  // 🔹 Tambah transaksi baru (Pemasukan/Pengeluaran)
  create: async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await apiClient.post("/cash-flows", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return { success: !!response.data?.success, data: response.data?.data || {} };
    } catch (error) {
      console.error("❌ [cashFlowAPI.create] Error:", error.response?.data || error.message);
      return { success: false, data: {} };
    }
  },

  // 🔹 Update transaksi berdasarkan ID
  update: async (id, data) => {
    try {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([k, v]) => params.append(k, v));

      const response = await apiClient.put(`/cash-flows/${id}`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      return { success: !!response.data?.success, data: response.data?.data || {} };
    } catch (error) {
      console.error("❌ [cashFlowAPI.update] Error:", error.response?.data || error.message);
      return { success: false, data: {} };
    }
  },

  // 🔹 Hapus transaksi berdasarkan ID
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/cash-flows/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ [cashFlowAPI.delete] Error:", error.response?.data || error.message);
      return { success: false, data: {} };
    }
  },

  // 🔹 Ambil semua label transaksi
  getLabels: async () => {
    try {
      const response = await apiClient.get("/cash-flows/labels");
      return { success: true, data: response.data?.data || [] };
    } catch (error) {
      console.error("❌ [cashFlowAPI.getLabels] Error:", error.response?.data || error.message);
      return { success: false, data: [] };
    }
  },

  // 🔹 Statistik harian
  getDailyStats: async (params = {}) => {
    try {
      const response = await apiClient.get("/cash-flows/stats/daily", { params });
      return { success: true, data: response.data?.data || [] };
    } catch (error) {
      console.error("❌ [cashFlowAPI.getDailyStats] Error:", error.response?.data || error.message);
      return { success: false, data: [] };
    }
  },

  // 🔹 Statistik bulanan
  getMonthlyStats: async (params = {}) => {
    try {
      const response = await apiClient.get("/cash-flows/stats/monthly", { params });
      return { success: true, data: response.data?.data || [] };
    } catch (error) {
      console.error("❌ [cashFlowAPI.getMonthlyStats] Error:", error.response?.data || error.message);
      return { success: false, data: [] };
    }
  },

  // 🔹 Statistik total (opsional — tampilkan di Dashboard)
  getStatsSummary: async () => {
    try {
      const response = await apiClient.get("/cash-flows/stats");
      return {
        success: true,
        data: response.data?.data || {
          total_inflow: 0,
          total_outflow: 0,
          balance: 0,
        },
      };
    } catch (error) {
      console.error("❌ [cashFlowAPI.getStatsSummary] Error:", error.response?.data || error.message);
      return { success: false, data: { total_inflow: 0, total_outflow: 0, balance: 0 } };
    }
  },
};
