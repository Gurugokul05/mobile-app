import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.role !== 'admin') {
        setError('Not authorized as admin');
        return;
      }
      localStorage.setItem('adminToken', data.token);
      setToken(data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={styles.title}>Admin Login</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button style={styles.button} type="submit">Login</button>
      </form>
    </div>
  );
};

const styles = {
  container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF' },
  form: { backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '320px', display: 'flex', flexDirection: 'column' },
  title: { margin: '0 0 1.5rem', color: '#2563EB', textAlign: 'center' },
  input: { padding: '10px', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '16px' },
  button: { padding: '12px', backgroundColor: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  error: { color: '#DC2626', marginBottom: '1rem', textAlign: 'center' }
};

export default Login;
