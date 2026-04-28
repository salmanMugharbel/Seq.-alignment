import { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import PageLayout from '../components/PageLayout';

SyntaxHighlighter.registerLanguage('typescript', typescript);

const NW_CODE = `// needlemanWunsch.ts — Needleman-Wunsch global alignment
// Reference: Needleman SB, Wunsch CD (1970). J Mol Biol 48(3):443-453.
// Time: O(m*n) | Space: O(m*n)

import type { AlignmentParams, AlignmentResult, DPCell, Direction, DPStep } from './types';
import { residueScore, gapCost, computeIdentitySimilarity } from './scoring';

export function needlemanWunsch(params: AlignmentParams): AlignmentResult {
  const seqA = params.seqA, seqB = params.seqB;
  const m = seqA.length, n = seqB.length;

  // Allocate (m+1) x (n+1) DP matrix
  const dp: DPCell[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => ({ score: 0, directions: [] as Direction[] }))
  );

  // Initialise: first cell
  dp[0][0] = { score: 0, directions: ['none'] };

  // First column: gap penalties for seqA
  for (let i = 1; i <= m; i++)
    dp[i][0] = { score: gapCost(i, params), directions: ['up'] };

  // First row: gap penalties for seqB
  for (let j = 1; j <= n; j++)
    dp[0][j] = { score: gapCost(j, params), directions: ['left'] };

  // Fill interior cells
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const sub  = residueScore(seqA[i-1], seqB[j-1], params);
      const diag = dp[i-1][j-1].score + sub;
      const up   = dp[i-1][j].score   + gapCost(1, params);
      const left = dp[i][j-1].score   + gapCost(1, params);
      const best = Math.max(diag, up, left);

      const dirs: Direction[] = [];
      if (diag === best) dirs.push('diag');
      if (up   === best) dirs.push('up');
      if (left === best) dirs.push('left');
      dp[i][j] = { score: best, directions: dirs };
    }
  }

  // Traceback from (m, n) to (0, 0)
  let [alignedA, alignedB] = ['', ''];
  const path: [number, number][] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    path.push([i, j]);
    const dir = dp[i][j].directions[0];
    if      (dir === 'diag') { alignedA = seqA[i-1] + alignedA; alignedB = seqB[j-1] + alignedB; i--; j--; }
    else if (dir === 'up')   { alignedA = seqA[i-1] + alignedA; alignedB = '-'        + alignedB; i--; }
    else                     { alignedA = '-'        + alignedA; alignedB = seqB[j-1] + alignedB; j--; }
  }
  path.push([0, 0]);
  path.reverse();

  const { identity, similarity, gaps } = computeIdentitySimilarity(alignedA, alignedB, params);
  return { alignedA, alignedB, score: dp[m][n].score, identity, similarity, gaps,
           length: alignedA.length, dpMatrix: dp, tracebackPath: path };
}

// Step iterator for animated fill (yields one DPStep per cell)
export function* needlemanWunschSteps(params: AlignmentParams): Generator<DPStep> {
  // ... (same logic as above, yielding each cell as it is computed)
}`;

const SW_CODE = `// smithWaterman.ts — Smith-Waterman local alignment
// Reference: Smith TF, Waterman MS (1981). J Mol Biol 147(1):195-197.
// Key difference from N-W: scores clamped to 0; traceback from global max.

import type { AlignmentParams, AlignmentResult, DPCell, Direction, DPStep } from './types';
import { residueScore, gapCost, computeIdentitySimilarity } from './scoring';

export function smithWaterman(params: AlignmentParams): AlignmentResult {
  const seqA = params.seqA, seqB = params.seqB;
  const m = seqA.length, n = seqB.length;

  const dp: DPCell[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => ({ score: 0, directions: ['none'] as Direction[] }))
  );

  let maxScore = 0, maxI = 0, maxJ = 0;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const sub  = residueScore(seqA[i-1], seqB[j-1], params);
      const diag = dp[i-1][j-1].score + sub;
      const up   = dp[i-1][j].score   + gapCost(1, params);
      const left = dp[i][j-1].score   + gapCost(1, params);
      const best = Math.max(0, diag, up, left);     // <-- clamped to 0

      const dirs: Direction[] = [];
      if (best === 0)        { dirs.push('none'); }
      else {
        if (diag === best) dirs.push('diag');
        if (up   === best) dirs.push('up');
        if (left === best) dirs.push('left');
      }
      dp[i][j] = { score: best, directions: dirs };

      if (best > maxScore) { maxScore = best; maxI = i; maxJ = j; }
    }
  }

  // Traceback from global maximum; stop at zero cell
  let [alignedA, alignedB] = ['', ''];
  const path: [number, number][] = [];
  let i = maxI, j = maxJ;
  while (i > 0 && j > 0 && dp[i][j].score > 0) {
    path.push([i, j]);
    const dir = dp[i][j].directions[0];
    if      (dir === 'diag') { alignedA = seqA[i-1] + alignedA; alignedB = seqB[j-1] + alignedB; i--; j--; }
    else if (dir === 'up')   { alignedA = seqA[i-1] + alignedA; alignedB = '-'        + alignedB; i--; }
    else                     { alignedA = '-'        + alignedA; alignedB = seqB[j-1] + alignedB; j--; }
  }
  path.push([i, j]); path.reverse();

  const { identity, similarity, gaps } = alignedA.length > 0
    ? computeIdentitySimilarity(alignedA, alignedB, params) : { identity: 0, similarity: 0, gaps: 0 };
  return { alignedA, alignedB, score: maxScore, identity, similarity, gaps,
           length: alignedA.length, dpMatrix: dp, tracebackPath: path };
}`;

const BLAST_CODE = `// blastLite.ts — simplified BLAST heuristic search
// Reference: Altschul SF et al. (1990). J Mol Biol 215(3):403-410.

export function blastLite(params: BlastParams): BlastHit[] {
  const query = params.query.toUpperCase();
  const wordSize = params.wordSize ?? 3;
  const xDrop    = params.xDrop    ?? 15;

  // 1. Index all k-mers from the query
  const queryKmers = new Map<string, number[]>();
  for (let i = 0; i <= query.length - wordSize; i++) {
    const kmer = query.slice(i, i + wordSize);
    if (!queryKmers.has(kmer)) queryKmers.set(kmer, []);
    queryKmers.get(kmer)!.push(i);
  }

  const hits: BlastHit[] = [];

  for (const dbSeq of params.db) {
    const subject = dbSeq.sequence.toUpperCase();
    const seen = new Set<string>();

    // 2. Find seeds: exact k-mer matches between query and subject
    for (let sj = 0; sj <= subject.length - wordSize; sj++) {
      const kmer = subject.slice(sj, sj + wordSize);
      const queryPositions = queryKmers.get(kmer);
      if (!queryPositions) continue;

      for (const qi of queryPositions) {
        if (seen.has(\`\${qi}-\${sj}\`)) continue;
        seen.add(\`\${qi}-\${sj}\`);

        // Seed score
        let seedScore = 0;
        for (let k = 0; k < wordSize; k++)
          seedScore += score(query[qi+k], subject[sj+k]);

        // 3. Extend right with X-drop criterion
        let [qR, sR, rScore, bestR] = [qi+wordSize, sj+wordSize, seedScore, seedScore];
        while (qR < query.length && sR < subject.length) {
          rScore += score(query[qR], subject[sR]);
          if (rScore > bestR) { bestR = rScore; }
          if (bestR - rScore >= xDrop) break;
          qR++; sR++;
        }

        // 4. Extend left with X-drop criterion
        let [qL, sL, lScore, bestL] = [qi-1, sj-1, 0, 0];
        while (qL >= 0 && sL >= 0) {
          lScore += score(query[qL], subject[sL]);
          if (lScore > bestL) { bestL = lScore; }
          if (bestL - lScore >= xDrop) break;
          qL--; sL--;
        }

        const totalScore = bestL + bestR;
        if (totalScore <= 0) continue;

        // 5. Compute Karlin-Altschul E-value
        const ev = K * query.length * dbTotalLen * Math.exp(-lambda * totalScore);
        hits.push({ subjectId: dbSeq.id, rawScore: totalScore, eValue: ev, ... });
      }
    }
  }

  // 6. Deduplicate (keep best hit per subject) and sort by E-value
  return deduplicate(hits).sort((a, b) => a.eValue - b.eValue);
}`;

const FILES = [
  { id: 'nw',    label: 'needlemanWunsch.ts',  code: NW_CODE    },
  { id: 'sw',    label: 'smithWaterman.ts',     code: SW_CODE    },
  { id: 'blast', label: 'blastLite.ts',         code: BLAST_CODE },
];

export default function Source() {
  const [active, setActive] = useState('nw');
  const current = FILES.find(f => f.id === active)!;

  return (
    <PageLayout
      title="Source Code Listing"
      subtitle="Annotated implementation of all three algorithms. Print this page for the written report (section 3.4)."
    >
      <div className="max-w-5xl space-y-4">
        <p className="text-sm text-gray-500">
          Full source is in <code className="bg-gray-100 px-1 rounded">src/lib/alignment/</code>. The listings
          below are the essential logic with explanatory comments. Line numbers are shown on the left.
          Use <strong>Ctrl+P</strong> (or Cmd+P on macOS) to print a clean version for inclusion in the report.
        </p>

        {/* File tabs */}
        <div className="flex gap-2 no-print">
          {FILES.map(f => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className={`px-4 py-1.5 rounded text-sm font-mono transition-colors ${
                active === f.id ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Code block */}
        <div className="border border-gray-200 rounded-lg overflow-hidden text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between no-print">
            <span className="text-xs font-mono text-gray-500">src/lib/alignment/{current.label}</span>
          </div>
          <SyntaxHighlighter
            language="typescript"
            style={githubGist}
            showLineNumbers
            wrapLines
            customStyle={{ margin: 0, borderRadius: 0, fontSize: '12px', background: '#fff' }}
          >
            {current.code}
          </SyntaxHighlighter>
        </div>
      </div>
    </PageLayout>
  );
}
