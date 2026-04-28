/**
 * Smith-Waterman local sequence alignment algorithm.
 *
 * Reference: Smith TF, Waterman MS (1981). "Identification of common
 * molecular subsequences." J Mol Biol 147(1):195-197.
 *
 * Key differences from Needleman-Wunsch:
 *   - Scores are clamped to 0 (no negative cells)
 *   - Initialisation row/col are all 0
 *   - Traceback starts at the global maximum cell and stops at any cell with score 0
 */

import type {
  AlignmentParams,
  AlignmentResult,
  DPCell,
  Direction,
  DPStep,
} from './types';
import { residueScore, gapCost, computeIdentitySimilarity } from './scoring';

// ---------------------------------------------------------------------------
// Core alignment function
// ---------------------------------------------------------------------------

export function smithWaterman(params: AlignmentParams): AlignmentResult {
  const seqA = params.seqA;
  const seqB = params.seqB;
  const m = seqA.length;
  const n = seqB.length;

  // -------------------------------------------------------------------------
  // 1. Allocate and initialise (all zeros for first row/column)
  // -------------------------------------------------------------------------

  const dp: DPCell[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => ({ score: 0, directions: ['none'] as Direction[] }))
  );

  // -------------------------------------------------------------------------
  // 2. Fill — same recurrence as N-W but clamp to 0
  // -------------------------------------------------------------------------

  let maxScore = 0;
  let maxI = 0;
  let maxJ = 0;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const sub = residueScore(seqA[i - 1], seqB[j - 1], params);

      const diagScore = dp[i - 1][j - 1].score + sub;
      const upScore   = dp[i - 1][j].score + gapCost(1, params);
      const leftScore = dp[i][j - 1].score + gapCost(1, params);

      const best = Math.max(0, diagScore, upScore, leftScore);

      const directions: Direction[] = [];
      if (best === 0) {
        directions.push('none');
      } else {
        if (diagScore === best) directions.push('diag');
        if (upScore   === best) directions.push('up');
        if (leftScore === best) directions.push('left');
      }

      dp[i][j] = { score: best, directions };

      if (best > maxScore) {
        maxScore = best;
        maxI = i;
        maxJ = j;
      }
    }
  }

  // -------------------------------------------------------------------------
  // 3. Traceback from max cell; stop when score reaches 0
  // -------------------------------------------------------------------------

  const path: [number, number][] = [];
  let alignedA = '';
  let alignedB = '';

  let i = maxI;
  let j = maxJ;

  while (i > 0 && j > 0 && dp[i][j].score > 0) {
    path.push([i, j]);
    const dir = dp[i][j].directions[0];

    if (dir === 'diag') {
      alignedA = seqA[i - 1] + alignedA;
      alignedB = seqB[j - 1] + alignedB;
      i--;
      j--;
    } else if (dir === 'up') {
      alignedA = seqA[i - 1] + alignedA;
      alignedB = '-' + alignedB;
      i--;
    } else {
      alignedA = '-' + alignedA;
      alignedB = seqB[j - 1] + alignedB;
      j--;
    }
  }
  // Push the terminal zero cell so traceback path is anchored
  path.push([i, j]);
  path.reverse();

  // -------------------------------------------------------------------------
  // 4. Statistics
  // -------------------------------------------------------------------------

  const { identity, similarity, gaps } = alignedA.length > 0
    ? computeIdentitySimilarity(alignedA, alignedB, params)
    : { identity: 0, similarity: 0, gaps: 0 };

  return {
    alignedA,
    alignedB,
    score: maxScore,
    identity,
    similarity,
    gaps,
    length: alignedA.length,
    dpMatrix: dp,
    tracebackPath: path,
  };
}

// ---------------------------------------------------------------------------
// Step iterator for animation
// ---------------------------------------------------------------------------

export function* smithWatermanSteps(
  params: AlignmentParams
): Generator<DPStep> {
  const seqA = params.seqA;
  const seqB = params.seqB;
  const m = seqA.length;
  const n = seqB.length;

  const dp: DPCell[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => ({ score: 0, directions: ['none'] as Direction[] }))
  );

  // Yield initialisation cells
  for (let i = 0; i <= m; i++) yield { row: i, col: 0, cell: dp[i][0] };
  for (let j = 1; j <= n; j++) yield { row: 0, col: j, cell: dp[0][j] };

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const sub = residueScore(seqA[i - 1], seqB[j - 1], params);
      const diagScore = dp[i - 1][j - 1].score + sub;
      const upScore   = dp[i - 1][j].score + gapCost(1, params);
      const leftScore = dp[i][j - 1].score + gapCost(1, params);
      const best = Math.max(0, diagScore, upScore, leftScore);

      const directions: Direction[] = [];
      if (best === 0) {
        directions.push('none');
      } else {
        if (diagScore === best) directions.push('diag');
        if (upScore   === best) directions.push('up');
        if (leftScore === best) directions.push('left');
      }

      dp[i][j] = { score: best, directions };
      yield { row: i, col: j, cell: dp[i][j] };
    }
  }
}
