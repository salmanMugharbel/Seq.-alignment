/**
 * Needleman-Wunsch global sequence alignment algorithm.
 *
 * Reference: Needleman SB, Wunsch CD (1970). "A general method applicable
 * to the search for similarities in the amino acid sequence of two proteins."
 * J Mol Biol 48(3):443-453.
 *
 * Time complexity:  O(m * n)
 * Space complexity: O(m * n)  (full matrix retained for visualisation)
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

/**
 * Runs Needleman-Wunsch on params.seqA and params.seqB.
 * Returns the full DP matrix, optimal traceback path, and aligned strings.
 */
export function needlemanWunsch(params: AlignmentParams): AlignmentResult {
  const seqA = params.seqA;
  const seqB = params.seqB;
  const m = seqA.length;
  const n = seqB.length;

  // -------------------------------------------------------------------------
  // 1. Allocate and initialise the DP matrix
  // -------------------------------------------------------------------------

  // dpMatrix[i][j] corresponds to seqA[0..i-1] vs seqB[0..j-1]
  const dp: DPCell[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => ({ score: 0, directions: [] as Direction[] }))
  );

  // First cell: no predecessor
  dp[0][0] = { score: 0, directions: ['none'] };

  // First column: gaps in seqB (coming from above)
  for (let i = 1; i <= m; i++) {
    dp[i][0] = {
      score: gapCost(i, params),
      directions: ['up'],
    };
  }

  // First row: gaps in seqA (coming from left)
  for (let j = 1; j <= n; j++) {
    dp[0][j] = {
      score: gapCost(j, params),
      directions: ['left'],
    };
  }

  // -------------------------------------------------------------------------
  // 2. Fill the DP matrix
  // -------------------------------------------------------------------------

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const sub = residueScore(seqA[i - 1], seqB[j - 1], params);

      const diagScore = dp[i - 1][j - 1].score + sub;
      const upScore   = dp[i - 1][j].score + gapCost(1, params);
      const leftScore = dp[i][j - 1].score + gapCost(1, params);

      const best = Math.max(diagScore, upScore, leftScore);

      const directions: Direction[] = [];
      if (diagScore === best) directions.push('diag');
      if (upScore   === best) directions.push('up');
      if (leftScore === best) directions.push('left');

      dp[i][j] = { score: best, directions };
    }
  }

  // -------------------------------------------------------------------------
  // 3. Traceback from (m, n) to (0, 0)
  // -------------------------------------------------------------------------

  const path: [number, number][] = [];
  let alignedA = '';
  let alignedB = '';

  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    path.push([i, j]);
    const dir = dp[i][j].directions[0]; // take first (deterministic)

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
  path.push([0, 0]);
  path.reverse();

  // -------------------------------------------------------------------------
  // 4. Statistics
  // -------------------------------------------------------------------------

  const { identity, similarity, gaps } = computeIdentitySimilarity(
    alignedA, alignedB, params
  );

  return {
    alignedA,
    alignedB,
    score: dp[m][n].score,
    identity,
    similarity,
    gaps,
    length: alignedA.length,
    dpMatrix: dp,
    tracebackPath: path,
  };
}

// ---------------------------------------------------------------------------
// Step iterator for animated matrix fill
// ---------------------------------------------------------------------------

/**
 * Generator that yields one DPStep at a time so the UI can animate the fill.
 * Yields first the initialisation steps (row 0, then col 0), then the rest.
 */
export function* needlemanWunschSteps(
  params: AlignmentParams
): Generator<DPStep> {
  const seqA = params.seqA;
  const seqB = params.seqB;
  const m = seqA.length;
  const n = seqB.length;

  const dp: DPCell[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => ({ score: 0, directions: [] as Direction[] }))
  );

  dp[0][0] = { score: 0, directions: ['none'] };
  yield { row: 0, col: 0, cell: dp[0][0] };

  for (let i = 1; i <= m; i++) {
    dp[i][0] = { score: gapCost(i, params), directions: ['up'] };
    yield { row: i, col: 0, cell: dp[i][0] };
  }
  for (let j = 1; j <= n; j++) {
    dp[0][j] = { score: gapCost(j, params), directions: ['left'] };
    yield { row: 0, col: j, cell: dp[0][j] };
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const sub = residueScore(seqA[i - 1], seqB[j - 1], params);
      const diagScore = dp[i - 1][j - 1].score + sub;
      const upScore   = dp[i - 1][j].score + gapCost(1, params);
      const leftScore = dp[i][j - 1].score + gapCost(1, params);
      const best = Math.max(diagScore, upScore, leftScore);

      const directions: Direction[] = [];
      if (diagScore === best) directions.push('diag');
      if (upScore   === best) directions.push('up');
      if (leftScore === best) directions.push('left');

      dp[i][j] = { score: best, directions };
      yield { row: i, col: j, cell: dp[i][j] };
    }
  }
}
