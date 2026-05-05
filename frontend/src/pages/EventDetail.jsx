import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventService, aiService } from '../services/api';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Trash2, BrainCircuit, Activity, AlertTriangle, Info } from 'lucide-react';
import clsx from 'clsx';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventService.getById(id);
        setEvent(response.data);
      } catch (error) {
        console.error("Failed to fetch event", error);
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.delete(id);
        navigate('/events');
      } catch (error) {
        alert('Failed to delete event');
      }
    }
  };

  const runAiAnalysis = async () => {
    if (!event) return;
    setAnalyzing(true);
    try {
      const result = await aiService.analyze(event.title, event.description, event.category);
      
      // Update event with AI results
      const updatedEvent = {
        ...event,
        aiScore: result.data.score,
        aiAnalysis: JSON.stringify(result.data)
      };
      
      const response = await eventService.update(id, updatedEvent);
      setEvent(response.data);
    } catch (error) {
      console.error("AI Analysis failed", error);
      alert('AI Analysis failed. Make sure the AI service is running and API key is set.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  if (!event) return null;

  // Parse AI Analysis if it exists
  let aiData = null;
  try {
    if (event.aiAnalysis) {
      // Handle both raw string and JSON string cases
      aiData = event.aiAnalysis.startsWith('{') ? JSON.parse(event.aiAnalysis) : { analysis: event.aiAnalysis };
    }
  } catch (e) {
    aiData = { analysis: event.aiAnalysis };
  }

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800 font-bold';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score < 30) return 'text-green-500 bg-green-50 border-green-200';
    if (score < 70) return 'text-yellow-500 bg-yellow-50 border-yellow-200';
    return 'text-red-500 bg-red-50 border-red-200';
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate('/events')} className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Events
        </button>
        <div className="flex space-x-3">
          <Link to={`/events/${event.id}/edit`} className="btn-secondary">
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Link>
          <button onClick={handleDelete} className="btn-danger">
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`badge ${getSeverityBadgeColor(event.severity)} px-3 py-1 text-sm`}>
                {event.severity} SEVERITY
              </span>
              <span className="text-sm font-medium text-gray-500">
                {event.status.replace('_', ' ')}
              </span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
            
            <div className="flex items-center text-sm text-gray-500 mb-6 space-x-4">
              <span className="flex items-center"><Activity className="h-4 w-4 mr-1"/> {event.category}</span>
              <span>•</span>
              <span>Occurred: {event.occurredAt ? format(new Date(event.occurredAt), 'MMM dd, yyyy HH:mm') : 'N/A'}</span>
            </div>

            <div className="prose max-w-none">
              <h3 className="text-lg font-medium text-gray-900 mb-2 border-b pb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          </div>
          
          {/* Audit Info could go here if implemented on frontend */}
        </div>

        {/* Sidebar / AI Panel */}
        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
            <div className="p-5 border-b border-indigo-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-indigo-900 flex items-center">
                <BrainCircuit className="h-5 w-5 mr-2 text-indigo-600" />
                AI Analysis
              </h3>
              {(!event.aiScore || !event.aiAnalysis) && (
                 <button 
                  onClick={runAiAnalysis} 
                  disabled={analyzing}
                  className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {analyzing ? 'Analyzing...' : 'Run Analysis'}
                </button>
              )}
            </div>
            
            <div className="p-5">
              {analyzing ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-pulse flex space-x-2">
                    <div className="h-3 w-3 bg-indigo-400 rounded-full"></div>
                    <div className="h-3 w-3 bg-indigo-500 rounded-full animation-delay-200"></div>
                    <div className="h-3 w-3 bg-indigo-600 rounded-full animation-delay-400"></div>
                  </div>
                  <p className="text-sm text-indigo-600 mt-4">AI is analyzing the event...</p>
                </div>
              ) : event.aiScore ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-indigo-900">Risk Score</span>
                    <div className={clsx("flex items-center justify-center h-12 w-12 rounded-full border-2 font-bold text-lg", getScoreColor(event.aiScore))}>
                      {event.aiScore}
                    </div>
                  </div>
                  
                  {aiData?.analysis && (
                    <div>
                      <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2">Rationale</h4>
                      <p className="text-sm text-indigo-900/80 bg-white/60 p-3 rounded-md text-justify leading-relaxed">
                        {aiData.analysis}
                      </p>
                    </div>
                  )}

                  {aiData?.suggested_actions && aiData.suggested_actions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2">Suggested Actions</h4>
                      <ul className="space-y-2">
                        {aiData.suggested_actions.map((action, idx) => (
                          <li key={idx} className="text-sm text-indigo-900/80 flex items-start">
                            <Info className="h-4 w-4 mr-2 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="pt-4 mt-2 border-t border-indigo-200/50">
                    <button 
                      onClick={runAiAnalysis} 
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 w-full text-center"
                    >
                      Re-run Analysis
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <AlertTriangle className="h-10 w-10 text-indigo-300 mx-auto mb-3" />
                  <p className="text-sm text-indigo-700">No AI analysis available for this event yet.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="card p-5">
            <h3 className="text-sm font-medium text-gray-900 mb-4 border-b pb-2">System Info</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Event ID</dt>
                <dd className="text-gray-900 truncate w-32" title={event.id}>{event.id.substring(0, 8)}...</dd>
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
    </div>
  );
}
