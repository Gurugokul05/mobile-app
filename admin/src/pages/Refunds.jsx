import React, { useState, useEffect } from 'react';
import api from '../config/api';

const Refunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetching refunds
    setTimeout(() => {
      setRefunds([
        { _id: '1', orderId: 'ORD-1234', reason: 'Item broken during shipping', status: 'Pending', unboxingVideoUrl: '#' },
        { _id: '2', orderId: 'ORD-5678', reason: 'Missing parts', status: 'Approved', unboxingVideoUrl: '#' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDecision = async (id, status) => {
    try {
      // await api.put(`/refunds/${id}/decide`, { status, adminReason: 'Reviewed by admin' });
      setRefunds(refunds.map(r => r._id === id ? { ...r, status } : r));
      alert(`Refund ${status}!`);
    } catch (error) {
      alert('Action failed');
    }
  };

  if (loading) return <div style={{padding: '2rem'}}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Refund Requests</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Order ID</th>
            <th style={styles.th}>Reason</th>
            <th style={styles.th}>Video Proof</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {refunds.map((r) => (
            <tr key={r._id} style={styles.tr}>
              <td style={styles.td}>{r.orderId}</td>
              <td style={styles.td}>{r.reason}</td>
              <td style={styles.td}>
                <a href={r.unboxingVideoUrl} target="_blank" rel="noreferrer" style={{color: '#2563EB'}}>Watch Video</a>
              </td>
              <td style={styles.td}>
                <span style={r.status === 'Approved' ? styles.badgeSuccess : r.status === 'Rejected' ? styles.badgeError : styles.badgePending}>
                  {r.status}
                </span>
              </td>
              <td style={styles.td}>
                {r.status === 'Pending' && (
                  <>
                    <button style={styles.btnApprove} onClick={() => handleDecision(r._id, 'Approved')}>Approve</button>
                    <button style={styles.btnReject} onClick={() => handleDecision(r._id, 'Rejected')}>Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: { padding: '2rem' },
  title: { fontSize: '24px', color: '#0F172A', marginBottom: '1.5rem' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  th: { backgroundColor: '#F8FAFC', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', color: '#475569' },
  tr: { borderBottom: '1px solid #E2E8F0' },
  td: { padding: '16px', color: '#0F172A' },
  badgeSuccess: { backgroundColor: '#DCFCE7', color: '#16A34A', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  badgeError: { backgroundColor: '#FEE2E2', color: '#DC2626', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  badgePending: { backgroundColor: '#FEF9C3', color: '#CA8A04', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  btnApprove: { padding: '6px 12px', backgroundColor: '#16A34A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' },
  btnReject: { padding: '6px 12px', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default Refunds;
