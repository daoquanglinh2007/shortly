import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getLinks, deleteLink } from '../api.js';

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Runs once when the page opens: load the links from the backend
  useEffect(() => {
    getLinks()
      .then((data) => setLinks(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(code) {
    if (!window.confirm(`Delete /${code}? Its click history will be lost.`)) return;
    try {
      await deleteLink(code);
      // Remove it from the screen without reloading
      setLinks(links.filter((link) => link.code !== code));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your links</h1>
      {error && <p className="mb-4 text-red-600">{error}</p>}

      {links.length === 0 ? (
        <p className="text-slate-500">
          No links yet. <Link to="/" className="text-indigo-600 underline">Create your first one</Link>.
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="px-4 py-3">Short link</th>
                <th className="px-4 py-3">Original URL</th>
                <th className="px-4 py-3 text-right">Clicks</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {/* One table row per link. key helps React track each row */}
              {links.map((link) => (
                <tr key={link.code} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-mono">
                    <Link to={`/stats/${link.code}`} className="text-indigo-600 hover:underline">
                      /{link.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate" title={link.url}>{link.url}</td>
                  <td className="px-4 py-3 text-right">{link.clicks}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(link.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(link.code)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}