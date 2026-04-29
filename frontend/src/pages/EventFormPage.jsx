import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { eventsApi } from '../services/apiClient.js'
import Spinner from '../components/Spinner.jsx'

const CATEGORIES = ['IT', 'PROCESS', 'PEOPLE', 'LEGAL', 'THIRD_PARTY']
const STATUSES = ['OPEN', 'IN_PROGRESS', 'CLOSED', 'MONITORING']
const IMPACT_TYPES = ['FINANCIAL', 'REGULATORY', 'REPUTATIONAL', 'OPERATIONAL']

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
const selectCls = inputCls
const textareaCls = inputCls + " resize-none"

export default function EventFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    title: '', description: '', status: 'OPEN', category: '', subCategory: '',
    businessUnit: '', department: '', location: '', impactType: '',
    likelihood: '', impact: '', residualRiskScore: '', lossAmount: '', currency: 'USD',
    incidentDate: '', discoveryDate: '', closureDate: '',
    rootCause: '', controlFailures: '', kri: '', actionPlan: ''
  })

  useEffect(() => {
    if (!isEdit) return
    eventsApi.get(id).then(r => {
      const e = r.data
      setForm({
        title: e.title || '', description: e.description || '', status: e.status || 'OPEN',
        category: e.category || '', subCategory: e.subCategory || '',
        businessUnit: e.businessUnit || '', department: e.department || '',
        location: e.location || '', impactType: e.impactType || '',
        likelihood: e.likelihood ?? '', impact: e.impact ?? '',
        residualRiskScore: e.residualRiskScore ?? '', lossAmount: e.lossAmount ?? '',
        currency: e.currency || 'USD', incidentDate: e.incidentDate || '',
        discoveryDate: e.discoveryDate || '', closureDate: e.closureDate || '',
        rootCause: e.rootCause || '', controlFailures: e.controlFailures || '',
        kri: e.kri || '', actionPlan: e.actionPlan || ''
      })
    }).catch(() => navigate('/events')).finally(() => setLoading(false))
  }, [id, isEdit, navigate])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.category) e.category = 'Category is required'
    if (!form.status) e.status = 'Status is required'
    if (form.likelihood && (form.likelihood < 1 || form.likelihood > 5)) e.likelihood = 'Must be 1–5'
    if (form.impact && (form.impact < 1 || form.impact > 5)) e.impact = 'Must be 1–5'
    if (form.lossAmount && isNaN(Number(form.lossAmount))) e.lossAmount = 'Must be a number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const payload = {
      ...form,
      likelihood: form.likelihood ? Number(form.likelihood) : null,
      impact: form.impact ? Number(form.impact) : null,
      residualRiskScore: form.residualRiskScore ? Number(form.residualRiskScore) : null,
      lossAmount: form.lossAmount ? Number(form.lossAmount) : null,
      incidentDate: form.incidentDate || null,
      discoveryDate: form.discoveryDate || null,
      closureDate: form.closureDate || null,
    }
    try {
      const res = isEdit ? await eventsApi.update(id, payload) : await eventsApi.create(payload)
      navigate(`/events/${res.data.id}`)
    } catch (err) {
      const fieldErrors = err.response?.data?.fieldErrors
      if (fieldErrors) setErrors(fieldErrors)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <button onClick={() => navigate(isEdit ? `/events/${id}` : '/events')} className="text-sm text-gray-400 hover:text-gray-600 mb-1">← Back</button>
        <h1 className="text-xl font-bold text-gray-800">{isEdit ? 'Edit Event' : 'New Operational Risk Event'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Core */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 space-y-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Core Details</div>
          <FormField label="Title" required>
            <input value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} maxLength={255} />
            {errors.title && <div className="text-red-500 text-xs mt-0.5">{errors.title}</div>}
          </FormField>
          <FormField label="Description">
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className={textareaCls} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Status" required>
              <select value={form.status} onChange={e => set('status', e.target.value)} className={selectCls}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Category" required>
              <select value={form.category} onChange={e => set('category', e.target.value)} className={selectCls}>
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <div className="text-red-500 text-xs mt-0.5">{errors.category}</div>}
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Sub-Category">
              <input value={form.subCategory} onChange={e => set('subCategory', e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Impact Type">
              <select value={form.impactType} onChange={e => set('impactType', e.target.value)} className={selectCls}>
                <option value="">Select...</option>
                {IMPACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Business Unit">
              <input value={form.businessUnit} onChange={e => set('businessUnit', e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Department">
              <input value={form.department} onChange={e => set('department', e.target.value)} className={inputCls} />
            </FormField>
          </div>
          <FormField label="Location">
            <input value={form.location} onChange={e => set('location', e.target.value)} className={inputCls} />
          </FormField>
        </div>

        {/* Risk */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 space-y-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Risk & Financial</div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Likelihood (1–5)">
              <input type="number" min={1} max={5} value={form.likelihood} onChange={e => set('likelihood', e.target.value)} className={inputCls} />
              {errors.likelihood && <div className="text-red-500 text-xs mt-0.5">{errors.likelihood}</div>}
            </FormField>
            <FormField label="Impact (1–5)">
              <input type="number" min={1} max={5} value={form.impact} onChange={e => set('impact', e.target.value)} className={inputCls} />
              {errors.impact && <div className="text-red-500 text-xs mt-0.5">{errors.impact}</div>}
            </FormField>
            <FormField label="Residual Risk (0–5)">
              <input type="number" min={0} max={5} value={form.residualRiskScore} onChange={e => set('residualRiskScore', e.target.value)} className={inputCls} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Loss Amount">
              <input type="number" min={0} step="0.01" value={form.lossAmount} onChange={e => set('lossAmount', e.target.value)} className={inputCls} />
              {errors.lossAmount && <div className="text-red-500 text-xs mt-0.5">{errors.lossAmount}</div>}
            </FormField>
            <FormField label="Currency">
              <input value={form.currency} onChange={e => set('currency', e.target.value)} maxLength={3} className={inputCls} />
            </FormField>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 space-y-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Dates</div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Incident Date">
              <input type="date" value={form.incidentDate} onChange={e => set('incidentDate', e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Discovery Date">
              <input type="date" value={form.discoveryDate} onChange={e => set('discoveryDate', e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Closure Date">
              <input type="date" value={form.closureDate} onChange={e => set('closureDate', e.target.value)} className={inputCls} />
            </FormField>
          </div>
        </div>

        {/* Root Cause */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 space-y-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Root Cause & Controls</div>
          <FormField label="Root Cause">
            <textarea value={form.rootCause} onChange={e => set('rootCause', e.target.value)} rows={2} className={textareaCls} />
          </FormField>
          <FormField label="Control Failures">
            <textarea value={form.controlFailures} onChange={e => set('controlFailures', e.target.value)} rows={2} className={textareaCls} />
          </FormField>
          <FormField label="KRI">
            <input value={form.kri} onChange={e => set('kri', e.target.value)} className={inputCls} />
          </FormField>
          <FormField label="Action Plan">
            <textarea value={form.actionPlan} onChange={e => set('actionPlan', e.target.value)} rows={3} className={textareaCls} />
          </FormField>
        </div>

        <div className="flex gap-3 pb-6">
          <button type="submit" disabled={saving}
            className="px-5 py-2 bg-primary text-white text-sm rounded hover:bg-primary-dark disabled:opacity-50 font-medium">
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Event'}
          </button>
          <button type="button" onClick={() => navigate(isEdit ? `/events/${id}` : '/events')}
            className="px-5 py-2 border border-gray-300 text-sm rounded hover:bg-gray-50">Cancel</button>
        </div>
      </form>
    </div>
  )
}
