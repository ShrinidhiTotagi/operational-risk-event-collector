import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventsApi } from '../services/apiClient.js'
import StatusBadge from '../components/StatusBadge.jsx'
import Spinner from '../components/Spinner.jsx'

const CATEGORIES = ['IT', 'PROCESS', 'PEOPLE', 'LEGAL', 'THIRD_PARTY']
const STATUSES = ['OPEN', 'IN_PROGRESS', 'CLOSED', 'MONITORING']

export default function EventsPage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({ status: '', category: '', search: '', dateFrom: '', dateTo: '' })

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, size: 20, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
      const res = await eventsApi.list(params)
      setEvents(res.data.content)
      setTotal(res.data.totalElements)
      setTotalPages(res.data.totalPages)
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const handleFilterChange = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }))
    setPage(0)
  }

  const handleExport = async () => {
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      const res = await eventsApi.export(params)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const a = document.createElement('a'); a.href = url; a.download = 'events.csv'; a.click()
      URL.revokeObjectURL(url)
    } catch { /* silent */ }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Operational Risk Events</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">Export CSV</button>
          <button onClick={() => navigate('/events/new')} className="px-3 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary-dark">+ New Event</button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search title / description..."
          value={filters.search}
          onChange={e => handleFilterChange('search', e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 min-w-48 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.category} onChange={e => handleFilterChange('category', e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={filters.dateFrom} onChange={e => handleFilterChange('dateFrom', e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <input type="date" value={filters.dateTo} onChange={e => handleFilterChange('dateTo', e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <button onClick={() => { setFilters({ status: '', category: '', search: '', dateFrom: '', dateTo: '' }); setPage(0) }}
          className="text-sm text-gray-500 hover:text-gray-700 px-2">Clear</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No events found. Try adjusting your filters or create a new event.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Reference', 'Title', 'Category', 'Status', 'Incident Date', 'Loss Amount', 'Risk Score', 'Owner'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.map(e => (
                <tr key={e.id} onClick={() => navigate(`/events/${e.id}`)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{e.referenceCode}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{e.title}</td>
                  <td className="px-4 py-3 text-gray-600">{e.category}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-gray-600">{e.incidentDate || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {e.lossAmount ? `${Number(e.lossAmount).toLocaleString()} ${e.currency}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {e.inherentRiskScore ? (
                      <span className={`font-semibold ${e.inherentRiskScore >= 15 ? 'text-red-600' : e.inherentRiskScore >= 9 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {e.inherentRiskScore}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{e.createdBy || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>{total} total events</span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">Prev</button>
            <span className="px-3 py-1">{page + 1} / {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
