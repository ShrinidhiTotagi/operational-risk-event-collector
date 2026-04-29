import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import RiskEventForm from '../components/RiskEventForm';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [search, setSearch] = useState({ keyword: '', category: '', severity: '', status: '' });
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (search.keyword) params.append('keyword', search.keyword);
      if (search.category) params.append('category', search.category);
      if (search.severity) params.append('severity', search.severity);
      if (search.status) params.append('status', search.status);
      const res = await api.get(`/api/risk-events/advanced?${params}`);
      setEvents(res.data.data.content || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/');
      }
      setEvents([]);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    await api.delete(`/api/risk-events/${id}`);
    fetchEvents();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Operational Risk Events</h2>
        <div>
          <button style={styles.btnAdd} onClick={() => { setEditEvent(null); setShowForm(true); }}>+ Add Event</button>
          <button style={styles.btnLogout} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Search Filters */}
      <div style={styles.filters}>
        <input style={styles.filterInput} placeholder="Search keyword..." value={search.keyword}
          onChange={e => setSearch({ ...search, keyword: e.target.value })} />
        <select style={styles.filterInput} value={search.category} onChange={e => setSearch({ ...search, category: e.target.value })}>
          <option value="">All Categories</option>
          <option>Fraud</option><option>System Failure</option><option>Legal</option><option>Operational</option>
        </select>
        <select style={styles.filterInput} value={search.severity} onChange={e => setSearch({ ...search, severity: e.target.value })}>
          <option value="">All Severities</option>
          <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
        </select>
        <select style={styles.filterInput} value={search.status} onChange={e => setSearch({ ...search, status: e.target.value })}>
          <option value="">All Statuses</option>
          <option>OPEN</option><option>CLOSED</option><option>IN_PROGRESS</option>
        </select>
        <button style={styles.btnAdd} onClick={fetchEvents}>Search</button>
      </div>

      {/* Table */}
      <table style={styles.table}>
        <thead>
          <tr style={styles.thead}>
            <th>Title</th><th>Category</th><th>Severity</th><th>Status</th><th>Created</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>No events found</td></tr>
          )}
          {events.map(ev => (
            <tr key={ev.id} style={styles.tr}>
              <td>{ev.title}</td>
              <td>{ev.category}</td>
              <td><span style={{ ...styles.badge, background: severityColor(ev.severity) }}>{ev.severity}</span></td>
              <td><span style={{ ...styles.badge, background: statusColor(ev.status) }}>{ev.status}</span></td>
              <td>{ev.createdAt ? new Date(ev.createdAt).toLocaleDateString() : '-'}</td>
              <td>
                <button style={styles.btnEdit} onClick={() => { setEditEvent(ev); setShowForm(true); }}>Edit</button>
                <button style={styles.btnDelete} onClick={() => handleDelete(ev.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <RiskEventForm
          event={editEvent}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchEvents(); }}
        />
      )}
    </div>
  );
}

const severityColor = (s) => s === 'HIGH' ? '#ff4d4f' : s === 'MEDIUM' ? '#faad14' : '#52c41a';
const statusColor = (s) => s === 'OPEN' ? '#1890ff' : s === 'CLOSED' ? '#8c8c8c' : '#722ed1';

const styles = {
  container: { padding: 24, fontFamily: 'sans-serif', maxWidth: 1100, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  filters: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterInput: { padding: '8px 10px', borderRadius: 4, border: '1px solid #ccc', minWidth: 140 },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  thead: { background: '#1890ff', color: '#fff' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  badge: { padding: '2px 10px', borderRadius: 12, color: '#fff', fontSize: 12 },
  btnAdd: { padding: '8px 16px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 8 },
  btnLogout: { padding: '8px 16px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  btnEdit: { padding: '4px 10px', background: '#faad14', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 4 },
  btnDelete: { padding: '4px 10px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
};
