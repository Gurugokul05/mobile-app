import React, { useState, useEffect } from 'react';
import api from '../config/api';

const Sellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock user fetching, assuming we had a GET sellers route
    setTimeout(() => {
      setSellers([
        { _id: '1', name: 'Artisan Crafts', email: 'artisan@test.com', isVerified: false, verificationDocs: { idProofUrl: 'link' } },
        { _id: '2', name: 'Kashmir Textures', email: 'kashmir@test.com', isVerified: true, verificationDocs: {} }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleVerify = async (id, status) => {
    try {
      // await api.put(`/seller/${id}/verify`, { status });
      setSellers(sellers.map(s => s._id === id ? { ...s, isVerified: status === 'approved' } : s));
      alert(`Seller ${status}!`);
    } catch (error) {
      alert('Verification failed');
    }
  };

  if (loading) return <div style={{padding: '2rem'}}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Seller Approvals</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Docs</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sellers.map((s) => (
            <tr key={s._id} style={styles.tr}>
              <td style={styles.td}>{s.name}</td>
              <td style={styles.td}>{s.email}</td>
              <td style={styles.td}>
                <span style={s.isVerified ? styles.badgeSuccess : styles.badgePending}>
                  {s.isVerified ? 'Verified' : 'Pending'}
                </span>
              </td>
              <td style={styles.td}>
                <a href={s.verificationDocs?.idProofUrl || '#'} target="_blank" rel="noreferrer" style={{color: '#2563EB'}}>View Docs</a>
              </td>
              <td style={styles.td}>
                {!s.isVerified && (
                  <>
                    <button style={styles.btnApprove} onClick={() => handleVerify(s._id, 'approved')}>Approve</button>
                    <button style={styles.btnReject} onClick={() => handleVerify(s._id, 'rejected')}>Reject</button>
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
  badgePending: { backgroundColor: '#FEF9C3', color: '#CA8A04', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  btnApprove: { padding: '6px 12px', backgroundColor: '#16A34A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' },
  btnReject: { padding: '6px 12px', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default Sellers;
