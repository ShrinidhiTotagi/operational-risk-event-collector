import { useState, useEffect } from 'react';
import { eventService } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { Calendar } from 'lucide-react';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30days');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real app, we'd pass the period to the backend
        const response = await eventService.getStats();
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [period]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  if (!stats) return <div className="text-center py-10">Failed to load analytics data.</div>;

  // Mock data for time series since backend doesn't provide it yet
  const timeSeriesData = [
    { name: 'Week 1', events: 4, critical: 1, resolved: 2 },
    { name: 'Week 2', events: 7, critical: 2, resolved: 3 },
    { name: 'Week 3', events: 3, critical: 0, resolved: 5 },
    { name: 'Week 4', events: 5, critical: 1, resolved: 4 },
  ];

  const categoryData = Object.entries(stats.eventsByCategory || {}).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Detailed operational risk analysis and trends.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2 bg-white rounded-md border border-gray-300 p-1">
          <button 
            onClick={() => setPeriod('7days')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${period === '7days' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            7 Days
          </button>
          <button 
            onClick={() => setPeriod('30days')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${period === '30days' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            30 Days
          </button>
          <button 
            onClick={() => setPeriod('90days')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${period === '90days' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            3 Months
          </button>
          <button 
            onClick={() => setPeriod('1year')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${period === '1year' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            1 Year
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Trend Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Event Trends Over Time</h3>
            <Calendar className="text-gray-400 h-5 w-5" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="events" name="Total Events" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEvents)" />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#22c55e" fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Events by Category</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="value" name="Count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">AI Risk Score Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { range: '0-20', count: 2 },
                  { range: '21-40', count: 5 },
                  { range: '41-60', count: 8 },
                  { range: '61-80', count: 4 },
                  { range: '81-100', count: 1 }
                ]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" name="Events" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
