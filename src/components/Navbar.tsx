import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/',                     label: 'Home' },
  { to: '/theory',               label: 'Theory' },
  { to: '/needleman-wunsch',     label: 'Needleman-Wunsch' },
  { to: '/smith-waterman',       label: 'Smith-Waterman' },
  { to: '/blast',                label: 'BLAST-lite' },
  { to: '/substitution-matrices',label: 'Matrices' },
  { to: '/test-cases',           label: 'Test Cases' },
  { to: '/analysis',             label: 'Analysis' },
  { to: '/source',               label: 'Source' },
  { to: '/conclusion',           label: 'Conclusion' },
  { to: '/references',           label: 'References' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#1e3a5f] shadow-md no-print">
      <nav className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto">
        <span className="text-white font-semibold text-sm whitespace-nowrap py-3 pr-4 border-r border-white/20 mr-2">
          Seq. Alignment
        </span>
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `text-sm px-3 py-3 whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-white border-b-2 border-white font-medium'
                  : 'text-white/70 hover:text-white'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
