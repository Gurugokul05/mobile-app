import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, RotateCcw, LogOut } from 'lucide-react';
import Login from './pages/Login';
import Sellers from './pages/Sellers';
import Refunds from './pages/Refunds';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    navigate('/login');
  };

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <div style={styles.appContainer}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>Roots Admin</div>
        <nav style={styles.nav}>
          <Link to="/" style={styles.navLink}><LayoutDashboard size={18} /> Dashboard</Link>
          <Link to="/sellers" style={styles.navLink}><Users size={18} /> Sellers</Link>
          <Link to="/refunds" style={styles.navLink}><RotateCcw size={18} /> Refunds</Link>
        </nav>
        <button style={styles.logoutBtn} onClick={handleLogout}><LogOut size={18} /> Logout</button>
      </aside>
      <main style={styles.mainContent}>
        <Routes>
          <Route path="/" element={<div style={{padding: '2rem'}}><h2>Welcome to Roots Admin</h2></div>} />
          <Route path="/sellers" element={<Sellers />} />
          <Route path="/refunds" element={<Refunds />} />
        </Routes>
      </main>
    </div>
  );
};

const styles = {
  appContainer: { display: 'flex', minHeight: '100vh', backgroundColor: '#EFF6FF', fontFamily: 'Inter, system-ui, sans-serif' },
  sidebar: { width: '250px', backgroundColor: 'white', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' },
  logo: { padding: '24px', fontSize: '24px', fontWeight: 'bold', color: '#2563EB', borderBottom: '1px solid #E2E8F0' },
  nav: { padding: '24px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
  navLink: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', textDecoration: 'none', color: '#475569', borderRadius: '8px', fontWeight: '500' },
  logoutBtn: { margin: '24px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: 'none', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
  mainContent: { flex: 1, overflowY: 'auto' }
};

export default App;
