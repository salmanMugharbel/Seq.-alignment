import PageLayout from '../components/PageLayout';
import AlignmentTool from '../components/AlignmentTool';
import { smithWaterman } from '../lib/alignment/smithWaterman';
import { needlemanWunsch } from '../lib/alignment/needlemanWunsch';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function SmithWatermanPage() {
  return (
    <PageLayout
      title="Smith-Waterman Local Alignment"
      subtitle="Find the best-matching sub-region between two sequences."
    >
      <div className="max-w-5xl space-y-6">
        <div className="text-gray-600 text-sm leading-relaxed max-w-3xl">
          <p>
            Smith and Waterman (1981) modified Needleman-Wunsch by clamping all matrix values to
            a minimum of 0. This allows the algorithm to ignore poorly-matching flanking regions
            and focus on the highest-scoring local sub-alignment. The traceback starts at the
            <strong> global maximum</strong> cell and ends when it reaches a zero cell.
          </p>
          <p className="mt-2">
            The side panel below runs global alignment on the same input so you can directly compare
            how global and local alignment differ on sequences with divergent ends.
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 inline-block">
          <BlockMath math={String.raw`H(i,j) = \max \begin{cases} 0 \\ H(i-1,j-1) + s(a_i,b_j) \\ H(i-1,j) + g \\ H(i,j-1) + g \end{cases}`} />
        </div>
        <AlignmentTool
          algo={smithWaterman}
          defaultSeqA="TTTACGTACGTTTT"
          defaultSeqB="ACGTACGT"
          compareAlgo={needlemanWunsch}
          compareLabel="Side-by-side: global alignment of the same input"
        />
      </div>
    </PageLayout>
  );
}
