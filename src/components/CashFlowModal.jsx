import React, { useState, useEffect } from 'react';

const CashFlowModal = ({ show, onHide, onSubmit, editData }) => {
  const [formData, setFormData] = useState({
    type: 'inflow',
    source: 'cash',
    label: '',
    description: '',
    nominal: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      if (editData) {
        setFormData({
          type: editData.type || 'inflow',
          source: editData.source || 'cash',
          label: editData.label || '',
          description: editData.description || '',
          nominal: editData.nominal ? editData.nominal.toString() : ''
        });
      } else {
        setFormData({
          type: 'inflow',
          source: 'cash',
          label: '',
          description: '',
          nominal: ''
        });
      }
      setErrors({});
    }
  }, [editData, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle numeric input for nominal
    if (name === 'nominal') {
      // Only allow numbers
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Label harus diisi';
    }

    if (!formData.nominal || parseFloat(formData.nominal) <= 0) {
      newErrors.nominal = 'Nominal harus lebih dari 0';
    }

    if (!formData.type) {
      newErrors.type = 'Tipe transaksi harus dipilih';
    }

    if (!formData.source) {
      newErrors.source = 'Sumber harus dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    
    try {
      // Convert nominal to number before submitting
      const submitData = {
        type: formData.type,
        source: formData.source,
        label: formData.label.trim(),
        description: formData.description.trim(),
        nominal: parseFloat(formData.nominal)
      };
      
      // Call onSubmit and wait for it to complete
      await onSubmit(submitData);
      
      // Only reset and close if submit was successful
      // The parent component will handle closing the modal
    } catch (error) {
      console.error('Submit error in modal:', error);
      setErrors({ submit: error.message || 'Terjadi kesalahan saat menyimpan data' });
      setSubmitting(false); // Re-enable form on error
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      type: 'inflow',
      source: 'cash',
      label: '',
      description: '',
      nominal: ''
    });
    setErrors({});
    setSubmitting(false);
    onHide();
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('id-ID').format(value);
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div className="modal-content" style={{ borderRadius: '15px', border: 'none' }}>
          <div className="modal-header" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '15px 15px 0 0'
          }}>
            <h5 className="modal-title">
              <i className={`bi ${editData ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
              {editData ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              aria-label="Close" 
              onClick={handleClose}
              disabled={submitting}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {errors.submit && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {errors.submit}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setErrors(prev => ({ ...prev, submit: '' }))}
                  ></button>
                </div>
              )}

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-arrow-left-right me-2"></i>
                    Tipe Transaksi <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.type ? 'is-invalid' : ''}`}
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  >
                    <option value="inflow">💰 Pemasukan</option>
                    <option value="outflow">💸 Pengeluaran</option>
                  </select>
                  {errors.type && <div className="invalid-feedback">{errors.type}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-wallet2 me-2"></i>
                    Sumber <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.source ? 'is-invalid' : ''}`}
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  >
                    <option value="cash">💵 Tunai (Cash)</option>
                    <option value="savings">🏦 Tabungan (Savings)</option>
                    <option value="loans">💳 Pinjaman (Loans)</option>
                  </select>
                  {errors.source && <div className="invalid-feedback">{errors.source}</div>}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-tag me-2"></i>
                  Label <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.label ? 'is-invalid' : ''}`}
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  placeholder="Contoh: Gaji, Belanja Bulanan, Transport, dll"
                  required
                  disabled={submitting}
                  maxLength="100"
                />
                {errors.label && <div className="invalid-feedback">{errors.label}</div>}
                <small className="text-muted">Berikan nama yang jelas untuk transaksi ini</small>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-currency-exchange me-2"></i>
                  Nominal <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <strong>Rp</strong>
                  </span>
                  <input
                    type="text"
                    className={`form-control ${errors.nominal ? 'is-invalid' : ''}`}
                    name="nominal"
                    value={formData.nominal}
                    onChange={handleChange}
                    placeholder="0"
                    required
                    disabled={submitting}
                  />
                  {errors.nominal && <div className="invalid-feedback">{errors.nominal}</div>}
                </div>
                {formData.nominal && (
                  <small className="text-muted d-block mt-1">
                    <i className="bi bi-info-circle me-1"></i>
                    Nilai: <strong>{formatCurrency(formData.nominal)}</strong>
                  </small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-chat-left-text me-2"></i>
                  Deskripsi <span className="text-muted">(Opsional)</span>
                </label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Tambahkan catatan atau detail transaksi (opsional)"
                  disabled={submitting}
                  maxLength="500"
                ></textarea>
                <small className="text-muted">{formData.description.length}/500 karakter</small>
              </div>

              <div className="alert alert-info d-flex align-items-center" role="alert">
                <i className="bi bi-lightbulb me-2"></i>
                <div>
                  <strong>Tips:</strong> Pastikan semua data sudah benar sebelum menyimpan. 
                  Anda bisa mengedit transaksi kapan saja setelah disimpan.
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light" style={{ borderRadius: '0 0 15px 15px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleClose}
                disabled={submitting}
              >
                <i className="bi bi-x-circle me-2"></i>
                Batal
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <i className={`bi ${editData ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>
                    {editData ? 'Simpan Perubahan' : 'Tambah Transaksi'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CashFlowModal;