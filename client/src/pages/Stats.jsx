import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { getStats } from '../api.js';

export default function Stats() {
  const { code } = useParams(); // reads :code from the address, e.g. /stats/promo
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  // Load the stats when the page opens, or when the code changes
  useEffect(() => {
    getStats(code)
      .then((data) => setStats(data))
      .catch((err) => setError(err.message));
  }, [code]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!stats) return <p className="text-slate-500">Loading...</p>;

  return (
    <div>
      <Link to="/dashboard" className="text-sm text-indigo-600 hover:underline">Back to dashboard</Link>
      <h1 className="text-3xl font-bold font-mono mt-2">/{stats.code}</h1>
      <p className="text-slate-500 truncate mb-6" title={stats.url}>{stats.url}</p>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <p className="text-sm text-slate-500">Total clicks</p>
        <p className="text-4xl font-bold">{stats.totalClicks}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold mb-4">Clicks in the last 7 days (UTC)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => date.slice(5)} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="clicks" stroke="#4f46e5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold mb-4">Top referrers</h2>
        {stats.topReferrers.length === 0 ? (
          <p className="text-slate-500">No clicks yet.</p>
        ) : (
          <ul className="space-y-2">
            {stats.topReferrers.map((r) => (
              <li key={r.referrer} className="flex justify-between gap-4">
                <span className="truncate">{r.referrer}</span>
                <span className="font-medium">{r.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}