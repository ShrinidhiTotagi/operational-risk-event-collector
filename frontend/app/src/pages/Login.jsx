import { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} placeholder="Username" value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })} required />
          <input style={styles.input} type="password" placeholder="Password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />
          <button style={styles.button} type="submit">Login</button>
        </form>
        <p style={{ marginTop: 12 }}>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' },
  card: { background: '#fff', padding: 40, borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: 360 },
  title: { marginBottom: 20, textAlign: 'center' },
  input: { width: '100%', padding: 10, marginBottom: 12, borderRadius: 4, border: '1px solid #ccc', boxSizing: 'border-box' },
  button: { width: '100%', padding: 10, background: '#1890ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 16 },
  error: { color: 'red', marginBottom: 10 },
};
