import React, { useEffect, useMemo, useState } from "react";
import api from "../config/api";

const STATUS_LABELS = {
  uploaded: "Uploaded",
  not_verified: "Not Verified",
  verified: "Approved",
  rejected: "Rejected",
};

const statusColor = (status) => {
  if (status === "verified") {
    return { background: "#DCFCE7", color: "#166534" };
  }
  if (status === "rejected") {
    return { background: "#FEE2E2", color: "#991B1B" };
  }
  if (status === "uploaded") {
    return { background: "#FEF3C7", color: "#92400E" };
  }
  return { background: "#E5E7EB", color: "#374151" };
};

const docReadyForReview = (doc) => Boolean(doc?.url);

const ComplianceVerifications = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchRecords = async () => {
    try {
      setError("");
      setLoading(true);
      const { data } = await api.get("/seller/admin/compliance-verifications");
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load compliance verifications.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    if (filter === "ready") {
      return records.filter(
        (record) =>
          docReadyForReview(record?.gstCertificate) ||
          docReadyForReview(record?.businessLicense),
      );
    }
    if (filter === "uploaded") {
      return records.filter(
        (item) =>
          item?.gstCertificate?.status === "uploaded" ||
          item?.businessLicense?.status === "uploaded",
      );
    }
    if (filter === "rejected") {
      return records.filter(
        (item) =>
          item?.gstCertificate?.status === "rejected" ||
          item?.businessLicense?.status === "rejected",
      );
    }
    return records;
  }, [filter, records]);

  const handleDecision = async (sellerId, docType, status) => {
    if (!sellerId) return;

    const adminComments =
      status === "approved"
        ? "Compliance documents reviewed and approved"
        : "Compliance documents reviewed";

    const rejectionReason =
      status === "rejected"
        ? window.prompt("Enter rejection reason", "Document mismatch") ||
          "Document mismatch"
        : "";

    try {
      setActionLoadingId(String(sellerId));
      await api.put(`/seller/${sellerId}/compliance/verify`, {
        docType,
        status,
        adminComments,
        rejectionReason,
      });
      await fetchRecords();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update verification status.",
      );
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) {
    return (
      <div style={styles.pageCenter}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading compliance verifications...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Compliance Verification</h1>
          <p style={styles.subtitle}>
            Review GST Certificate and Business License submissions
          </p>
        </div>
        <button style={styles.refreshBtn} onClick={fetchRecords}>
          Refresh
        </button>
      </div>

      {error ? <div style={styles.errorBanner}>⚠ {error}</div> : null}

      <div style={styles.filterRow}>
        {[
          { key: "all", label: `All (${records.length})` },
          {
            key: "ready",
            label: `Ready (${records.filter((item) => docReadyForReview(item?.gstCertificate) || docReadyForReview(item?.businessLicense)).length})`,
          },
          {
            key: "uploaded",
            label: `Uploaded (${records.filter((item) => item?.gstCertificate?.status === "uploaded" || item?.businessLicense?.status === "uploaded").length})`,
          },
          {
            key: "rejected",
            label: `Rejected (${records.filter((item) => item?.gstCertificate?.status === "rejected" || item?.businessLicense?.status === "rejected").length})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            style={{
              ...styles.filterTab,
              ...(filter === tab.key ? styles.filterTabActive : {}),
            }}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredRecords.length === 0 ? (
        <div style={styles.emptyState}>No compliance submissions found.</div>
      ) : (
        <div style={styles.grid}>
          {filteredRecords.map((record) => {
            const gstStyle = statusColor(record?.gstCertificate?.status);
            const bizStyle = statusColor(record?.businessLicense?.status);
            const canReviewGst = docReadyForReview(record?.gstCertificate);
            const canReviewBiz = docReadyForReview(record?.businessLicense);
            const busy = actionLoadingId === String(record.sellerId);

            return (
              <div key={record.sellerId} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <div style={styles.sellerName}>{record.sellerName}</div>
                    <div style={styles.sellerMeta}>{record.sellerEmail}</div>
                    {record.sellerLocation ? (
                      <div style={styles.sellerMeta}>
                        📍 {record.sellerLocation}
                      </div>
                    ) : null}
                  </div>
                  <div style={styles.verificationBadge}>
                    {record.isVerified ? "Verified Seller" : "Pending Seller"}
                  </div>
                </div>

                <div style={styles.docRow}>
                  <div style={styles.docBlock}>
                    <div style={styles.docLabel}>GST Certificate</div>
                    <span style={{ ...styles.statusPill, ...gstStyle }}>
                      {STATUS_LABELS[record?.gstCertificate?.status] ||
                        "Not Verified"}
                    </span>
                    {record?.gstCertificate?.url ? (
                      <a
                        href={record.gstCertificate.url}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.docLink}
                      >
                        Open GST
                      </a>
                    ) : (
                      <span style={styles.missingText}>Not uploaded</span>
                    )}
                    {record?.gstCertificate?.rejectionReason ? (
                      <div style={styles.rejectText}>
                        {record.gstCertificate.rejectionReason}
                      </div>
                    ) : null}
                    <div style={styles.docActions}>
                      <button
                        style={{
                          ...styles.docApproveBtn,
                          opacity: canReviewGst && !busy ? 1 : 0.5,
                        }}
                        disabled={!canReviewGst || busy}
                        onClick={() =>
                          handleDecision(
                            record.sellerId,
                            "gstCertificate",
                            "approved",
                          )
                        }
                      >
                        Approve GST
                      </button>
                      <button
                        style={{
                          ...styles.docRejectBtn,
                          opacity: canReviewGst && !busy ? 1 : 0.5,
                        }}
                        disabled={!canReviewGst || busy}
                        onClick={() =>
                          handleDecision(
                            record.sellerId,
                            "gstCertificate",
                            "rejected",
                          )
                        }
                      >
                        Reject GST
                      </button>
                    </div>
                  </div>

                  <div style={styles.docBlock}>
                    <div style={styles.docLabel}>Business License</div>
                    <span style={{ ...styles.statusPill, ...bizStyle }}>
                      {STATUS_LABELS[record?.businessLicense?.status] ||
                        "Not Verified"}
                    </span>
                    {record?.businessLicense?.url ? (
                      <a
                        href={record.businessLicense.url}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.docLink}
                      >
                        Open License
                      </a>
                    ) : (
                      <span style={styles.missingText}>Not uploaded</span>
                    )}
                    {record?.businessLicense?.rejectionReason ? (
                      <div style={styles.rejectText}>
                        {record.businessLicense.rejectionReason}
                      </div>
                    ) : null}
                    <div style={styles.docActions}>
                      <button
                        style={{
                          ...styles.docApproveBtn,
                          opacity: canReviewBiz && !busy ? 1 : 0.5,
                        }}
                        disabled={!canReviewBiz || busy}
                        onClick={() =>
                          handleDecision(
                            record.sellerId,
                            "businessLicense",
                            "approved",
                          )
                        }
                      >
                        Approve License
                      </button>
                      <button
                        style={{
                          ...styles.docRejectBtn,
                          opacity: canReviewBiz && !busy ? 1 : 0.5,
                        }}
                        disabled={!canReviewBiz || busy}
                        onClick={() =>
                          handleDecision(
                            record.sellerId,
                            "businessLicense",
                            "rejected",
                          )
                        }
                      >
                        Reject License
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    padding: "28px",
    background: "#F8FAFC",
  },
  pageCenter: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    background: "#F8FAFC",
  },
  spinner: {
    width: "30px",
    height: "30px",
    borderRadius: "999px",
    border: "3px solid #D1D5DB",
    borderTopColor: "#4F46E5",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    marginTop: "10px",
    color: "#4B5563",
    fontSize: "14px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    color: "#111827",
  },
  subtitle: {
    margin: "6px 0 0",
    fontSize: "14px",
    color: "#6B7280",
  },
  refreshBtn: {
    border: "1px solid #D1D5DB",
    background: "#FFFFFF",
    borderRadius: "10px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 600,
  },
  errorBanner: {
    marginBottom: "12px",
    border: "1px solid #FCA5A5",
    background: "#FEF2F2",
    color: "#991B1B",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "13px",
  },
  filterRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "14px",
  },
  filterTab: {
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    borderRadius: "999px",
    padding: "8px 12px",
    fontSize: "12px",
    cursor: "pointer",
    color: "#374151",
    fontWeight: 600,
  },
  filterTabActive: {
    borderColor: "#4F46E5",
    background: "#EEF2FF",
    color: "#3730A3",
  },
  emptyState: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "12px",
    padding: "22px",
    color: "#6B7280",
    fontSize: "14px",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "14px",
  },
  card: {
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    borderRadius: "14px",
    padding: "14px",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    gap: "10px",
    marginBottom: "12px",
  },
  sellerName: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#111827",
  },
  sellerMeta: {
    fontSize: "12px",
    color: "#6B7280",
    marginTop: "3px",
  },
  verificationBadge: {
    borderRadius: "999px",
    padding: "5px 9px",
    fontSize: "11px",
    background: "#EEF2FF",
    color: "#4338CA",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  docRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  docBlock: {
    border: "1px solid #E5E7EB",
    borderRadius: "10px",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  docLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#111827",
  },
  statusPill: {
    fontSize: "11px",
    fontWeight: 700,
    borderRadius: "999px",
    padding: "4px 8px",
    width: "fit-content",
  },
  docLink: {
    color: "#2563EB",
    fontSize: "12px",
    textDecoration: "none",
    fontWeight: 600,
  },
  missingText: {
    color: "#9CA3AF",
    fontSize: "12px",
  },
  rejectText: {
    color: "#B91C1C",
    fontSize: "11px",
    lineHeight: 1.35,
  },
  actions: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
  },
  docActions: {
    marginTop: "4px",
    display: "flex",
    gap: "6px",
  },
  docApproveBtn: {
    flex: 1,
    border: "none",
    borderRadius: "8px",
    padding: "8px",
    background: "#16A34A",
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: "11px",
    cursor: "pointer",
  },
  docRejectBtn: {
    flex: 1,
    border: "1px solid #FCA5A5",
    borderRadius: "8px",
    padding: "8px",
    background: "#FFFFFF",
    color: "#DC2626",
    fontWeight: 700,
    fontSize: "11px",
    cursor: "pointer",
  },
  approveBtn: {
    flex: 1,
    border: "none",
    borderRadius: "10px",
    padding: "10px",
    background: "#16A34A",
    color: "#FFFFFF",
    fontWeight: 700,
    cursor: "pointer",
  },
  rejectBtn: {
    flex: 1,
    border: "1px solid #FCA5A5",
    borderRadius: "10px",
    padding: "10px",
    background: "#FFFFFF",
    color: "#DC2626",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default ComplianceVerifications;
