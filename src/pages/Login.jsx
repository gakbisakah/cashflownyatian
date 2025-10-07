// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth'; 
import '../styles/auth.css'; 

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(formData.email, formData.password);
      
      if (response.success) {
        navigate('/dashboard'); 
      } else {
        setError(response.message || 'Login gagal. Silakan coba lagi.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // URL Ilustrasi Placeholder (Ganti dengan ilustrasi keuangan Anda)
  const loginIllustration = "https://i.ibb.co/6P6XyYv/login-finance-illustration.png"; 

  return (
    <div className="auth-container-centered">
      <div className="auth-split-card">

        {/* Sisi Kiri: Ilustrasi Login (Hanya muncul di desktop) */}
        <div className="auth-split-card-left d-none d-md-flex">
        
          <i className="bi bi-wallet2 text-primary-color mt-4" style={{ fontSize: '3rem' }}></i>
          <h2>Kelola Uang Anda</h2>
          <p>Masuk dan mulai lacak pendapatan dan pengeluaran Anda dengan mudah.</p>
        </div>

        {/* Sisi Kanan: Form Login */}
        <div className="auth-split-card-right">
          
          <div className="auth-header-form">
            <h3>Masuk ke Akun</h3>
            <p className="text-muted-modern">Selamat datang kembali! Silakan masukkan detail Anda.</p>
          </div>
          
          {error && (
            <div className="alert alert-danger alert-modern mb-4" role="alert">
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label-modern">Email</label>
              <div className="input-group input-group-modern">
                <span className="input-group-text">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control form-control-modern"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <label htmlFor="password" className="form-label-modern">Password</label>
              <div className="input-group input-group-modern">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control form-control-modern"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Masukkan password Anda"
                  required
                />
                <button 
                  type="button" 
                  className="btn btn-link text-muted-modern p-0 pe-3" 
                  onClick={togglePasswordVisibility}
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary-modern w-100" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Memproses...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Masuk ke Akun
                </>
              )}
            </button>
          </form>

          {/* Link Register */}
          <div className="text-center mt-4 pt-3 border-top">
            <p className="mb-0 text-muted-modern" style={{ fontSize: '0.9rem' }}>
              Belum punya akun?{' '}
              <Link to="/register" className="link-modern">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;