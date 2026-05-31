/**
 * FullAdderDiagram.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 * SVG circuit for Full Adder: two half-adders + OR for carry-out
 * Animated signal dots travel along wires when inputs change.
 */

import AnimatedWire from "./AnimatedWire";

const HIGH = "#0EA5E9";
const LOW = "#CBD5E1";
const ACTIVE_FILL = "#E0F2FE";
const INACTIVE_FILL = "#F8FAFC";
const CARRY_COLOR = "#F59E0B";

function sc(v: number, isCarry = false) {
  if (isCarry && v === 1) return CARRY_COLOR;
  return v === 1 ? HIGH : LOW;
}

interface Props {
  a: number; b: number; cin: number;
  xor1: number; and1: number;
  sum: number; and2: number; carryOut: number;
  animKey: number;
}

function MiniNeuron({ cx, cy, label, theta, active, isCarry = false }: {
  cx: number; cy: number; label: string; theta: number; active: boolean; isCarry?: boolean;
}) {
  const stroke = active ? (isCarry ? CARRY_COLOR : HIGH) : "#94A3B8";
  const fill = active ? (isCarry ? "#FEF3C7" : ACTIVE_FILL) : INACTIVE_FILL;
  return (
    <g>
      <circle cx={cx} cy={cy} r={22} fill={fill} stroke={stroke} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize={8} fill="#1E293B" fontWeight="700">{label}</text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize={7} fill="#64748B">θ={theta}</text>
    </g>
  );
}

export default function FullAdderDiagram({ a, b, cin, xor1, and1, sum, and2, carryOut, animKey }: Props) {
  return (
    <svg viewBox="0 0 600 300" className="w-full max-w-2xl mx-auto" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* Inputs */}
      {[{ label: "A", val: a, y: 70 }, { label: "B", val: b, y: 130 }, { label: "Cᵢₙ", val: cin, y: 210, isCarry: true }].map(({ label, val, y, isCarry }) => (
        <g key={label}>
          <text x={24} y={y + 5} textAnchor="end" fontSize={12} fill="#1E293B" fontWeight="700">{label}</text>
          <rect x={28} y={y - 12} width={26} height={26} rx={4} fill={sc(val, isCarry)} style={{ transition: "fill 0.2s" }} />
          <text x={41} y={y + 5} textAnchor="middle" fontSize={12} fill={val === 1 ? "#fff" : "#64748B"} fontWeight="700">{val}</text>
        </g>
      ))}

      {/* HA1: A XOR B */}
      <AnimatedWire x1={54} y1={70}  x2={110} y2={95}  value={a} animKey={animKey} delay={0} strokeWidth={1.8} />
      <AnimatedWire x1={54} y1={130} x2={110} y2={115} value={b} animKey={animKey} delay={20} strokeWidth={1.8} />
      <MiniNeuron cx={132} cy={105} label="XOR" theta={2} active={xor1 === 1} />

      {/* HA1: A AND B */}
      <AnimatedWire x1={54} y1={70}  x2={110} y2={155} value={a} animKey={animKey} delay={10} strokeWidth={1.8} />
      <AnimatedWire x1={54} y1={130} x2={110} y2={165} value={b} animKey={animKey} delay={30} strokeWidth={1.8} />
      <MiniNeuron cx={132} cy={160} label="AND" theta={2} active={and1 === 1} isCarry />

      <text x={132} y={52} textAnchor="middle" fontSize={9} fill="#94A3B8">Half Adder 1</text>
      <line x1={90} y1={58} x2={174} y2={58} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="3 2" />

      {/* HA2: xor1 XOR cin */}
      <AnimatedWire x1={154} y1={105} x2={260} y2={115} value={xor1} animKey={animKey} delay={130} strokeWidth={1.8} />
      <AnimatedWire x1={54}  y1={210} x2={260} y2={135} value={cin}  animKey={animKey} delay={0}   strokeWidth={1.8} isCarry />
      <MiniNeuron cx={282} cy={125} label="XOR" theta={2} active={sum === 1} />

      {/* HA2: xor1 AND cin */}
      <AnimatedWire x1={154} y1={105} x2={260} y2={185} value={xor1} animKey={animKey} delay={140} strokeWidth={1.8} />
      <AnimatedWire x1={54}  y1={210} x2={260} y2={205} value={cin}  animKey={animKey} delay={10}  strokeWidth={1.8} isCarry />
      <MiniNeuron cx={282} cy={195} label="AND" theta={2} active={and2 === 1} isCarry />

      <text x={282} y={52} textAnchor="middle" fontSize={9} fill="#94A3B8">Half Adder 2</text>
      <line x1={240} y1={58} x2={324} y2={58} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="3 2" />

      {/* OR for carry-out */}
      <AnimatedWire x1={154} y1={160} x2={400} y2={200} value={and1} animKey={animKey} delay={150} strokeWidth={1.8} isCarry />
      <AnimatedWire x1={304} y1={195} x2={400} y2={215} value={and2} animKey={animKey} delay={260} strokeWidth={1.8} isCarry />
      <MiniNeuron cx={422} cy={208} label="OR" theta={1} active={carryOut === 1} isCarry />

      {/* Sum output */}
      <AnimatedWire x1={304} y1={125} x2={526} y2={125} value={sum} animKey={animKey} delay={260} strokeWidth={2.5} />
      <rect x={496} y={112} width={28} height={28} rx={4} fill={sc(sum)} style={{ transition: "fill 0.2s" }} />
      <text x={510} y={130} textAnchor="middle" fontSize={13} fill={sum === 1 ? "#fff" : "#64748B"} fontWeight="700">{sum}</text>
      <text x={530} y={130} fontSize={11} fill="#1E293B" fontWeight="600">Sum</text>

      {/* Carry-out output */}
      <AnimatedWire x1={444} y1={208} x2={526} y2={208} value={carryOut} animKey={animKey} delay={360} strokeWidth={2.5} isCarry />
      <rect x={496} y={195} width={28} height={28} rx={4} fill={sc(carryOut, true)} style={{ transition: "fill 0.2s" }} />
      <text x={510} y={213} textAnchor="middle" fontSize={13} fill={carryOut === 1 ? "#fff" : "#64748B"} fontWeight="700">{carryOut}</text>
      <text x={530} y={213} fontSize={11} fill="#1E293B" fontWeight="600">Cₒᵤₜ</text>
    </svg>
  );
}
