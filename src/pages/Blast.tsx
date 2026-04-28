import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import { blastLite, type BlastHit } from '../lib/alignment/blastLite';
import { MOCK_DATABASE } from '../data/database';

function HitRow({ hit }: { hit: BlastHit }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 flex items-center justify-between gap-2"
      >
        <div className="flex-1 min-w-0">
          <span className="font-mono text-sm text-[#1e3a5f] font-medium">{hit.subjectId}</span>
          <span className="ml-2 text-sm text-gray-500 truncate">{hit.description}</span>
        </div>
        <div className="flex gap-4 text-sm shrink-0">
          <span className="font-mono">
            <span className="text-gray-400 text-xs">score </span>{hit.rawScore}
          </span>
          <span className="font-mono">
            <span className="text-gray-400 text-xs">bits </span>{hit.bitScore.toFixed(1)}
          </span>
          <span className="font-mono">
            <span className="text-gray-400 text-xs">E </span>
            {hit.eValue < 1e-4 ? hit.eValue.toExponential(2) : hit.eValue.toFixed(4)}
          </span>
          <span className="font-mono">
            <span className="text-gray-400 text-xs">id </span>{(hit.identity * 100).toFixed(0)}%
          </span>
          <span className="text-gray-400 text-sm">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>
      {expanded && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 font-mono text-xs space-y-1">
          <div className="text-gray-400">
            Query  {hit.queryStart + 1}..{hit.queryEnd + 1} &nbsp;&nbsp;
            Subject {hit.subjectStart + 1}..{hit.subjectEnd + 1}
          </div>
          <div>
            <span className="text-gray-400 select-none w-16 inline-block">Query </span>
            {hit.alignedQuery.split('').map((c, k) => (
              <span key={k} className={c === hit.alignedSubject[k] ? 'text-[#1e3a5f] font-bold' : 'text-amber-600'}>{c}</span>
            ))}
          </div>
          <div>
            <span className="text-gray-400 select-none w-16 inline-block">       </span>
            {hit.alignedQuery.split('').map((c, k) => (
              <span key={k} className="text-gray-400">{c === hit.alignedSubject[k] ? '|' : ' '}</span>
            ))}
          </div>
          <div>
            <span className="text-gray-400 select-none w-16 inline-block">Sbjct </span>
            {hit.alignedSubject.split('').map((c, k) => (
              <span key={k} className={c === hit.alignedQuery[k] ? 'text-[#1e3a5f] font-bold' : 'text-amber-600'}>{c}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlastPage() {
  const [query, setQuery] = useState('MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFP');
  const [wordSize, setWordSize] = useState(3);
  const [xDrop, setXDrop] = useState(15);
  const [hits, setHits] = useState<BlastHit[]>([]);
  const [ran, setRan] = useState(false);

  const runSearch = () => {
    const results = blastLite({
      query: query.toUpperCase().replace(/\s/g, ''),
      db: MOCK_DATABASE,
      wordSize,
      xDrop,
    });
    setHits(results);
    setRan(true);
  };

  return (
    <PageLayout
      title="BLAST-lite Heuristic Search"
      subtitle="Seed-and-extend search against a mock database of 22 sequences."
    >
      <div className="max-w-4xl space-y-6">
        <p className="text-sm text-gray-600 leading-relaxed">
          Enter a query sequence (protein or DNA) and search the built-in database using the
          BLAST heuristic. The algorithm generates k-mers from the query, locates exact seed
          matches in each database sequence, extends seeds without gaps until the score drops by
          X below the running maximum, then ranks hits by E-value.
        </p>

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Query sequence</label>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded px-2 py-1.5 font-mono text-sm resize-none"
              placeholder="Paste protein or DNA sequence..."
            />
          </div>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Word size (k)</label>
              <input type="number" min={2} max={15} value={wordSize}
                onChange={e => setWordSize(+e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm w-20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">X-drop</label>
              <input type="number" min={5} max={50} value={xDrop}
                onChange={e => setXDrop(+e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm w-20" />
            </div>
            <button
              onClick={runSearch}
              className="bg-[#1e3a5f] text-white px-5 py-2 rounded text-sm font-medium hover:bg-[#2a4f82] transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Results */}
        {ran && (
          <div className="space-y-2">
            <h2 className="font-semibold text-gray-800">
              {hits.length > 0 ? `${hits.length} hit${hits.length === 1 ? '' : 's'} found` : 'No hits found'}
            </h2>
            {hits.map(h => <HitRow key={h.subjectId} hit={h} />)}
          </div>
        )}

        {/* DB summary */}
        <details className="border border-gray-200 rounded-lg">
          <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50">
            Database contents ({MOCK_DATABASE.length} sequences)
          </summary>
          <div className="overflow-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-1.5 border-b border-gray-200">ID</th>
                  <th className="text-left px-3 py-1.5 border-b border-gray-200">Description</th>
                  <th className="text-right px-3 py-1.5 border-b border-gray-200">Length</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DATABASE.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-3 py-1.5 font-mono text-[#1e3a5f]">{s.id}</td>
                    <td className="px-3 py-1.5 text-gray-600">{s.description}</td>
                    <td className="px-3 py-1.5 text-right text-gray-500">{s.sequence.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </PageLayout>
  );
}
