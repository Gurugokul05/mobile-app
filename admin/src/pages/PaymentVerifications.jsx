import React, { useEffect, useMemo, useState } from "react";
import { Copy, Expand } from "lucide-react";
import api from "../config/api";
import { resolveMediaUrl } from "../utils/media";
import { useToast } from "../components/ToastProvider";

const PaymentVerifications = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState("");
  const [expandedProof, setExpandedProof] = useState("");
  const { showToast } = useToast();

  const fetchRows = async () => {
    try {
      setLoading(true);
      setError("");
      const status =
        filter === "all"
          ? "all"
          : filter === "submitted"
            ? "Payment Submitted"
            : filter === "pending"
              ? "Pending Payment"
              : "Payment Expired";
      const { data } = await api.get("/orders/payment-verifications", { params: { status } });
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch payment queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, [filter]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      submitted: rows.filter((r) => r?.paymentDetails?.status === "Payment Submitted").length,
      pending: rows.filter((r) => r?.paymentDetails?.status === "Pending Payment").length,
      expired: rows.filter((r) => r?.paymentDetails?.status === "Payment Expired").length,
    }),
    [rows],
  );

  const decide = async (orderId, decision) => {
    setActionLoading(`${orderId}:${decision}`);
    try {
      await api.put(`/orders/${orderId}/payment-verification`, { decision });
      await fetchRows();
      showToast({
        type: decision === "approve" ? "success" : "warning",
        title: `Payment ${decision}d`,
        message: "Verification decision saved",
      });
    } catch (_err) {
      showToast({ type: "error", title: "Payment decision failed", message: "Could not update payment verification" });
    } finally {
      setActionLoading("");
    }
  };

  const copyTransactionId = async (value) => {
    try {
      await navigator.clipboard.writeText(value || "");
      showToast({ type: "success", title: "Copied", message: "Transaction ID copied" });
    } catch (_err) {
      showToast({ type: "error", title: "Copy failed", message: "Could not copy transaction ID" });
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Verifications</h1>
          <p className="page-subtitle">Review UPI proof and approve directly from queue rows</p>
        </div>
        <button type="button" className="btn" onClick={fetchRows}>Refresh</button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="tabs-row">
        {[
          { key: "all", label: "All" },
          { key: "submitted", label: "Submitted" },
          { key: "pending", label: "Pending" },
          { key: "expired", label: "Expired" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            className={`tab-btn ${filter === item.key ? "active" : ""}`}
            onClick={() => setFilter(item.key)}
          >
            {item.label}
            <span className="tab-count">{counts[item.key]}</span>
          </button>
        ))}
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="queue-skeleton">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="skeleton-row" />
            ))}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Buyer/Seller</th>
                <th>Payment Proof</th>
                <th>Transaction ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const amount = Number(
                  item?.paymentDetails?.lockedAmount?.grandTotal || item?.totalPrice || 0,
                ).toLocaleString();
                const proofUrl = resolveMediaUrl(item?.paymentDetails?.proof?.screenshotUrl);
                const transactionId = item?.paymentDetails?.proof?.claimedTransactionId || "N/A";
                const status = item?.paymentDetails?.status || "N/A";
                const reviewable = status === "Payment Submitted";

                return (
                  <tr key={item._id}>
                    <td>
                      <strong>{item?.orderReference || item?._id}</strong>
                      <div className="page-subtitle">Amount Rs {amount}</div>
                    </td>
                    <td>
                      <div>{item?.buyerId?.name || "Buyer"}</div>
                      <div className="page-subtitle">Seller: {item?.sellerId?.name || "N/A"}</div>
                    </td>
                    <td>
                      {proofUrl ? (
                        <div className="bulk-actions">
                          <img
                            src={proofUrl}
                            alt="Payment proof"
                            className="proof-thumb"
                            onClick={() => setExpandedProof(proofUrl)}
                          />
                          <button
                            type="button"
                            className="btn"
                            onClick={() => setExpandedProof(proofUrl)}
                          >
                            <Expand size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="page-subtitle">No screenshot</span>
                      )}
                    </td>
                    <td>
                      <div className="bulk-actions">
                        <span>{transactionId}</span>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => copyTransactionId(transactionId)}
                        >
                          <Copy size={13} /> Copy
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${reviewable ? "status-warning" : "status-success"}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <div className="bulk-actions">
                        <button
                          type="button"
                          className="btn btn-success"
                          title="Approve (A)"
                          disabled={!reviewable || actionLoading === `${item._id}:approve`}
                          onClick={() => decide(item._id, "approve")}
                        >
                          {actionLoading === `${item._id}:approve` ? "Saving..." : "Approve"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          title="Reject (R)"
                          disabled={!reviewable || actionLoading === `${item._id}:reject`}
                          onClick={() => decide(item._id, "reject")}
                        >
                          {actionLoading === `${item._id}:reject` ? "Saving..." : "Reject"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {expandedProof ? (
        <div className="modal-overlay" onClick={(event) => event.currentTarget === event.target && setExpandedProof("")}>
          <div className="modal-card">
            <div className="modal-head">
              <h3 className="page-title">Payment Proof</h3>
              <button type="button" className="btn" onClick={() => setExpandedProof("")}>Close</button>
            </div>
            <div className="modal-grid single-column-grid">
              <img className="proof-preview-large" src={expandedProof} alt="Expanded payment proof" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PaymentVerifications;
