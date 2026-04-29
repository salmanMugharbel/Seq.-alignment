import PageLayout from '../components/PageLayout';
import AlignmentTool from '../components/AlignmentTool';
import { needlemanWunsch } from '../lib/alignment/needlemanWunsch';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function NeedlemanWunschPage() {
  return (
    <PageLayout
      title="Needleman-Wunsch Global Alignment"
      subtitle="Align the full length of two sequences using dynamic programming."
    >
      <div className="max-w-5xl space-y-6">
        <div className="prose prose-sm max-w-none text-gray-600">
          <p>
            The Needleman-Wunsch algorithm (1970) guarantees an <strong>optimal global alignment</strong>:
            every residue in both sequences is included. It fills an (m+1)&times;(n+1) matrix using
            the recurrence below, then traces back through the matrix to reconstruct the alignment.
            Cells highlighted in navy are on the optimal traceback path; arrow(s) indicate
            the direction of the predecessor cell.
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 overflow-x-auto my-6">
          <BlockMath math={String.raw`F(i,j) = \max \begin{cases} F(i-1,j-1) + s(a_i,b_j) & \text{diagonal (match/mismatch)} \\ F(i-1,j) + g & \text{up (gap in sequence B)} \\ F(i,j-1) + g & \text{left (gap in sequence A)} \end{cases}`} />
        </div>
        <AlignmentTool
          algo={needlemanWunsch}
          defaultSeqA="GATTACA"
          defaultSeqB="GCATGCU"
        />
      </div>
    </PageLayout>
  );
}
