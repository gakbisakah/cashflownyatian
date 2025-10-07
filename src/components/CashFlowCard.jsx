import React from "react";

const CashFlowCard = ({ data = {}, onEdit, onDelete, onView, showActions = true }) => {
  if (!data || Object.keys(data).length === 0) return null;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case "cash":
        return "bi-cash-coin";
      case "savings":
        return "bi-piggy-bank";
      case "loans":
        return "bi-credit-card";
      default:
        return "bi-wallet2";
    }
  };

  const getSourceLabel = (source) => {
    switch (source) {
      case "cash":
        return "Tunai";
      case "savings":
        return "Tabungan";
      case "loans":
        return "Pinjaman";
      default:
        return source;
    }
  };

  return (
    <div
      className={`card cashflow-card shadow-sm h-100 ${
        data.type === "inflow" ? "border-success" : "border-danger"
      }`}
    >
      <div
        className={`card-header ${
          data.type === "inflow"
            ? "bg-success bg-opacity-10"
            : "bg-danger bg-opacity-10"
        }`}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h6
            className={`mb-0 ${
              data.type === "inflow" ? "text-success" : "text-danger"
            }`}
          >
            <i
              className={`bi ${
                data.type === "inflow"
                  ? "bi-arrow-down-circle"
                  : "bi-arrow-up-circle"
              } me-2`}
            ></i>
            {data.type === "inflow" ? "Pemasukan" : "Pengeluaran"}
          </h6>
          <span
            className={`badge ${
              data.type === "inflow" ? "bg-success" : "bg-danger"
            }`}
          >
            <i className={`bi ${getSourceIcon(data.source)} me-1`}></i>
            {getSourceLabel(data.source)}
          </span>
        </div>
      </div>

      <div className="card-body">
        <h5 className="card-title text-truncate" title={data.label}>
          {data.label}
        </h5>
        <h4
          className={`mb-3 ${
            data.type === "inflow" ? "text-success" : "text-danger"
          }`}
        >
          {formatCurrency(data.nominal)}
        </h4>
        {data.description && (
          <p
            className="card-text text-muted small text-truncate"
            title={data.description}
          >
            <i className="bi bi-chat-left-text me-1"></i>
            {data.description}
          </p>
        )}
        <p className="card-text">
          <small className="text-muted">
            <i className="bi bi-calendar3 me-1"></i>
            {formatDate(data.created_at || data.date || new Date())}
          </small>
        </p>
      </div>

      {/* 🔹 Hanya tampilkan tombol aksi jika showActions = true */}
      {showActions && (
        <div className="card-footer bg-transparent">
          <div className="btn-group w-100" role="group">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => onView(data)}
              title="Lihat Detail"
            >
              <i className="bi bi-eye"></i>
            </button>
            <button
              className="btn btn-sm btn-outline-warning"
              onClick={() => onEdit(data)}
              title="Edit"
            >
              <i className="bi bi-pencil"></i>
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(data.id)}
              title="Hapus"
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlowCard;
