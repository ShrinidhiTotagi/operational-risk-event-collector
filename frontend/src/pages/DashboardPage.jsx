import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { eventsApi } from '../services/apiClient.js'
import KpiCard from '../components/KpiCard.jsx'
import Spinner from '../components/Spinner.jsx'

const PIE_COLORS = ['#1B4F8A', '#2563a8', '#3b82f6', '#93c5fd', '#dbeafe', '#1e40af']

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    eventsApi.stats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!stats) return <div className="text-center py-20 text-gray-400">Failed to load dashboard data.</div>

  const categoryData = (stats.byCategory || []).map(d => ({ name: d.category, value: Number(d.count) }))
  const statusData = (stats.byStatus || []).map(d => ({ name: d.status, value: Number(d.count) }))
  const lossData = (stats.lossByMonth || []).map(d => ({ month: d.month, loss: Number(d.loss) }))

  const totalLoss = stats.totalLoss ? Number(stats.totalLoss).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <button onClick={() => navigate('/events/new')} className="px-3 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary-dark">
          + New Event
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Events" value={stats.totalEvents} />
        <KpiCard label="Open Events" value={stats.openEvents} color="text-red-600" />
        <KpiCard label="In Progress" value={stats.inProgressEvents} color="text-yellow-600" />
        <KpiCard label="Total Loss (USD)" value={`$${totalLoss}`} color="text-red-700" sub="Cumulative reported loss" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Events by Category */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="text-sm font-semibold text-gray-700 mb-4">Events by Category</div>
          {categoryData.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#1B4F8A" radius={[3, 3, 0, 0]} name="Events" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Events by Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="text-sm font-semibold text-gray-700 mb-4">Events by Status</div>
          {statusData.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Loss by Month */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div className="text-sm font-semibold text-gray-700 mb-4">Loss Amount by Month (USD)</div>
        {lossData.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">No loss data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={lossData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`$${Number(v).toLocaleString()}`, 'Loss']} />
              <Bar dataKey="loss" fill="#dc2626" radius={[3, 3, 0, 0]} name="Loss (USD)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
