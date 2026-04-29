import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { eventsApi } from '../services/apiClient.js'
import StatusBadge from '../components/StatusBadge.jsx'
import AiPanel from '../components/AiPanel.jsx'
import Spinner from '../components/Spinner.jsx'

function Field({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div>
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
      <div className="text-sm text-gray-800">{value}</div>
    </div>
  )
}

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    eventsApi.get(id).then(r => setEvent(r.data)).catch(() => navigate('/events')).finally(() => setLoading(false))
  }, [id, navigate])

  const handleDelete = async () => {
    if (!confirm('Delete this event? This action cannot be undone.')) return
    setDeleting(true)
    try {
      await eventsApi.delete(id)
      navigate('/events')
    } catch {
      setDeleting(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!event) return null

  const riskColor = event.inherentRiskScore >= 15 ? 'text-red-600' : event.inherentRiskScore >= 9 ? 'text-yellow-600' : 'text-green-600'

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <button onClick={() => navigate('/events')} className="text-sm text-gray-400 hover:text-gray-600 mb-1">← Back to Events</button>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-primary">{event.referenceCode}</span>
            <StatusBadge status={event.status} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mt-1">{event.title}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/events/${id}/edit`)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">Edit</button>
          <button onClick={handleDelete} disabled={deleting}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          {event.description && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</div>
              <p className="text-sm text-gray-700 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Categorization */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Categorization</div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category" value={event.category} />
              <Field label="Sub-Category" value={event.subCategory} />
              <Field label="Business Unit" value={event.businessUnit} />
              <Field label="Department" value={event.department} />
              <Field label="Location" value={event.location} />
              <Field label="Impact Type" value={event.impactType} />
            </div>
          </div>

          {/* Risk & Impact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Risk & Impact</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-400 mb-1">Likelihood</div>
                <div className="text-2xl font-bold text-gray-700">{event.likelihood ?? '—'}</div>
                <div className="text-xs text-gray-400">/ 5</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-400 mb-1">Impact</div>
                <div className="text-2xl font-bold text-gray-700">{event.impact ?? '—'}</div>
                <div className="text-xs text-gray-400">/ 5</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-400 mb-1">Risk Score</div>
                <div className={`text-2xl font-bold ${riskColor}`}>{event.inherentRiskScore ?? '—'}</div>
                <div className="text-xs text-gray-400">/ 25</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Field label="Residual Risk Score" value={event.residualRiskScore} />
              <Field label="Loss Amount" value={event.lossAmount ? `${Number(event.lossAmount).toLocaleString()} ${event.currency}` : null} />
            </div>
          </div>

          {/* Root Cause & Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Root Cause & Controls</div>
            <div className="space-y-3">
              <Field label="Root Cause" value={event.rootCause} />
              <Field label="Control Failures" value={event.controlFailures} />
              <Field label="KRI" value={event.kri} />
              <Field label="Action Plan" value={event.actionPlan} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Dates */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Dates</div>
            <div className="space-y-3">
              <Field label="Incident Date" value={event.incidentDate} />
              <Field label="Discovery Date" value={event.discoveryDate} />
              <Field label="Closure Date" value={event.closureDate} />
              <Field label="Created At" value={event.createdAt?.slice(0, 10)} />
              <Field label="Created By" value={event.createdBy} />
              <Field label="Last Updated" value={event.updatedAt?.slice(0, 10)} />
            </div>
          </div>

          {/* AI Panel */}
          <AiPanel event={event} />
        </div>
      </div>
    </div>
  )
}
