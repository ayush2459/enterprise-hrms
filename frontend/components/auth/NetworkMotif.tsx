"use client";

// A quiet, drifting node-and-line network — grounded in what this
// product actually is: people, connected into teams and reporting
// lines. Positions are fixed (not random) so server/client markup
// matches exactly, avoiding hydration warnings.
const NODES = [
  { x: 18, y: 22, r: 5, delay: "0s" },
  { x: 62, y: 14, r: 4, delay: "1.2s" },
  { x: 84, y: 36, r: 6, delay: "0.6s" },
  { x: 40, y: 44, r: 7, delay: "2s" },
  { x: 12, y: 62, r: 4, delay: "0.3s" },
  { x: 68, y: 60, r: 5, delay: "1.6s" },
  { x: 90, y: 78, r: 4, delay: "0.9s" },
  { x: 34, y: 82, r: 5, delay: "2.4s" },
  { x: 55, y: 88, r: 3, delay: "1.4s" },
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [3, 1], [3, 4], [3, 5], [2, 5], [4, 7], [5, 6], [7, 8], [5, 8],
];

export function NetworkMotif() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <g stroke="rgba(255,255,255,0.14)" strokeWidth="0.3">
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
          />
        ))}
      </g>
      {NODES.map((n, i) => (
        <g key={i} className="animate-drift" style={{ animationDelay: n.delay, transformOrigin: `${n.x}px ${n.y}px` }}>
          <circle cx={n.x} cy={n.y} r={n.r + 3} fill="rgba(91,130,232,0.10)" />
          <circle
            cx={n.x}
            cy={n.y}
            r={n.r * 0.4}
            fill="#5B82E8"
            className="animate-pulse-soft"
            style={{ animationDelay: n.delay }}
          />
        </g>
      ))}
    </svg>
  );
}
