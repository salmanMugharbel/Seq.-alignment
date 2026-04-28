import { useState } from 'react';

interface MatrixHeatmapProps {
  matrix: Record<string, Record<string, number>>;
  residues: string[];
  title?: string;
}

function scoreColor(score: number, min: number, max: number): string {
  // Negative: red-tinted; zero: white; positive: blue-tinted
  if (score < 0) {
    const t = Math.min(1, Math.abs(score) / Math.abs(min));
    const r = Math.round(255);
    const g = Math.round(255 - 180 * t);
    const b = Math.round(255 - 180 * t);
    return `rgb(${r},${g},${b})`;
  } else if (score === 0) {
    return '#f9fafb';
  } else {
    const t = Math.min(1, score / max);
    const r = Math.round(255 - 180 * t);
    const g = Math.round(255 - 140 * t);
    const b = Math.round(255);
    return `rgb(${r},${g},${b})`;
  }
}

export default function MatrixHeatmap({ matrix, residues, title }: MatrixHeatmapProps) {
  const [hovered, setHovered] = useState<{ a: string; b: string; score: number } | null>(null);

  let min = 0;
  let max = 0;
  for (const a of residues) {
    for (const b of residues) {
      const v = matrix[a]?.[b] ?? 0;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }

  return (
    <div className="space-y-2">
      {title && <h3 className="font-serif text-lg text-[#1e3a5f]">{title}</h3>}
      <div className="overflow-auto">
        <table className="border-collapse text-[10px] font-mono">
          <thead>
            <tr>
              <th className="w-6 h-6" />
              {residues.map(r => (
                <th key={r} className="w-6 h-6 text-center text-gray-500 font-normal">{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {residues.map(a => (
              <tr key={a}>
                <td className="w-6 h-6 text-center text-gray-500">{a}</td>
                {residues.map(b => {
                  const score = matrix[a]?.[b] ?? 0;
                  const bg = scoreColor(score, min, max);
                  const isHovered = hovered?.a === a && hovered?.b === b;
                  return (
                    <td
                      key={b}
                      className="w-6 h-6 text-center border border-white cursor-default"
                      style={{
                        background: isHovered ? '#fbbf24' : bg,
                        color: Math.abs(score) > 8 ? '#fff' : '#111',
                      }}
                      onMouseEnter={() => setHovered({ a, b, score })}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {score}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="h-5 text-xs text-gray-500 font-mono">
        {hovered
          ? `${hovered.a} ↔ ${hovered.b}: ${hovered.score}`
          : 'Hover a cell to see the score.'}
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 inline-block rounded" style={{ background: scoreColor(min, min, max) }} />
          {min} (min)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 inline-block rounded bg-gray-100" />
          0
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 inline-block rounded" style={{ background: scoreColor(max, min, max) }} />
          {max} (max)
        </span>
      </div>
    </div>
  );
}
