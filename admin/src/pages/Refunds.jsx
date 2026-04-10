import React, { useState, useEffect } from "react";
import api from "../config/api";

const Refunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchRefunds = async () => {
    try {
      setError("");
      setLoading(true);
      const { data } = await api.get("/refunds");
      setRefunds(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load refunds. Check backend server.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleDecision = async (id, status, reason = "") => {
    try {
      setActionLoading(true);
      await api.put(`/refunds/${id}/decide`, { status, adminReason: reason });
      await fetchRefunds();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (r) => {
    setSelectedRefund(r);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRefund(null);
  };

  const countByStatus = {
    all: refunds.length,
    pending: refunds.filter((r) => r.status === "Pending").length,
    approved: refunds.filter((r) => r.status === "Approved").length,
    rejected: refunds.filter((r) => r.status === "Rejected").length,
  };

  const matchesFilter = (r) => {
    if (filter === "pending") return r.status === "Pending";
    if (filter === "approved") return r.status === "Approved";
    if (filter === "rejected") return r.status === "Rejected";
    return true;
  };

  const filtered = refunds.filter(matchesFilter);

  const canPlayVideo = (url) => {
    if (!url || url === "#") return false;
    return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading refund requests…</p>
      </div>
    );
  }

  /* ─── Main ─── */
  return (
    <div style={styles.page}>
      <style>{cssAnimations}</style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Refund Requests</h1>
          <p style={styles.subtitle}>
            {refunds.length} request{refunds.length !== 1 && "s"} submitted
          </p>
        </div>
        <button style={styles.refreshBtn} onClick={fetchRefunds}>
          ↻ Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBanner}>
          <span>⚠ {error}</span>
          <button style={styles.errorClose} onClick={() => setError("")}>
            ✕
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div style={styles.filterRow}>
        {[
          { key: "all", label: "All", icon: "📋" },
          { key: "pending", label: "Pending", icon: "⏳" },
          { key: "approved", label: "Approved", icon: "✓" },
          { key: "rejected", label: "Rejected", icon: "✕" },
        ].map((tab) => (
          <button
            key={tab.key}
            style={{
              ...styles.filterTab,
              ...(filter === tab.key ? styles.filterTabActive : {}),
            }}
            onClick={() => setFilter(tab.key)}
          >
            <span style={styles.filterIcon}>{tab.icon}</span>
            {tab.label}
            <span style={styles.filterBadge}>{countByStatus[tab.key]}</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>📭</span>
          <p>No refund requests match this filter.</p>
        </div>
      ) : (
        <div style={styles.cardsGrid}>
          {filtered.map((r, i) => {
            const isPending = r.status === "Pending";
            const statusColor = isPending
              ? "#F59E0B"
              : r.status === "Approved"
                ? "#16A34A"
                : "#DC2626";
            const statusBg = isPending
              ? "#FEF3C7"
              : r.status === "Approved"
                ? "#DCFCE7"
                : "#FEE2E2";
            const statusText = isPending
              ? "⏳ Pending"
              : r.status === "Approved"
                ? "✓ Approved"
                : "✕ Rejected";
            const order = r.orderId || {};
            const buyer = r.buyerId || {};

            return (
              <div
                key={r._id}
                style={{
                  ...styles.card,
                  borderLeft: `4px solid ${statusColor}`,
                  animationDelay: `${i * 40}ms`,
                }}
                className="refund-card"
              >
                <div style={styles.cardTop}>
                  <div style={styles.cardAvatar}>
                    {(buyer.name || "B")[0].toUpperCase()}
                  </div>
                  <div style={styles.cardInfo}>
                    <span style={styles.cardName}>
                      {buyer.name || "Unknown Buyer"}
                    </span>
                    <span style={styles.cardEmail}>{buyer.email || ""}</span>
                  </div>
                  <span
                    style={{
                      ...styles.cardStatus,
                      background: statusBg,
                      color: statusColor,
                    }}
                  >
                    {statusText}
                  </span>
                </div>

                <div style={styles.cardReason}>
                  <span style={styles.reasonLabel}>Reason</span>
                  <span style={styles.reasonText}>{r.reason}</span>
                </div>

                {order?.productId && (
                  <div style={styles.cardOrder}>
                    <span>📦 {order.productId.name || "Product"}</span>
                    {order.totalPrice ? <span>₹{order.totalPrice}</span> : null}
                  </div>
                )}

                <div style={styles.cardMeta}>
                  <span style={styles.metaItem}>
                    📅{" "}
                    {new Date(r.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div style={styles.cardActions}>
                  {r.unboxingVideoUrl && r.unboxingVideoUrl !== "#" && (
                    <a
                      href={r.unboxingVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.videoLink}
                    >
                      🎬 View Unboxing Video
                    </a>
                  )}
                  <button
                    style={styles.detailsBtn}
                    onClick={() => openModal(r)}
                  >
                    {isPending ? "Review →" : "Details →"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Modal ─── */}
      {showModal && selectedRefund && (
        <div
          style={styles.overlay}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div style={styles.modalIdentity}>
                <div style={styles.modalAvatar}>
                  {(selectedRefund.buyerId?.name || "B")[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={styles.modalTitle}>Refund Request</h3>
                  <p style={styles.modalSubtitle}>
                    {selectedRefund.buyerId?.name || "Unknown Buyer"}
                  </p>
                </div>
              </div>
              <button style={styles.modalClose} onClick={closeModal}>
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Info */}
              <div style={styles.infoGrid}>
                {selectedRefund.buyerId?.email && (
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Buyer Email</span>
                    <span style={styles.infoValue}>
                      {selectedRefund.buyerId.email}
                    </span>
                  </div>
                )}
                {selectedRefund.orderId?.totalPrice && (
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Order Amount</span>
                    <span style={styles.infoValue}>
                      ₹{selectedRefund.orderId.totalPrice}
                    </span>
                  </div>
                )}
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Status</span>
                  <span style={styles.infoValue}>{selectedRefund.status}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Submitted</span>
                  <span style={styles.infoValue}>
                    {new Date(selectedRefund.createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </span>
                </div>
                {selectedRefund.adminDecision?.decidedAt && (
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Reviewed</span>
                    <span style={styles.infoValue}>
                      {new Date(
                        selectedRefund.adminDecision.decidedAt,
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {selectedRefund.adminDecision?.decidedBy?.name && (
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Reviewed By</span>
                    <span style={styles.infoValue}>
                      {selectedRefund.adminDecision.decidedBy.name}
                    </span>
                  </div>
                )}
              </div>

              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Reason</h4>
                <p style={styles.pastComment}>{selectedRefund.reason}</p>
              </div>

              {/* Unboxing video */}
              {selectedRefund.unboxingVideoUrl &&
                selectedRefund.unboxingVideoUrl !== "#" && (
                  <div style={styles.section}>
                    <h4 style={styles.sectionTitle}>Unboxing Video</h4>
                    {canPlayVideo(selectedRefund.unboxingVideoUrl) ? (
                      <video
                        controls
                        preload="metadata"
                        style={styles.videoPlayer}
                        src={selectedRefund.unboxingVideoUrl}
                      >
                        Your browser does not support this video format.
                      </video>
                    ) : null}
                    <a
                      href={selectedRefund.unboxingVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.videoCard}
                    >
                      🎬 Open Unboxing Video in New Tab
                    </a>
                  </div>
                )}

              {/* Past admin decision */}
              {selectedRefund.adminDecision?.reason &&
                selectedRefund.status !== "Pending" && (
                  <div style={styles.section}>
                    <h4 style={styles.sectionTitle}>Admin Notes</h4>
                    <p style={styles.pastComment}>
                      {selectedRefund.adminDecision.reason}
                    </p>
                  </div>
                )}
            </div>

            {/* Action buttons (Pending only) - kept outside scrollable body */}
            {selectedRefund.status === "Pending" && (
              <div style={styles.actionRow}>
                <button
                  style={styles.btnApprove}
                  disabled={actionLoading}
                  onClick={() =>
                    handleDecision(
                      selectedRefund._id,
                      "Approved",
                      "Reviewed and approved",
                    )
                  }
                >
                  {actionLoading ? "Processing…" : "✓ Approve"}
                </button>
                <button
                  style={styles.btnReject}
                  disabled={actionLoading}
                  onClick={() =>
                    handleDecision(
                      selectedRefund._id,
                      "Rejected",
                      "Reviewed and rejected",
                    )
                  }
                >
                  {actionLoading ? "Processing…" : "✕ Reject"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Animations ─── */
const cssAnimations = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.97) translateY(12px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .refund-card {
    animation: fadeInUp 0.3s ease both;
  }
  .refund-card:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    transform: translateY(-1px);
  }
  button:disabled {
    opacity: 0.6 !important;
    cursor: not-allowed !important;
  }
`;

/* ─── Styles ─── */
const styles = {
  page: {
    padding: "32px 40px 120px",
    minHeight: "100vh",
    background: "#F8F9FC",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  centerPage: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#F8F9FC",
    gap: "16px",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #E5E7EB",
    borderTop: "3px solid #4F46E5",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  loadingText: {
    color: "#6B7280",
    fontSize: "14px",
    margin: 0,
  },

  /* Header */
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6B7280",
    margin: "4px 0 0",
  },
  refreshBtn: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    padding: "8px 18px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    cursor: "pointer",
  },

  /* Error */
  errorBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: "10px",
    padding: "12px 16px",
    marginBottom: "20px",
    fontSize: "14px",
    color: "#B91C1C",
  },
  errorClose: {
    background: "none",
    border: "none",
    color: "#B91C1C",
    cursor: "pointer",
    fontSize: "16px",
    padding: "0 4px",
  },

  /* Filter */
  filterRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  filterTab: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "24px",
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#4B5563",
    cursor: "pointer",
  },
  filterTabActive: {
    background: "#4F46E5",
    border: "1px solid #4F46E5",
    color: "#FFFFFF",
    boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
  },
  filterIcon: { fontSize: "14px" },
  filterBadge: {
    background: "#F3F4F6",
    borderRadius: "10px",
    padding: "1px 8px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#6B7280",
  },

  /* Cards */
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "16px",
  },
  card: {
    background: "#FFFFFF",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    transition: "all 0.2s ease",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  cardAvatar: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #2563EB, #7C3AED)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "700",
    flexShrink: 0,
  },
  cardInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
  },
  cardName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#111827",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cardEmail: {
    fontSize: "12px",
    color: "#6B7280",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cardStatus: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 10px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
  },
  cardReason: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  reasonLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  reasonText: {
    fontSize: "14px",
    color: "#374151",
    lineHeight: 1.4,
  },
  cardOrder: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#F9FAFB",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
  },
  cardMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    fontSize: "13px",
    color: "#4B5563",
  },
  metaItem: { display: "flex", alignItems: "center", gap: "4px" },
  cardActions: {
    display: "flex",
    gap: "8px",
  },
  videoLink: {
    background: "#FEF3C7",
    color: "#92400E",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "12px",
    fontWeight: "600",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    transition: "background 0.15s",
  },
  detailsBtn: {
    background: "#4F46E5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    marginLeft: "auto",
    transition: "background 0.15s",
  },

  /* Empty */
  emptyState: {
    textAlign: "center",
    padding: "64px 24px",
  },
  emptyIcon: { fontSize: "48px" },

  /* ─── Modal ─── */
  overlay: {
    position: "fixed",
    inset: 0,
    bottom: "60px",
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    background: "#FFFFFF",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    animation: "modalIn 0.25s ease",
    boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #F3F4F6",
  },
  modalIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  modalAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563EB, #7C3AED)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "700",
  },
  modalTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "700",
    color: "#111827",
  },
  modalSubtitle: {
    margin: "2px 0 0",
    fontSize: "13px",
    color: "#6B7280",
  },
  modalClose: {
    background: "#F3F4F6",
    border: "none",
    borderRadius: "8px",
    width: "32px",
    height: "32px",
    fontSize: "14px",
    cursor: "pointer",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    padding: "20px 24px 24px",
    overflowY: "auto",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    minHeight: 0,
  },

  /* Info grid */
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  infoItem: {
    background: "#F9FAFB",
    borderRadius: "8px",
    padding: "10px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  infoLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  infoValue: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#111827",
    wordBreak: "break-all",
  },

  /* Sections */
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "12px",
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  pastComment: {
    background: "#F9FAFB",
    borderRadius: "8px",
    padding: "12px 14px",
    fontSize: "14px",
    color: "#374151",
    lineHeight: 1.5,
    margin: 0,
  },

  /* Video card */
  videoPlayer: {
    width: "100%",
    maxHeight: "320px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    background: "#000000",
  },
  videoCard: {
    background: "#FEF3C7",
    color: "#92400E",
    borderRadius: "10px",
    padding: "16px",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background 0.15s",
  },

  /* Action buttons */
  actionRow: {
    display: "flex",
    gap: "10px",
    padding: "16px 24px 24px",
    borderTop: "1px solid #F3F4F6",
    flexShrink: 0,
  },
  btnApprove: {
    flex: 1,
    background: "#16A34A",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnReject: {
    flex: 1,
    background: "#FFFFFF",
    color: "#DC2626",
    border: "1px solid #FECACA",
    borderRadius: "10px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Refunds;
