import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function RiskEventForm({ event, onClose, onSaved }) {
  const [form, setForm] = useState({ title: '', description: '', category: '', severity: 'LOW', status: 'OPEN' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (event) setForm({ title: event.title, description: event.description, category: event.category, severity: event.severity, status: event.status });
  }, [event]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (event) await api.put(`/api/risk-events/${event.id}`, form);
      else await api.post('/api/risk-events', form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event');
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>{event ? 'Edit Risk Event' : 'Add Risk Event'}</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} placeholder="Title" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} required />
          <textarea style={{ ...styles.input, height: 80 }} placeholder="Description" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} required />
          <select style={styles.input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
            <option value="">Select Category</option>
            <option>Fraud</option><option>System Failure</option><option>Legal</option><option>Operational</option>
          </select>
          <select style={styles.input} value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
            <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
          </select>
          <select style={styles.input} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option>OPEN</option><option>IN_PROGRESS</option><option>CLOSED</option>
          </select>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button style={styles.btnSave} type="submit">Save</button>
            <button style={styles.btnCancel} type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { background: '#fff', padding: 32, borderRadius: 8, width: 420, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  input: { width: '100%', padding: 10, marginBottom: 12, borderRadius: 4, border: '1px solid #ccc', boxSizing: 'border-box' },
  btnSave: { flex: 1, padding: 10, background: '#1890ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  btnCancel: { flex: 1, padding: 10, background: '#ccc', color: '#333', border: 'none', borderRadius: 4, cursor: 'pointer' },
};
