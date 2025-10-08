import React from "react";
import Navbar from "../components/Navbar";
import { authService } from "../services/auth";

const Profile = () => {
  const user = authService.getCurrentUser();

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h3 className="card-title mb-3">Profil Pengguna</h3>
            <p><strong>Nama:</strong> {user?.name || "Tidak diketahui"}</p>
            <p><strong>Email:</strong> {user?.email || "Tidak tersedia"}</p>
            <p><strong>Role:</strong> {user?.role || "User biasa"}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
