import React, { useEffect, useMemo, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  LayoutGrid,
  Users,
  RefreshCcw,
  Shield,
  CreditCard,
  PanelLeft,
  LogOut,
} from "lucide-react";
import "./App.css";
import Login from "./pages/Login";
import Sellers from "./pages/Sellers";
import Refunds from "./pages/Refunds";
import ComplianceVerifications from "./pages/ComplianceVerifications";
import PaymentVerifications from "./pages/PaymentVerifications";
import Dashboard from "./pages/Dashboard";
import { ToastProvider } from "./components/ToastProvider";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [adminEmail, setAdminEmail] = useState(
    localStorage.getItem("adminEmail") || "admin@roots.com",
  );
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1180);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem("adminToken"));
      setAdminEmail(localStorage.getItem("adminEmail") || "admin@roots.com");
    };

    window.addEventListener("storage", syncToken);
    return () => window.removeEventListener("storage", syncToken);
  }, []);

  useEffect(() => {
    const onResize = () => {
      setIsCollapsed(window.innerWidth < 1180);
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    setToken(null);
    setAdminEmail("admin@roots.com");
    navigate("/login");
  };

  const navItems = useMemo(
    () => [
      { to: "/", icon: LayoutGrid, label: "Dashboard" },
      { to: "/sellers", icon: Users, label: "Sellers" },
      { to: "/refunds", icon: RefreshCcw, label: "Refunds" },
      { to: "/payments", icon: CreditCard, label: "Payments" },
      { to: "/compliance", icon: Shield, label: "Compliance" },
    ],
    [],
  );

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  const isMobile = window.innerWidth < 768;

  return (
    <ToastProvider>
      <div className="admin-root">
        {isMobile && mobileOpen ? (
          <button
            type="button"
            className="mobile-overlay"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          />
        ) : null}

        <aside
          className={[
            "admin-sidebar",
            isCollapsed ? "collapsed" : "",
            mobileOpen ? "mobile-open" : "",
          ].join(" ")}
        >
          <div className="sidebar-brand">
            <div className="brand-mark">R</div>
            <span className="brand-title">Roots Admin</span>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`sidebar-link ${active ? "active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={18} />
                  <span className="sidebar-link-label">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-bottom">
            <div className="admin-email" title={adminEmail}>
              {adminEmail}
            </div>
            <button type="button" className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span className="logout-label">Logout</span>
            </button>
          </div>
        </aside>

        <main className="admin-main">
          <header className="mobile-topbar">
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
            >
              <PanelLeft size={16} />
            </button>
            <strong>Roots Admin</strong>
            <div className="mobile-topbar-spacer" />
          </header>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sellers" element={<Sellers />} />
            <Route path="/refunds" element={<Refunds />} />
            <Route path="/payments" element={<PaymentVerifications />} />
            <Route path="/compliance" element={<ComplianceVerifications />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
};

export default App;
