/**
 * BLAST-lite: a simplified implementation of the BLAST heuristic search.
 *
 * Reference: Altschul SF et al. (1990). "Basic local alignment search tool."
 * J Mol Biol 215(3):403-410.
 *
 * Pipeline implemented here:
 *   1. Generate all k-mers from the query.
 *   2. Scan each database sequence for exact k-mer seeds.
 *   3. Extend each seed ungapped in both directions until score drops by X.
 *   4. Rank hits; compute a simplified E-value using Karlin-Altschul statistics.
 */

export interface BlastDatabase {
  id: string;
  description: string;
  sequence: string;
}

export interface BlastHit {
  subjectId: string;
  description: string;
  queryStart: number;
  queryEnd: number;
  subjectStart: number;
  subjectEnd: number;
  alignedQuery: string;
  alignedSubject: string;
  rawScore: number;
  bitScore: number;
  eValue: number;
  identity: number;     // 0..1
}

export interface BlastParams {
  query: string;
  db: BlastDatabase[];
  wordSize?: number;        // default 3 for protein, 11 for DNA
  xDrop?: number;           // extension drop-off, default 15
  matchScore?: number;      // default +1
  mismatchScore?: number;   // default -2
  // Karlin-Altschul parameters (approximate defaults for ungapped protein)
  lambda?: number;
  kParam?: number;
}

// ---------------------------------------------------------------------------
// Karlin-Altschul E-value calculation
// ---------------------------------------------------------------------------

/**
 * Simplified E-value: E = K * m * n * exp(-lambda * S)
 * where m = query length, n = db total length, S = raw score.
 */
function eValue(
  rawScore: number,
  queryLen: number,
  dbLen: number,
  lambda: number,
  kParam: number
): number {
  return kParam * queryLen * dbLen * Math.exp(-lambda * rawScore);
}

/**
 * Bit score: S' = (lambda * S - ln(K)) / ln(2)
 */
function bitScore(rawScore: number, lambda: number, kParam: number): number {
  return (lambda * rawScore - Math.log(kParam)) / Math.LN2;
}

// ---------------------------------------------------------------------------
// Core BLAST-lite function
// ---------------------------------------------------------------------------

export function blastLite(params: BlastParams): BlastHit[] {
  const query = params.query.toUpperCase();
  const db = params.db;
  const wordSize = params.wordSize ?? 3;
  const xDrop = params.xDrop ?? 15;
  const matchScore = params.matchScore ?? 1;
  const mismatchScore = params.mismatchScore ?? -2;
  const lambda = params.lambda ?? 0.318;
  const kParam = params.kParam ?? 0.134;

  const dbTotalLen = db.reduce((acc, s) => acc + s.sequence.length, 0);

  const score = (a: string, b: string) =>
    a.toUpperCase() === b.toUpperCase() ? matchScore : mismatchScore;

  // -------------------------------------------------------------------------
  // 1. Build k-mer index from query
  // -------------------------------------------------------------------------

  const queryKmers = new Map<string, number[]>(); // kmer -> positions in query
  for (let i = 0; i <= query.length - wordSize; i++) {
    const kmer = query.slice(i, i + wordSize);
    if (!queryKmers.has(kmer)) queryKmers.set(kmer, []);
    queryKmers.get(kmer)!.push(i);
  }

  const hits: BlastHit[] = [];

  // -------------------------------------------------------------------------
  // 2. For each DB sequence, find seeds and extend
  // -------------------------------------------------------------------------

  for (const dbSeq of db) {
    const subject = dbSeq.sequence.toUpperCase();
    const seenExtensions = new Set<string>(); // avoid duplicate extensions

    for (let sj = 0; sj <= subject.length - wordSize; sj++) {
      const kmer = subject.slice(sj, sj + wordSize);
      const queryPositions = queryKmers.get(kmer);
      if (!queryPositions) continue;

      for (const qi of queryPositions) {
        const seedKey = `${qi}-${sj}`;
        if (seenExtensions.has(seedKey)) continue;
        seenExtensions.add(seedKey);

        // Seed score
        let seedScore = 0;
        for (let k = 0; k < wordSize; k++) {
          seedScore += score(query[qi + k], subject[sj + k]);
        }

        // Extend right
        let qRight = qi + wordSize;
        let sRight = sj + wordSize;
        let rightScore = seedScore;
        let bestRightScore = seedScore;
        let bestQRight = qi + wordSize;
        let bestSRight = sj + wordSize;

        while (qRight < query.length && sRight < subject.length) {
          rightScore += score(query[qRight], subject[sRight]);
          if (rightScore > bestRightScore) {
            bestRightScore = rightScore;
            bestQRight = qRight + 1;
            bestSRight = sRight + 1;
          }
          if (bestRightScore - rightScore >= xDrop) break;
          qRight++;
          sRight++;
        }

        // Extend left
        let qLeft = qi - 1;
        let sLeft = sj - 1;
        let leftScore = 0;
        let bestLeftScore = 0;
        let bestQLeft = qi;
        let bestSLeft = sj;

        while (qLeft >= 0 && sLeft >= 0) {
          leftScore += score(query[qLeft], subject[sLeft]);
          if (leftScore > bestLeftScore) {
            bestLeftScore = leftScore;
            bestQLeft = qLeft;
            bestSLeft = sLeft;
          }
          if (bestLeftScore - leftScore >= xDrop) break;
          qLeft--;
          sLeft--;
        }

        const totalScore = bestLeftScore + bestRightScore;
        if (totalScore <= 0) continue;

        // Build aligned strings for the extended region
        const alignedQuery = query.slice(bestQLeft, bestQRight);
        const alignedSubject = subject.slice(bestSLeft, bestSRight);

        let matches = 0;
        for (let k = 0; k < alignedQuery.length; k++) {
          if (alignedQuery[k] === alignedSubject[k]) matches++;
        }
        const identity = alignedQuery.length > 0 ? matches / alignedQuery.length : 0;

        const ev = eValue(totalScore, query.length, dbTotalLen, lambda, kParam);
        const bs = bitScore(totalScore, lambda, kParam);

        hits.push({
          subjectId: dbSeq.id,
          description: dbSeq.description,
          queryStart: bestQLeft,
          queryEnd: bestQRight - 1,
          subjectStart: bestSLeft,
          subjectEnd: bestSRight - 1,
          alignedQuery,
          alignedSubject,
          rawScore: totalScore,
          bitScore: bs,
          eValue: ev,
          identity,
        });
      }
    }
  }

  // -------------------------------------------------------------------------
  // 3. Deduplicate (keep best hit per subject), sort by E-value
  // -------------------------------------------------------------------------

  const bestBySubject = new Map<string, BlastHit>();
  for (const hit of hits) {
    const existing = bestBySubject.get(hit.subjectId);
    if (!existing || hit.rawScore > existing.rawScore) {
      bestBySubject.set(hit.subjectId, hit);
    }
  }

  return Array.from(bestBySubject.values()).sort((a, b) => a.eValue - b.eValue);
}
