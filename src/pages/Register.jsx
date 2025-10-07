// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import '../styles/auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else if (field === 'confirmPassword') {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter!');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(
        formData.name,
        formData.email,
        formData.password
      );

      if (response.success) {
        alert('Registrasi berhasil! Silakan login.');
        navigate('/login');
      } else {
        setError(response.message || 'Registrasi gagal. Silakan coba lagi.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // URL Ilustrasi Placeholder (Ganti dengan ilustrasi yang sesuai)
  const registerIllustration = "https://i.ibb.co/D8G3w5g/register-illustration.png";

  return (
    <div className="auth-container-centered">
      <div className="auth-split-card">

        {/* Sisi Kiri: Ilustrasi Register (Hanya muncul di desktop) */}
        <div className="auth-split-card-left d-none d-md-flex">
          
          <i className="bi bi-person-plus text-primary-color mt-4" style={{ fontSize: '3rem' }}></i>
          <h2>Bergabunglah Sekarang</h2>
          <p>Daftar dalam beberapa langkah mudah dan mulai kelola finansial Anda hari ini.</p>
        </div>

        {/* Sisi Kanan: Form Register */}
        <div className="auth-split-card-right">
          
          <div className="auth-header-form">
            <h3>Buat Akun Baru</h3>
            <p className="text-muted-modern">Masukkan data Anda untuk memulai.</p>
          </div>
          
          {error && (
            <div className="alert alert-danger alert-modern mb-4" role="alert">
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Input Nama Lengkap */}
            <div className="mb-3">
              <label htmlFor="name" className="form-label-modern">Nama Lengkap</label>
              <div className="input-group input-group-modern">
                <span className="input-group-text">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  className="form-control form-control-modern"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nama lengkap Anda"
                  required
                />
              </div>
            </div>

            {/* Input Email */}
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
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="mb-3">
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
                  placeholder="Minimal 6 karakter"
                  required
                />
                <button 
                  type="button" 
                  className="btn btn-link text-muted-modern p-0 pe-3" 
                  onClick={() => togglePasswordVisibility('password')}
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Input Konfirmasi Password */}
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label-modern">Konfirmasi Password</label>
              <div className="input-group input-group-modern">
                <span className="input-group-text">
                  <i className="bi bi-lock-fill"></i>
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control form-control-modern"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi password"
                  required
                />
                <button 
                  type="button" 
                  className="btn btn-link text-muted-modern p-0 pe-3" 
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  title={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
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
                  <i className="bi bi-person-check me-2"></i>
                  Daftar Sekarang
                </>
              )}
            </button>
          </form>

          {/* Link Login */}
          <div className="text-center mt-4 pt-3 border-top">
            <p className="mb-0 text-muted-modern" style={{ fontSize: '0.9rem' }}>
              Sudah punya akun?{' '}
              <Link to="/login" className="link-modern">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;