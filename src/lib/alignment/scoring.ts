// Scoring utilities used by all alignment algorithms

import type { AlignmentParams, SequenceType } from './types';

/**
 * Returns the substitution score for residues a and b.
 * Priority: explicit substitution matrix > match/mismatch scores.
 */
export function residueScore(
  a: string,
  b: string,
  params: AlignmentParams
): number {
  if (params.substitutionMatrix) {
    const row = params.substitutionMatrix[a.toUpperCase()];
    if (row) {
      const val = row[b.toUpperCase()];
      if (val !== undefined) return val;
    }
  }
  return a.toUpperCase() === b.toUpperCase()
    ? params.matchScore
    : params.mismatchScore;
}

/**
 * Returns the gap penalty for opening a gap of `length` residues.
 * Linear: gapPenalty * length
 * Affine: gapOpen + gapExtend * (length - 1)
 */
export function gapCost(length: number, params: AlignmentParams): number {
  if (params.gap.mode === 'linear') {
    return params.gap.gapPenalty * length;
  }
  return params.gap.gapOpen + params.gap.gapExtend * (length - 1);
}

/** Sanitize sequence: uppercase, strip whitespace/digits */
export function sanitizeSequence(seq: string, type: SequenceType): string {
  const cleaned = seq.toUpperCase().replace(/[\s\d]/g, '');
  const validDNA = /^[ACGTN-]*$/;
  const validProtein = /^[ACDEFGHIKLMNPQRSTVWYBZXJ-]*$/;
  const pattern = type === 'dna' ? validDNA : validProtein;
  return cleaned.split('').filter(c => pattern.test(c)).join('');
}

/** Compute identity and similarity from aligned strings */
export function computeIdentitySimilarity(
  alignedA: string,
  alignedB: string,
  params: AlignmentParams
): { identity: number; similarity: number; gaps: number } {
  let matches = 0;
  let similar = 0;
  let gaps = 0;
  const len = alignedA.length;

  for (let i = 0; i < len; i++) {
    const a = alignedA[i];
    const b = alignedB[i];
    if (a === '-' || b === '-') {
      gaps++;
    } else if (a.toUpperCase() === b.toUpperCase()) {
      matches++;
      similar++;
    } else {
      // Count as similar if substitution score >= 0
      const s = residueScore(a, b, params);
      if (s >= 0) similar++;
    }
  }

  const aligned = len - gaps;
  return {
    identity: aligned > 0 ? matches / len : 0,
    similarity: aligned > 0 ? similar / len : 0,
    gaps,
  };
}
