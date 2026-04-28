import { useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import PageLayout from '../components/PageLayout';
import DotPlot from '../components/DotPlot';
import MatrixHeatmap from '../components/MatrixHeatmap';
import { BLOSUM62, BLOSUM62_RESIDUES } from '../lib/matrices/blosum62';

const CORE_RESIDUES = ['A','R','N','D','C','Q','E','G','H','I','L','K','M','F','P','S','T','W','Y','V'];

export default function Theory() {
  const [seqA, setSeqA] = useState('ACGTACGTAGCT');
  const [seqB, setSeqB] = useState('ACGAACGTACT');
  const [windowSize, setWindowSize] = useState(1);
  const [stringency, setStringency] = useState(1);
  const [gapOpen, setGapOpen] = useState(-10);
  const [gapExtend, setGapExtend] = useState(-1);

  // Demo alignment for gap penalty widget
  const DEMO_A = 'ACGT----ACGT';
  const DEMO_B = 'ACGTTTTTACGT';
  const gapLen = 4;
  const matches = 8;
  const affineScore = matches + gapOpen + gapExtend * (gapLen - 1);
  const linearScore = matches + gapExtend * gapLen;  // treat gapExtend as linear

  return (
    <PageLayout
      title="Theoretical Foundations"
      subtitle="Biological motivation, scoring schemes, DP algorithms, and heuristic search."
    >
      <div className="space-y-12 max-w-4xl">

        {/* 2.1 Biological motivation */}
        <section id="motivation">
          <h2 className="text-xl font-serif text-[#1e3a5f] mb-3">2.1 Biological motivation</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            All living organisms encode biological information in linear sequences of nucleotides (DNA/RNA) and
            amino acids (proteins). Two sequences that share a common evolutionary ancestor tend to retain
            similarity in their primary structure, which in turn often implies similar three-dimensional
            structure and biochemical function. Sequence alignment is the computational procedure of arranging
            two or more sequences so that corresponding positions are placed in the same column, allowing us to
            quantify their similarity.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Practical applications include: predicting the function of an uncharacterised protein by identifying
            its closest relative in a curated database; detecting conserved regulatory elements in non-coding
            DNA; reconstructing phylogenetic trees; identifying disease-associated mutations by comparing patient
            sequences to reference genomes; and designing primers for PCR amplification.
          </p>
        </section>

        {/* 2.2 Dot matrix */}
        <section id="dotmatrix">
          <h2 className="text-xl font-serif text-[#1e3a5f] mb-3">2.2 Dot matrix and similarity matrices</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            The dot matrix (or dot plot) is the simplest visual tool for detecting similarity between two
            sequences. One sequence is placed on each axis. A dot is drawn at position (i, j) whenever the
            residue at position i of sequence A matches the residue at position j of sequence B within a
            sliding window of size <em>w</em>. Diagonal streaks indicate locally similar regions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Sequence A (vertical)</label>
              <input
                value={seqA}
                onChange={e => setSeqA(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 font-mono text-sm"
                maxLength={200}
              />
              <label className="text-sm font-medium text-gray-700 block">Sequence B (horizontal)</label>
              <input
                value={seqB}
                onChange={e => setSeqB(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 font-mono text-sm"
                maxLength={200}
              />
              <label className="text-sm font-medium text-gray-700 block">
                Window size: {windowSize}
              </label>
              <input type="range" min={1} max={10} value={windowSize}
                onChange={e => { const v = +e.target.value; setWindowSize(v); if (stringency > v) setStringency(v); }}
                className="w-full" />
              <label className="text-sm font-medium text-gray-700 block">
                Stringency: {stringency}/{windowSize}
              </label>
              <input type="range" min={1} max={windowSize} value={stringency}
                onChange={e => setStringency(+e.target.value)}
                className="w-full" />
            </div>
            <div className="md:col-span-2">
              <DotPlot seqA={seqA} seqB={seqB} windowSize={windowSize} stringency={stringency} />
              <p className="text-xs text-gray-400 mt-1">
                Horizontal axis = Sequence B &nbsp;&bull;&nbsp; Vertical axis = Sequence A
              </p>
            </div>
          </div>
        </section>

        {/* 2.3 Scoring schemes */}
        <section id="scoring">
          <h2 className="text-xl font-serif text-[#1e3a5f] mb-3">2.3 Scoring schemes</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            A scoring scheme assigns a numerical reward to each aligned column. For DNA,
            simple match/mismatch scores suffice. For proteins, empirical substitution matrices
            derived from observed evolutionary replacements are more informative.
          </p>
          <h3 className="font-semibold text-gray-800 mb-2">PAM matrices (Dayhoff, 1978)</h3>
          <p className="text-gray-600 leading-relaxed mb-3">
            PAM (Point Accepted Mutation) matrices are built from a model of protein evolution.
            1 PAM represents the expected number of accepted point mutations per 100 residues.
            PAM250 is used for distant relationships (~20% identity); PAM30 for close relatives.
          </p>
          <h3 className="font-semibold text-gray-800 mb-2">BLOSUM matrices (Henikoff &amp; Henikoff, 1992)</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            BLOSUM (BLOcks SUbstitution Matrix) matrices are derived from conserved ungapped blocks
            in related protein families (the BLOCKS database). BLOSUM62 is built from blocks with
            at most 62% pairwise identity, making it appropriate for typical database searches.
            BLOSUM50 is more conservative and suited to divergent queries.
          </p>
          <div className="border border-gray-200 rounded-lg p-4 overflow-auto">
            <MatrixHeatmap
              matrix={BLOSUM62}
              residues={CORE_RESIDUES}
              title="BLOSUM62 (20 standard amino acids)"
            />
          </div>
        </section>

        {/* 2.4 Gap penalties */}
        <section id="gaps">
          <h2 className="text-xl font-serif text-[#1e3a5f] mb-3">2.4 Gap penalties</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            A gap in an alignment represents an insertion or deletion (indel) in one of the sequences.
            Biologically, a single evolutionary event may create a gap of any length, so it is unrealistic
            to penalise each gap character independently.
          </p>
          <div className="space-y-3 mb-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Linear gap penalty</h3>
              <BlockMath math={`\\text{penalty}(k) = g \\cdot k`} />
              <p className="text-sm text-gray-500">where <InlineMath math="g" /> is the gap cost per residue and <InlineMath math="k" /> is gap length.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Affine gap penalty (Gotoh, 1982)</h3>
              <BlockMath math={`\\text{penalty}(k) = g_o + g_e \\cdot (k - 1)`} />
              <p className="text-sm text-gray-500">
                <InlineMath math="g_o" /> = gap-open (paid once); <InlineMath math="g_e" /> = gap-extend (paid for each additional residue).
                This is more biologically realistic and preferred for protein alignment.
              </p>
            </div>
          </div>

          {/* Interactive gap widget */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-700">Interactive: effect of gap parameters</h3>
            <p className="text-xs text-gray-500">
              Example alignment has 8 matches and a gap of length 4.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block">
                  Gap open ({gapOpen})
                </label>
                <input type="range" min={-20} max={-1} value={gapOpen}
                  onChange={e => setGapOpen(+e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block">
                  Gap extend ({gapExtend})
                </label>
                <input type="range" min={-10} max={-1} value={gapExtend}
                  onChange={e => setGapExtend(+e.target.value)} className="w-full" />
              </div>
            </div>
            <div className="font-mono text-sm space-y-1">
              <div>ACGT<span className="text-red-500">----</span>ACGT</div>
              <div>ACGT<span className="text-gray-400">TTTT</span>ACGT</div>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-medium text-gray-700">Affine score:</span>
                <span className="ml-2 font-mono text-[#1e3a5f] font-bold">{affineScore}</span>
                <span className="ml-1 text-xs text-gray-400">
                  (8 + {gapOpen} + {gapExtend}×3)
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Linear score:</span>
                <span className="ml-2 font-mono text-gray-500">{linearScore}</span>
                <span className="ml-1 text-xs text-gray-400">
                  (8 + {gapExtend}×4)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2.5 DP algorithms */}
        <section id="dp">
          <h2 className="text-xl font-serif text-[#1e3a5f] mb-3">2.5 Pairwise DP algorithms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-[#1e3a5f]">Needleman-Wunsch (Global)</h3>
              <p className="text-sm text-gray-500">Aligns the <em>entire</em> length of both sequences. Optimal for sequences of similar length and high similarity.</p>
              <BlockMath math={String.raw`F(i,j) = \max \begin{cases} F(i-1,j-1) + s(a_i,b_j) \\ F(i-1,j) + g \\ F(i,j-1) + g \end{cases}`} />
              <p className="text-xs text-gray-400">Initialisation: <InlineMath math="F(i,0)=g \cdot i,\; F(0,j)=g \cdot j" /></p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-[#1e3a5f]">Smith-Waterman (Local)</h3>
              <p className="text-sm text-gray-500">Finds the highest-scoring <em>sub-region</em>. Robust to divergent flanking sequence.</p>
              <BlockMath math={String.raw`H(i,j) = \max \begin{cases} 0 \\ H(i-1,j-1) + s(a_i,b_j) \\ H(i-1,j) + g \\ H(i,j-1) + g \end{cases}`} />
              <p className="text-xs text-gray-400">Initialisation: <InlineMath math="H(i,0)=H(0,j)=0" />. Traceback from global maximum.</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Both algorithms have time and space complexity of <InlineMath math="O(m \cdot n)" />, where <InlineMath math="m" /> and <InlineMath math="n" /> are sequence lengths. For sequences of 300 residues each this yields 90 000 cells — easily computed in the browser.
          </p>
        </section>

        {/* 2.6 BLAST */}
        <section id="blast">
          <h2 className="text-xl font-serif text-[#1e3a5f] mb-3">2.6 Approximate methods: BLAST</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Exact DP alignment of a query against a database of millions of sequences would require
            <InlineMath math=" O(q \cdot D) " /> time (where <InlineMath math="D" /> is total database length),
            which is prohibitively slow. BLAST (Basic Local Alignment Search Tool; Altschul et al., 1990)
            uses a heuristic pipeline to achieve near-linear speed:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li><strong>Neighbourhood generation.</strong> For each k-mer in the query, enumerate all k-mers scoring above threshold T with a substitution matrix.</li>
            <li><strong>Seed lookup.</strong> Scan the database index for exact matches to those k-mers.</li>
            <li><strong>Ungapped extension.</strong> Extend each seed in both directions; stop when the score drops by X below the running maximum (X-drop criterion).</li>
            <li><strong>Gapped extension.</strong> High-scoring segment pairs (HSPs) above a cutoff S are refined with Smith-Waterman.</li>
            <li><strong>E-value calculation.</strong> Statistical significance is estimated using Karlin-Altschul theory.</li>
          </ol>
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded p-3">
            <p className="text-sm font-semibold text-gray-700 mb-1">Karlin-Altschul E-value:</p>
            <BlockMath math={`E = K \\cdot m \\cdot n \\cdot e^{-\\lambda S}`} />
            <p className="text-xs text-gray-500">
              <InlineMath math="m" /> = query length, <InlineMath math="n" /> = database length,
              <InlineMath math=" S" /> = raw score, <InlineMath math="\lambda" /> and <InlineMath math="K" /> = statistical parameters estimated from the scoring system.
            </p>
          </div>
        </section>

      </div>
    </PageLayout>
  );
}
