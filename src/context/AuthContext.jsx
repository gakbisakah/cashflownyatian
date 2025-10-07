import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
const BASE_URL = "https://open-api.delcom.org/api/v1";

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        navigate("/dashboard");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const register = async (email, password) => {
    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Register berhasil! Silakan login.");
        navigate("/login");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
