import { useMemo } from 'react';

interface DotPlotProps {
  seqA: string;    // vertical axis
  seqB: string;    // horizontal axis
  windowSize: number;
  stringency: number; // minimum matches in window (1..windowSize)
}

export default function DotPlot({ seqA, seqB, windowSize, stringency }: DotPlotProps) {
  const CELL = 6;
  const m = seqA.length;
  const n = seqB.length;

  // For large sequences cap at 200 chars to keep SVG size manageable
  const a = seqA.slice(0, 200).toUpperCase();
  const b = seqB.slice(0, 200).toUpperCase();

  const dots = useMemo(() => {
    const result: [number, number][] = [];
    for (let i = 0; i <= a.length - windowSize; i++) {
      for (let j = 0; j <= b.length - windowSize; j++) {
        let matches = 0;
        for (let k = 0; k < windowSize; k++) {
          if (a[i + k] === b[j + k]) matches++;
        }
        if (matches >= stringency) result.push([i, j]);
      }
    }
    return result;
  }, [a, b, windowSize, stringency]);

  const width  = a.length * CELL + 1;
  const height = b.length * CELL + 1;

  return (
    <div className="overflow-auto border border-gray-200 rounded">
      <svg width={width} height={height} className="bg-white block">
        {/* Grid lines every 10 cells */}
        {Array.from({ length: Math.floor(a.length / 10) }, (_, k) => (
          <line
            key={`v${k}`}
            x1={(k + 1) * 10 * CELL}
            y1={0}
            x2={(k + 1) * 10 * CELL}
            y2={height}
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        ))}
        {Array.from({ length: Math.floor(b.length / 10) }, (_, k) => (
          <line
            key={`h${k}`}
            x1={0}
            y1={(k + 1) * 10 * CELL}
            x2={width}
            y2={(k + 1) * 10 * CELL}
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        ))}
        {dots.map(([i, j]) => (
          <rect
            key={`${i}-${j}`}
            x={i * CELL}
            y={j * CELL}
            width={CELL}
            height={CELL}
            fill="#1e3a5f"
            opacity={0.75}
          />
        ))}
      </svg>
      <div className="text-xs text-gray-400 px-2 py-1">
        {m > 200 || n > 200
          ? `Showing first 200 residues of each sequence. `
          : ''}
        {dots.length} dots plotted.
      </div>
    </div>
  );
}
