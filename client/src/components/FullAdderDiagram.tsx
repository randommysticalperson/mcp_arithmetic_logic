/**
 * FullAdderDiagram.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 * SVG circuit for Full Adder: two half-adders + OR for carry-out
 */

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
  a: number;
  b: number;
  cin: number;
  xor1: number;
  and1: number;
  sum: number;
  and2: number;
  carryOut: number;
}

function MiniNeuron({
  cx, cy, label, theta, active, isCarry = false,
}: {
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

export default function FullAdderDiagram({ a, b, cin, xor1, and1, sum, and2, carryOut }: Props) {
  return (
    <svg
      viewBox="0 0 600 300"
      className="w-full max-w-2xl mx-auto"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {/* ── Inputs ── */}
      {[
        { label: "A", val: a, y: 70 },
        { label: "B", val: b, y: 130 },
        { label: "Cᵢₙ", val: cin, y: 210, isCarry: true },
      ].map(({ label, val, y, isCarry }) => (
        <g key={label}>
          <text x={24} y={y + 5} textAnchor="end" fontSize={12} fill="#1E293B" fontWeight="700">{label}</text>
          <rect x={28} y={y - 12} width={26} height={26} rx={4} fill={sc(val, isCarry)} style={{ transition: "fill 0.2s" }} />
          <text x={41} y={y + 5} textAnchor="middle" fontSize={12} fill={val === 1 ? "#fff" : "#64748B"} fontWeight="700">{val}</text>
        </g>
      ))}

      {/* ── Half Adder 1: A XOR B → xor1, A AND B → and1 ── */}
      {/* Wires to HA1 XOR */}
      <line x1={54} y1={70} x2={110} y2={95} stroke={sc(a)} strokeWidth={1.8} style={{ transition: "stroke 0.2s" }} />
      <line x1={54} y1={130} x2={110} y2={115} stroke={sc(b)} strokeWidth={1.8} style={{ transition: "stroke 0.2s" }} />
      <MiniNeuron cx={132} cy={105} label="XOR" theta={2} active={xor1 === 1} />

      {/* Wires to HA1 AND */}
      <line x1={54} y1={70} x2={110} y2={155} stroke={sc(a)} strokeWidth={1.8} style={{ transition: "stroke 0.2s" }} />
      <line x1={54} y1={130} x2={110} y2={165} stroke={sc(b)} strokeWidth={1.8} style={{ transition: "stroke 0.2s" }} />
      <MiniNeuron cx={132} cy={160} label="AND" theta={2} active={and1 === 1} isCarry />

      {/* HA1 label */}
      <text x={132} y={52} textAnchor="middle" fontSize={9} fill="#94A3B8">Half Adder 1</text>
      <line x1={90} y1={58} x2={174} y2={58} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="3 2" />

      {/* ── Half Adder 2: xor1 XOR cin → sum, xor1 AND cin → and2 ── */}
      {/* xor1 → HA2 XOR */}
      <line x1={154} y1={105} x2={260} y2={115} stroke={sc(xor1)} strokeWidth={1.8} style={{ transition: "stroke 0.2s" }} />
      {/* cin → HA2 XOR */}
      <line x1={54} y1={210} x2={260} y2={135} stroke={sc(cin, true)} strokeWidth={1.8} style={{ transition: "stroke 0.2s" }} />
      <MiniNeuron cx={282} cy={125} label="XOR" theta={2} active={sum === 1} />

      {/* xor1 → HA2 AND */}
      <line x1={154} y1={105} x2={260} y2={185} stroke={sc(xor1)} strokeWidth={1.8} style={{ transition: "stroke 0.2s" }} />
      {/* cin → HA2 AND */}
      <line x1={54} y1={210} x2={260} y2={205} stroke={sc(cin, true)} strokeWidth={1.8} style={{ transition: "stroke 0.2s" }} />
      <MiniNeuron cx={282} cy={195} label="AND" theta={2} active={and2 === 1} isCarry />

      {/* HA2 label */}
      <text x={282} y={52} textAnchor="middle" fontSize={9} fill="#94A3B8">Half Adder 2</text>
      <line x1={240} y1={58} x2={324} y2={58} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="3 2" />

      {/* ── OR gate for carry-out ── */}
      {/* and1 → OR */}
      <line x1={154} y1={160} x2={400} y2={200} stroke={sc(and1, true)} strokeWidth={1.8} style={{ transition: "stroke 0.2s" }} />
      {/* and2 → OR */}
      <line x1={304} y1={195} x2={400} y2={215} stroke={sc(and2, true)} strokeWidth={1.8} style={{ transition: "stroke 0.2s" }} />
      <MiniNeuron cx={422} cy={208} label="OR" theta={1} active={carryOut === 1} isCarry />

      {/* ── Outputs ── */}
      {/* Sum */}
      <line x1={304} y1={125} x2={530} y2={125} stroke={sc(sum)} strokeWidth={2.5} style={{ transition: "stroke 0.2s" }} />
      <rect x={498} y={112} width={28} height={28} rx={4} fill={sc(sum)} style={{ transition: "fill 0.2s" }} />
      <text x={512} y={130} textAnchor="middle" fontSize={13} fill={sum === 1 ? "#fff" : "#64748B"} fontWeight="700">{sum}</text>
      <text x={532} y={130} fontSize={11} fill="#1E293B" fontWeight="600">Sum</text>

      {/* Carry-out */}
      <line x1={444} y1={208} x2={530} y2={208} stroke={sc(carryOut, true)} strokeWidth={2.5} style={{ transition: "stroke 0.2s" }} />
      <rect x={498} y={195} width={28} height={28} rx={4} fill={sc(carryOut, true)} style={{ transition: "fill 0.2s" }} />
      <text x={512} y={213} textAnchor="middle" fontSize={13} fill={carryOut === 1 ? "#fff" : "#64748B"} fontWeight="700">{carryOut}</text>
      <text x={532} y={213} fontSize={11} fill="#1E293B" fontWeight="600">Cₒᵤₜ</text>

      {/* OR label */}
      <text x={422} y={52} textAnchor="middle" fontSize={9} fill="#94A3B8">Carry OR</text>
    </svg>
  );
}
