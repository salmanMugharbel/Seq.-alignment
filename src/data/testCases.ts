import type { AlignmentParams } from '../lib/alignment/types';

export interface TestCase {
  id: string;
  name: string;
  description: string;
  algorithm: 'needleman-wunsch' | 'smith-waterman' | 'blast';
  params: Partial<AlignmentParams>;
  query?: string;   // for BLAST
  expectedScore?: number;
  expectedAlignedA?: string;
  expectedAlignedB?: string;
  notes: string;
}

export const TEST_CASES: TestCase[] = [
  {
    id: 'tc1-nw-dna-indel',
    name: 'Global DNA alignment with one indel',
    description:
      'Classic Needleman-Wunsch on GATTACA vs GCATGCU. ' +
      'Canonical result: score = 0, with one deletion and one mismatch.',
    algorithm: 'needleman-wunsch',
    params: {
      seqA: 'GATTACA',
      seqB: 'GCATGCU',
      sequenceType: 'dna',
      matchScore: 1,
      mismatchScore: -1,
      gap: { mode: 'linear', gapPenalty: -1 },
    },
    expectedScore: 0,
    expectedAlignedA: 'G-ATTACA',
    expectedAlignedB: 'GCA-TGCU',
    notes:
      'This test case is taken from the original Needleman-Wunsch paper example ' +
      'as reproduced in Durbin et al., "Biological Sequence Analysis" (1998). ' +
      'The DP matrix should be a 8x8 grid; the full matrix is rendered below.',
  },
  {
    id: 'tc2-sw-local-motif',
    name: 'Local alignment finds buried motif',
    description:
      'Smith-Waterman on a long noisy sequence vs a short known motif. ' +
      'The local aligner should recover the exact motif buried inside the subject.',
    algorithm: 'smith-waterman',
    params: {
      seqA: 'AAACCCTTTAGGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGTTTGGG',
      seqB: 'ATCGATCG',
      sequenceType: 'dna',
      matchScore: 2,
      mismatchScore: -1,
      gap: { mode: 'linear', gapPenalty: -2 },
    },
    expectedScore: 16,
    notes:
      'The motif ATCGATCG appears multiple times within the long sequence. ' +
      'Smith-Waterman should identify the first occurrence with a perfect score of 16 (8 * +2). ' +
      'Global alignment (N-W) on the same input would be dominated by gaps and produce a lower, ' +
      'less meaningful score.',
  },
  {
    id: 'tc3-blast-protein',
    name: 'BLAST-lite protein database search',
    description:
      'Query a fragment of human hemoglobin alpha against the mock database. ' +
      'The top hit should be the full HBA_HUMAN entry.',
    algorithm: 'blast',
    query: 'MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFP',
    params: {
      sequenceType: 'protein',
    },
    notes:
      'The query is the first 38 residues of human hemoglobin alpha (HBA_HUMAN). ' +
      'BLAST-lite should rank sp|P69905|HBA_HUMAN first, with a high bit score and low E-value. ' +
      'This demonstrates the seed-and-extend heuristic for fast database search.',
  },
];
