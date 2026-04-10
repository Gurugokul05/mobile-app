import React, { useState, useEffect } from "react";
import api from "../config/api";

const Sellers = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVerif, setSelectedVerif] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminComments, setAdminComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const PAGE_SIZE = 8;

  const matchesFilter = (v) => {
    if (filter === "pending") return v.status === "pending";
    if (filter === "approved") return v.status === "approved";
    if (filter === "rejected") return v.status === "rejected";
    if (filter === "missingDocs") {
      const d = v.documents || {};
      return !d.idProofUrl || !d.locationProofUrl || !d.makingProofUrl;
    }
    return true;
  };

  const filtered = verifications.filter(matchesFilter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const statusCounts = {
    all: verifications.length,
    pending: verifications.filter((v) => v.status === "pending").length,
    approved: verifications.filter((v) => v.status === "approved").length,
    rejected: verifications.filter((v) => v.status === "rejected").length,
    missingDocs: verifications.filter((v) => {
      const d = v.documents || {};
      return !d.idProofUrl || !d.locationProofUrl || !d.makingProofUrl;
    }).length,
  };

  const fetchVerifications = async () => {
    try {
      setError("");
      setLoading(true);
      const { data } = await api.get("/seller/admin/all-verifications");
      setVerifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load seller verifications. Check backend server.",
      );
    } finally {
      setLoading(false);
    }
  };

  const openDetailsModal = (verif) => {
    setSelectedVerif(verif);
    setShowModal(true);
    setAdminComments(verif.adminComments || "");
    setRejectionReason(verif.rejectionReason || "");
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVerif(null);
    setAdminComments("");
    setRejectionReason("");
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const extractSellerId = (verif) => {
    const raw = verif?.sellerId;
    if (!raw) return "";

    if (typeof raw === "string") return raw;
    if (typeof raw?._id === "string") return raw._id;
    if (typeof raw?.id === "string") return raw.id;

    // Handles Mongo ObjectId-like values that expose toString().
    if (raw?._id && typeof raw._id?.toString === "function") {
      const id = raw._id.toString();
      return id === "[object Object]" ? "" : id;
    }
    if (typeof raw?.toString === "function") {
      const id = raw.toString();
      return id === "[object Object]" ? "" : id;
    }

    return "";
  };

  const handleVerify = async (status, comments = "", reason = "") => {
    if (!selectedVerif) return;
    const sellerId = extractSellerId(selectedVerif);
    if (!sellerId) {
      setError("Seller ID not found. Try refreshing the page.");
      return;
    }
    try {
      setActionLoading(true);
      await api.put(`/seller/${String(sellerId)}/verify`, {
        status,
        adminComments: comments,
        rejectionReason: reason,
      });
      await fetchVerifications();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const filterTabs = [
    { key: "all", label: "All", icon: "📋" },
    { key: "pending", label: "Pending", icon: "⏳" },
    { key: "approved", label: "Approved", icon: "✓" },
    { key: "rejected", label: "Rejected", icon: "✕" },
    { key: "missingDocs", label: "Missing Docs", icon: "⚠" },
  ];

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading seller verifications…</p>
      </div>
    );
  }

  /* ─── Main render ─── */
  return (
    <div style={styles.page}>
      <style>{cssAnimations}</style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Seller Verification</h1>
          <p style={styles.subtitle}>
            {verifications.length} seller{verifications.length !== 1 && "s"}{" "}
            submitted for review
          </p>
        </div>
        <button style={styles.refreshBtn} onClick={fetchVerifications}>
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
        {filterTabs.map((tab) => (
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
            <span style={styles.filterBadge}>{statusCounts[tab.key]}</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {pageItems.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>📭</span>
          <p style={styles.emptyText}>No sellers match this filter.</p>
        </div>
      ) : (
        <div style={styles.cardsGrid}>
          {pageItems.map((v, i) => {
            const docs = v.documents || {};
            const pending = v.status === "pending";
            return (
              <div
                key={v._id}
                style={{
                  ...styles.card,
                  borderLeft: pending
                    ? "4px solid #F59E0B"
                    : v.status === "approved"
                      ? "4px solid #16A34A"
                      : "4px solid #DC2626",
                  animationDelay: `${i * 40}ms`,
                }}
                className="seller-card"
              >
                <div style={styles.cardTop}>
                  <div style={styles.cardAvatar}>
                    {(v.sellerName || "?")[0].toUpperCase()}
                  </div>
                  <div style={styles.cardInfo}>
                    <span style={styles.cardName}>{v.sellerName}</span>
                    <span style={styles.cardEmail}>{v.sellerEmail}</span>
                  </div>
                  <span
                    style={{
                      ...styles.cardStatus,
                      background: pending
                        ? "#FEF3C7"
                        : v.status === "approved"
                          ? "#DCFCE7"
                          : "#FEE2E2",
                      color: pending
                        ? "#92400E"
                        : v.status === "approved"
                          ? "#15803D"
                          : "#B91C1C",
                    }}
                  >
                    {pending
                      ? "⏳ Pending"
                      : v.status === "approved"
                        ? "✓ Approved"
                        : "✕ Rejected"}
                  </span>
                </div>

                <div style={styles.cardMeta}>
                  {v.sellerPhone && (
                    <span style={styles.metaItem}>📞 {v.sellerPhone}</span>
                  )}
                  {v.sellerLocation && (
                    <span style={styles.metaItem}>📍 {v.sellerLocation}</span>
                  )}
                  <span style={styles.metaItem}>
                    📅{" "}
                    {new Date(v.submittedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div style={styles.cardDocs}>
                  {docs.idProofUrl && (
                    <a
                      href={docs.idProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.docChip}
                    >
                      ID Proof
                    </a>
                  )}
                  {docs.locationProofUrl && (
                    <a
                      href={docs.locationProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.docChip}
                    >
                      Location Proof
                    </a>
                  )}
                  {docs.makingProofUrl && (
                    <a
                      href={docs.makingProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.docChip}
                    >
                      Making Proof
                    </a>
                  )}
                  {(!docs.idProofUrl ||
                    !docs.locationProofUrl ||
                    !docs.makingProofUrl) && (
                    <span style={styles.missingChip}>Incomplete documents</span>
                  )}
                </div>

                <button
                  style={{
                    ...styles.reviewBtn,
                    background: pending ? "#4F46E5" : "#6B7280",
                  }}
                  onClick={() => openDetailsModal(v)}
                >
                  {pending ? "Review →" : "View Details →"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <span style={styles.pageInfo}>
            Showing {startIndex + 1}–
            {Math.min(startIndex + PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <div style={styles.pageBtns}>
            <button
              disabled={safePage <= 1}
              style={{ ...styles.pageBtn, opacity: safePage <= 1 ? 0.4 : 1 }}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ← Prev
            </button>
            <span style={styles.pageNum}>
              {safePage} / {totalPages}
            </span>
            <button
              disabled={safePage >= totalPages}
              style={{
                ...styles.pageBtn,
                opacity: safePage >= totalPages ? 0.4 : 1,
              }}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ─── Modal ─── */}
      {showModal && selectedVerif && (
        <div
          style={styles.overlay}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div style={styles.modal}>
            {/* Modal header */}
            <div style={styles.modalHeader}>
              <div style={styles.modalIdentity}>
                <div style={styles.modalAvatar}>
                  {(selectedVerif.sellerName || "?")[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={styles.modalTitle}>{selectedVerif.sellerName}</h3>
                  <p style={styles.modalSubtitle}>
                    {selectedVerif.sellerEmail}
                  </p>
                </div>
              </div>
              <button style={styles.modalClose} onClick={closeModal}>
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Info grid */}
              <div style={styles.infoGrid}>
                {selectedVerif.sellerPhone && (
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Phone</span>
                    <span style={styles.infoValue}>
                      {selectedVerif.sellerPhone}
                    </span>
                  </div>
                )}
                {selectedVerif.sellerLocation && (
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Location</span>
                    <span style={styles.infoValue}>
                      {selectedVerif.sellerLocation}
                    </span>
                  </div>
                )}
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Submitted</span>
                  <span style={styles.infoValue}>
                    {new Date(selectedVerif.submittedAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </span>
                </div>
                {selectedVerif.reviewedAt && (
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Reviewed</span>
                    <span style={styles.infoValue}>
                      {new Date(selectedVerif.reviewedAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                )}
                {selectedVerif.sellerId?.yearsInBusiness && (
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Years in business</span>
                    <span style={styles.infoValue}>
                      {selectedVerif.sellerId.yearsInBusiness}
                    </span>
                  </div>
                )}
                {selectedVerif.sellerId?.specialties?.length > 0 && (
                  <div style={styles.infoItemFull}>
                    <span style={styles.infoLabel}>Specialties</span>
                    <div style={styles.specialtyTags}>
                      {selectedVerif.sellerId.specialties.map((s) => (
                        <span key={s} style={styles.specialtyTag}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Documents</h4>
                <div style={styles.docsRow}>
                  {[
                    {
                      label: "ID Proof",
                      url: selectedVerif.documents?.idProofUrl,
                    },
                    {
                      label: "Location Proof",
                      url: selectedVerif.documents?.locationProofUrl,
                    },
                    {
                      label: "Making Proof",
                      url: selectedVerif.documents?.makingProofUrl,
                    },
                  ].map(({ label, url }) => (
                    <a
                      key={label}
                      href={url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      style={url ? styles.docCard : styles.docCardMissing}
                      onClick={(e) => !url && e.preventDefault()}
                    >
                      <span style={styles.docIcon}>{url ? "📄" : "✗"}</span>
                      <span>{label}</span>
                    </a>
                  ))}
                </div>
              </div>

              {selectedVerif.documents?.makingProofUrl && (
                <div style={styles.section}>
                  <h4 style={styles.sectionTitle}>Making Proof Video</h4>
                  <video
                    controls
                    preload="metadata"
                    style={styles.videoPlayer}
                    src={selectedVerif.documents.makingProofUrl}
                  >
                    Your browser does not support this video format.
                  </video>
                  <a
                    href={selectedVerif.documents.makingProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.videoLink}
                  >
                    Open video in new tab
                  </a>
                </div>
              )}

              {/* Past decision */}
              {selectedVerif.status !== "pending" && (
                <>
                  {selectedVerif.adminComments && (
                    <div style={styles.section}>
                      <h4 style={styles.sectionTitle}>Admin Comments</h4>
                      <p style={styles.pastComment}>
                        {selectedVerif.adminComments}
                      </p>
                    </div>
                  )}
                  {selectedVerif.rejectionReason && (
                    <div style={styles.section}>
                      <h4 style={styles.sectionTitle}>Rejection Reason</h4>
                      <p style={{ ...styles.pastComment, color: "#DC2626" }}>
                        {selectedVerif.rejectionReason}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Review actions (only for pending) */}
              {selectedVerif.status === "pending" && (
                <div style={styles.section}>
                  <h4 style={styles.sectionTitle}>Your Review</h4>
                  <label style={styles.fieldLabel}>Comments (optional)</label>
                  <textarea
                    style={styles.textarea}
                    value={adminComments}
                    onChange={(e) => setAdminComments(e.target.value)}
                    placeholder="Notes about this seller…"
                  />
                  <label style={styles.fieldLabel}>
                    Rejection reason (required if rejecting)
                  </label>
                  <textarea
                    style={styles.textarea}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why the seller is rejected…"
                  />
                </div>
              )}
            </div>

            {/* Action buttons - kept outside scrollable body */}
            {selectedVerif.status === "pending" && (
              <div style={styles.actionRow}>
                <button
                  style={styles.btnApprove}
                  disabled={actionLoading}
                  onClick={() => handleVerify("approved", adminComments)}
                >
                  {actionLoading ? "Processing…" : "✓ Approve"}
                </button>
                <button
                  style={styles.btnReject}
                  disabled={actionLoading}
                  onClick={() =>
                    handleVerify("rejected", adminComments, rejectionReason)
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
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .seller-card {
    animation: fadeInUp 0.3s ease both;
  }
  .seller-card:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    transform: translateY(-1px);
  }
  textarea:focus {
    border-color: #4F46E5 !important;
    box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
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
    transition: "all 0.15s",
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

  /* Filter row */
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
    transition: "all 0.15s",
    whiteSpace: "nowrap",
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
    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
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
  cardMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    fontSize: "13px",
    color: "#4B5563",
  },
  metaItem: { display: "flex", alignItems: "center", gap: "4px" },
  cardDocs: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  docChip: {
    background: "#EEF2FF",
    color: "#4F46E5",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    textDecoration: "none",
    transition: "background 0.15s",
  },
  missingChip: {
    background: "#FEF2F2",
    color: "#B91C1C",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
  },
  reviewBtn: {
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "center",
    transition: "background 0.15s",
  },

  /* Empty */
  emptyState: {
    textAlign: "center",
    padding: "64px 24px",
  },
  emptyIcon: { fontSize: "48px" },
  emptyText: {
    fontSize: "16px",
    color: "#6B7280",
    marginTop: "8px",
  },

  /* Pagination */
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
  },
  pageInfo: {
    fontSize: "13px",
    color: "#6B7280",
  },
  pageBtns: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  pageBtn: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    cursor: "pointer",
  },
  pageNum: {
    fontSize: "13px",
    color: "#6B7280",
    minWidth: "48px",
    textAlign: "center",
    fontWeight: "500",
  },

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
    maxWidth: "920px",
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
    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
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
  infoItemFull: {
    background: "#F9FAFB",
    borderRadius: "8px",
    padding: "10px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    gridColumn: "1 / -1",
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
  specialtyTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  specialtyTag: {
    background: "#EEF2FF",
    color: "#4F46E5",
    padding: "3px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
  },

  /* Documents */
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
  videoPlayer: {
    width: "100%",
    maxHeight: "560px",
    minHeight: "320px",
    aspectRatio: "16 / 9",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    background: "#000",
  },
  videoLink: {
    marginTop: "8px",
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "8px",
    background: "#EEF2FF",
    color: "#3730A3",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
  },
  docsRow: {
    display: "flex",
    gap: "10px",
  },
  docCard: {
    flex: 1,
    background: "#EEF2FF",
    color: "#4F46E5",
    borderRadius: "10px",
    padding: "14px 10px",
    textDecoration: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    fontWeight: "600",
    transition: "background 0.15s",
  },
  docCardMissing: {
    flex: 1,
    background: "#FEF2F2",
    color: "#B91C1C",
    borderRadius: "10px",
    padding: "14px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "default",
    textDecoration: "none",
  },
  docIcon: { fontSize: "24px" },

  /* Past comments */
  pastComment: {
    background: "#F9FAFB",
    borderRadius: "8px",
    padding: "12px 14px",
    fontSize: "13px",
    color: "#374151",
    lineHeight: 1.5,
    margin: 0,
  },

  /* Textarea */
  fieldLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#374151",
  },
  textarea: {
    width: "100%",
    minHeight: "72px",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    fontSize: "13px",
    color: "#111827",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    marginBottom: "10px",
    transition: "border-color 0.15s, box-shadow 0.15s",
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
    transition: "background 0.15s",
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
    transition: "background 0.15s",
  },
};

export default Sellers;
