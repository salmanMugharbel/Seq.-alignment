import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import MatrixView from '../components/MatrixView';
import AlignmentDisplay from '../components/AlignmentDisplay';
import { TEST_CASES } from '../data/testCases';
import { needlemanWunsch } from '../lib/alignment/needlemanWunsch';
import type { AlignmentParams } from '../lib/alignment/types';

// Pre-compute TC1 result inline for the full-matrix display
const TC1_PARAMS: AlignmentParams = {
  seqA: 'GATTACA',
  seqB: 'GCATGCU',
  sequenceType: 'dna',
  matchScore: 1,
  mismatchScore: -1,
  gap: { mode: 'linear', gapPenalty: -1 },
};
const tc1Result = needlemanWunsch(TC1_PARAMS);

const ALGO_LABELS: Record<string, string> = {
  'needleman-wunsch': 'Needleman-Wunsch',
  'smith-waterman': 'Smith-Waterman',
  'blast': 'BLAST-lite',
};

const ALGO_ROUTES: Record<string, string> = {
  'needleman-wunsch': '/needleman-wunsch',
  'smith-waterman': '/smith-waterman',
  'blast': '/blast',
};

export default function TestCases() {
  return (
    <PageLayout
      title="Predefined Test Cases"
      subtitle="Three required test cases demonstrating each algorithm."
    >
      <div className="max-w-5xl space-y-10">

        {/* Summary table */}
        <div className="overflow-auto border border-gray-200 rounded-lg">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 border-b border-gray-200 font-medium">#</th>
                <th className="text-left px-4 py-2 border-b border-gray-200 font-medium">Name</th>
                <th className="text-left px-4 py-2 border-b border-gray-200 font-medium">Algorithm</th>
                <th className="text-left px-4 py-2 border-b border-gray-200 font-medium">Seq A</th>
                <th className="text-left px-4 py-2 border-b border-gray-200 font-medium">Seq B / Query</th>
                <th className="text-right px-4 py-2 border-b border-gray-200 font-medium">Expected score</th>
                <th className="px-4 py-2 border-b border-gray-200" />
              </tr>
            </thead>
            <tbody>
              {TEST_CASES.map((tc, idx) => (
                <tr key={tc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-400 font-mono">{idx + 1}</td>
                  <td className="px-4 py-2 font-medium text-gray-800">{tc.name}</td>
                  <td className="px-4 py-2">
                    <span className="bg-[#1e3a5f]/10 text-[#1e3a5f] px-2 py-0.5 rounded text-xs font-medium">
                      {ALGO_LABELS[tc.algorithm]}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-600">
                    {(tc.params.seqA ?? tc.query ?? '').slice(0, 20)}
                    {(tc.params.seqA ?? tc.query ?? '').length > 20 ? '...' : ''}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-600">
                    {(tc.params.seqB ?? '').slice(0, 20)}
                    {(tc.params.seqB ?? '').length > 20 ? '...' : ''}
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-medium text-[#1e3a5f]">
                    {tc.expectedScore ?? 'see hit list'}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      to={ALGO_ROUTES[tc.algorithm]}
                      className="text-xs text-[#1e3a5f] hover:underline"
                    >
                      Open tool
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TC1 detail */}
        <section className="border border-gray-200 rounded-lg p-6 space-y-5">
          <div>
            <h2 className="text-lg font-serif text-[#1e3a5f]">
              Test Case 1: {TEST_CASES[0].name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{TEST_CASES[0].notes}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-400">Sequence A:</span> <span className="font-mono font-medium">{TC1_PARAMS.seqA}</span></div>
            <div><span className="text-gray-400">Sequence B:</span> <span className="font-mono font-medium">{TC1_PARAMS.seqB}</span></div>
            <div><span className="text-gray-400">Match:</span> +{TC1_PARAMS.matchScore}</div>
            <div><span className="text-gray-400">Mismatch:</span> {TC1_PARAMS.mismatchScore}</div>
            <div><span className="text-gray-400">Gap:</span> {TC1_PARAMS.gap.mode === 'linear' ? TC1_PARAMS.gap.gapPenalty : ''}</div>
          </div>
          <AlignmentDisplay
            alignedA={tc1Result.alignedA}
            alignedB={tc1Result.alignedB}
            score={tc1Result.score}
            identity={tc1Result.identity}
            similarity={tc1Result.similarity}
            gaps={tc1Result.gaps}
          />
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Full DP Matrix (8x8)</h3>
            <MatrixView
              matrix={tc1Result.dpMatrix}
              seqA={TC1_PARAMS.seqA}
              seqB={TC1_PARAMS.seqB}
              tracebackPath={tc1Result.tracebackPath}
            />
          </div>
        </section>

        {/* TC2 detail */}
        <section className="border border-gray-200 rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-serif text-[#1e3a5f]">{TEST_CASES[1].name}</h2>
          <p className="text-sm text-gray-500">{TEST_CASES[1].notes}</p>
          <div className="grid grid-cols-1 gap-1 text-sm font-mono bg-gray-50 border border-gray-200 rounded p-3">
            <div><span className="text-gray-400">SeqA:</span> {TEST_CASES[1].params.seqA}</div>
            <div><span className="text-gray-400">SeqB:</span> {TEST_CASES[1].params.seqB}</div>
            <div><span className="text-gray-400">Expected score:</span> <span className="text-[#1e3a5f] font-bold">{TEST_CASES[1].expectedScore}</span></div>
          </div>
          <Link to="/smith-waterman" className="inline-block text-sm text-[#1e3a5f] border border-[#1e3a5f] px-4 py-1.5 rounded hover:bg-[#1e3a5f] hover:text-white transition-colors">
            Run in Smith-Waterman tool
          </Link>
        </section>

        {/* TC3 detail */}
        <section className="border border-gray-200 rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-serif text-[#1e3a5f]">{TEST_CASES[2].name}</h2>
          <p className="text-sm text-gray-500">{TEST_CASES[2].notes}</p>
          <div className="text-sm font-mono bg-gray-50 border border-gray-200 rounded p-3">
            <div><span className="text-gray-400">Query:</span> {TEST_CASES[2].query}</div>
            <div className="mt-1 text-gray-400 text-xs">Expected top hit: sp|P69905|HBA_HUMAN</div>
          </div>
          <Link to="/blast" className="inline-block text-sm text-[#1e3a5f] border border-[#1e3a5f] px-4 py-1.5 rounded hover:bg-[#1e3a5f] hover:text-white transition-colors">
            Run in BLAST-lite tool
          </Link>
        </section>
      </div>
    </PageLayout>
  );
}
