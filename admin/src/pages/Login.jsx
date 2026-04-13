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
      localStorage.setItem("adminEmail", data.email || email);
      setToken(data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand-row">
          <div className="auth-brand-mark">R</div>
          <h1 className="auth-title">Roots Admin</h1>
        </div>
        <p className="auth-subtitle">Sign in to your admin account</p>

        {error ? <div className="error-banner">{error}</div> : null}

        <form onSubmit={handleLogin} className="auth-form">
          <label className="field-label">Email</label>
          <input
            className="text-input"
            type="email"
            placeholder="admin@roots.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="field-label">Password</label>
          <input
            className="text-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="auth-hint"></p>
        </form>
      </div>
    </div>
  );
};

export default Login;
