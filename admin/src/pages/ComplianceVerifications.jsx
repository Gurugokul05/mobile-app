import React, { useEffect, useMemo, useState } from "react";
import api from "../config/api";
import { resolveMediaUrl } from "../utils/media";
import { useToast } from "../components/ToastProvider";

const ComplianceVerifications = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [busyKey, setBusyKey] = useState("");
  const { showToast } = useToast();

  const fetchRecords = async () => {
    try {
      setError("");
      setLoading(true);
      const { data } = await api.get("/seller/admin/compliance-verifications");
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load compliance queue",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return records;
    return records.filter((record) => {
      const docs = record?.complianceDocs || {};
      if (filter === "uploaded") {
        return (
          docs?.gstCertificate?.status === "uploaded" ||
          docs?.businessLicense?.status === "uploaded"
        );
      }
      if (filter === "verified") {
        return (
          docs?.gstCertificate?.status === "verified" ||
          docs?.businessLicense?.status === "verified"
        );
      }
      return (
        docs?.gstCertificate?.status === "rejected" ||
        docs?.businessLicense?.status === "rejected"
      );
    });
  }, [records, filter]);

  const doDecision = async (record, docType, status) => {
    const sellerId = String(record?.sellerId || record?._id || "");
    if (!sellerId) return;

    const key = `${sellerId}:${docType}:${status}`;
    setBusyKey(key);
    try {
      await api.put(`/seller/${sellerId}/compliance/verify`, {
        docType,
        status,
        adminComments: `Compliance ${status} by admin`,
        rejectionReason:
          status === "rejected"
            ? "Document does not match compliance requirements"
            : "",
      });
      await fetchRecords();
      showToast({
        type: status === "approved" ? "success" : "warning",
        title: `${docType} ${status}`,
        message: "Compliance decision updated",
      });
    } catch (_err) {
      showToast({
        type: "error",
        title: "Compliance update failed",
        message: "Could not save document status",
      });
    } finally {
      setBusyKey("");
    }
  };

  const getDocClass = (doc) => {
    if (doc?.status === "verified") return "doc-card verified";
    if (doc?.status === "rejected") return "doc-card rejected";
    return "doc-card uploaded";
  };

  const getStatusToneClass = (status) => {
    if (status === "verified") return "status-success";
    if (status === "rejected") return "status-danger";
    return "status-warning";
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance</h1>
          <p className="page-subtitle">
            Review GST and business license documents per seller
          </p>
        </div>
        <button type="button" className="btn" onClick={fetchRecords}>
          Refresh
        </button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="tabs-row">
        {["all", "uploaded", "verified", "rejected"].map((item) => (
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

      {loading ? (
        <div className="card queue-skeleton">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="skeleton-row" />
          ))}
        </div>
      ) : (
        <div className="compliance-grid">
          {filtered.map((record) => {
            const sellerId = String(record?.sellerId || record?._id || "");
            const gst = record?.complianceDocs?.gstCertificate || {};
            const license = record?.complianceDocs?.businessLicense || {};
            return (
              <div
                key={String(
                  record?.sellerId || record?._id || record?.sellerEmail,
                )}
                className="card compliance-seller-card"
              >
                <div className="compliance-card-header">
                  <h3 className="modal-section-title">
                    {record?.sellerName || "Seller"}
                  </h3>
                  <p className="page-subtitle">
                    {record?.sellerEmail || "No email"}
                  </p>
                </div>

                <div className="compliance-doc-grid">
                  <section className={getDocClass(gst)}>
                    <div className="doc-card-head">
                      <strong>GST Certificate</strong>
                      <span
                        className={`status-badge ${getStatusToneClass(gst?.status)}`}
                      >
                        {gst?.status || "not_verified"}
                      </span>
                    </div>

                    <div className="doc-card-body">
                      {gst?.url ? (
                        <a
                          className="doc-link"
                          href={resolveMediaUrl(gst.url)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open GST document
                        </a>
                      ) : (
                        <p className="page-subtitle">Not uploaded</p>
                      )}

                      {gst?.rejectionReason ? (
                        <p className="doc-reason">
                          Reason: {gst.rejectionReason}
                        </p>
                      ) : (
                        <p className="page-subtitle">No admin comments</p>
                      )}
                    </div>

                    <div className="doc-card-actions">
                      <button
                        type="button"
                        className="btn btn-success"
                        title="Approve (A)"
                        disabled={
                          !gst?.url ||
                          busyKey === `${sellerId}:gstCertificate:approved`
                        }
                        onClick={() =>
                          doDecision(record, "gstCertificate", "approved")
                        }
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        title="Reject (R)"
                        disabled={
                          !gst?.url ||
                          busyKey === `${sellerId}:gstCertificate:rejected`
                        }
                        onClick={() =>
                          doDecision(record, "gstCertificate", "rejected")
                        }
                      >
                        Reject
                      </button>
                    </div>
                  </section>

                  <section className={getDocClass(license)}>
                    <div className="doc-card-head">
                      <strong>Business License</strong>
                      <span
                        className={`status-badge ${getStatusToneClass(license?.status)}`}
                      >
                        {license?.status || "not_verified"}
                      </span>
                    </div>

                    <div className="doc-card-body">
                      {license?.url ? (
                        <a
                          className="doc-link"
                          href={resolveMediaUrl(license.url)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open license document
                        </a>
                      ) : (
                        <p className="page-subtitle">Not uploaded</p>
                      )}

                      {license?.rejectionReason ? (
                        <p className="doc-reason">
                          Reason: {license.rejectionReason}
                        </p>
                      ) : (
                        <p className="page-subtitle">No admin comments</p>
                      )}
                    </div>

                    <div className="doc-card-actions">
                      <button
                        type="button"
                        className="btn btn-success"
                        title="Approve (A)"
                        disabled={
                          !license?.url ||
                          busyKey === `${sellerId}:businessLicense:approved`
                        }
                        onClick={() =>
                          doDecision(record, "businessLicense", "approved")
                        }
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        title="Reject (R)"
                        disabled={
                          !license?.url ||
                          busyKey === `${sellerId}:businessLicense:rejected`
                        }
                        onClick={() =>
                          doDecision(record, "businessLicense", "rejected")
                        }
                      >
                        Reject
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComplianceVerifications;
