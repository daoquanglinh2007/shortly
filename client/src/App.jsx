import { Routes, Route, NavLink } from 'react-router';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Stats from './pages/Stats.jsx';

// Highlights the menu link for the page you're on
const navClass = ({ isActive }) =>
  isActive ? 'text-indigo-600 font-medium' : 'text-slate-600 hover:text-slate-900';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-6">
          <span className="font-bold text-lg text-indigo-600">Shortly</span>
          <NavLink to="/" end className={navClass}>Shorten</NavLink>
          <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Shows one page depending on the address bar */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stats/:code" element={<Stats />} />
        </Routes>
      </main>
    </div>
  );
}