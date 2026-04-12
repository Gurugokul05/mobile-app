import React, { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, Check, X } from "lucide-react";
import api from "../config/api";
import { resolveMediaUrl } from "../utils/media";
import { useToast } from "../components/ToastProvider";

const DOC_KEYS = [
  { key: "idProofUrl", label: "ID" },
  { key: "locationProofUrl", label: "Location" },
  { key: "makingProofUrl", label: "Making" },
];

const extractSellerId = (verif) => {
  const raw = verif?.sellerId;
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw?._id === "string") return raw._id;
  if (typeof raw?.id === "string") return raw.id;
  return "";
};

const Sellers = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("submittedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selected, setSelected] = useState(new Set());
  const [reviewItem, setReviewItem] = useState(null);
  const [decision, setDecision] = useState("approve");
  const [reason, setReason] = useState("");
  const [adminComments, setAdminComments] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  const fetchRows = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/seller/admin/all-verifications");
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load seller queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  useEffect(() => {
    if (!reviewItem) return undefined;
    const onKeyDown = (event) => {
      if (event.key.toLowerCase() === "a") setDecision("approve");
      if (event.key.toLowerCase() === "r") setDecision("reject");
      if (event.key === "Escape") setReviewItem(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reviewItem]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      pending: rows.filter((item) => item?.status === "pending").length,
      approved: rows.filter((item) => item?.status === "approved").length,
      rejected: rows.filter((item) => item?.status === "rejected").length,
    }),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const scoped = filter === "all" ? rows : rows.filter((item) => item?.status === filter);

    return [...scoped].sort((a, b) => {
      const docsA = a?.documents || {};
      const docsB = b?.documents || {};
      const docsScoreA = DOC_KEYS.reduce((acc, item) => acc + (docsA[item.key] ? 1 : 0), 0);
      const docsScoreB = DOC_KEYS.reduce((acc, item) => acc + (docsB[item.key] ? 1 : 0), 0);

      const values = {
        name: [String(a?.sellerName || "").toLowerCase(), String(b?.sellerName || "").toLowerCase()],
        submittedAt: [new Date(a?.submittedAt || 0).getTime(), new Date(b?.submittedAt || 0).getTime()],
        docs: [docsScoreA, docsScoreB],
      };

      const [left, right] = values[sortBy] || values.submittedAt;
      if (left < right) return sortOrder === "asc" ? -1 : 1;
      if (left > right) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filter, rows, sortBy, sortOrder]);

  const selectedRows = filteredRows.filter((item) => selected.has(item?._id));

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(key);
    setSortOrder("asc");
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredRows.length) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(filteredRows.map((item) => item._id)));
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const applyDecision = async (sellerId, status, nextComments, nextReason) => {
    await api.put(`/seller/${sellerId}/verify`, {
      status,
      adminComments: nextComments,
      rejectionReason: nextReason,
    });
  };

  const handleBulkDecision = async (status) => {
    if (!selectedRows.length) return;

    setActionLoading(true);
    try {
      const payloads = selectedRows.map(async (item) => {
        const sellerId = extractSellerId(item);
        if (!sellerId) return;
        await applyDecision(
          sellerId,
          status,
          `Bulk ${status} by admin`,
          status === "rejected" ? "Rejected in bulk action" : "",
        );
      });

      await Promise.all(payloads);
      setSelected(new Set());
      await fetchRows();
      showToast({
        type: status === "approved" ? "success" : "warning",
        title: "Bulk action completed",
        message: `${selectedRows.length} seller records updated`,
      });
    } catch (_err) {
      showToast({ type: "error", title: "Bulk action failed", message: "Could not update all selected records" });
    } finally {
      setActionLoading(false);
    }
  };

  const openReview = (item) => {
    setReviewItem(item);
    setDecision(item?.status === "rejected" ? "reject" : "approve");
    setReason(item?.rejectionReason || "");
    setAdminComments(item?.adminComments || "");
  };

  const submitReview = async () => {
    if (!reviewItem) return;

    const sellerId = extractSellerId(reviewItem);
    if (!sellerId) {
      showToast({ type: "error", title: "Invalid seller", message: "Could not resolve seller id" });
      return;
    }

    const status = decision === "approve" ? "approved" : "rejected";
    setActionLoading(true);
    try {
      await applyDecision(sellerId, status, adminComments, decision === "reject" ? reason : "");
      setReviewItem(null);
      await fetchRows();
      showToast({
        type: status === "approved" ? "success" : "warning",
        title: status === "approved" ? "Seller approved" : "Seller rejected",
        message: `Decision saved for ${reviewItem?.sellerName || "seller"}`,
      });
    } catch (_err) {
      showToast({ type: "error", title: "Save failed", message: "Could not save verification decision" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sellers Queue</h1>
          <p className="page-subtitle">Review seller onboarding verifications and supporting documents</p>
        </div>
        <button type="button" className="btn" onClick={fetchRows}>Refresh</button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="tabs-row">
        {["all", "pending", "approved", "rejected"].map((item) => (
          <button
            key={item}
            type="button"
            className={`tab-btn ${filter === item ? "active" : ""}`}
            onClick={() => setFilter(item)}
          >
            {item[0].toUpperCase() + item.slice(1)}
            <span className="tab-count">{counts[item]}</span>
          </button>
        ))}
      </div>

      {selected.size > 0 ? (
        <div className="bulk-bar">
          <strong>{selected.size} selected</strong>
          <div className="bulk-actions">
            <button
              type="button"
              className="btn btn-success"
              title="Approve selected (A)"
              disabled={actionLoading}
              onClick={() => handleBulkDecision("approved")}
            >
              <Check size={15} /> Approve Selected
            </button>
            <button
              type="button"
              className="btn btn-danger"
              title="Reject selected (R)"
              disabled={actionLoading}
              onClick={() => handleBulkDecision("rejected")}
            >
              <X size={15} /> Reject Selected
            </button>
          </div>
        </div>
      ) : null}

      <div className="table-wrap">
        {loading ? (
          <div className="queue-skeleton">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="skeleton-row" />
            ))}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={filteredRows.length > 0 && selected.size === filteredRows.length}
                    onChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th>
                  <button type="button" className="sort-btn" onClick={() => toggleSort("name")}>
                    Name <ArrowDownUp size={13} />
                  </button>
                </th>
                <th>
                  <button type="button" className="sort-btn" onClick={() => toggleSort("submittedAt")}>
                    Submitted <ArrowDownUp size={13} />
                  </button>
                </th>
                <th>
                  <button type="button" className="sort-btn" onClick={() => toggleSort("docs")}>
                    Doc Status <ArrowDownUp size={13} />
                  </button>
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((item) => {
                const docs = item?.documents || {};
                return (
                  <tr key={item._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(item._id)}
                        onChange={() => toggleSelect(item._id)}
                        aria-label="Select seller"
                      />
                    </td>
                    <td>
                      <strong>{item?.sellerName || "Unknown"}</strong>
                      <div className="page-subtitle">{item?.sellerEmail || "No email"}</div>
                    </td>
                    <td>
                      {new Date(item?.submittedAt || Date.now()).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <div className="doc-pill-row">
                        {DOC_KEYS.map((doc) => {
                          const uploaded = Boolean(docs[doc.key]);
                          return (
                            <span
                              key={doc.key}
                              className={`doc-pill ${uploaded ? "status-success" : "status-warning"}`}
                            >
                              {doc.label}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          item?.status === "approved"
                            ? "status-success"
                            : item?.status === "rejected"
                              ? "status-danger"
                              : "status-warning"
                        }`}
                      >
                        {item?.status || "pending"}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="btn btn-primary" onClick={() => openReview(item)}>
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {reviewItem ? (
        <div className="modal-overlay" onClick={(event) => event.currentTarget === event.target && setReviewItem(null)}>
          <div className="modal-card">
            <div className="modal-head">
              <div>
                <h3 className="page-title">Seller Verification Review</h3>
                <p className="page-subtitle">A=approve, R=reject</p>
              </div>
              <button type="button" className="btn" onClick={() => setReviewItem(null)}>Close</button>
            </div>

            <div className="modal-grid">
              <section>
                <h4 className="modal-section-title">{reviewItem?.sellerName || "Seller"}</h4>
                <p className="page-subtitle">{reviewItem?.sellerEmail || "No email"}</p>
                <div className="doc-preview-grid">
                  {DOC_KEYS.map((doc) => {
                    const url = reviewItem?.documents?.[doc.key];
                    return (
                      <div key={doc.key} className="doc-preview">
                        <strong>{doc.label}</strong>
                        {url ? (
                          <>
                            <img src={resolveMediaUrl(url)} alt={doc.label} />
                            <a href={resolveMediaUrl(url)} target="_blank" rel="noreferrer">
                              Open full document
                            </a>
                          </>
                        ) : (
                          <p className="page-subtitle">Document missing</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <label className="field-label">Decision</label>
                <div className="decision-row">
                  <label className="decision-option" title="Approve (A)">
                    <input
                      type="radio"
                      name="decision"
                      checked={decision === "approve"}
                      onChange={() => setDecision("approve")}
                    />
                    Approve
                  </label>
                  <label className="decision-option" title="Reject (R)">
                    <input
                      type="radio"
                      name="decision"
                      checked={decision === "reject"}
                      onChange={() => setDecision("reject")}
                    />
                    Reject
                  </label>
                </div>

                {decision === "reject" ? (
                  <>
                    <label className="field-label">Rejection Reason</label>
                    <textarea
                      className="text-area"
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder="Describe why verification is rejected"
                    />
                  </>
                ) : null}

                <label className="field-label">Admin Notes</label>
                <textarea
                  className="text-area"
                  value={adminComments}
                  onChange={(event) => setAdminComments(event.target.value)}
                  placeholder="Internal comments"
                />

                <div className="bulk-actions section-gap-top">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={actionLoading || (decision === "reject" && !reason.trim())}
                    onClick={submitReview}
                  >
                    {actionLoading ? "Saving..." : "Save Decision"}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Sellers;
