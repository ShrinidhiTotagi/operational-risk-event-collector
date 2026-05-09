import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventService, aiService } from '../services/api';
import { format } from 'date-fns';
import {
  ArrowLeft, Edit, Trash2, BrainCircuit, Activity, AlertTriangle,
  CheckCircle, Clock, Shield, TrendingUp, MessageSquare, Send, X, RefreshCw
} from 'lucide-react';
import clsx from 'clsx';

const PRIORITY_COLORS = {
  IMMEDIATE: 'bg-red-100 text-red-700 border-red-200',
  SHORT_TERM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  LONG_TERM: 'bg-blue-100 text-blue-700 border-blue-200',
};

const LIKELIHOOD_COLORS = {
  RARE: 'text-green-600', UNLIKELY: 'text-green-500', POSSIBLE: 'text-yellow-500',
  LIKELY: 'text-orange-500', ALMOST_CERTAIN: 'text-red-600',
};

const IMPACT_COLORS = {
  NEGLIGIBLE: 'text-green-600', MINOR: 'text-green-500', MODERATE: 'text-yellow-500',
  MAJOR: 'text-orange-500', CATASTROPHIC: 'text-red-600',
};

function ScoreGauge({ score }) {
  const color = score < 30 ? '#22c55e' : score < 60 ? '#f59e0b' : score < 80 ? '#f97316' : '#ef4444';
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="28" fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="40" cy="40" r="28" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 40 40)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x="40" y="45" textAnchor="middle" fontSize="18" fontWeight="bold" fill={color}>{score}</text>
      </svg>
      <span className="text-xs text-gray-500 mt-1">Risk Score</span>
    </div>
  );
}

function ConfidenceBar({ confidence }) {
  const color = confidence >= 70 ? 'bg-green-500' : confidence >= 40 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <div>
      <div className="flex justify-between text-xs text-indigo-700 mb-1">
        <span>AI Confidence</span><span>{confidence}%</span>
      </div>
      <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${confidence}%`, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
}

function ChatWidget({ event, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi! I'm your AI risk analyst. Ask me anything about this "${event.title}" event.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    const history = messages.slice(1);
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await aiService.chat(event, history, input);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not process that. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-indigo-100 flex flex-col z-50" style={{ height: '480px' }}>
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="h-5 w-5 text-white" />
          <span className="text-white font-semibold text-sm">AI Risk Assistant</span>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white"><X className="h-4 w-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={clsx('max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-none'
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-xl rounded-bl-none">
              <div className="flex space-x-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-gray-100">
        <div className="flex space-x-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask about this event..."
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button onClick={send} disabled={loading || !input.trim()}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    eventService.getById(id)
      .then(r => setEvent(r.data))
      .catch(() => navigate('/events'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this event?')) return;
    try { await eventService.delete(id); navigate('/events'); }
    catch { alert('Failed to delete event'); }
  };

  const runAiAnalysis = async () => {
    if (!event) return;
    setAnalyzing(true);
    try {
      const result = await aiService.analyze(event.title, event.description, event.category, event.severity, event.status);
      const updated = { ...event, aiScore: result.data.score, aiAnalysis: JSON.stringify(result.data) };
      const response = await eventService.update(id, updated);
      setEvent(response.data);
    } catch {
      alert('AI Analysis failed. Check AI service and API key.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!event) return null;

  let aiData = null;
  try {
    if (event.aiAnalysis) aiData = JSON.parse(event.aiAnalysis);
  } catch { aiData = { analysis: event.aiAnalysis }; }

  const severityColors = { LOW: 'bg-green-100 text-green-800', MEDIUM: 'bg-yellow-100 text-yellow-800', HIGH: 'bg-orange-100 text-orange-800', CRITICAL: 'bg-red-100 text-red-800 font-bold' };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate('/events')} className="flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Events
        </button>
        <div className="flex space-x-3">
          <Link to={`/events/${event.id}/edit`} className="btn-secondary"><Edit className="h-4 w-4 mr-2" />Edit</Link>
          <button onClick={handleDelete} className="btn-danger"><Trash2 className="h-4 w-4 mr-2" />Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`badge ${severityColors[event.severity]} px-3 py-1 text-sm`}>{event.severity} SEVERITY</span>
              <span className="text-sm font-medium text-gray-500">{event.status?.replace('_', ' ')}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
            <div className="flex items-center text-sm text-gray-500 mb-6 space-x-4">
              <span className="flex items-center"><Activity className="h-4 w-4 mr-1" />{event.category}</span>
              <span>•</span>
              <span>Occurred: {event.occurredAt ? format(new Date(event.occurredAt), 'MMM dd, yyyy HH:mm') : 'N/A'}</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 border-b pb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
          </div>
        </div>

        {/* AI Panel */}
        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
            <div className="p-5 border-b border-indigo-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-indigo-900 flex items-center">
                <BrainCircuit className="h-5 w-5 mr-2 text-indigo-600" />AI Analysis
              </h3>
              <div className="flex items-center space-x-2">
                {event.aiScore && (
                  <button onClick={() => setShowChat(v => !v)}
                    className="text-xs bg-purple-100 text-purple-700 px-2 py-1.5 rounded hover:bg-purple-200 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> Chat
                  </button>
                )}
                <button onClick={runAiAnalysis} disabled={analyzing}
                  className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1">
                  <RefreshCw className={clsx('h-3 w-3', analyzing && 'animate-spin')} />
                  {analyzing ? 'Analyzing...' : event.aiScore ? 'Re-run' : 'Analyze'}
                </button>
              </div>
            </div>

            <div className="p-5">
              {analyzing ? (
                <div className="flex flex-col items-center py-8">
                  <div className="flex space-x-2">
                    {[0, 1, 2].map(i => <div key={i} className="h-3 w-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                  <p className="text-sm text-indigo-600 mt-4">AI is analyzing the event...</p>
                </div>
              ) : aiData ? (
                <div className="space-y-5">
                  {/* Score + Confidence */}
                  <div className="flex items-center justify-between">
                    <ScoreGauge score={aiData.score ?? event.aiScore} />
                    <div className="flex-1 ml-4 space-y-3">
                      {aiData.confidence !== undefined && <ConfidenceBar confidence={aiData.confidence} />}
                      {aiData.risk_level && (
                        <div className="flex justify-between text-xs">
                          <span className="text-indigo-700">Risk Level</span>
                          <span className={clsx('font-bold', { LOW: 'text-green-600', MEDIUM: 'text-yellow-600', HIGH: 'text-orange-600', CRITICAL: 'text-red-600' }[aiData.risk_level])}>
                            {aiData.risk_level}
                          </span>
                        </div>
                      )}
                      {aiData.estimated_resolution_days && (
                        <div className="flex justify-between text-xs">
                          <span className="text-indigo-700 flex items-center gap-1"><Clock className="h-3 w-3" />Est. Resolution</span>
                          <span className="font-medium text-indigo-900">{aiData.estimated_resolution_days}d</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Likelihood & Impact */}
                  {(aiData.likelihood || aiData.impact) && (
                    <div className="grid grid-cols-2 gap-2">
                      {aiData.likelihood && (
                        <div className="bg-white/60 rounded-lg p-2 text-center">
                          <div className="text-xs text-indigo-600 mb-1">Likelihood</div>
                          <div className={clsx('text-xs font-bold', LIKELIHOOD_COLORS[aiData.likelihood])}>{aiData.likelihood}</div>
                        </div>
                      )}
                      {aiData.impact && (
                        <div className="bg-white/60 rounded-lg p-2 text-center">
                          <div className="text-xs text-indigo-600 mb-1">Impact</div>
                          <div className={clsx('text-xs font-bold', IMPACT_COLORS[aiData.impact])}>{aiData.impact}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Analysis */}
                  {aiData.analysis && (
                    <div>
                      <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2">Analysis</h4>
                      <p className="text-sm text-indigo-900/80 bg-white/60 p-3 rounded-md leading-relaxed">{aiData.analysis}</p>
                    </div>
                  )}

                  {/* Root Causes */}
                  {aiData.root_causes?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2">Root Causes</h4>
                      <ul className="space-y-1">
                        {aiData.root_causes.map((cause, i) => (
                          <li key={i} className="text-sm text-indigo-900/80 flex items-start gap-2">
                            <TrendingUp className="h-3.5 w-3.5 text-orange-400 flex-shrink-0 mt-0.5" />{cause}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested Actions */}
                  {aiData.suggested_actions?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2">Suggested Actions</h4>
                      <ul className="space-y-2">
                        {aiData.suggested_actions.map((item, i) => {
                          const action = typeof item === 'string' ? item : item.action;
                          const priority = typeof item === 'object' ? item.priority : null;
                          return (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <CheckCircle className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                              <div>
                                {priority && (
                                  <span className={clsx('text-xs font-semibold px-1.5 py-0.5 rounded border mr-1', PRIORITY_COLORS[priority])}>
                                    {priority}
                                  </span>
                                )}
                                <span className="text-indigo-900/80">{action}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Regulatory Flags */}
                  {aiData.regulatory_flags?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5" />Regulatory Flags
                      </h4>
                      <ul className="space-y-1">
                        {aiData.regulatory_flags.map((flag, i) => (
                          <li key={i} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded">{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Similar Patterns */}
                  {aiData.similar_risk_patterns && aiData.similar_risk_patterns !== 'Unable to determine' && (
                    <div className="bg-white/60 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-1">Similar Patterns</h4>
                      <p className="text-xs text-indigo-700">{aiData.similar_risk_patterns}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <AlertTriangle className="h-10 w-10 text-indigo-300 mx-auto mb-3" />
                  <p className="text-sm text-indigo-700">No AI analysis yet. Click Analyze to start.</p>
                </div>
              )}
            </div>
          </div>

          {/* System Info */}
          <div className="card p-5">
            <h3 className="text-sm font-medium text-gray-900 mb-4 border-b pb-2">System Info</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Event ID</dt>
                <dd className="text-gray-900 truncate w-32" title={event.id}>{event.id?.substring(0, 8)}...</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Created At</dt>
                <dd className="text-gray-900">{event.createdAt ? format(new Date(event.createdAt), 'MMM dd, yyyy') : 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Reported By</dt>
                <dd className="text-gray-900">{event.createdBy || 'System'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {showChat && <ChatWidget event={event} onClose={() => setShowChat(false)} />}
    </div>
  );
}
