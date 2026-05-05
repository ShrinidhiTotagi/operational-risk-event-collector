import { useState, useEffect } from 'react';
import { eventService } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { ShieldAlert, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await eventService.getStats();
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  if (!stats) return <div className="text-center py-10">Failed to load dashboard data.</div>;

  // Format data for charts
  const severityData = Object.entries(stats.eventsBySeverity || {}).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(stats.eventsByStatus || {}).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of operational risk events.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="card px-4 py-5 sm:p-6 flex items-center">
          <div className="p-3 rounded-md bg-blue-50 text-blue-600 mr-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 truncate">Total Events</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalEvents}</p>
          </div>
        </div>
        
        <div className="card px-4 py-5 sm:p-6 flex items-center">
          <div className="p-3 rounded-md bg-yellow-50 text-yellow-600 mr-4">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 truncate">Open Events</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.openEvents}</p>
          </div>
        </div>

        <div className="card px-4 py-5 sm:p-6 flex items-center">
          <div className="p-3 rounded-md bg-red-50 text-red-600 mr-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 truncate">Critical Events</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.criticalEvents}</p>
          </div>
        </div>

        <div className="card px-4 py-5 sm:p-6 flex items-center">
          <div className="p-3 rounded-md bg-purple-50 text-purple-600 mr-4">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 truncate">Avg. AI Risk Score</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.avgAiScore}/100</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Events by Severity</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Events by Status</h3>
          <div className="h-72 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
