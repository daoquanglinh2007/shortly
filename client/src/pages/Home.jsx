import { useState } from 'react';
import { createLink } from '../api.js';

export default function Home() {
  // State: values that change while the page is open.
  // [currentValue, functionToChangeIt] = useState(startingValue)
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Runs when the form is submitted (button click or Enter key)
  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser from reloading the page
    setError('');
    setResult(null);
    setCopied(false);
    setLoading(true);
    try {
      const link = await createLink(url, customCode);
      setResult(link);
      setUrl('');
      setCustomCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Shorten a link</h1>
      <p className="text-slate-500 mb-6">Paste a long URL and get a short one you can share.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Long URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.example.com/a/very/long/page"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Custom alias (optional)</label>
          <input
            type="text"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="promo"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </form>

      {/* Only shown when there is an error */}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      {/* Only shown after a link is created */}
      {result && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <a href={result.shortUrl} target="_blank" rel="noreferrer" className="font-mono text-indigo-700 break-all">
            {result.shortUrl}
          </a>
          <button onClick={handleCopy} className="shrink-0 border border-slate-300 bg-white px-3 py-1 rounded-lg hover:bg-slate-100">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  );
}