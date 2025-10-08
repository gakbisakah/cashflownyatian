import { apiClient } from "./auth";

export const cashflowService = {
  // ===================== GET ALL =====================
  getAll: async (filters = {}) => {
    try {
      const { type, source, label, start_date, end_date } = filters;
      const params = {};
      if (type) params.type = type;
      if (source) params.source = source;
      if (label) params.label = label;
      if (start_date) params.start_date = start_date;
      if (end_date) params.end_date = end_date;

      const res = await apiClient.get("/cash-flows", { params });
      const result = res.data?.data || {};
      return {
        success: true,
        data: result.cash_flows || [],
        stats: result.stats || {},
      };
    } catch (err) {
      console.error("❌ getAll error:", err.response?.data || err.message);
      return { success: false, data: [], stats: {} };
    }
  },

  

  // ===================== GET BY ID =====================
  getById: async (id) => {
    try {
      const res = await apiClient.get(`/cash-flows/${id}`);
      return { success: true, data: res.data?.data || {} };
    } catch (err) {
      console.error("❌ getById error:", err.response?.data || err.message);
      return { success: false, data: {} };
    }
  },

  // ===================== CREATE =====================
  create: async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));

      const res = await apiClient.post("/cash-flows", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return { success: !!res.data?.success, data: res.data?.data || {} };
    } catch (err) {
      console.error("❌ create error:", err.response?.data || err.message);
      return { success: false, data: {} };
    }
  },

  // ===================== UPDATE =====================
  update: async (id, data) => {
    try {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([k, v]) => params.append(k, v));

      const res = await apiClient.put(`/cash-flows/${id}`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      return { success: !!res.data?.success, data: res.data?.data || {} };
    } catch (err) {
      console.error("❌ update error:", err.response?.data || err.message);
      return { success: false, data: {} };
    }
  },

  // ===================== DELETE =====================
  delete: async (id) => {
    try {
      const res = await apiClient.delete(`/cash-flows/${id}`);
      return { success: true, data: res.data };
    } catch (err) {
      console.error("❌ delete error:", err.response?.data || err.message);
      return { success: false, data: {} };
    }
  },

  

  // ===================== GET LABELS =====================
  getLabels: async () => {
    try {
      const res = await apiClient.get("/cash-flows/labels");
      return { success: true, data: res.data?.data || [] };
    } catch (err) {
      console.error("❌ getLabels error:", err.response?.data || err.message);
      return { success: false, data: [] };
    }
  },

  // ===================== GET DAILY STATS =====================
  getDailyStats: async ({ end_date, total_data } = {}) => {
    try {
      // Gunakan tanggal hari ini jika tidak ada end_date
      const today = end_date || new Date().toISOString().split("T")[0] + " 23:59:59";
      const total = total_data || 7;

      const res = await apiClient.get("/cash-flows/stats/daily", {
        params: { 
          end_date: today, 
          total_data: total 
        },
      });

      const result = res.data?.data || {};
      const inflow = result.stats_inflow || {};
      const outflow = result.stats_outflow || {};
      const cashflow = result.stats_cashflow || {};

      // Gabungkan semua data berdasarkan tanggal
      const allDates = new Set([
        ...Object.keys(inflow),
        ...Object.keys(outflow),
        ...Object.keys(cashflow)
      ]);

      const dailyData = Array.from(allDates).map((dateKey) => {
        const inflowVal = inflow[dateKey] || 0;
        const outflowVal = outflow[dateKey] || 0;
        
        return {
          date: dateKey, // format: DD-MM-YYYY dari backend
          total_inflow: inflowVal,
          total_outflow: outflowVal,
          total_cashflow: cashflow[dateKey] || 0,
          total_transactions: (inflowVal > 0 ? 1 : 0) + (outflowVal > 0 ? 1 : 0), // estimasi
        };
      });

      // Sort by date (oldest to newest)
      dailyData.sort((a, b) => {
        const [dA, mA, yA] = a.date.split("-").map(Number);
        const [dB, mB, yB] = b.date.split("-").map(Number);
        const dateA = new Date(yA, mA - 1, dA);
        const dateB = new Date(yB, mB - 1, dB);
        return dateA - dateB;
      });

      return { success: true, data: dailyData };
    } catch (err) {
      console.error("❌ getDailyStats error:", err.response?.data || err.message);
      return { success: false, data: [] };
    }
  },

  // ===================== GET MONTHLY STATS =====================
  getMonthlyStats: async ({ end_date, total_data } = {}) => {
    try {
      // Gunakan tanggal hari ini jika tidak ada end_date
      const today = end_date || new Date().toISOString().split("T")[0] + " 23:59:59";
      const total = total_data || 6;

      const res = await apiClient.get("/cash-flows/stats/monthly", {
        params: { 
          end_date: today, 
          total_data: total 
        },
      });

      const result = res.data?.data || {};
      const inflow = result.stats_inflow || {};
      const outflow = result.stats_outflow || {};
      const cashflow = result.stats_cashflow || {};

      // Gabungkan semua data berdasarkan bulan
      const allMonths = new Set([
        ...Object.keys(inflow),
        ...Object.keys(outflow),
        ...Object.keys(cashflow)
      ]);

      const monthlyData = Array.from(allMonths).map((monthKey) => {
        const inflowVal = inflow[monthKey] || 0;
        const outflowVal = outflow[monthKey] || 0;
        
        return {
          month: monthKey, // format: MM-YYYY dari backend
          total_inflow: inflowVal,
          total_outflow: outflowVal,
          total_cashflow: cashflow[monthKey] || 0,
          total_transactions: (inflowVal > 0 ? 1 : 0) + (outflowVal > 0 ? 1 : 0), // estimasi
        };
      });

      // Sort by month (oldest to newest)
      monthlyData.sort((a, b) => {
        const [mA, yA] = a.month.split("-").map(Number);
        const [mB, yB] = b.month.split("-").map(Number);
        const dateA = new Date(yA, mA - 1);
        const dateB = new Date(yB, mB - 1);
        return dateA - dateB;
      });

      return { success: true, data: monthlyData };
    } catch (err) {
      console.error("❌ getMonthlyStats error:", err.response?.data || err.message);
      return { success: false, data: [] };
    }
  },


 getDetail: async (id) => {
  try {
    const res = await apiClient.get(`/cash-flows/${id}`);
    return { success: true, data: res.data?.data || {} };
  } catch (err) {
    console.error("❌ getDetail error:", err.response?.data || err.message);
    return { success: false, data: {} };
  }
}

};