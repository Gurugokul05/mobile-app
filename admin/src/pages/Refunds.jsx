import React, { useEffect, useMemo, useState } from "react";
import api from "../config/api";
import { resolveMediaUrl } from "../utils/media";
import { useToast } from "../components/ToastProvider";

const Refunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState("");
  const [decisionNotes, setDecisionNotes] = useState({});
  const [actionLoading, setActionLoading] = useState("");
  const { showToast } = useToast();

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

  const stats = useMemo(
    () => ({
      pending: refunds.filter((item) => item?.status === "Pending").length,
      approved: refunds.filter((item) => item?.status === "Approved").length,
      rejected: refunds.filter((item) => item?.status === "Rejected").length,
    }),
    [refunds],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return refunds;
    return refunds.filter(
      (item) => String(item?.status || "").toLowerCase() === filter,
    );
  }, [refunds, filter]);

  const decide = async (refundId, status) => {
    const key = `${refundId}:${status}`;
    setActionLoading(key);
    const note = decisionNotes[refundId] || "";
    try {
      await api.put(`/refunds/${refundId}/decide`, {
        status,
        adminReason: note,
      });
      await fetchRefunds();
      showToast({
        type: status === "Approved" ? "success" : "warning",
        title: `Refund ${status.toLowerCase()}`,
        message: "Decision saved",
      });
    } catch (_err) {
      showToast({
        type: "error",
        title: "Decision failed",
        message: "Could not save refund decision",
      });
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Refunds</h1>
          <p className="page-subtitle">Evidence-first dispute resolution</p>
        </div>
        <button type="button" className="btn" onClick={fetchRefunds}>
          Refresh
        </button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="summary-cards">
        <div className="card metric-card">
          <div className="metric-label">Total Pending</div>
          <h2 className="metric-value">{stats.pending}</h2>
        </div>
        <div className="card metric-card">
          <div className="metric-label">Total Approved</div>
          <h2 className="metric-value">{stats.approved}</h2>
        </div>
        <div className="card metric-card">
          <div className="metric-label">Total Rejected</div>
          <h2 className="metric-value">{stats.rejected}</h2>
        </div>
      </div>

      <div className="tabs-row">
        {["all", "pending", "approved", "rejected"].map((item) => (
          <button
            key={item}
            type="button"
            className={`tab-btn ${filter === item ? "active" : ""}`}
            onClick={() => setFilter(item)}
          >
            {item[0].toUpperCase() + item.slice(1)}
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
                <th>Buyer</th>
                <th>Order</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const expanded = expandedId === item._id;
                return (
                  <React.Fragment key={item._id}>
                    <tr>
                      <td>
                        <strong>{item?.buyerId?.name || "Buyer"}</strong>
                        <div className="page-subtitle">
                          {item?.buyerId?.email || "No email"}
                        </div>
                      </td>
                      <td>{String(item?.order?._id || "").slice(-8)}</td>
                      <td>{item?.reason || "N/A"}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            item?.status === "Approved"
                              ? "status-success"
                              : item?.status === "Rejected"
                                ? "status-danger"
                                : "status-warning"
                          }`}
                        >
                          {item?.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() =>
                            setExpandedId(expanded ? "" : item._id)
                          }
                        >
                          {expanded ? "Hide" : "Review"}
                        </button>
                      </td>
                    </tr>
                    {expanded ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="evidence-grid">
                            <section className="evidence-card">
                              <h4 className="modal-section-title">
                                Buyer Claim
                              </h4>
                              <p>{item?.reason || "No claim text"}</p>
                              {item?.unboxingVideoUrl ? (
                                <a
                                  href={resolveMediaUrl(item.unboxingVideoUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Open buyer evidence
                                </a>
                              ) : (
                                <p className="page-subtitle">
                                  No buyer evidence link
                                </p>
                              )}
                            </section>

                            <section className="evidence-card">
                              <h4 className="modal-section-title">
                                Seller Response
                              </h4>
                              <p>
                                {item?.sellerResponse || "No seller response"}
                              </p>
                              {item?.order?.packingProofUrl ? (
                                <a
                                  href={resolveMediaUrl(
                                    item.order.packingProofUrl,
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Open seller proof
                                </a>
                              ) : (
                                <p className="page-subtitle">
                                  No seller proof link
                                </p>
                              )}
                            </section>
                          </div>

                          <div className="section-gap-top">
                            <label className="field-label">
                              Decision Notes
                            </label>
                            <textarea
                              className="text-area"
                              value={decisionNotes[item._id] || ""}
                              onChange={(event) =>
                                setDecisionNotes((prev) => ({
                                  ...prev,
                                  [item._id]: event.target.value,
                                }))
                              }
                              placeholder="Add reason for final decision"
                            />

                            <div className="bulk-actions section-gap-top">
                              <button
                                type="button"
                                className="btn btn-success"
                                title="Approve (A)"
                                disabled={
                                  actionLoading === `${item._id}:Approved`
                                }
                                onClick={() => decide(item._id, "Approved")}
                              >
                                {actionLoading === `${item._id}:Approved`
                                  ? "Saving..."
                                  : "Approve"}
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger"
                                title="Reject (R)"
                                disabled={
                                  actionLoading === `${item._id}:Rejected`
                                }
                                onClick={() => decide(item._id, "Rejected")}
                              >
                                {actionLoading === `${item._id}:Rejected`
                                  ? "Saving..."
                                  : "Reject"}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Refunds;
