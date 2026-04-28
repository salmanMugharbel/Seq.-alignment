import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DPCell } from '../lib/alignment/types';

interface MatrixViewProps {
  matrix: DPCell[][];
  seqA: string;
  seqB: string;
  tracebackPath?: [number, number][];
  animating?: boolean;
  revealedUpTo?: number; // reveal cells 0..revealedUpTo in row-major order
}

const DIR_ARROWS: Record<string, string> = {
  diag: '↖',
  up: '↑',
  left: '←',
  none: '',
};

function cellColor(score: number, min: number, max: number): string {
  if (max === min) return '#f0f4f8';
  const t = (score - min) / (max - min); // 0=min(cold), 1=max(warm)
  // interpolate: #d1e8ff (cold) -> #1e3a5f (warm)
  const r = Math.round(209 + (30 - 209) * t);
  const g = Math.round(232 + (58 - 232) * t);
  const b = Math.round(255 + (95 - 255) * t);
  return `rgb(${r},${g},${b})`;
}

export default function MatrixView({
  matrix,
  seqA,
  seqB,
  tracebackPath = [],
  animating = false,
  revealedUpTo,
}: MatrixViewProps) {
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);

  const pathSet = new Set(tracebackPath.map(([r, c]) => `${r}-${c}`));

  // compute score range for color scale
  let min = Infinity;
  let max = -Infinity;
  for (const row of matrix) {
    for (const cell of row) {
      if (cell.score < min) min = cell.score;
      if (cell.score > max) max = cell.score;
    }
  }

  const m = matrix.length;     // seqA.length + 1
  const n = matrix[0]?.length ?? 0; // seqB.length + 1

  const totalCells = m * n;
  const threshold = revealedUpTo ?? totalCells - 1;

  return (
    <div className="overflow-auto">
      <table className="border-collapse text-xs font-mono" style={{ minWidth: 'max-content' }}>
        <thead>
          <tr>
            <td className="w-8 h-8" />
            <td className="w-8 h-8 text-center font-bold text-gray-400">-</td>
            {seqB.split('').map((c, j) => (
              <td key={j} className="w-8 h-8 text-center font-bold text-[#1e3a5f]">{c}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => {
            const rowLabel = i === 0 ? '-' : seqA[i - 1];
            return (
              <tr key={i}>
                <td className="w-8 h-8 text-center font-bold text-[#1e3a5f]">{rowLabel}</td>
                {row.map((cell, j) => {
                  const idx = i * n + j;
                  const isVisible = !animating || idx <= threshold;
                  const isPath = pathSet.has(`${i}-${j}`);
                  const isHovered = hoveredCell?.[0] === i && hoveredCell?.[1] === j;
                  const bg = isPath
                    ? '#1e3a5f'
                    : isHovered
                    ? '#dbeafe'
                    : cellColor(cell.score, min, max);
                  const textColor = isPath ? 'white' : '#1a1a1a';

                  return (
                    <AnimatePresence key={j}>
                      {isVisible && (
                        <motion.td
                          initial={animating ? { opacity: 0, scale: 0.5 } : false}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.15 }}
                          className="w-8 h-8 text-center border border-gray-200 cursor-default select-none relative"
                          style={{ background: bg, color: textColor }}
                          onMouseEnter={() => setHoveredCell([i, j])}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <span className="block leading-none text-[10px]">
                            {cell.directions.slice(0, 2).map(d => DIR_ARROWS[d]).join('')}
                          </span>
                          <span className="block leading-none font-medium">
                            {cell.score}
                          </span>
                        </motion.td>
                      )}
                    </AnimatePresence>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {hoveredCell && (
        <div className="mt-2 text-xs text-gray-500">
          Cell ({hoveredCell[0]}, {hoveredCell[1]}): score = {matrix[hoveredCell[0]][hoveredCell[1]].score},{' '}
          direction = {matrix[hoveredCell[0]][hoveredCell[1]].directions.join(', ')}
        </div>
      )}
    </div>
  );
}
