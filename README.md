# 💰 Delcom Cash Flow API

API untuk mengelola arus kas pribadi (inflow & outflow) dengan fitur lengkap: tambah, ubah, hapus, statistik harian & bulanan.

---

## 🌐 Base URL


https://open-api.delcom.org/api/v1


---

## 📘 Endpoint Overview

| No | Fitur | URL | Method | Headers | Body / Params | Deskripsi |
|----|--------|------|---------|----------|----------------|-------------|
| 1 | **Add New Cash Flow** | `/cash-flows` | `POST` | `Authorization: Bearer <token>`<br>`Content-Type: multipart/form-data` | `type`, `source`, `label`, `description`, `nominal` | Menambahkan data cash flow baru |
| 2 | **Update Cash Flow** | `/cash-flows/:id` | `PUT` | `Authorization: Bearer <token>`<br>`Content-Type: application/x-www-form-urlencoded` | `type`, `source`, `label`, `description`, `nominal` | Mengubah data cash flow berdasarkan ID |
| 3 | **Get All Cash Flows** | `/cash-flows` | `GET` | `Authorization: Bearer <token>` | (opsional) `type`, `source`, `label`, `start_date`, `end_date` | Mengambil seluruh data cash flow beserta statistik total |
| 4 | **Detail Cash Flow** | `/cash-flows/:id` | `GET` | `Authorization: Bearer <token>` | - | Mengambil detail cash flow berdasarkan ID |
| 5 | **Delete Cash Flow** | `/cash-flows/:id` | `DELETE` | `Authorization: Bearer <token>` | - | Menghapus data cash flow |
| 6 | **Get Your Labels** | `/cash-flows/labels` | `GET` | `Authorization: Bearer <token>` | - | Mendapatkan daftar label transaksi milik pengguna |
| 7 | **Get Stats Daily** | `/cash-flows/stats/daily` | `GET` | `Authorization: Bearer <token>` | `end_date`, `total_data` | Statistik harian inflow, outflow, dan total cashflow |
| 8 | **Get Stats Monthly** | `/cash-flows/stats/monthly` | `GET` | `Authorization: Bearer <token>` | `end_date`, `total_data` | Statistik bulanan inflow, outflow, dan total cashflow |

---

## 🧾 Contoh Response Sukses

```json
{
  "success": true,
  "message": "Berhasil mengambil data",
  "data": {
    "cash_flows": [...],
    "stats": {
      "total_inflow": 2500000,
      "total_outflow": 500000,
      "cashflow": 2000000
    }
  }
}

🔐 Autentikasi

Semua endpoint membutuhkan header:

Authorization: Bearer <token>

📅 Format Tanggal

Gunakan format timestamp:

YYYY-MM-DD HH:MM:SS


