import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/dashboard">
          <i className="bi bi-wallet2 me-2"></i>
           Cashflow
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                to="/dashboard"
              >
                <i className="bi bi-speedometer2 me-1"></i>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive('/transactions') ? 'active' : ''}`}
                to="/transactions"
              >
                <i className="bi bi-list-ul me-1"></i>
                Transaksi
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive('/statistics') ? 'active' : ''}`}
                to="/statistics"
              >
                <i className="bi bi-graph-up me-1"></i>
                Statistik
              </Link>
            </li>
          </ul>
          
          <div className="d-flex align-items-center">
            <Link
  to="/profile"
  className="text-white text-decoration-none me-3 d-flex align-items-center"
  style={{ cursor: 'pointer' }}
>
  <i className="bi bi-person-circle me-2"></i>
  {user?.name || 'User'}
</Link>

            <button
              className="btn btn-outline-light btn-sm"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;