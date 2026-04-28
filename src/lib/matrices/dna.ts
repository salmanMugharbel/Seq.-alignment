/**
 * Simple DNA match/mismatch matrix.
 * Match = +1, transition = -1, transversion = -2, N = 0 with all.
 */

export const DNA_RESIDUES = ['A', 'C', 'G', 'T', 'N'];

// Transitions: A<->G, C<->T. Transversions: all other mismatches.
const TRANSITIONS = new Set(['AG', 'GA', 'CT', 'TC']);

const RAW: Record<string, Record<string, number>> = {};

for (const a of DNA_RESIDUES) {
  RAW[a] = {};
  for (const b of DNA_RESIDUES) {
    if (a === 'N' || b === 'N') {
      RAW[a][b] = 0;
    } else if (a === b) {
      RAW[a][b] = 1;
    } else if (TRANSITIONS.has(a + b)) {
      RAW[a][b] = -1;
    } else {
      RAW[a][b] = -2;
    }
  }
}

export const DNA_MATRIX = RAW;
