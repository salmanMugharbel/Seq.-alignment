/**
 * Shared alignment tool UI used by both Needleman-Wunsch and Smith-Waterman pages.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import MatrixView from './MatrixView';
import AlignmentDisplay from './AlignmentDisplay';
import type { AlignmentParams, AlignmentResult } from '../lib/alignment/types';
import { BLOSUM62 } from '../lib/matrices/blosum62';

type AlgoFn = (params: AlignmentParams) => AlignmentResult;

interface AlignmentToolProps {
  algo: AlgoFn;
  defaultSeqA?: string;
  defaultSeqB?: string;
  compareAlgo?: AlgoFn;
  compareLabel?: string;
}

const MATRIX_NAMES = ['None', 'BLOSUM62'] as const;

export default function AlignmentTool({
  algo,
  defaultSeqA = 'ACGTACGTAGCT',
  defaultSeqB = 'ACGAACGTACT',
  compareAlgo,
  compareLabel,
}: AlignmentToolProps) {
  const [seqA, setSeqA] = useState(defaultSeqA);
  const [seqB, setSeqB] = useState(defaultSeqB);
  const [seqType, setSeqType] = useState<'dna' | 'protein'>('dna');
  const [matchScore, setMatchScore] = useState(1);
  const [mismatchScore, setMismatchScore] = useState(-1);
  const [gapMode, setGapMode] = useState<'linear' | 'affine'>('linear');
  const [gapPenalty, setGapPenalty] = useState(-2);
  const [gapOpen, setGapOpen] = useState(-10);
  const [gapExtend, setGapExtend] = useState(-1);
  const [matrixName, setMatrixName] = useState<'None' | 'BLOSUM62'>('None');
  const [result, setResult] = useState<AlignmentResult | null>(null);
  const [compareResult, setCompareResult] = useState<AlignmentResult | null>(null);
  const [animating, setAnimating] = useState(false);
  const [revealedUpTo, setRevealedUpTo] = useState(0);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const buildParams = useCallback((): AlignmentParams => ({
    seqA: seqA.toUpperCase().replace(/\s/g, ''),
    seqB: seqB.toUpperCase().replace(/\s/g, ''),
    sequenceType: seqType,
    matchScore,
    mismatchScore,
    gap: gapMode === 'linear'
      ? { mode: 'linear', gapPenalty }
      : { mode: 'affine', gapOpen, gapExtend },
    substitutionMatrix: matrixName === 'BLOSUM62' ? BLOSUM62 : undefined,
  }), [seqA, seqB, seqType, matchScore, mismatchScore, gapMode, gapPenalty, gapOpen, gapExtend, matrixName]);

  const runAlignment = useCallback(() => {
    const params = buildParams();
    if (!params.seqA || !params.seqB) return;
    const res = algo(params);
    setResult(res);
    setAnimating(false);
    setRevealedUpTo((res.dpMatrix.length) * (res.dpMatrix[0]?.length ?? 0));
    if (compareAlgo) {
      setCompareResult(compareAlgo(params));
    }
  }, [algo, buildParams, compareAlgo]);

  const startAnimation = useCallback(() => {
    if (!result) return;
    const total = result.dpMatrix.length * (result.dpMatrix[0]?.length ?? 0);
    setRevealedUpTo(0);
    setAnimating(true);
    let cur = 0;
    animRef.current = setInterval(() => {
      cur += result.dpMatrix[0]?.length ?? 1; // reveal one row at a time
      if (cur >= total) {
        cur = total - 1;
        clearInterval(animRef.current!);
        setAnimating(false);
      }
      setRevealedUpTo(cur);
    }, 200);
  }, [result]);

  useEffect(() => () => { if (animRef.current) clearInterval(animRef.current); }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sequence A</label>
          <textarea
            value={seqA}
            onChange={e => setSeqA(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded px-2 py-1 font-mono text-sm resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sequence B</label>
          <textarea
            value={seqB}
            onChange={e => setSeqB(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded px-2 py-1 font-mono text-sm resize-none"
          />
        </div>
      </div>

      {/* Parameters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sequence type</label>
          <select value={seqType} onChange={e => setSeqType(e.target.value as 'dna' | 'protein')}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm">
            <option value="dna">DNA</option>
            <option value="protein">Protein</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subst. matrix</label>
          <select value={matrixName} onChange={e => setMatrixName(e.target.value as typeof matrixName)}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm">
            {MATRIX_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        {matrixName === 'None' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Match</label>
              <input type="number" value={matchScore} onChange={e => setMatchScore(+e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm w-16" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mismatch</label>
              <input type="number" value={mismatchScore} onChange={e => setMismatchScore(+e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm w-16" />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gap mode</label>
          <select value={gapMode} onChange={e => setGapMode(e.target.value as 'linear' | 'affine')}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm">
            <option value="linear">Linear</option>
            <option value="affine">Affine</option>
          </select>
        </div>
        {gapMode === 'linear' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gap penalty</label>
            <input type="number" value={gapPenalty} onChange={e => setGapPenalty(+e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm w-20" />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gap open</label>
              <input type="number" value={gapOpen} onChange={e => setGapOpen(+e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm w-20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gap extend</label>
              <input type="number" value={gapExtend} onChange={e => setGapExtend(+e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm w-20" />
            </div>
          </>
        )}
        <button
          onClick={runAlignment}
          className="bg-[#1e3a5f] text-white px-5 py-2 rounded text-sm font-medium hover:bg-[#2a4f82] transition-colors"
        >
          Run alignment
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-8">
          <AlignmentDisplay
            alignedA={result.alignedA}
            alignedB={result.alignedB}
            score={result.score}
            identity={result.identity}
            similarity={result.similarity}
            gaps={result.gaps}
          />

          {/* DP Matrix */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-semibold text-gray-800">DP Matrix</h3>
              <button
                onClick={startAnimation}
                disabled={animating}
                className="text-sm border border-gray-300 px-3 py-1 rounded hover:border-[#1e3a5f] disabled:opacity-50"
              >
                {animating ? 'Animating...' : 'Animate fill'}
              </button>
              {animating && (
                <button
                  onClick={() => { if (animRef.current) clearInterval(animRef.current); setAnimating(false); setRevealedUpTo(result.dpMatrix.length * (result.dpMatrix[0]?.length ?? 0)); }}
                  className="text-sm text-red-500 hover:underline"
                >
                  Skip
                </button>
              )}
            </div>
            <MatrixView
              matrix={result.dpMatrix}
              seqA={seqA.toUpperCase().replace(/\s/g, '').slice(0, 50)}
              seqB={seqB.toUpperCase().replace(/\s/g, '').slice(0, 50)}
              tracebackPath={result.tracebackPath}
              animating={animating}
              revealedUpTo={revealedUpTo}
            />
            {result.dpMatrix[0]?.length > 51 && (
              <p className="text-xs text-gray-400 mt-1">
                Matrix display limited to 50 columns. Full matrix is computed internally.
              </p>
            )}
          </div>

          {/* Side-by-side comparison */}
          {compareAlgo && compareResult && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-800 mb-4">{compareLabel ?? 'Comparison'}</h3>
              <AlignmentDisplay
                alignedA={compareResult.alignedA}
                alignedB={compareResult.alignedB}
                score={compareResult.score}
                identity={compareResult.identity}
                similarity={compareResult.similarity}
                gaps={compareResult.gaps}
                label="Global alignment (Needleman-Wunsch)"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
