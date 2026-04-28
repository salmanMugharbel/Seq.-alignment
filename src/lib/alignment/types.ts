// Core types shared across all alignment algorithms

export type SequenceType = 'dna' | 'protein';

export type GapMode = 'linear' | 'affine';

export interface LinearGapParams {
  mode: 'linear';
  gapPenalty: number;     // negative, e.g. -2
}

export interface AffineGapParams {
  mode: 'affine';
  gapOpen: number;        // negative, e.g. -10
  gapExtend: number;      // negative, e.g. -1
}

export type GapParams = LinearGapParams | AffineGapParams;

export interface AlignmentParams {
  seqA: string;
  seqB: string;
  sequenceType: SequenceType;
  matchScore: number;     // positive, e.g. +1
  mismatchScore: number;  // negative, e.g. -1
  gap: GapParams;
  // Optional substitution matrix override (takes precedence over match/mismatch)
  substitutionMatrix?: Record<string, Record<string, number>>;
}

// Direction enum for traceback arrows in the DP matrix
export type Direction = 'diag' | 'up' | 'left' | 'none';

export interface DPCell {
  score: number;
  directions: Direction[];  // may have multiple for tie-breaking display
}

export interface AlignmentResult {
  alignedA: string;
  alignedB: string;
  score: number;
  identity: number;       // 0..1
  similarity: number;     // 0..1 (identity + conserved substitutions)
  gaps: number;
  length: number;         // alignment length including gaps
  dpMatrix: DPCell[][];   // full DP matrix (rows = seqA+1, cols = seqB+1)
  tracebackPath: [number, number][];  // ordered [row, col] cells on optimal path
}

// Step iterator type for animation
export interface DPStep {
  row: number;
  col: number;
  cell: DPCell;
}
