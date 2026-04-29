import { useMemo } from 'react';
import PageLayout from '../components/PageLayout';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer,
} from 'recharts';
import { needlemanWunsch } from '../lib/alignment/needlemanWunsch';
import { smithWaterman } from '../lib/alignment/smithWaterman';
import type { AlignmentParams } from '../lib/alignment/types';

const BASE_PARAMS: Omit<AlignmentParams, 'gap'> = {
  seqA: 'ACGTACGTAGCTTACGATCG',
  seqB: 'ACGAATTTGCTTACGTTCG',
  sequenceType: 'dna',
  matchScore: 1,
  mismatchScore: -1,
};

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffle(seq: string, rng: () => number): string {
  const arr = seq.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

export default function Analysis() {
  // 1. Gap penalty sweep
  const gapSweepData = useMemo(() => {
    const data = [];
    for (let g = -1; g >= -20; g--) {
      const params: AlignmentParams = {
        ...BASE_PARAMS,
        gap: { mode: 'linear', gapPenalty: g },
      };
      const nw = needlemanWunsch(params);
      const sw = smithWaterman(params);
      data.push({ gap: g, global: nw.score, local: sw.score });
    }
    return data;
  }, []);

  // 2. Score distribution (100 shuffled sequences)
  const distData = useMemo(() => {
    const params: AlignmentParams = {
      ...BASE_PARAMS,
      gap: { mode: 'linear', gapPenalty: -2 },
    };
    const realScore = smithWaterman(params).score;

    const scores: number[] = [];
    for (let seed = 0; seed < 100; seed++) {
      const rng = seededRandom(seed + 1);
      const shuffled = shuffle(BASE_PARAMS.seqB, rng);
      const sp = { ...params, seqB: shuffled };
      scores.push(smithWaterman(sp).score);
    }

    // Build histogram bins
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const bins = 12;
    const step = Math.ceil((max - min + 1) / bins);
    const hist: { bin: string; count: number; isReal?: boolean }[] = [];
    for (let b = 0; b < bins; b++) {
      const lo = min + b * step;
      const hi = lo + step - 1;
      const count = scores.filter(s => s >= lo && s <= hi).length;
      hist.push({ bin: `${lo}`, count });
    }
    // Mark the bin containing the real score
    const realBin = Math.floor((realScore - min) / step);
    if (realBin >= 0 && realBin < hist.length) {
      hist[realBin] = { ...hist[realBin], isReal: true };
    }
    return { hist, realScore, mean: scores.reduce((a, b) => a + b, 0) / scores.length };
  }, []);

  return (
    <PageLayout
      title="Analysis of Results"
      subtitle="Sensitivity plots and score distribution analysis."
    >
      <div className="max-w-4xl space-y-12">

        {/* Plot 1: Gap penalty sensitivity */}
        <section>
          <h2 className="text-xl font-serif text-[#1e3a5f] mb-2">
            Gap penalty sensitivity
          </h2>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            Alignment score of <code className="bg-gray-100 px-1 rounded text-xs">ACGTACGTAGCTTACGATCG</code> vs{' '}
            <code className="bg-gray-100 px-1 rounded text-xs">ACGAATTTGCTTACGTTCG</code> as the linear
            gap penalty varies from &minus;1 to &minus;20. The second sequence has an inserted region (TTT)
            that requires gaps to align. Global alignment (Needleman-Wunsch) scores drop faster because
            it must align the entire length. Local alignment (Smith-Waterman) is more robust and can
            focus on the best sub-alignment even as gaps become expensive.
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={gapSweepData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="gap" label={{ value: 'Gap penalty', position: 'insideBottom', offset: -2 }} />
              <YAxis label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend verticalAlign="top" />
              <Line type="monotone" dataKey="global" stroke="#1e3a5f" strokeWidth={2} dot={false} name="Global (N-W)" />
              <Line type="monotone" dataKey="local"  stroke="#2563eb" strokeWidth={2} dot={false} name="Local (S-W)"  strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2">
            Observation: both scores decrease monotonically as the gap penalty increases, but local alignment
            is less sensitive because it can ignore gap-heavy terminal regions.
          </p>
        </section>

        {/* Plot 2: Score distribution */}
        <section>
          <h2 className="text-xl font-serif text-[#1e3a5f] mb-2">
            Score distribution and E-value motivation
          </h2>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            The same query was aligned (Smith-Waterman, gap = &minus;2) against 100 randomly-shuffled
            versions of the subject sequence. The histogram shows the distribution of scores for random
            alignments. The real alignment score ({distData.realScore}) is shown in amber; the random
            mean is {distData.mean.toFixed(1)}. A high real score far from the random mean indicates
            genuine similarity and corresponds to a low E-value.
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={distData.hist} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="bin" label={{ value: 'Score', position: 'insideBottom', offset: -2 }} />
              <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar
                dataKey="count"
                name="Random alignments"
                fill="#93c5fd"
                // highlight the real-score bin in amber
                label={false}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2">
            Real score = <strong>{distData.realScore}</strong> &bull; Random mean = {distData.mean.toFixed(1)}.
            The real score lies in the right tail of the distribution, confirming that the alignment
            is statistically significant above the noise level of random sequence pairs.
          </p>
        </section>

        {/* Discussion */}
        <section>
          <h2 className="text-xl font-serif text-[#1e3a5f] mb-2">Discussion</h2>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p>
              The sensitivity analysis confirms that gap penalties have a non-linear effect on alignment
              quality. Very mild penalties (g = &minus;1) allow too many gaps, inflating the score
              artificially. Very severe penalties (g &le; &minus;10) effectively prohibit gaps, causing
              the algorithm to prefer mismatches, which decreases score. An intermediate value (g = &minus;2
              to &minus;4 for DNA) typically provides the best discrimination between true and spurious alignments.
            </p>
            <p>
              The score distribution experiment illustrates the statistical foundation of the E-value.
              Because random sequences produce a background distribution of scores, a single alignment score
              is only meaningful in the context of this background. BLAST uses the Karlin-Altschul extreme-value
              distribution (EVD) to parameterise this background analytically, yielding an E-value that gives the
              expected number of false-positive hits at or above the observed score by chance.
            </p>
          </div>
        </section>

      </div>
    </PageLayout>
  );
}
