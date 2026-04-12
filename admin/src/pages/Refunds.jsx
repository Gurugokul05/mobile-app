import React, { useEffect, useMemo, useState } from "react";
import api from "../config/api";

const Refunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [adminComment, setAdminComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/refunds");
      setRefunds(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load refunds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const stats = useMemo(() => {
    return {
      all: refunds.length,
      pending: refunds.filter((r) => r.status === "Pending").length,
      approved: refunds.filter((r) => r.status === "Approved").length,
      rejected: refunds.filter((r) => r.status === "Rejected").length,
    };
  }, [refunds]);

  const filteredRefunds = useMemo(() => {
    if (filter === "all") return refunds;
    return refunds.filter((r) => r.status.toLowerCase() === filter);
  }, [refunds, filter]);

  const openDetails = (refund) => {
    setSelectedRefund(refund);
    setAdminComment(refund?.adminDecision?.reason || "");
  };

  const closeDetails = () => {
    setSelectedRefund(null);
    setAdminComment("");
  };

  const decideRefund = async (status) => {
    if (!selectedRefund?._id) return;

    try {
      setActionLoading(true);
      await api.put(`/refunds/${selectedRefund._id}/decide`, {
        status,
        adminReason: adminComment.trim(),
      });
      await fetchRefunds();
      closeDetails();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to decide refund");
    } finally {
      setActionLoading(false);
    }
  };

  const statusColor = (status) => {
    if (status === "Approved") return { bg: "#DCFCE7", text: "#166534" };
    if (status === "Rejected") return { bg: "#FEE2E2", text: "#991B1B" };
    return { bg: "#FEF3C7", text: "#92400E" };
  };

  const isVideoUrl = (url) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(String(url));
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Refund Disputes</h1>
          <p style={styles.subtitle}>
            Review buyer and seller evidence together
          </p>
        </div>
        <button style={styles.refreshBtn} onClick={fetchRefunds}>
          Refresh
        </button>
      </div>

      {error ? <div style={styles.error}>{error}</div> : null}

      <div style={styles.filters}>
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "approved", label: "Approved" },
          { key: "rejected", label: "Rejected" },
        ].map((item) => (
          <button
            key={item.key}
            style={{
              ...styles.filterBtn,
              ...(filter === item.key ? styles.filterBtnActive : {}),
            }}
            onClick={() => setFilter(item.key)}
          >
            {item.label} ({stats[item.key]})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loading}>Loading refunds...</div>
      ) : filteredRefunds.length === 0 ? (
        <div style={styles.empty}>No refunds in this filter</div>
      ) : (
        <div style={styles.grid}>
          {filteredRefunds.map((refund) => {
            const order = refund.order || {};
            const product = order.product || {};
            const seller = order.seller || {};
            const buyer = refund.buyerId || {};
            const colors = statusColor(refund.status);

            return (
              <div key={refund._id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <div style={styles.name}>{buyer.name || "Buyer"}</div>
                    <div style={styles.email}>{buyer.email || ""}</div>
                  </div>
                  <span
                    style={{
                      ...styles.badge,
                      background: colors.bg,
                      color: colors.text,
                    }}
                  >
                    {refund.status}
                  </span>
                </div>

                <div style={styles.meta}>
                  Order #{String(order._id || "").slice(-6)}
                </div>
                <div style={styles.meta}>Product: {product.name || "N/A"}</div>
                <div style={styles.meta}>Seller: {seller.name || "N/A"}</div>
                <div style={styles.reason}>
                  Reason: {refund.reason || "N/A"}
                </div>

                <button
                  style={styles.openBtn}
                  onClick={() => openDetails(refund)}
                >
                  Open Dispute
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedRefund ? (
        <div
          style={styles.overlay}
          onClick={(e) => e.currentTarget === e.target && closeDetails()}
        >
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Dispute Review</h3>
              <button style={styles.closeBtn} onClick={closeDetails}>
                Close
              </button>
            </div>

            <div style={styles.evidenceLayout}>
              <div style={styles.evidenceCard}>
                <h4 style={styles.evidenceTitle}>Buyer Evidence</h4>
                <p style={styles.evidenceText}>
                  Reason: {selectedRefund.reason || "N/A"}
                </p>
                {selectedRefund.unboxingVideoUrl ? (
                  <>
                    {isVideoUrl(selectedRefund.unboxingVideoUrl) ? (
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
                      style={styles.linkBtn}
                    >
                      Open Unboxing Video
                    </a>
                  </>
                ) : (
                  <p style={styles.muted}>No unboxing video</p>
                )}
              </div>

              <div style={styles.evidenceCard}>
                <h4 style={styles.evidenceTitle}>Seller Evidence</h4>
                <p style={styles.evidenceText}>
                  Packing Proof:{" "}
                  {selectedRefund.order?.packingProofUrl
                    ? "Available"
                    : "Not available"}
                </p>
                {selectedRefund.order?.packingProofUrl ? (
                  <>
                    {isVideoUrl(selectedRefund.order.packingProofUrl) ? (
                      <video
                        controls
                        preload="metadata"
                        style={styles.videoPlayer}
                        src={selectedRefund.order.packingProofUrl}
                      >
                        Your browser does not support this video format.
                      </video>
                    ) : null}
                    <a
                      href={selectedRefund.order.packingProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.linkBtn}
                    >
                      Open Packing Proof
                    </a>
                  </>
                ) : null}

                <p style={styles.evidenceText}>
                  Seller Response:{" "}
                  {selectedRefund.sellerResponse || "No response"}
                </p>
                <p style={styles.evidenceText}>
                  Seller Decision:{" "}
                  {selectedRefund.sellerDecision?.status || "Not decided"}
                </p>
              </div>
            </div>

            <div style={styles.commentWrap}>
              <label style={styles.commentLabel}>
                Admin Comment (optional)
              </label>
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Add your final notes"
                style={styles.textarea}
              />
            </div>

            <div style={styles.actionRow}>
              <button
                style={styles.approveBtn}
                disabled={actionLoading || selectedRefund.status !== "Pending"}
                onClick={() => decideRefund("Approved")}
              >
                {actionLoading ? "Processing..." : "Approve"}
              </button>
              <button
                style={styles.rejectBtn}
                disabled={actionLoading || selectedRefund.status !== "Pending"}
                onClick={() => decideRefund("Rejected")}
              >
                {actionLoading ? "Processing..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const styles = {
  page: {
    padding: "28px 32px 100px",
    minHeight: "100vh",
    background: "#F8FAFC",
    fontFamily: "Inter, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    margin: 0,
    fontSize: 28,
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 0,
    color: "#475569",
  },
  refreshBtn: {
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: 600,
  },
  error: {
    background: "#FEE2E2",
    color: "#991B1B",
    border: "1px solid #FCA5A5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  filters: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  filterBtn: {
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    borderRadius: 999,
    padding: "7px 14px",
    cursor: "pointer",
    fontWeight: 600,
    color: "#334155",
  },
  filterBtnActive: {
    background: "#1D4ED8",
    color: "#FFFFFF",
    border: "1px solid #1D4ED8",
  },
  loading: {
    color: "#64748B",
  },
  empty: {
    color: "#64748B",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 14,
  },
  card: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    padding: 14,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontWeight: 700,
    color: "#111827",
  },
  email: {
    fontSize: 12,
    color: "#64748B",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  meta: {
    fontSize: 13,
    color: "#334155",
    marginBottom: 4,
  },
  reason: {
    color: "#1E293B",
    fontSize: 13,
    margin: "8px 0 10px",
  },
  openBtn: {
    border: "none",
    background: "#1D4ED8",
    color: "#FFFFFF",
    borderRadius: 8,
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 700,
    width: "100%",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    zIndex: 1000,
  },
  modal: {
    width: "100%",
    maxWidth: 980,
    maxHeight: "90vh",
    overflow: "auto",
    background: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    margin: 0,
    color: "#0F172A",
  },
  closeBtn: {
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
  },
  evidenceLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  evidenceCard: {
    border: "1px solid #E2E8F0",
    borderRadius: 10,
    padding: 12,
    background: "#F8FAFC",
  },
  evidenceTitle: {
    marginTop: 0,
    marginBottom: 8,
    color: "#0F172A",
  },
  evidenceText: {
    margin: "0 0 8px",
    color: "#334155",
  },
  muted: {
    margin: 0,
    color: "#64748B",
  },
  linkBtn: {
    display: "inline-block",
    textDecoration: "none",
    background: "#DBEAFE",
    color: "#1E40AF",
    borderRadius: 8,
    padding: "8px 10px",
    fontWeight: 700,
    fontSize: 13,
    marginBottom: 8,
  },
  videoPlayer: {
    width: "100%",
    maxHeight: "300px",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    background: "#000000",
    marginBottom: "8px",
  },
  commentWrap: {
    marginTop: 14,
  },
  commentLabel: {
    display: "block",
    marginBottom: 6,
    color: "#334155",
    fontWeight: 600,
    fontSize: 13,
  },
  textarea: {
    width: "100%",
    minHeight: 90,
    borderRadius: 10,
    border: "1px solid #CBD5E1",
    padding: 10,
    resize: "vertical",
    fontFamily: "Inter, sans-serif",
  },
  actionRow: {
    marginTop: 12,
    display: "flex",
    gap: 8,
  },
  approveBtn: {
    flex: 1,
    border: "none",
    background: "#16A34A",
    color: "#FFFFFF",
    borderRadius: 10,
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 700,
  },
  rejectBtn: {
    flex: 1,
    border: "1px solid #FCA5A5",
    background: "#FFFFFF",
    color: "#B91C1C",
    borderRadius: 10,
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 700,
  },
};

export default Refunds;
