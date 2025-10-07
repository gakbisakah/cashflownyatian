import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { cashflowService } from '../services/cashflow';
import '../styles/statistics.css';

const Statistics = () => {
  const [dailyStats, setDailyStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalInflow: 0,
    totalOutflow: 0,
    balance: 0,
    transactionCount: 0,
  });

  const [filters, setFilters] = useState({
    dailyEndDate: new Date().toISOString().split('T')[0],
    dailyTotalData: 7,
    monthlyEndDate: new Date().toISOString().split('T')[0],
    monthlyTotalData: 6,
  });

  useEffect(() => {
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      const [dailyRes, monthlyRes, allCashFlowsRes] = await Promise.all([
        cashflowService.getDailyStats({
          end_date: filters.dailyEndDate + ' 23:59:59',
          total_data: filters.dailyTotalData,
        }),
        cashflowService.getMonthlyStats({
          end_date: filters.monthlyEndDate + ' 23:59:59',
          total_data: filters.monthlyTotalData,
        }),
        cashflowService.getAll(),
      ]);

      if (dailyRes && dailyRes.success) {
        setDailyStats(Array.isArray(dailyRes.data) ? dailyRes.data : []);
      } else {
        setDailyStats([]);
      }

      if (monthlyRes && monthlyRes.success) {
        setMonthlyStats(Array.isArray(monthlyRes.data) ? monthlyRes.data : []);
      } else {
        setMonthlyStats([]);
      }

      if (allCashFlowsRes && allCashFlowsRes.success) {
        calculateSummary(Array.isArray(allCashFlowsRes.data) ? allCashFlowsRes.data : []);
      } else {
        calculateSummary([]);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setDailyStats([]);
      setMonthlyStats([]);
      setSummary({ totalInflow: 0, totalOutflow: 0, balance: 0, transactionCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {
    if (!Array.isArray(data)) {
      setSummary({ totalInflow: 0, totalOutflow: 0, balance: 0, transactionCount: 0 });
      return;
    }

    const inflow = data
      .filter((item) => item.type === 'inflow')
      .reduce((sum, item) => sum + parseFloat(item.nominal || 0), 0);

    const outflow = data
      .filter((item) => item.type === 'outflow')
      .reduce((sum, item) => sum + parseFloat(item.nominal || 0), 0);

    setSummary({
      totalInflow: inflow,
      totalOutflow: outflow,
      balance: inflow - outflow,
      transactionCount: data.length,
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getMaxValue = (stats) => {
    if (!Array.isArray(stats) || stats.length === 0) return 0;
    return Math.max(...stats.map((stat) => Math.max(stat.total_inflow || 0, stat.total_outflow || 0)));
  };

  const getPercentage = (value, maxValue) => {
    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    const headers = ['Tanggal/Bulan', 'Total Pemasukan', 'Total Pengeluaran', 'Total Transaksi'];
    const rows = data.map(stat => [
      stat.date ? formatDate(stat.date) : new Date(stat.month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      stat.total_inflow || 0,
      stat.total_outflow || 0,
      stat.total_transactions || 0
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="statistics-page">
      <Navbar />

      <div className="stats-wrapper">
        <div className="container-fluid px-3 px-lg-4">
          {/* Header Section */}
          <div className="stats-hero">
            <div className="row align-items-center">
              <div className="col">
                <h1 className="stats-hero-title">Statistik Keuangan</h1>
                <p className="stats-hero-subtitle">Monitor dan analisis performa keuangan Anda secara real-time</p>
              </div>
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="row g-3 g-lg-4 mb-4 mb-lg-5">
            <div className="col-6 col-lg-3">
              <div className="metric-card metric-success">
                <div className="metric-icon-wrapper">
                  <div className="metric-icon">
                    <i className="bi bi-arrow-down-circle"></i>
                  </div>
                </div>
                <div className="metric-content">
                  <div className="metric-label">Pemasukan</div>
                  <div className="metric-value">{formatCurrency(summary.totalInflow)}</div>
                </div>
                <div className="metric-trend">
                  <i className="bi bi-graph-up-arrow"></i>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="metric-card metric-danger">
                <div className="metric-icon-wrapper">
                  <div className="metric-icon">
                    <i className="bi bi-arrow-up-circle"></i>
                  </div>
                </div>
                <div className="metric-content">
                  <div className="metric-label">Pengeluaran</div>
                  <div className="metric-value">{formatCurrency(summary.totalOutflow)}</div>
                </div>
                <div className="metric-trend">
                  <i className="bi bi-graph-down-arrow"></i>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className={`metric-card ${summary.balance >= 0 ? 'metric-info' : 'metric-warning'}`}>
                <div className="metric-icon-wrapper">
                  <div className="metric-icon">
                    <i className="bi bi-wallet2"></i>
                  </div>
                </div>
                <div className="metric-content">
                  <div className="metric-label">Saldo</div>
                  <div className="metric-value">{formatCurrency(summary.balance)}</div>
                </div>
                <div className="metric-trend">
                  <i className={`bi ${summary.balance >= 0 ? 'bi-check-circle' : 'bi-exclamation-circle'}`}></i>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="metric-card metric-primary">
                <div className="metric-icon-wrapper">
                  <div className="metric-icon">
                    <i className="bi bi-receipt-cutoff"></i>
                  </div>
                </div>
                <div className="metric-content">
                  <div className="metric-label">Transaksi</div>
                  <div className="metric-value">{summary.transactionCount}</div>
                </div>
                <div className="metric-trend">
                  <i className="bi bi-activity"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Statistics */}
          <div className="data-section">
            <div className="section-header">
              <div className="section-title-group">
                <h2 className="section-title">
                  <i className="bi bi-calendar-week me-2"></i>
                  Statistik Harian
                </h2>
                <p className="section-subtitle">Ringkasan transaksi per hari</p>
              </div>
              <div className="section-controls">
                <div className="control-group">
                  <input
                    type="date"
                    className="form-control"
                    name="dailyEndDate"
                    value={filters.dailyEndDate}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="control-group">
                  <select
                    className="form-select"
                    name="dailyTotalData"
                    value={filters.dailyTotalData}
                    onChange={handleFilterChange}
                  >
                    <option value="7">7 Hari</option>
                    <option value="14">14 Hari</option>
                    <option value="30">30 Hari</option>
                  </select>
                </div>
                <button 
                  className="btn btn-export"
                  onClick={() => exportToCSV(dailyStats, 'statistik-harian.csv')}
                  disabled={dailyStats.length === 0}
                >
                  <i className="bi bi-download me-2"></i>
                  <span className="d-none d-md-inline">Export CSV</span>
                  <span className="d-md-none">CSV</span>
                </button>
              </div>
            </div>

            <div className="section-content">
              {loading ? (
                <div className="loading-container">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="loading-text">Memuat statistik...</p>
                </div>
              ) : dailyStats.length === 0 ? (
                <div className="empty-container">
                  <div className="empty-icon">
                    <i className="bi bi-inbox"></i>
                  </div>
                  <h5 className="empty-title">Belum Ada Data</h5>
                  <p className="empty-text">Mulai tambahkan transaksi untuk melihat statistik harian</p>
                </div>
              ) : (
                <div className="stats-grid">
                  {dailyStats.map((stat, index) => {
                    const maxValue = getMaxValue(dailyStats);
                    const inflowPercent = getPercentage(stat.total_inflow || 0, maxValue);
                    const outflowPercent = getPercentage(stat.total_outflow || 0, maxValue);
                    const balance = (stat.total_inflow || 0) - (stat.total_outflow || 0);

                    return (
                      <div key={index} className="stat-card">
                        <div className="stat-card-header">
                          <div className="stat-date">
                            <i className="bi bi-calendar3 me-2"></i>
                            {formatDate(stat.date)}
                          </div>
                          <div className="stat-badges">
                            <span className="badge-count">
                              <i className="bi bi-receipt me-1"></i>
                              {stat.total_transactions || 0}
                            </span>
                            <span className={`badge-amount ${balance >= 0 ? 'badge-positive' : 'badge-negative'}`}>
                              {formatCurrency(balance)}
                            </span>
                          </div>
                        </div>

                        <div className="stat-card-body">
                          <div className="progress-group">
                            <div className="progress-info">
                              <span className="progress-label text-success">
                                <i className="bi bi-arrow-down me-1"></i>
                                Pemasukan
                              </span>
                              <span className="progress-value">{formatCurrency(stat.total_inflow || 0)}</span>
                            </div>
                            <div className="progress-bar-container">
                              <div 
                                className="progress-bar-fill progress-bar-success"
                                style={{ width: `${inflowPercent}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="progress-group">
                            <div className="progress-info">
                              <span className="progress-label text-danger">
                                <i className="bi bi-arrow-up me-1"></i>
                                Pengeluaran
                              </span>
                              <span className="progress-value">{formatCurrency(stat.total_outflow || 0)}</span>
                            </div>
                            <div className="progress-bar-container">
                              <div 
                                className="progress-bar-fill progress-bar-danger"
                                style={{ width: `${outflowPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Monthly Statistics */}
          <div className="data-section">
            <div className="section-header">
              <div className="section-title-group">
                <h2 className="section-title">
                  <i className="bi bi-calendar-month me-2"></i>
                  Statistik Bulanan
                </h2>
                <p className="section-subtitle">Ringkasan transaksi per bulan</p>
              </div>
              <div className="section-controls">
                <div className="control-group">
                  <input
                    type="date"
                    className="form-control"
                    name="monthlyEndDate"
                    value={filters.monthlyEndDate}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="control-group">
                  <select
                    className="form-select"
                    name="monthlyTotalData"
                    value={filters.monthlyTotalData}
                    onChange={handleFilterChange}
                  >
                    <option value="3">3 Bulan</option>
                    <option value="6">6 Bulan</option>
                    <option value="12">12 Bulan</option>
                  </select>
                </div>
                <button 
                  className="btn btn-export"
                  onClick={() => exportToCSV(monthlyStats, 'statistik-bulanan.csv')}
                  disabled={monthlyStats.length === 0}
                >
                  <i className="bi bi-download me-2"></i>
                  <span className="d-none d-md-inline">Export CSV</span>
                  <span className="d-md-none">CSV</span>
                </button>
              </div>
            </div>

            <div className="section-content">
              {loading ? (
                <div className="loading-container">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="loading-text">Memuat statistik...</p>
                </div>
              ) : monthlyStats.length === 0 ? (
                <div className="empty-container">
                  <div className="empty-icon">
                    <i className="bi bi-inbox"></i>
                  </div>
                  <h5 className="empty-title">Belum Ada Data</h5>
                  <p className="empty-text">Mulai tambahkan transaksi untuk melihat statistik bulanan</p>
                </div>
              ) : (
                <div className="stats-grid">
                  {monthlyStats.map((stat, index) => {
                    const maxValue = getMaxValue(monthlyStats);
                    const inflowPercent = getPercentage(stat.total_inflow || 0, maxValue);
                    const outflowPercent = getPercentage(stat.total_outflow || 0, maxValue);
                    const balance = (stat.total_inflow || 0) - (stat.total_outflow || 0);

                    return (
                      <div key={index} className="stat-card">
                        <div className="stat-card-header">
                          <div className="stat-date">
                            <i className="bi bi-calendar-range me-2"></i>
                            {new Date(stat.month).toLocaleDateString('id-ID', {
                              month: 'long',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="stat-badges">
                            <span className="badge-count">
                              <i className="bi bi-receipt me-1"></i>
                              {stat.total_transactions || 0}
                            </span>
                            <span className={`badge-amount ${balance >= 0 ? 'badge-positive' : 'badge-negative'}`}>
                              {formatCurrency(balance)}
                            </span>
                          </div>
                        </div>

                        <div className="stat-card-body">
                          <div className="progress-group">
                            <div className="progress-info">
                              <span className="progress-label text-success">
                                <i className="bi bi-arrow-down me-1"></i>
                                Pemasukan
                              </span>
                              <span className="progress-value">{formatCurrency(stat.total_inflow || 0)}</span>
                            </div>
                            <div className="progress-bar-container">
                              <div 
                                className="progress-bar-fill progress-bar-success"
                                style={{ width: `${inflowPercent}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="progress-group">
                            <div className="progress-info">
                              <span className="progress-label text-danger">
                                <i className="bi bi-arrow-up me-1"></i>
                                Pengeluaran
                              </span>
                              <span className="progress-value">{formatCurrency(stat.total_outflow || 0)}</span>
                            </div>
                            <div className="progress-bar-container">
                              <div 
                                className="progress-bar-fill progress-bar-danger"
                                style={{ width: `${outflowPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;