/**
 * HalfAdderDiagram.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 * SVG circuit for Half Adder: XOR (Sum) + AND (Carry)
 */

const HIGH = "#0EA5E9";
const LOW = "#CBD5E1";
const ACTIVE_FILL = "#E0F2FE";
const INACTIVE_FILL = "#F8FAFC";

function sc(v: number) {
  return v === 1 ? HIGH : LOW;
}

interface Props {
  a: number;
  b: number;
  sum: number;
  carry: number;
}

export default function HalfAdderDiagram({ a, b, sum, carry }: Props) {
  return (
    <svg
      viewBox="0 0 520 260"
      className="w-full max-w-xl mx-auto"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {/* ── Inputs ── */}
      {[{ label: "A", val: a, y: 90 }, { label: "B", val: b, y: 170 }].map(({ label, val, y }) => (
        <g key={label}>
          <text x={22} y={y + 5} textAnchor="end" fontSize={13} fill="#1E293B" fontWeight="700">{label}</text>
          <rect x={28} y={y - 13} width={26} height={26} rx={4} fill={sc(val)} style={{ transition: "fill 0.2s" }} />
          <text x={41} y={y + 5} textAnchor="middle" fontSize={13} fill={val === 1 ? "#fff" : "#64748B"} fontWeight="700">{val}</text>
        </g>
      ))}

      {/* ── Wires from inputs to XOR neurons ── */}
      {/* A → NAND */}
      <line x1={54} y1={90} x2={140} y2={100} stroke={sc(a)} strokeWidth={2} style={{ transition: "stroke 0.2s" }} />
      {/* B → NAND */}
      <line x1={54} y1={170} x2={140} y2={140} stroke={sc(b)} strokeWidth={2} style={{ transition: "stroke 0.2s" }} />
      {/* A → OR */}
      <line x1={54} y1={90} x2={140} y2={175} stroke={sc(a)} strokeWidth={2} style={{ transition: "stroke 0.2s" }} />
      {/* B → OR */}
      <line x1={54} y1={170} x2={140} y2={195} stroke={sc(b)} strokeWidth={2} style={{ transition: "stroke 0.2s" }} />

      {/* ── XOR sub-circuit neurons ── */}
      {/* NAND */}
      {(() => {
        const nandOut = a === 1 && b === 1 ? 0 : 1;
        const orOut = a === 1 || b === 1 ? 1 : 0;
        return (
          <>
            <circle cx={168} cy={120} r={26} fill={nandOut === 1 ? ACTIVE_FILL : INACTIVE_FILL} stroke={nandOut === 1 ? HIGH : "#94A3B8"} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
            <text x={168} y={116} textAnchor="middle" fontSize={9} fill="#1E293B" fontWeight="700">NAND</text>
            <text x={168} y={128} textAnchor="middle" fontSize={8} fill="#64748B">θ=1</text>

            {/* OR */}
            <circle cx={168} cy={185} r={26} fill={orOut === 1 ? ACTIVE_FILL : INACTIVE_FILL} stroke={orOut === 1 ? HIGH : "#94A3B8"} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
            <text x={168} y={181} textAnchor="middle" fontSize={9} fill="#1E293B" fontWeight="700">OR</text>
            <text x={168} y={193} textAnchor="middle" fontSize={8} fill="#64748B">θ=1</text>

            {/* NAND→AND */}
            <line x1={194} y1={120} x2={258} y2={152} stroke={sc(nandOut)} strokeWidth={2} style={{ transition: "stroke 0.2s" }} />
            {/* OR→AND */}
            <line x1={194} y1={185} x2={258} y2={165} stroke={sc(orOut)} strokeWidth={2} style={{ transition: "stroke 0.2s" }} />

            {/* AND (XOR output) */}
            <circle cx={284} cy={158} r={26} fill={sum === 1 ? ACTIVE_FILL : INACTIVE_FILL} stroke={sum === 1 ? HIGH : "#94A3B8"} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
            <text x={284} y={154} textAnchor="middle" fontSize={9} fill="#1E293B" fontWeight="700">AND</text>
            <text x={284} y={166} textAnchor="middle" fontSize={8} fill="#64748B">θ=2</text>

            {/* Sum output wire */}
            <line x1={310} y1={158} x2={430} y2={158} stroke={sc(sum)} strokeWidth={2.5} style={{ transition: "stroke 0.2s" }} />
            <rect x={400} y={145} width={28} height={28} rx={4} fill={sc(sum)} style={{ transition: "fill 0.2s" }} />
            <text x={414} y={163} textAnchor="middle" fontSize={13} fill={sum === 1 ? "#fff" : "#64748B"} fontWeight="700">{sum}</text>
            <text x={434} y={163} fontSize={12} fill="#1E293B" fontWeight="600">Sum</text>
          </>
        );
      })()}

      {/* ── AND gate for Carry ── */}
      {/* A → AND */}
      <line x1={54} y1={90} x2={258} y2={88} stroke={sc(a)} strokeWidth={2} style={{ transition: "stroke 0.2s" }} />
      {/* B → AND */}
      <line x1={54} y1={170} x2={258} y2={112} stroke={sc(b)} strokeWidth={2} style={{ transition: "stroke 0.2s" }} />

      <circle cx={284} cy={100} r={26} fill={carry === 1 ? ACTIVE_FILL : INACTIVE_FILL} stroke={carry === 1 ? HIGH : "#94A3B8"} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
      <text x={284} y={96} textAnchor="middle" fontSize={9} fill="#1E293B" fontWeight="700">AND</text>
      <text x={284} y={108} textAnchor="middle" fontSize={8} fill="#64748B">θ=2</text>

      {/* Carry output wire */}
      <line x1={310} y1={100} x2={430} y2={100} stroke={sc(carry)} strokeWidth={2.5} style={{ transition: "stroke 0.2s" }} />
      <rect x={400} y={87} width={28} height={28} rx={4} fill={sc(carry)} style={{ transition: "fill 0.2s" }} />
      <text x={414} y={105} textAnchor="middle" fontSize={13} fill={carry === 1 ? "#fff" : "#64748B"} fontWeight="700">{carry}</text>
      <text x={434} y={105} fontSize={12} fill="#1E293B" fontWeight="600">Carry</text>

      {/* Labels */}
      <text x={168} y={36} textAnchor="middle" fontSize={10} fill="#64748B">XOR sub-circuit</text>
      <text x={284} y={36} textAnchor="middle" fontSize={10} fill="#64748B">AND</text>
      <line x1={90} y1={42} x2={320} y2={42} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="4 2" />
    </svg>
  );
}
