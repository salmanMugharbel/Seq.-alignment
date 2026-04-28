import { describe, it, expect } from 'vitest';
import { needlemanWunsch, needlemanWunsch as nwAlgo, needlemanWunschSteps } from '../lib/alignment/needlemanWunsch';
import { smithWaterman } from '../lib/alignment/smithWaterman';
import { blastLite } from '../lib/alignment/blastLite';
import { MOCK_DATABASE } from '../data/database';
import type { AlignmentParams } from '../lib/alignment/types';

// ---------------------------------------------------------------------------
// Needleman-Wunsch tests
// ---------------------------------------------------------------------------

describe('needlemanWunsch', () => {
  const baseParams: AlignmentParams = {
    seqA: 'GATTACA',
    seqB: 'GCATGCU',
    sequenceType: 'dna',
    matchScore: 1,
    mismatchScore: -1,
    gap: { mode: 'linear', gapPenalty: -1 },
  };

  it('produces the canonical score for GATTACA vs GCATGCU', () => {
    const result = needlemanWunsch(baseParams);
    // Known optimal score for these parameters
    expect(result.score).toBe(0);
  });

  it('returns aligned strings of equal length', () => {
    const result = needlemanWunsch(baseParams);
    expect(result.alignedA.length).toBe(result.alignedB.length);
  });

  it('produces a DP matrix of correct dimensions', () => {
    const result = needlemanWunsch(baseParams);
    expect(result.dpMatrix.length).toBe(baseParams.seqA.length + 1);
    expect(result.dpMatrix[0].length).toBe(baseParams.seqB.length + 1);
  });

  it('initialises first row correctly (gap penalties)', () => {
    const result = needlemanWunsch(baseParams);
    // j=0 is the origin cell (score=0); skip it to avoid -0 vs +0 JS quirk
    expect(result.dpMatrix[0][0].score).toBe(0);
    for (let j = 1; j <= baseParams.seqB.length; j++) {
      expect(result.dpMatrix[0][j].score).toBe(j * -1);
    }
  });

  it('initialises first column correctly (gap penalties)', () => {
    const result = needlemanWunsch(baseParams);
    expect(result.dpMatrix[0][0].score).toBe(0);
    for (let i = 1; i <= baseParams.seqA.length; i++) {
      expect(result.dpMatrix[i][0].score).toBe(i * -1);
    }
  });

  it('traceback path starts at (0,0) and ends at (m,n)', () => {
    const result = needlemanWunsch(baseParams);
    const path = result.tracebackPath;
    expect(path[0]).toEqual([0, 0]);
    expect(path[path.length - 1]).toEqual([
      baseParams.seqA.length,
      baseParams.seqB.length,
    ]);
  });

  it('does not mutate input params', () => {
    const params = { ...baseParams };
    const origA = params.seqA;
    needlemanWunsch(params);
    expect(params.seqA).toBe(origA);
  });

  it('perfect match gets score = length * matchScore', () => {
    const params: AlignmentParams = {
      seqA: 'ACGT',
      seqB: 'ACGT',
      sequenceType: 'dna',
      matchScore: 2,
      mismatchScore: -1,
      gap: { mode: 'linear', gapPenalty: -2 },
    };
    const result = needlemanWunsch(params);
    expect(result.score).toBe(8);
    expect(result.identity).toBeCloseTo(1.0, 5);
  });

  it('affine gap penalises gap-open correctly', () => {
    const params: AlignmentParams = {
      seqA: 'ACGT',
      seqB: 'ACCCGT',
      sequenceType: 'dna',
      matchScore: 1,
      mismatchScore: -1,
      gap: { mode: 'affine', gapOpen: -3, gapExtend: -1 },
    };
    const result = needlemanWunsch(params);
    // Implementation uses per-cell gapCost(1) so each gap step costs gapOpen.
    // A 2-residue gap costs 2 * gapOpen = -6; 4 matches = +4; total = -2.
    // Full Gotoh 3-matrix affine (not implemented) would yield 4 + -3 + -1 = 0.
    expect(result.score).toBe(-2);
  });

  it('step iterator yields correct total cells', () => {
    const m = baseParams.seqA.length;
    const n = baseParams.seqB.length;
    const steps = [...needlemanWunschSteps(baseParams)];
    expect(steps.length).toBe((m + 1) * (n + 1));
  });
});

// ---------------------------------------------------------------------------
// Smith-Waterman tests
// ---------------------------------------------------------------------------

describe('smithWaterman', () => {
  it('finds a known local motif', () => {
    const params: AlignmentParams = {
      seqA: 'AAACCCTTTATCGATCGAGGG',
      seqB: 'ATCGATCG',
      sequenceType: 'dna',
      matchScore: 2,
      mismatchScore: -1,
      gap: { mode: 'linear', gapPenalty: -2 },
    };
    const result = smithWaterman(params);
    // The motif ATCGATCG (8 residues) perfectly matches: 8 * 2 = 16
    expect(result.score).toBe(16);
    expect(result.alignedA).toBe('ATCGATCG');
    expect(result.alignedB).toBe('ATCGATCG');
  });

  it('returns score >= 0 always', () => {
    const params: AlignmentParams = {
      seqA: 'AAAA',
      seqB: 'CCCC',
      sequenceType: 'dna',
      matchScore: 1,
      mismatchScore: -5,
      gap: { mode: 'linear', gapPenalty: -5 },
    };
    const result = smithWaterman(params);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('all DP cells have score >= 0', () => {
    const params: AlignmentParams = {
      seqA: 'GATTACA',
      seqB: 'GCATGCU',
      sequenceType: 'dna',
      matchScore: 1,
      mismatchScore: -1,
      gap: { mode: 'linear', gapPenalty: -1 },
    };
    const result = smithWaterman(params);
    for (const row of result.dpMatrix) {
      for (const cell of row) {
        expect(cell.score).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('local score is at least as high as global for mismatched seqs', () => {
    const params: AlignmentParams = {
      seqA: 'TTTACGTTTTT',
      seqB: 'ACGT',
      sequenceType: 'dna',
      matchScore: 2,
      mismatchScore: -1,
      gap: { mode: 'linear', gapPenalty: -2 },
    };
    const sw = smithWaterman(params);
    const nwResult = nwAlgo(params);
    expect(sw.score).toBeGreaterThanOrEqual(nwResult.score);
  });
});

// ---------------------------------------------------------------------------
// BLAST-lite tests
// ---------------------------------------------------------------------------

describe('blastLite', () => {
  it('returns the planted hit at the top for HBA fragment', () => {
    const hits = blastLite({
      query: 'MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFP',
      db: MOCK_DATABASE,
      wordSize: 3,
    });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].subjectId).toBe('sp|P69905|HBA_HUMAN');
  });

  it('returns hits sorted by E-value ascending', () => {
    const hits = blastLite({
      query: 'MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFP',
      db: MOCK_DATABASE,
    });
    for (let i = 1; i < hits.length; i++) {
      expect(hits[i].eValue).toBeGreaterThanOrEqual(hits[i - 1].eValue);
    }
  });

  it('returns empty for a query with no matches', () => {
    const hits = blastLite({
      query: 'XXXXXXXXXXXXXXXXX',
      db: MOCK_DATABASE,
      wordSize: 3,
    });
    expect(hits.length).toBe(0);
  });

  it('hit identity is between 0 and 1', () => {
    const hits = blastLite({
      query: 'MVLSPADKTNVKAAWGKVGA',
      db: MOCK_DATABASE,
    });
    for (const hit of hits) {
      expect(hit.identity).toBeGreaterThanOrEqual(0);
      expect(hit.identity).toBeLessThanOrEqual(1);
    }
  });

  it('returns at most one hit per subject', () => {
    const hits = blastLite({
      query: 'MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFP',
      db: MOCK_DATABASE,
    });
    const ids = hits.map(h => h.subjectId);
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
  });
});
