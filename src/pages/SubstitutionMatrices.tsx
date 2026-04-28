import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import MatrixHeatmap from '../components/MatrixHeatmap';
import { BLOSUM62, BLOSUM62_RESIDUES } from '../lib/matrices/blosum62';
import { BLOSUM50, BLOSUM50_RESIDUES } from '../lib/matrices/blosum50';
import { PAM250, PAM250_RESIDUES } from '../lib/matrices/pam250';
import { PAM30, PAM30_RESIDUES } from '../lib/matrices/pam30';
import { DNA_MATRIX, DNA_RESIDUES } from '../lib/matrices/dna';

const CORE_RESIDUES = ['A','R','N','D','C','Q','E','G','H','I','L','K','M','F','P','S','T','W','Y','V'];

const MATRICES = [
  {
    id: 'blosum62',
    label: 'BLOSUM62',
    matrix: BLOSUM62,
    residues: BLOSUM62_RESIDUES.filter(r => CORE_RESIDUES.includes(r)),
    description: 'Derived from conserved protein blocks at 62% identity. The standard choice for most protein database searches (BLAST default). Penalises conservative substitutions moderately.',
  },
  {
    id: 'blosum50',
    label: 'BLOSUM50',
    matrix: BLOSUM50,
    residues: BLOSUM50_RESIDUES.filter(r => CORE_RESIDUES.includes(r)),
    description: 'Built from blocks at 50% identity. More conservative than BLOSUM62; better for aligning distantly related proteins or for gapped alignments with long gaps.',
  },
  {
    id: 'pam250',
    label: 'PAM250',
    matrix: PAM250,
    residues: PAM250_RESIDUES,
    description: 'PAM250 models ~250 accepted mutations per 100 residues (~20% identity). Appropriate for comparing very distantly related proteins. Tolerates more conservative replacements.',
  },
  {
    id: 'pam30',
    label: 'PAM30',
    matrix: PAM30,
    residues: PAM30_RESIDUES,
    description: 'PAM30 models ~30 accepted mutations per 100 residues (~85% identity). Suited to short, highly similar sequences such as peptide matches. Used in BLAST short-sequence mode.',
  },
  {
    id: 'dna',
    label: 'DNA (match/mismatch)',
    matrix: DNA_MATRIX,
    residues: DNA_RESIDUES,
    description: 'Simple DNA scoring matrix: +1 for matches, -1 for transitions (A↔G, C↔T), -2 for transversions, 0 when N is involved. Appropriate for nucleotide alignments when a neutral-model matrix is not required.',
  },
] as const;

export default function SubstitutionMatrices() {
  const [active, setActive] = useState<string>('blosum62');
  const current = MATRICES.find(m => m.id === active)!;

  return (
    <PageLayout
      title="Substitution Matrix Viewer"
      subtitle="Interactive heatmaps of BLOSUM62, BLOSUM50, PAM250, PAM30, and DNA matrices."
    >
      <div className="max-w-4xl space-y-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
          {MATRICES.map(m => (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                active === m.id
                  ? 'bg-[#1e3a5f] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">{current.description}</p>

        {/* Heatmap */}
        <div className="border border-gray-200 rounded-lg p-4 overflow-auto">
          <MatrixHeatmap
            matrix={current.matrix as Record<string, Record<string, number>>}
            residues={current.residues as unknown as string[]}
            title={current.label}
          />
        </div>

        {/* Usage guide */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 space-y-2">
          <h3 className="font-semibold text-gray-800">When to use each matrix</h3>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-1 pr-4">Matrix</th>
                <th className="text-left py-1 pr-4">Approx. identity</th>
                <th className="text-left py-1">Best for</th>
              </tr>
            </thead>
            <tbody className="space-y-1">
              {[
                ['PAM30',    '~85%', 'Short, near-identical sequences; peptide BLAST'],
                ['BLOSUM62', '~62%', 'General protein search; BLAST default'],
                ['BLOSUM50', '~50%', 'More divergent queries; gapped alignments'],
                ['PAM250',   '~20%', 'Very distantly related proteins'],
                ['DNA',       'n/a', 'Nucleotide alignments (basic match/mismatch)'],
              ].map(([mat, id, use]) => (
                <tr key={mat} className="border-b border-gray-100">
                  <td className="py-1 pr-4 font-mono font-medium text-[#1e3a5f]">{mat}</td>
                  <td className="py-1 pr-4 text-gray-500">{id}</td>
                  <td className="py-1 text-gray-600">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
