interface AlignmentDisplayProps {
  alignedA: string;
  alignedB: string;
  score: number;
  identity: number;
  similarity: number;
  gaps: number;
  label?: string;
}

export default function AlignmentDisplay({
  alignedA,
  alignedB,
  score,
  identity,
  similarity,
  gaps,
  label,
}: AlignmentDisplayProps) {
  const CHUNK = 60;
  const len = alignedA.length;
  const chunks: { a: string; mid: string; b: string; start: number }[] = [];

  for (let pos = 0; pos < len; pos += CHUNK) {
    const a = alignedA.slice(pos, pos + CHUNK);
    const b = alignedB.slice(pos, pos + CHUNK);
    const mid = a
      .split('')
      .map((c, k) => {
        if (c === '-' || b[k] === '-') return ' ';
        if (c.toUpperCase() === b[k].toUpperCase()) return '|';
        return '.';
      })
      .join('');
    chunks.push({ a, mid, b, start: pos + 1 });
  }

  return (
    <div className="space-y-4">
      {label && <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{label}</h3>}

      {/* Stats row */}
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="bg-[#1e3a5f] text-white px-3 py-1 rounded font-mono">
          Score: {score}
        </span>
        <span className="bg-gray-100 px-3 py-1 rounded font-mono">
          Identity: {(identity * 100).toFixed(1)}%
        </span>
        <span className="bg-gray-100 px-3 py-1 rounded font-mono">
          Similarity: {(similarity * 100).toFixed(1)}%
        </span>
        <span className="bg-gray-100 px-3 py-1 rounded font-mono">
          Gaps: {gaps}
        </span>
        <span className="bg-gray-100 px-3 py-1 rounded font-mono">
          Length: {len}
        </span>
      </div>

      {/* Aligned sequences */}
      <div className="overflow-x-auto bg-gray-50 border border-gray-200 rounded p-4 space-y-3">
        {chunks.map(({ a, mid, b, start }) => (
          <div key={start} className="font-mono text-sm leading-5">
            <div>
              <span className="text-gray-400 select-none inline-block w-10 text-right pr-2">{start}</span>
              {a.split('').map((c, k) => (
                <span
                  key={k}
                  className={
                    c === '-'
                      ? 'text-red-500'
                      : mid[k] === '|'
                      ? 'text-[#1e3a5f] font-semibold'
                      : 'text-amber-600'
                  }
                >
                  {c}
                </span>
              ))}
            </div>
            <div>
              <span className="inline-block w-10" />
              <span className="text-gray-400">{mid}</span>
            </div>
            <div>
              <span className="text-gray-400 select-none inline-block w-10 text-right pr-2">{start}</span>
              {b.split('').map((c, k) => (
                <span
                  key={k}
                  className={
                    c === '-'
                      ? 'text-red-500'
                      : mid[k] === '|'
                      ? 'text-[#1e3a5f] font-semibold'
                      : 'text-amber-600'
                  }
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-400">
        <span className="text-[#1e3a5f] font-bold">|</span> match &nbsp;
        <span className="text-amber-600">.</span> mismatch &nbsp;
        <span className="text-red-500">-</span> gap
      </div>
    </div>
  );
}
