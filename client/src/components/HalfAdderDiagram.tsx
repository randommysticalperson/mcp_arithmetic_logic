/**
 * HalfAdderDiagram.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 * SVG circuit for Half Adder: XOR (Sum) + AND (Carry)
 * Animated signal dots travel along wires when inputs change.
 */

import AnimatedWire from "./AnimatedWire";

const HIGH = "#0EA5E9";
const LOW = "#CBD5E1";
const ACTIVE_FILL = "#E0F2FE";
const INACTIVE_FILL = "#F8FAFC";

function sc(v: number) { return v === 1 ? HIGH : LOW; }

interface Props { a: number; b: number; sum: number; carry: number; animKey: number; }

export default function HalfAdderDiagram({ a, b, sum, carry, animKey }: Props) {
  const nandOut = a === 1 && b === 1 ? 0 : 1;
  const orOut   = a === 1 || b === 1 ? 1 : 0;

  return (
    <svg viewBox="0 0 520 260" className="w-full max-w-xl mx-auto" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* Input labels */}
      {[{ label: "A", val: a, y: 90 }, { label: "B", val: b, y: 170 }].map(({ label, val, y }) => (
        <g key={label}>
          <text x={22} y={y + 5} textAnchor="end" fontSize={13} fill="#1E293B" fontWeight="700">{label}</text>
          <rect x={28} y={y - 13} width={26} height={26} rx={4} fill={sc(val)} style={{ transition: "fill 0.2s" }} />
          <text x={41} y={y + 5} textAnchor="middle" fontSize={13} fill={val === 1 ? "#fff" : "#64748B"} fontWeight="700">{val}</text>
        </g>
      ))}

      {/* Wires to XOR sub-circuit */}
      <AnimatedWire x1={54} y1={90}  x2={140} y2={100} value={a} animKey={animKey} delay={0} />
      <AnimatedWire x1={54} y1={170} x2={140} y2={140} value={b} animKey={animKey} delay={30} />
      <AnimatedWire x1={54} y1={90}  x2={140} y2={175} value={a} animKey={animKey} delay={10} />
      <AnimatedWire x1={54} y1={170} x2={140} y2={195} value={b} animKey={animKey} delay={40} />

      {/* NAND neuron */}
      <circle cx={168} cy={120} r={26} fill={nandOut === 1 ? ACTIVE_FILL : INACTIVE_FILL} stroke={nandOut === 1 ? HIGH : "#94A3B8"} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
      <text x={168} y={116} textAnchor="middle" fontSize={9} fill="#1E293B" fontWeight="700">NAND</text>
      <text x={168} y={128} textAnchor="middle" fontSize={8} fill="#64748B">θ=1</text>

      {/* OR neuron */}
      <circle cx={168} cy={185} r={26} fill={orOut === 1 ? ACTIVE_FILL : INACTIVE_FILL} stroke={orOut === 1 ? HIGH : "#94A3B8"} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
      <text x={168} y={181} textAnchor="middle" fontSize={9} fill="#1E293B" fontWeight="700">OR</text>
      <text x={168} y={193} textAnchor="middle" fontSize={8} fill="#64748B">θ=1</text>

      <AnimatedWire x1={194} y1={120} x2={258} y2={152} value={nandOut} animKey={animKey} delay={150} />
      <AnimatedWire x1={194} y1={185} x2={258} y2={165} value={orOut}   animKey={animKey} delay={160} />

      {/* AND (XOR output) */}
      <circle cx={284} cy={158} r={26} fill={sum === 1 ? ACTIVE_FILL : INACTIVE_FILL} stroke={sum === 1 ? HIGH : "#94A3B8"} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
      <text x={284} y={154} textAnchor="middle" fontSize={9} fill="#1E293B" fontWeight="700">AND</text>
      <text x={284} y={166} textAnchor="middle" fontSize={8} fill="#64748B">θ=2</text>

      <AnimatedWire x1={310} y1={158} x2={396} y2={158} value={sum} animKey={animKey} delay={260} strokeWidth={2.5} />
      <rect x={368} y={145} width={28} height={28} rx={4} fill={sc(sum)} style={{ transition: "fill 0.2s" }} />
      <text x={382} y={163} textAnchor="middle" fontSize={13} fill={sum === 1 ? "#fff" : "#64748B"} fontWeight="700">{sum}</text>
      <text x={400} y={163} fontSize={12} fill="#1E293B" fontWeight="600">Sum</text>

      {/* AND gate for Carry */}
      <AnimatedWire x1={54} y1={90}  x2={258} y2={88}  value={a} animKey={animKey} delay={5} />
      <AnimatedWire x1={54} y1={170} x2={258} y2={112} value={b} animKey={animKey} delay={35} />

      <circle cx={284} cy={100} r={26} fill={carry === 1 ? ACTIVE_FILL : INACTIVE_FILL} stroke={carry === 1 ? HIGH : "#94A3B8"} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
      <text x={284} y={96}  textAnchor="middle" fontSize={9} fill="#1E293B" fontWeight="700">AND</text>
      <text x={284} y={108} textAnchor="middle" fontSize={8} fill="#64748B">θ=2</text>

      <AnimatedWire x1={310} y1={100} x2={396} y2={100} value={carry} animKey={animKey} delay={250} strokeWidth={2.5} isCarry />
      <rect x={368} y={87} width={28} height={28} rx={4} fill={carry === 1 ? "#F59E0B" : LOW} style={{ transition: "fill 0.2s" }} />
      <text x={382} y={105} textAnchor="middle" fontSize={13} fill={carry === 1 ? "#fff" : "#64748B"} fontWeight="700">{carry}</text>
      <text x={400} y={105} fontSize={12} fill="#1E293B" fontWeight="600">Carry</text>

      <text x={168} y={36} textAnchor="middle" fontSize={10} fill="#64748B">XOR sub-circuit</text>
      <text x={284} y={36} textAnchor="middle" fontSize={10} fill="#64748B">AND</text>
      <line x1={90} y1={42} x2={320} y2={42} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="4 2" />
    </svg>
  );
}
