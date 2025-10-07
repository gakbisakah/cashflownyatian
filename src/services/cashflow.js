import { apiClient } from "./auth";

export const cashflowService = {
  // ===================== GET ALL =====================
  getAll: async (filters = {}) => {
  try {
    const {
      type,
      source,
      label,
      start_date,
      end_date,
    } = filters;

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
// ===================== GET DAILY STATS (Auto Tanggal Hari Ini) =====================
getDailyStats: async () => {
  try {
    const today = new Date();
    const endDate = today.toISOString().split("T")[0] + " 23:59:59";

    const res = await apiClient.get("/cash-flows/stats/daily", {
      params: { end_date: endDate, total_data: 40 },
    });

    const result = res.data?.data || {};
    const inflow = result.stats_inflow || {};
    const outflow = result.stats_outflow || {};
    const cashflow = result.stats_cashflow || {};

    const dailyData = Object.keys(inflow).map((key) => ({
      date: key,
      total_inflow: inflow[key] || 0,
      total_outflow: outflow[key] || 0,
      total_cashflow: cashflow[key] || 0,
    }));

    // Urutkan berdasarkan tanggal agar tampil rapi
    dailyData.sort((a, b) => {
      const [dA, mA, yA] = a.date.split("-").map(Number);
      const [dB, mB, yB] = b.date.split("-").map(Number);
      return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
    });

    console.log("📈 Daily Stats (auto today):", dailyData);
    return { success: true, data: dailyData };
  } catch (err) {
    console.error("❌ getDailyStats error:", err.response?.data || err.message);
    return { success: false, data: [] };
  }
},


// ===================== GET MONTHLY STATS (Auto Bulan Ini) =====================
getMonthlyStats: async () => {
  try {
    const today = new Date();
    const endDate = today.toISOString().split("T")[0] + " 23:59:59";

    const res = await apiClient.get("/cash-flows/stats/monthly", {
      params: { end_date: endDate, total_data: 12 }, // tampil 12 bulan terakhir
    });

    const result = res.data?.data || {};
    const inflow = result.stats_inflow || {};
    const outflow = result.stats_outflow || {};
    const cashflow = result.stats_cashflow || {};

    const monthlyData = Object.keys(inflow).map((key) => ({
      month: key,
      total_inflow: inflow[key] || 0,
      total_outflow: outflow[key] || 0,
      total_cashflow: cashflow[key] || 0,
    }));

    // Urutkan berdasarkan bulan (MM-YYYY)
    monthlyData.sort((a, b) => {
      const [mA, yA] = a.month.split("-").map(Number);
      const [mB, yB] = b.month.split("-").map(Number);
      return new Date(yA, mA - 1) - new Date(yB, mB - 1);
    });

    console.log("📊 Monthly Stats (auto month):", monthlyData);
    return { success: true, data: monthlyData };
  } catch (err) {
    console.error("❌ getMonthlyStats error:", err.response?.data || err.message);
    return { success: false, data: [] };
  }
},


};
