import React, { useEffect, useMemo, useState } from "react";
import api from "../config/api";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    sellersPending: 0,
    refundsPending: 0,
    paymentsSubmitted: 0,
    complianceReady: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [sellersRes, refundsRes, paymentsRes, complianceRes] =
          await Promise.all([
            api.get("/seller/admin/all-verifications"),
            api.get("/refunds"),
            api.get("/orders/payment-verifications", {
              params: { status: "all" },
            }),
            api.get("/seller/admin/compliance-verifications"),
          ]);

        const sellers = Array.isArray(sellersRes?.data) ? sellersRes.data : [];
        const refunds = Array.isArray(refundsRes?.data) ? refundsRes.data : [];
        const payments = Array.isArray(paymentsRes?.data)
          ? paymentsRes.data
          : [];
        const compliance = Array.isArray(complianceRes?.data)
          ? complianceRes.data
          : [];

        setStats({
          sellersPending: sellers.filter((item) => item?.status === "pending")
            .length,
          refundsPending: refunds.filter((item) => item?.status === "Pending")
            .length,
          paymentsSubmitted: payments.filter(
            (item) => item?.paymentDetails?.status === "Payment Submitted",
          ).length,
          complianceReady: compliance.filter((item) => {
            const docs = item?.complianceDocs || {};
            return (
              Boolean(docs?.gstCertificate?.url) ||
              Boolean(docs?.businessLicense?.url)
            );
          }).length,
        });
      } catch (_error) {
        setStats({
          sellersPending: 0,
          refundsPending: 0,
          paymentsSubmitted: 0,
          complianceReady: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const queueCards = useMemo(
    () => [
      {
        key: "sellers",
        label: "Seller Queue Pending",
        value: stats.sellersPending,
        tone: "status-warning",
      },
      {
        key: "refunds",
        label: "Refunds Pending",
        value: stats.refundsPending,
        tone: "status-danger",
      },
      {
        key: "payments",
        label: "Payments To Verify",
        value: stats.paymentsSubmitted,
        tone: "status-warning",
      },
      {
        key: "compliance",
        label: "Compliance Ready",
        value: stats.complianceReady,
        tone: "status-success",
      },
    ],
    [stats],
  );

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Operational overview across verification queues
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card queue-skeleton">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="skeleton-row" />
          ))}
        </div>
      ) : (
        <>
          <div className="metric-grid metric-grid-four">
            {queueCards.map((item) => (
              <div key={item.key} className="card metric-card">
                <div className="metric-label">{item.label}</div>
                <h2 className="metric-value">{item.value}</h2>
                <span className={`status-badge ${item.tone}`}>Live queue</span>
              </div>
            ))}
          </div>

          <div className="card metric-card section-gap-top">
            <h3 className="modal-section-title">Power Tips</h3>
            <p className="page-subtitle">
              Use keyboard hints in review actions for speed: A to approve and R
              to reject.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
