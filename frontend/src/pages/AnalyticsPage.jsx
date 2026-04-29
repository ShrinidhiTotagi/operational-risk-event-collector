import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, Cell
} from 'recharts'
import { eventsApi } from '../services/apiClient.js'
import Spinner from '../components/Spinner.jsx'

const RISK_COLORS = { HIGH: '#dc2626', MEDIUM: '#d97706', LOW: '#16a34a' }
const BAR_COLORS = ['#1B4F8A', '#2563a8', '#3b82f6', '#60a5fa', '#93c5fd']

function getRiskBand(score) {
  if (!score) return 'LOW'
  if (score >= 15) return 'HIGH'
  if (score >= 9) return 'MEDIUM'
  return 'LOW'
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    eventsApi.stats().then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!stats) return <div className="text-center py-20 text-gray-400">Failed to load analytics data.</div>

  const categoryData = (stats.byCategory || []).map((d, i) => ({
    name: d.category, count: Number(d.count), fill: BAR_COLORS[i % BAR_COLORS.length]
  }))

  const lossData = (stats.lossByMonth || []).map(d => ({
    month: d.month, loss: Number(d.loss)
  }))

  const statusData = (stats.byStatus || []).map(d => ({ name: d.status, count: Number(d.count) }))

  const totalEvents = stats.totalEvents || 0
  const closureRate = totalEvents > 0 ? ((stats.closedEvents / totalEvents) * 100).toFixed(1) : 0
  const avgLoss = totalEvents > 0 && stats.totalLoss
    ? (Number(stats.totalLoss) / totalEvents).toFixed(0)
    : 0

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-5">Analytics</h1>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Closure Rate', value: `${closureRate}%`, sub: 'Closed / Total' },
          { label: 'Monitoring', value: stats.monitoringEvents, sub: 'Under monitoring' },
          { label: 'Avg Loss / Event', value: `$${Number(avgLoss).toLocaleString()}`, sub: 'USD average' },
          { label: 'Closed Events', value: stats.closedEvents, sub: 'Resolved' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <div className="text-sm text-gray-500 mb-1">{m.label}</div>
            <div className="text-2xl font-bold text-primary">{m.value}</div>
            <div className="text-xs text-gray-400 mt-1">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Category breakdown with colored bars */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="text-sm font-semibold text-gray-700 mb-4">Event Volume by Category</div>
          {categoryData.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 3, 3, 0]} name="Events">
                  {categoryData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="text-sm font-semibold text-gray-700 mb-4">Status Distribution</div>
          {statusData.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">No data</div>
          ) : (
            <div className="space-y-3 mt-2">
              {statusData.map(s => {
                const pct = totalEvents > 0 ? (s.count / totalEvents) * 100 : 0
                const barColor = s.name === 'OPEN' ? 'bg-red-500' : s.name === 'IN_PROGRESS' ? 'bg-yellow-500' : s.name === 'CLOSED' ? 'bg-green-500' : 'bg-blue-500'
                return (
                  <div key={s.name}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{s.name}</span>
                      <span>{s.count} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Loss trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-4">
        <div className="text-sm font-semibold text-gray-700 mb-4">Loss Trend Over Time (USD)</div>
        {lossData.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">No loss data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lossData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`$${Number(v).toLocaleString()}`, 'Loss']} />
              <Line type="monotone" dataKey="loss" stroke="#1B4F8A" strokeWidth={2} dot={{ r: 4 }} name="Loss (USD)" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Risk exposure table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div className="text-sm font-semibold text-gray-700 mb-4">Category Risk Exposure</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Category</th>
              <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">Event Count</th>
              <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">% of Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categoryData.map(d => (
              <tr key={d.name}>
                <td className="py-2 text-gray-700">{d.name}</td>
                <td className="py-2 text-right font-medium text-gray-800">{d.count}</td>
                <td className="py-2 text-right text-gray-500">
                  {totalEvents > 0 ? ((d.count / totalEvents) * 100).toFixed(1) : 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
