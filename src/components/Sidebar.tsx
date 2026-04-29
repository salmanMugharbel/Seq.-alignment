import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/theory', label: 'Theory' },
  { path: '/needleman-wunsch', label: 'Needleman-Wunsch' },
  { path: '/smith-waterman', label: 'Smith-Waterman' },
  { path: '/blast', label: 'BLAST' },
  { path: '/substitution-matrices', label: 'Matrices' },
  { path: '/test-cases', label: 'Test Cases' },
  { path: '/analysis', label: 'Analysis' },
  { path: '/source', label: 'Source Code' },
  { path: '/conclusion', label: 'Conclusion' },
  { path: '/references', label: 'References' },
];

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-[#1e3a5f] text-white transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-0 -translate-x-full'
        } md:w-64 md:translate-x-0 overflow-y-auto`}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold mb-8 text-center">Seq. Alignment</h1>
          <nav className="space-y-2">
            {NAV_LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-2 rounded text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-blue-700 text-blue-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed md:hidden top-4 left-4 z-50 p-2 bg-[#1e3a5f] text-white rounded hover:bg-blue-700"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Spacer on desktop */}
      <div className="hidden md:block w-64" />
    </>
  );
};
