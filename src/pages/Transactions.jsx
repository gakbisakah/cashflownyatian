import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CashFlowCard from '../components/CashFlowCard';
import CashFlowModal from '../components/CashFlowModal';
import { cashflowService } from '../services/cashflow';
import '../styles/transactions.css';
import { ArrowLeftRight } from "lucide-react";

const CashFlowDetailModal = ({ show, onHide, data }) => {
  if (!show || !data) return null;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
      <div className="modal-dialog modal-md modal-dialog-centered" role="document">
        <div className="modal-content modal-modern">
          <div className={`modal-header ${data.type === 'inflow' ? 'modal-header-success' : 'modal-header-danger'}`}>
            <h5 className="modal-title">
              <i className={`bi ${data.type === 'inflow' ? 'bi-arrow-down-circle' : 'bi-arrow-up-circle'} me-2`}></i>
              {data.type === 'inflow' ? 'Detail Pemasukan' : 'Detail Pengeluaran'}
            </h5>
            <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onHide}></button>
          </div>
          <div className="modal-body copyable-container">
            <div className="detail-item">
              <span className="detail-label">Label</span>
              <span className="detail-value">{data.label}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Sumber</span>
              <span className="detail-value">{data.source}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Nominal</span>
              <span className={`detail-value fw-bold ${data.type === 'inflow' ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(data.nominal)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Deskripsi</span>
              <span className="detail-value">{data.description || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tanggal</span>
              <span className="detail-value">{formatDate(data.created_at || data.date || new Date())}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">ID</span>
              <span className="detail-value text-muted">{data.id}</span>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onHide}>Tutup</button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  );
};



const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [labels, setLabels] = useState([]);

  const [filters, setFilters] = useState({
    type: '',
    source: '',
    label: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => { 
    fetchAll();
    fetchLabels();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, transactions]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await cashflowService.getAll();
      const data = res && res.success ? (Array.isArray(res.data) ? res.data : []) : [];
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (err) {
      console.error('fetchAll transactions error', err);
      setTransactions([]);
      setFilteredTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLabels = async () => {
    try {
      const res = await cashflowService.getLabels();
      if (res && res.success) {
        setLabels(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('fetchLabels error', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters.type) {
      filtered = filtered.filter(tx => tx.type === filters.type);
    }

    if (filters.source) {
      filtered = filtered.filter(tx => tx.source === filters.source);
    }

    if (filters.label) {
      filtered = filtered.filter(tx => 
        tx.label.toLowerCase().includes(filters.label.toLowerCase())
      );
    }

    if (filters.start_date) {
      const startDate = new Date(filters.start_date + ' 00:00:00');
      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.created_at || tx.date);
        return txDate >= startDate;
      });
    }

    if (filters.end_date) {
      const endDate = new Date(filters.end_date + ' 23:59:59');
      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.created_at || tx.date);
        return txDate <= endDate;
      });
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      type: '',
      source: '',
      label: '',
      start_date: '',
      end_date: ''
    });
  };

  const handleAdd = () => { 
    setEditData(null); 
    setShowModal(true); 
  };

  const handleEdit = (data) => { 
    setEditData(data); 
    setShowModal(true); 
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus transaksi ini?')) return;
    try {
      const result = await cashflowService.delete(id);
      if (result.success) {
        fetchAll();
        alert('Transaksi berhasil dihapus');
      } else {
        alert('Gagal menghapus transaksi');
      }
    } catch (err) {
      console.error('delete error', err);
      alert('Terjadi kesalahan saat menghapus transaksi');
    }
  };

const handleView = async (data) => {
  try {
    const res = await cashflowService.getDetail(data.id);
    const apiData = res?.data?.cash_flow || data;

    const mappedData = {
      id: apiData.id,
      label: apiData.label,
      source: apiData.source,
      nominal: apiData.nominal,
      description: apiData.description,
      created_at: apiData.created_at,
      type: apiData.type
    };

    setDetailData(mappedData);
  } catch (err) {
    console.error("detail error", err);
    setDetailData(data);
  } finally {
    setShowDetail(true);
  }
};



  const handleSubmit = async (formData) => {
    try {
      let result;
      if (editData) {
        result = await cashflowService.update(editData.id, formData);
        if (result.success) {
          alert('Transaksi berhasil diubah');
        }
      } else {
        result = await cashflowService.create(formData);
        if (result.success) {
          alert('Transaksi berhasil ditambahkan');
        }
      }
      
      if (!result.success) {
        alert('Gagal menyimpan transaksi');
      }
    } catch (err) {
      console.error('submit error', err);
      alert('Terjadi kesalahan saat menyimpan transaksi');
    } finally {
      setShowModal(false);
      fetchAll();
    }
  };

  const getTotalInflow = () => {
    return filteredTransactions
      .filter(tx => tx.type === 'inflow')
      .reduce((sum, tx) => sum + parseFloat(tx.nominal || 0), 0);
  };

  const getTotalOutflow = () => {
    return filteredTransactions
      .filter(tx => tx.type === 'outflow')
      .reduce((sum, tx) => sum + parseFloat(tx.nominal || 0), 0);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

  return (
    <div className="transaction-page">
      <Navbar />

      <div className="transaction-wrapper">
        <div className="container-fluid px-3 px-lg-4">
          {/* Header Section */}
          <div className="transaction-hero">
            <div className="row align-items-center justify-content-between">
              <div className="col-auto">
              <h1 className="transaction-hero-title flex items-center gap-2 text-3xl font-semibold">
  <ArrowLeftRight className="text-blue-600 w-8 h-8" />
  Transaksi
</h1>
                <p className="transaction-hero-subtitle">Kelola dan monitor semua transaksi keuangan Anda</p>
              </div>
              <div className="col-auto">
                <button className="btn btn-add-transaction" onClick={handleAdd}>
                  <i className="bi bi-plus-circle me-2"></i>
                  <span>Tambah Transaksi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Card */}
          <div className="filter-card mb-4">
            <div className="filter-card-header">
              <h5 className="filter-card-title">
                <i className="bi bi-funnel me-2"></i>
                Filter Transaksi
              </h5>
            </div>
            <div className="filter-card-body">
              <div className="row g-3">
                <div className="col-md-6 col-lg-3">
                  <label className="filter-label">Tipe Transaksi</label>
                  <select 
                    className="form-select filter-input" 
                    name="type" 
                    value={filters.type}
                    onChange={handleFilterChange}
                  >
                    <option value="">Semua Tipe</option>
                    <option value="inflow">Pemasukan</option>
                    <option value="outflow">Pengeluaran</option>
                  </select>
                </div>
                <div className="col-md-6 col-lg-3">
                  <label className="filter-label">Sumber</label>
                  <select 
                    className="form-select filter-input" 
                    name="source" 
                    value={filters.source}
                    onChange={handleFilterChange}
                  >
                    <option value="">Semua Sumber</option>
                    <option value="cash">Cash</option>
                    <option value="savings">Savings</option>
                    <option value="loans">Loans</option>
                  </select>
                </div>
                <div className="col-md-6 col-lg-3">
                  <label className="filter-label">Label</label>
                  <input 
                    type="text" 
                    className="form-control filter-input" 
                    name="label"
                    value={filters.label}
                    onChange={handleFilterChange}
                    placeholder="Cari label..."
                    list="labelList"
                  />
                  <datalist id="labelList">
                    {labels.map((label, idx) => (
                      <option key={idx} value={label} />
                    ))}
                  </datalist>
                </div>
                <div className="col-md-6 col-lg-3">
                  <label className="filter-label">Tanggal Mulai</label>
                  <input 
                    type="date" 
                    className="form-control filter-input" 
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-6 col-lg-3">
                  <label className="filter-label">Tanggal Akhir</label>
                  <input 
                    type="date" 
                    className="form-control filter-input" 
                    name="end_date"
                    value={filters.end_date}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-6 col-lg-3 d-flex align-items-end">
                  <button 
                    className="btn btn-reset-filter w-100" 
                    onClick={handleResetFilters}
                  >
                    <i className="bi bi-arrow-counterclockwise me-2"></i>
                    Reset Filter
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="row g-3 g-lg-4 mb-4">
            <div className="col-md-4">
              <div className="summary-metric summary-metric-success">
                <div className="summary-metric-icon">
                  <i className="bi bi-arrow-down-circle"></i>
                </div>
                <div className="summary-metric-content">
                  <div className="summary-metric-label">Total Pemasukan</div>
                  <div className="summary-metric-value">{formatCurrency(getTotalInflow())}</div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="summary-metric summary-metric-danger">
                <div className="summary-metric-icon">
                  <i className="bi bi-arrow-up-circle"></i>
                </div>
                <div className="summary-metric-content">
                  <div className="summary-metric-label">Total Pengeluaran</div>
                  <div className="summary-metric-value">{formatCurrency(getTotalOutflow())}</div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="summary-metric summary-metric-primary">
                <div className="summary-metric-icon">
                  <i className="bi bi-receipt-cutoff"></i>
                </div>
                <div className="summary-metric-content">
                  <div className="summary-metric-label">Jumlah Transaksi</div>
                  <div className="summary-metric-value">{filteredTransactions.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction List */}
          <div className="transaction-list-section">
            <div className="transaction-list-header">
              <h5 className="transaction-list-title">
                <i className="bi bi-list-ul me-2"></i>
                Daftar Transaksi
              </h5>
              <span className="transaction-count-badge">
                {filteredTransactions.length} Transaksi
              </span>
            </div>

            <div className="transaction-list-content">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="loading-text">Memuat transaksi...</p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="empty-state">
                 
                  <h5 className="empty-title">
                    {transactions.length === 0 ? 'Belum ada transaksi' : 'Tidak ada transaksi yang sesuai filter'}
                  </h5>
                 
                  <button className="btn btn-add-transaction mt-3" onClick={handleAdd}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Tambah Transaksi
                  </button>
                </div>
              ) : (
                <div className="transaction-grid-scrollable">
                  <div className="transaction-grid">
                    {filteredTransactions.map(tx => (
                      <div className="transaction-grid-item" key={tx.id}>
                        <CashFlowCard 
                          data={tx} 
                          onEdit={handleEdit} 
                          onDelete={handleDelete} 
                          onView={handleView} 
                        />
                      </div>
                    ))}
                  </div>
                  {filteredTransactions.length > 8 && (
                    <div className="scroll-indicator">
                      <i className="bi bi-chevron-down"></i>
                      <span>Scroll untuk melihat lebih banyak</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CashFlowModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        onSubmit={handleSubmit} 
        editData={editData} 
      />
      
      <CashFlowDetailModal 
        show={showDetail} 
        onHide={() => { 
          setShowDetail(false); 
          setDetailData(null); 
        }} 
        data={detailData} 
      />
    </div>
  );
};

export default Transaction;