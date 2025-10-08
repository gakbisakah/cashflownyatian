import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import CashFlowCard from "../components/CashFlowCard";
import { cashflowService } from "../services/cashflow";
import "../styles/dashboard.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Dashboard = () => {
  const [cashFlows, setCashFlows] = useState([]);
  const [stats, setStats] = useState({
    totalInflow: 0,
    totalOutflow: 0,
    balance: 0,
  });
  const [dailyStats, setDailyStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState("daily"); // "daily" | "monthly"
  const [labels, setLabels] = useState([]);

  // 🔹 Filter state
  const [filters, setFilters] = useState({
    type: "",
    source: "",
    label: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 🔹 Ambil semua cash flows + stats (pakai filter)
        const res = await cashflowService.getAll(filters);
        if (res.success) {
          setCashFlows(res.data || []);
          const inflow = res.stats?.total_inflow || 0;
          const outflow = res.stats?.total_outflow || 0;
          setStats({
            totalInflow: inflow,
            totalOutflow: outflow,
            balance: inflow - outflow,
          });
        }

        // 🔹 Ambil grafik harian
        const dailyRes = await cashflowService.getDailyStats();
        if (dailyRes.success) setDailyStats(dailyRes.data || []);

        // 🔹 Ambil grafik bulanan
        const monthlyRes = await cashflowService.getMonthlyStats();
        if (monthlyRes.success) setMonthlyStats(monthlyRes.data || []);

        // 🔹 Ambil daftar label
        const labelsRes = await cashflowService.getLabels();
        if (
          labelsRes.success &&
          labelsRes.data &&
          labelsRes.data.data &&
          Array.isArray(labelsRes.data.data.labels)
        ) {
          setLabels(labelsRes.data.data.labels);
        } else {
          setLabels([]); // fallback jika tidak ada label
        }
      } catch (err) {
        console.error("❌ Gagal memuat data Dashboard:", err);
        setLabels([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  // 🔹 Fungsi untuk handle filter
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = () => {
    console.log("🔍 Filter diterapkan:", filters);
    // useEffect otomatis refetch karena filters berubah
  };
  
  const handleResetFilter = () => {
    setFilters({
      type: "",
      source: "",
      label: "",
      start_date: "",
      end_date: "",
    });
  };

  // 🔹 Fungsi view detail transaksi (Contoh implementasi placeholder)
  const handleView = async (item) => {
    const res = await cashflowService.getById(item.id);
    if (res.success) {
      alert(
        `📄 Detail Transaksi:\n\nLabel: ${res.data.label}\nDeskripsi: ${
          res.data.description
        }\nNominal: Rp ${res.data.nominal.toLocaleString("id-ID")}`
      );
    } else {
      alert("❌ Gagal mengambil detail transaksi.");
    }
  };

  // 🔹 Fungsi edit transaksi (Contoh implementasi placeholder)
  const handleEdit = async (item) => {
    const res = await cashflowService.getById(item.id);
    if (res.success) {
      alert(
        `✏️ Edit Transaksi:\n\nLabel: ${res.data.label}\nTipe: ${res.data.type}\nSumber: ${res.data.source}`
      );
    } else {
      alert("❌ Gagal mengambil data untuk edit.");
    }
  };

  // 🔹 Fungsi hapus transaksi (Contoh implementasi placeholder)
  const handleDelete = (id) => {
    alert(`🗑️ Hapus ID: ${id}`);
  };

  // 🔹 Pilih data grafik sesuai jenis (harian / bulanan)
  const chartData = chartType === "daily" ? dailyStats : monthlyStats;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border rounded shadow-sm recharts-default-tooltip">
          <p className="recharts-tooltip-label mb-2">
            **{chartType === "daily" ? label : `Bulan ${label}`}**
          </p>
          {payload.map((p, index) => (
            <p key={index} className="recharts-tooltip-item mb-0" style={{ color: p.stroke }}>
              {p.name}: **{`Rp ${p.value.toLocaleString("id-ID")}`}**
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="transaction-page">
      <Navbar />
      {/* MENGHAPUS KELAS 'container' di sini agar full-width */}
      <div className="transaction-wrapper"> 
          
          {/* 🔹 HERO SECTION / JUDUL */}
          <header className="transaction-hero">
            <div className="container-content-padding d-flex justify-content-between align-items-center"> {/* Tambah padding di sini */}
              <div>
                <h1 className="transaction-hero-title">📊 Dashboard Keuangan</h1>
                <p className="transaction-hero-subtitle">
                  Ringkasan arus kas Anda, termasuk statistik dan riwayat transaksi.
                </p>
              </div>
              {/* Tombol Tambah Transaksi (Contoh) */}
            
            </div>
          </header>

          {/* 🔹 Statistik Utama (SUMMARY METRICS) */}
          <div className="container-content-padding"> {/* Tambah padding di sini */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <div className="summary-metric summary-metric-success">
                  <div className="summary-metric-icon">
                    <i className="bi bi-arrow-down-left"></i>
                  </div>
                  <div className="summary-metric-content">
                    <div className="summary-metric-label">Total Pemasukan</div>
                    <div className="summary-metric-value">
                      Rp {stats.totalInflow.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="summary-metric summary-metric-danger">
                  <div className="summary-metric-icon">
                    <i className="bi bi-arrow-up-right"></i>
                  </div>
                  <div className="summary-metric-content">
                    <div className="summary-metric-label">Total Pengeluaran</div>
                    <div className="summary-metric-value">
                      Rp {stats.totalOutflow.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="summary-metric summary-metric-primary">
                  <div className="summary-metric-icon">
                    <i className="bi bi-graph-up-arrow"></i>
                  </div>
                  <div className="summary-metric-content">
                    <div className="summary-metric-label">Saldo Akhir</div>
                    <div className="summary-metric-value">
                      Rp {stats.balance.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🔹 Filter Bar */}
          <div className="container-content-padding"> {/* Tambah padding di sini */}
            <div className="card mb-4 filter-card">
              <div className="filter-card-body">
                <div className="row g-3">
                  <div className="col-6 col-md-2">
                    <label className="filter-label">Tipe</label>
                    <select
                      className="form-select filter-input w-100"
                      name="type"
                      value={filters.type}
                      onChange={handleFilterChange}
                    >
                      <option value="">Semua</option>
                      <option value="inflow">Pemasukan</option>
                      <option value="outflow">Pengeluaran</option>
                    </select>
                  </div>
                  <div className="col-6 col-md-2">
                    <label className="filter-label">Sumber</label>
                    <input
                      type="text"
                      className="form-control filter-input w-100"
                      name="source"
                      value={filters.source}
                      onChange={handleFilterChange}
                      placeholder="Contoh: Kas, Bank A"
                    />
                  </div>
                  <div className="col-12 col-md-2">
                    <label className="filter-label">Label/Kategori</label>
                    <select
                      className="form-select filter-input w-100"
                      name="label"
                      value={filters.label}
                      onChange={handleFilterChange}
                    >
                      <option value="">Semua</option>
                      {Array.isArray(labels) &&
                        labels.map((lbl) => (
                          <option key={lbl} value={lbl}>
                            {lbl}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="col-6 col-md-2">
                    <label className="filter-label">Dari Tanggal</label>
                    <input
                      type="date"
                      className="form-control filter-input w-100"
                      name="start_date"
                      value={filters.start_date}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="col-6 col-md-2">
                    <label className="filter-label">Sampai Tanggal</label>
                    <input
                      type="date"
                      className="form-control filter-input w-100"
                      name="end_date"
                      value={filters.end_date}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="col-12 col-md-2 d-flex align-items-end gap-2">
                    <button
                      className="btn btn-primary w-50 filter-input"
                      onClick={handleApplyFilter}
                    >
                      <i className="bi bi-search d-block d-md-none"></i>
                      <span className="d-none d-md-block">Cari</span>
                    </button>
                    <button
                      className="btn btn-reset-filter w-50"
                      onClick={handleResetFilter}
                    >
                      <i className="bi bi-x-lg d-block d-md-none"></i>
                      <span className="d-none d-md-block">Reset</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 🔹 Grafik Harian & Bulanan */}
          <div className="container-content-padding"> {/* Tambah padding di sini */}
            <div className="card mb-4 filter-card">
              <div className="filter-card-header">
                  <h2 className="filter-card-title">
                      {chartType === "daily"
                        ? "📅 Tren Harian"
                        : "📆 Tren Bulanan"}
                  </h2>
                  <div className="btn-group">
                    <button
                      className={`btn btn-sm ${
                        chartType === "daily" ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => setChartType("daily")}
                    >
                      Harian
                    </button>
                    <button
                      className={`btn btn-sm ${
                        chartType === "monthly"
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => setChartType("monthly")}
                    >
                      Bulanan
                    </button>
                  </div>
              </div>
              <div className="filter-card-body">
                {isLoading ? (
                  <p className="text-center text-muted loading-state">Memuat grafik...</p>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey={chartType === "daily" ? "date" : "month"}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="total_inflow"
                        stroke="#10b981" // Hijau
                        name="Pemasukan"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="total_outflow"
                        stroke="#ef4444" // Merah
                        name="Pengeluaran"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="total_cashflow"
                        stroke="#6366f1" // Biru/Ungu
                        name="Saldo Bersih"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted empty-state">
                    Tidak ada data untuk grafik ini.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 🔹 Daftar Transaksi (TRANSACTION LIST) */}
          <div className="container-content-padding"> {/* Tambah padding di sini */}
            <div className="transaction-list-section">
              <div className="transaction-list-header">
                <h2 className="transaction-list-title">
                  <i className="bi bi-list-stars me-2"></i> Riwayat Transaksi
                </h2>
                <span className="transaction-count-badge">
                  {cashFlows.length} Transaksi
                </span>
              </div>
              <div className="transaction-grid-scrollable">
                  <div className="transaction-grid">
                      {isLoading ? (
                      <div className="loading-state col-12">
                          <p>Memuat data...</p>
                      </div>
                      ) : cashFlows.length > 0 ? (
                          cashFlows.map((item) => (
                          <CashFlowCard
                              key={item.id}
                              data={item}
                              onView={handleView}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              showActions={false} // Nonaktifkan tombol di Dashboard
                          />
                          ))
                      ) : (
                      <div className="empty-state col-12">
                         
                          <h3 className="empty-title">Belum ada transaksi</h3>
                         
                      </div>
                      )}
                  </div>
              </div>
            </div>
          </div>
          
      </div> {/* Akhir dari .transaction-wrapper */}
    </div>
  );
};

export default Dashboard;