import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ReceiptText,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import Login from "./pages/Login";
import Sellers from "./pages/Sellers";
import Refunds from "./pages/Refunds";
import ComplianceVerifications from "./pages/ComplianceVerifications";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const navigate = useNavigate();

  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem("adminToken"));
    };

    window.addEventListener("storage", syncToken);
    return () => window.removeEventListener("storage", syncToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    navigate("/login");
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
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <aside style={styles.sidebar}>
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>R</div>
          <span style={styles.logoText}>Roots</span>
        </div>
        <nav style={styles.nav}>
          <NavLink to="/" icon={<LayoutDashboard size={18} />}>
            Dashboard
          </NavLink>
          <NavLink to="/sellers" icon={<Users size={18} />}>
            Sellers
          </NavLink>
          <NavLink to="/refunds" icon={<ReceiptText size={18} />}>
            Refunds
          </NavLink>
          <NavLink to="/compliance" icon={<ShieldCheck size={18} />}>
            Compliance Verify
          </NavLink>
        </nav>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </aside>
      <main style={styles.main}>
        <Routes>
          <Route
            path="/"
            element={
              <div style={styles.dashboardFallback}>
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    margin: 0,
                    color: "#111827",
                  }}
                >
                  Dashboard
                </h1>
                <p
                  style={{
                    fontSize: "15px",
                    color: "#6B7280",
                    margin: "8px 0 0",
                  }}
                >
                  Welcome to Roots Admin — use the sidebar to manage sellers and
                  refunds.
                </p>
              </div>
            }
          />
          <Route path="/sellers" element={<Sellers />} />
          <Route path="/refunds" element={<Refunds />} />
          <Route path="/compliance" element={<ComplianceVerifications />} />
        </Routes>
      </main>
    </div>
  );
};

const NavLink = ({ to, icon, children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.navLink,
        background: hovered ? "#EEEEFF" : "transparent",
      }}
    >
      {icon}
      {children}
    </Link>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  sidebar: {
    width: "240px",
    background: "#FFFFFF",
    borderRight: "1px solid #E5E7EB",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "20px 18px",
    borderBottom: "1px solid #F3F4F6",
  },
  logoIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "800",
    flexShrink: 0,
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
  },
  nav: {
    padding: "16px 12px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    textDecoration: "none",
    color: "#374151",
    borderRadius: "8px",
    fontWeight: "500",
    fontSize: "14px",
    transition: "background 0.15s",
  },
  logoutBtn: {
    margin: "16px 12px",
    padding: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    border: "1px solid #FECACA",
    backgroundColor: "#FFFFFF",
    color: "#DC2626",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "background 0.15s",
  },
  main: { flex: 1 },
  dashboardFallback: {
    padding: "40px 40px 24px",
    background: "#F8F9FC",
    minHeight: "100vh",
  },
};

export default App;
