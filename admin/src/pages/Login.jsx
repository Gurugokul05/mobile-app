import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/api";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/auth/login", { email, password });
      if (data.role !== "admin") {
        setError("Not authorized as admin");
        return;
      }
      localStorage.setItem("adminToken", data.token);
      setToken(data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{cssAnimations}</style>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>R</div>
          <h1 style={styles.logoText}>Roots Admin</h1>
        </div>
        <p style={styles.subtitle}>Sign in to your admin account</p>

        {error && (
          <div style={styles.errorBox} className="error-shake">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <label style={styles.fieldLabel}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="admin@roots.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label style={styles.fieldLabel}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button style={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <p style={styles.hintText}>
            Default admin: admin@roots.com / admin123
          </p>
        </form>
      </div>
    </div>
  );
};

const cssAnimations = `
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.97) translateY(12px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-4px); }
    40%, 80% { transform: translateX(4px); }
  }
  .error-shake { animation: shake 0.4s ease; }
  input:focus {
    border-color: #4F46E5 !important;
    box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
    outline: none;
  }
`;

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    padding: "20px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  card: {
    background: "#FFFFFF",
    borderRadius: "20px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
    animation: "modalIn 0.4s ease",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "8px",
  },
  logoIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
  },
  logoText: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#6B7280",
    textAlign: "center",
    margin: "0 0 28px",
  },
  errorBox: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#B91C1C",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  fieldLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "4px",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    fontSize: "15px",
    backgroundColor: "#F9FAFB",
    transition: "all 0.15s",
    fontFamily: "'Inter', sans-serif",
  },
  submitBtn: {
    marginTop: "12px",
    padding: "13px",
    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.15s",
    fontFamily: "'Inter', sans-serif",
  },
  hintText: {
    marginTop: "10px",
    fontSize: "12px",
    color: "#6B7280",
    textAlign: "center",
  },
};

export default Login;
