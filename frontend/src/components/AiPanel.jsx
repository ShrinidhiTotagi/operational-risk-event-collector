import { useState } from 'react'
import { aiApi } from '../services/apiClient.js'
import Spinner from './Spinner.jsx'

function AiResult({ data, type }) {
  if (!data) return null
  if (data.is_fallback) return (
    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
      AI service unavailable. Please try again later.
    </div>
  )

  if (type === 'describe') return (
    <div className="mt-3 space-y-3">
      <div className="p-3 bg-blue-50 rounded text-sm text-gray-700">{data.description}</div>
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Key Risks</div>
        <ul className="space-y-1">
          {(data.key_risks || []).map((r, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-red-400">•</span>{r}</li>)}
        </ul>
      </div>
      {data.suggested_kri && (
        <div className="p-3 bg-gray-50 rounded text-sm">
          <span className="font-medium text-gray-600">Suggested KRI: </span>{data.suggested_kri}
        </div>
      )}
    </div>
  )

  if (type === 'recommend') return (
    <div className="mt-3 space-y-2">
      {(data.recommendations || []).map((r, i) => (
        <div key={i} className="p-3 bg-gray-50 rounded border-l-4 border-primary text-sm">
          <div className="flex justify-between mb-1">
            <span className="font-medium text-gray-700">{r.action_type}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${r.priority === 'HIGH' ? 'bg-red-100 text-red-700' : r.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
              {r.priority}
            </span>
          </div>
          <div className="text-gray-600">{r.description}</div>
        </div>
      ))}
    </div>
  )

  if (type === 'report') return (
    <div className="mt-3 space-y-3 text-sm">
      <div className="font-semibold text-gray-800">{data.title}</div>
      <div className="text-gray-600">{data.summary}</div>
      <div className="p-3 bg-gray-50 rounded text-gray-700">{data.overview}</div>
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Key Findings</div>
        <ul className="space-y-1">{(data.key_items || []).map((k, i) => <li key={i} className="flex gap-2 text-gray-700"><span className="text-primary">•</span>{k}</li>)}</ul>
      </div>
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Recommendations</div>
        <ul className="space-y-1">{(data.recommendations || []).map((r, i) => <li key={i} className="flex gap-2 text-gray-700"><span className="text-green-500">✓</span>{r}</li>)}</ul>
      </div>
    </div>
  )

  return null
}

export default function AiPanel({ event }) {
  const [active, setActive] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState({})

  const payload = {
    title: event.title,
    category: event.category,
    description: event.description,
    status: event.status,
    impact_type: event.impactType,
    likelihood: event.likelihood,
    impact: event.impact,
    inherent_risk_score: event.inherentRiskScore,
    residual_risk_score: event.residualRiskScore,
    loss_amount: event.lossAmount,
    root_cause: event.rootCause,
    control_failures: event.controlFailures,
    action_plan: event.actionPlan,
  }

  const run = async (type) => {
    setActive(type)
    if (results[type]) return
    setLoading(true)
    try {
      const fn = type === 'describe' ? aiApi.describe : type === 'recommend' ? aiApi.recommend : aiApi.generateReport
      const res = await fn(payload)
      setResults(r => ({ ...r, [type]: res.data }))
    } catch {
      setResults(r => ({ ...r, [type]: { is_fallback: true } }))
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { key: 'describe', label: 'Describe' },
    { key: 'recommend', label: 'Recommend' },
    { key: 'report', label: 'Generate Report' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <div className="text-sm font-semibold text-gray-700 mb-3">AI Analysis</div>
      <div className="flex gap-2 mb-3">
        {tabs.map(t => (
          <button key={t.key} onClick={() => run(t.key)}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${active === t.key ? 'bg-primary text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {t.label}
          </button>
        ))}
      </div>
      {loading && active && !results[active] && (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
          <Spinner size="sm" /> Generating AI response...
        </div>
      )}
      {active && results[active] && <AiResult data={results[active]} type={active} />}
      {!active && <div className="text-sm text-gray-400 py-2">Select an action above to generate AI insights for this event.</div>}
    </div>
  )
}
