/**
 * BitwisePage.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 *
 * Interactive 8-bit bitwise operations using McCulloch-Pitts neurons.
 * Operations: AND, OR, XOR, NOT
 * Each bit position has its own MCP neuron computing the result.
 */

import { useState, useMemo } from "react";
import { useSignalAnimation } from "@/hooks/useSignalAnimation";

type BitwiseOp = "AND" | "OR" | "XOR" | "NOT";

const OP_INFO: Record<BitwiseOp, {
  name: string;
  color: string;
  activeColor: string;
  dotColor: string;
  borderColor: string;
  description: string;
  mcpImpl: string;
  threshold: string;
  inputs: number;
  formula: string;
}> = {
  AND: {
    name: "Bitwise AND",
    color: "bg-sky-100 text-sky-800 border-sky-300",
    activeColor: "bg-sky-500",
    dotColor: "#0EA5E9",
    borderColor: "border-sky-300",
    description: "Output bit is 1 only when both corresponding input bits are 1. Used for masking — clearing specific bits by ANDing with a mask.",
    mcpImpl: "One MCP neuron per bit position with two excitatory inputs (Aᵢ and Bᵢ) and threshold θ = 2. The neuron fires only when both inputs are active.",
    threshold: "θ = 2",
    inputs: 2,
    formula: "Cᵢ = Aᵢ AND Bᵢ",
  },
  OR: {
    name: "Bitwise OR",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    activeColor: "bg-emerald-500",
    dotColor: "#10B981",
    borderColor: "border-emerald-300",
    description: "Output bit is 1 when at least one corresponding input bit is 1. Used for setting specific bits by ORing with a mask.",
    mcpImpl: "One MCP neuron per bit with two excitatory inputs and threshold θ = 1. The neuron fires when either or both inputs are active.",
    threshold: "θ = 1",
    inputs: 2,
    formula: "Cᵢ = Aᵢ OR Bᵢ",
  },
  XOR: {
    name: "Bitwise XOR",
    color: "bg-violet-100 text-violet-800 border-violet-300",
    activeColor: "bg-violet-500",
    dotColor: "#8B5CF6",
    borderColor: "border-violet-300",
    description: "Output bit is 1 when the two input bits differ. Used for toggling bits, detecting differences, and parity checks.",
    mcpImpl: "Three MCP neurons per bit: NAND (θ=1, inhibitory) + OR (θ=1) → AND (θ=2). The same XOR sub-circuit used in the half-adder.",
    threshold: "θ = 1/2",
    inputs: 2,
    formula: "Cᵢ = Aᵢ XOR Bᵢ",
  },
  NOT: {
    name: "Bitwise NOT",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    activeColor: "bg-amber-500",
    dotColor: "#F59E0B",
    borderColor: "border-amber-300",
    description: "Flips every bit. Produces the one's complement. Combined with +1 it gives two's complement (negation).",
    mcpImpl: "One MCP neuron per bit with one inhibitory input and a bias excitatory input (always 1). Threshold θ = 1. When input is 1, inhibition suppresses output; when input is 0, bias fires the neuron.",
    threshold: "θ = 1",
    inputs: 1,
    formula: "Cᵢ = NOT Aᵢ",
  },
};

function numToBits(n: number, len = 8): number[] {
  const clamped = ((n % (1 << len)) + (1 << len)) % (1 << len);
  return Array.from({ length: len }, (_, i) => (clamped >> (len - 1 - i)) & 1);
}

function bitsToNum(bits: number[]): number {
  return parseInt(bits.join("") || "0", 2);
}

function computeBitwise(op: BitwiseOp, a: number[], b: number[]): number[] {
  return a.map((ai, i) => {
    const bi = b[i];
    switch (op) {
      case "AND": return ai & bi;
      case "OR":  return ai | bi;
      case "XOR": return ai ^ bi;
      case "NOT": return ai === 1 ? 0 : 1;
    }
  });
}

// ─── Per-bit neuron SVG ────────────────────────────────────────────────────────

function BitNeuronSVG({
  op, a, b, out, animKey, delay,
}: {
  op: BitwiseOp; a: number; b: number; out: number; animKey: number; delay: number;
}) {
  const info = OP_INFO[op];
  const W = 80, H = 90;
  const cx = 40, neuronY = 52;
  const dotColor = info.dotColor;
  const wireColor = (v: number) => v === 1 ? dotColor : "#CBD5E1";
  const animName = `bit-dot-${animKey}-${delay}`;

  const inputYs = op === "NOT" ? [20] : [16, 28];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ fontFamily: "'IBM Plex Mono', monospace", overflow: "visible" }}>
      <style>{`
        @keyframes ${animName} {
          0%   { offset-distance: 0%;   opacity: 1; }
          80%  { offset-distance: 100%; opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
      `}</style>

      {/* Input wires */}
      {inputYs.map((iy, idx) => {
        const val = idx === 0 ? a : b;
        const isInhibitory = op === "NOT" && idx === 0;
        return (
          <g key={idx}>
            <line x1={8} y1={iy} x2={cx - 12} y2={neuronY}
              stroke={isInhibitory && val === 1 ? "#EF4444" : wireColor(val)}
              strokeWidth={1.5}
              strokeDasharray={isInhibitory ? "3 2" : undefined}
              style={{ transition: "stroke 0.2s" }}
            />
            {val === 1 && (
              <circle key={`d-${animKey}-${idx}`} r={3} fill={isInhibitory ? "#EF4444" : dotColor} opacity={0}
                style={{
                  offsetPath: `path('M8,${iy} L${cx - 12},${neuronY}')`,
                  offsetDistance: "0%",
                  animation: `${animName} 350ms ease-out ${delay + idx * 30}ms forwards`,
                } as React.CSSProperties}
              />
            )}
            {isInhibitory && (
              <circle cx={cx - 12} cy={neuronY} r={4}
                fill={val === 1 ? "#EF4444" : "#CBD5E1"}
                style={{ transition: "fill 0.2s" }}
              />
            )}
          </g>
        );
      })}

      {/* Bias for NOT */}
      {op === "NOT" && (
        <line x1={8} y1={36} x2={cx - 12} y2={neuronY}
          stroke={dotColor} strokeWidth={1} strokeDasharray="2 2" />
      )}

      {/* Neuron body */}
      <circle cx={cx} cy={neuronY} r={12}
        fill={out === 1 ? `${dotColor}22` : "#F8FAFC"}
        stroke={out === 1 ? dotColor : "#CBD5E1"}
        strokeWidth={1.5}
        style={{ transition: "fill 0.25s, stroke 0.25s" }}
      />
      <text x={cx} y={neuronY + 4} textAnchor="middle" fontSize={7} fill="#1E293B" fontWeight="700">{op}</text>

      {/* Output wire */}
      <line x1={cx + 12} y1={neuronY} x2={72} y2={neuronY}
        stroke={wireColor(out)} strokeWidth={1.5}
        style={{ transition: "stroke 0.2s" }}
      />
      {out === 1 && (
        <circle key={`out-${animKey}`} r={3} fill={dotColor} opacity={0}
          style={{
            offsetPath: `path('M${cx + 12},${neuronY} L72,${neuronY}')`,
            offsetDistance: "0%",
            animation: `${animName} 300ms ease-out ${delay + 200}ms forwards`,
          } as React.CSSProperties}
        />
      )}

      {/* Output bit */}
      <rect x={60} y={neuronY - 9} width={18} height={18} rx={3}
        fill={out === 1 ? dotColor : "#F1F5F9"}
        stroke={out === 1 ? dotColor : "#CBD5E1"}
        strokeWidth={1}
        style={{ transition: "fill 0.2s" }}
      />
      <text x={69} y={neuronY + 5} textAnchor="middle" fontSize={10}
        fill={out === 1 ? "#fff" : "#94A3B8"} fontWeight="700">{out}</text>
    </svg>
  );
}

// ─── Bit Row ───────────────────────────────────────────────────────────────────

function BitRow({
  op, aBits, bBits, outBits, animKey,
}: {
  op: BitwiseOp; aBits: number[]; bBits: number[]; outBits: number[]; animKey: number;
}) {
  const info = OP_INFO[op];
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {aBits.map((a, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span className="text-xs font-mono text-slate-400">b{7 - i}</span>
            <BitNeuronSVG
              op={op} a={a} b={bBits[i]} out={outBits[i]}
              animKey={animKey} delay={i * 35}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Bit Toggle Row ────────────────────────────────────────────────────────────

function BitToggleRow({
  label, bits, onToggle, activeColor, isResult = false,
}: {
  label: string; bits: number[]; onToggle?: (i: number) => void;
  activeColor: string; isResult?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 text-sm font-bold font-mono text-slate-500 shrink-0">{label}</span>
      <div className="flex gap-1.5">
        {bits.map((bit, i) => (
          <button
            key={i}
            onClick={() => onToggle?.(i)}
            disabled={isResult}
            className={`w-9 h-9 rounded-lg text-sm font-bold border-2 transition-all duration-150 font-mono
              ${isResult ? "cursor-default" : "active:scale-95 hover:border-opacity-80"}
              ${bit === 1
                ? `${activeColor} border-transparent text-white shadow-sm`
                : "bg-slate-100 border-slate-200 text-slate-400"
              }`}
          >
            {bit}
          </button>
        ))}
      </div>
      <span className="text-xs font-mono text-slate-400 shrink-0">
        {bitsToNum(bits)}
      </span>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function BitwisePage() {
  const [op, setOp] = useState<BitwiseOp>("AND");
  const [aBits, setABits] = useState<number[]>([1, 0, 1, 1, 0, 1, 0, 0]); // 180
  const [bBits, setBBits] = useState<number[]>([1, 1, 0, 1, 0, 0, 1, 1]); // 211

  const outBits = useMemo(() => computeBitwise(op, aBits, bBits), [op, aBits, bBits]);
  const animKey = useSignalAnimation([aBits, bBits, op]);
  const info = OP_INFO[op];

  function toggleA(i: number) {
    setABits(prev => { const n = [...prev]; n[i] ^= 1; return n; });
  }
  function toggleB(i: number) {
    setBBits(prev => { const n = [...prev]; n[i] ^= 1; return n; });
  }
  function setDecimalA(v: number) { setABits(numToBits(Math.max(0, Math.min(255, v)))); }
  function setDecimalB(v: number) { setBBits(numToBits(Math.max(0, Math.min(255, v)))); }

  const ops: BitwiseOp[] = ["AND", "OR", "XOR", "NOT"];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Bitwise Operations
            </h2>
            <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
              8-bit bitwise logic using McCulloch-Pitts neurons. Each bit position has its own
              dedicated neuron computing the result independently and in parallel.
            </p>
          </div>
          <div className="flex gap-2">
            {ops.map((o) => (
              <button
                key={o}
                onClick={() => setOp(o)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-150
                  ${op === o ? OP_INFO[o].color + " shadow-sm scale-105" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Left panel: info */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border mb-3 ${info.color}`}>
              {info.name}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">{info.description}</p>
            <div className="bg-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 mb-3">
              <span className="text-slate-500">formula: </span>
              <span className="text-sky-300">{info.formula}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">MCP Implementation</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">{info.mcpImpl}</p>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs font-mono space-y-1">
              <p><span className="text-slate-400">neurons:</span> <span className="font-bold text-sky-600">8 {op} neurons</span></p>
              <p><span className="text-slate-400">threshold:</span> <span className="font-bold text-sky-600">{info.threshold}</span></p>
              <p><span className="text-slate-400">inputs/neuron:</span> <span className="font-bold text-sky-600">{info.inputs}</span></p>
            </div>
          </div>

          {/* Result summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Result</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">A (dec)</span>
                <span className="font-bold text-slate-700">{bitsToNum(aBits)}</span>
              </div>
              {op !== "NOT" && (
                <div className="flex justify-between">
                  <span className="text-slate-400">B (dec)</span>
                  <span className="font-bold text-slate-700">{bitsToNum(bBits)}</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-2 flex justify-between">
                <span className="text-slate-400">A {op} {op !== "NOT" ? "B" : ""}</span>
                <span className={`font-bold ${info.activeColor.replace("bg-", "text-")}`}>{bitsToNum(outBits)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">hex</span>
                <span className={`font-bold ${info.activeColor.replace("bg-", "text-")}`}>
                  0x{bitsToNum(outBits).toString(16).toUpperCase().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: main visualization */}
        <div className="xl:col-span-3 space-y-4">
          {/* Input editors */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Operands</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <BitToggleRow label="A" bits={aBits} onToggle={toggleA} activeColor={info.activeColor} />
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-slate-400 font-mono">dec:</span>
                  <input
                    type="number" min={0} max={255} value={bitsToNum(aBits)}
                    onChange={(e) => setDecimalA(parseInt(e.target.value) || 0)}
                    className="w-16 text-center text-sm font-mono border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>
              </div>
              {op !== "NOT" && (
                <div className="flex items-center gap-3 flex-wrap">
                  <BitToggleRow label="B" bits={bBits} onToggle={toggleB} activeColor={info.activeColor} />
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-slate-400 font-mono">dec:</span>
                    <input
                      type="number" min={0} max={255} value={bitsToNum(bBits)}
                      onChange={(e) => setDecimalB(parseInt(e.target.value) || 0)}
                      className="w-16 text-center text-sm font-mono border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                  </div>
                </div>
              )}
              <div className="border-t border-slate-200 pt-3">
                <BitToggleRow label="=" bits={outBits} activeColor={info.activeColor} isResult />
              </div>
            </div>
          </div>

          {/* Neuron diagram */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
              8 Parallel MCP Neurons — {op}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Each column is one independent MCP neuron computing one output bit.
              Animated dots show signal propagation when inputs change.
            </p>
            <BitRow op={op} aBits={aBits} bBits={bBits} outBits={outBits} animKey={animKey} />
            <div className="mt-3 flex gap-4 justify-center text-xs text-slate-400 font-mono flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: info.dotColor }} /> Active (1)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" /> Inactive (0)
              </span>
              {op === "NOT" && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Inhibitory
                </span>
              )}
            </div>
          </div>

          {/* Truth table for single bit */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
              Single-Bit Truth Table — {op}
            </h3>
            <div className="overflow-auto rounded-lg border border-slate-200">
              <table className="text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-2 text-left font-semibold text-slate-500">A</th>
                    {op !== "NOT" && <th className="px-4 py-2 text-left font-semibold text-slate-500">B</th>}
                    <th className="px-4 py-2 text-left font-semibold text-slate-500">Out</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-500">Neuron fires?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(op === "NOT"
                    ? [[0], [1]]
                    : [[0,0],[0,1],[1,0],[1,1]]
                  ).map((row, ri) => {
                    const [ra, rb = 0] = row;
                    const rout = computeBitwise(op, [ra], [rb])[0];
                    return (
                      <tr key={ri} className={rout === 1 ? "bg-sky-50" : "hover:bg-slate-50"}>
                        <td className="px-4 py-1.5">
                          <span className={`inline-flex w-5 h-5 rounded items-center justify-center font-bold ${ra === 1 ? `${info.activeColor} text-white` : "bg-slate-100 text-slate-400"}`}>{ra}</span>
                        </td>
                        {op !== "NOT" && (
                          <td className="px-4 py-1.5">
                            <span className={`inline-flex w-5 h-5 rounded items-center justify-center font-bold ${rb === 1 ? `${info.activeColor} text-white` : "bg-slate-100 text-slate-400"}`}>{rb}</span>
                          </td>
                        )}
                        <td className="px-4 py-1.5">
                          <span className={`inline-flex w-5 h-5 rounded items-center justify-center font-bold ${rout === 1 ? `${info.activeColor} text-white` : "bg-slate-100 text-slate-400"}`}>{rout}</span>
                        </td>
                        <td className="px-4 py-1.5 text-slate-500">{rout === 1 ? "✓ Yes" : "✗ No"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
