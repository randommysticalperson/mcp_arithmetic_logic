/**
 * LogicShifterPage.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 *
 * Interactive 8-bit logic shifter demonstrating:
 *   LSL, LSR, ASR, ROL, ROR
 * Each implemented using McCulloch-Pitts AND/OR neuron networks.
 */

import { useState, useMemo } from "react";
import { applyShift, SHIFT_DESCRIPTIONS, type ShiftType } from "@/lib/logicShifter";
import { useSignalAnimation } from "@/hooks/useSignalAnimation";

const SHIFT_TYPES: ShiftType[] = ["LSL", "LSR", "ASR", "ROL", "ROR"];

const SHIFT_COLORS: Record<ShiftType, { pill: string; active: string; dot: string }> = {
  LSL: { pill: "bg-sky-100 text-sky-800 border-sky-200",   active: "bg-sky-500",    dot: "#0EA5E9" },
  LSR: { pill: "bg-emerald-100 text-emerald-800 border-emerald-200", active: "bg-emerald-500", dot: "#10B981" },
  ASR: { pill: "bg-violet-100 text-violet-800 border-violet-200",   active: "bg-violet-500",  dot: "#8B5CF6" },
  ROL: { pill: "bg-amber-100 text-amber-800 border-amber-200",      active: "bg-amber-500",   dot: "#F59E0B" },
  ROR: { pill: "bg-rose-100 text-rose-800 border-rose-200",         active: "bg-rose-500",    dot: "#EF4444" },
};

function numToBits(n: number, len = 8): number[] {
  const clamped = ((n % (1 << len)) + (1 << len)) % (1 << len);
  return Array.from({ length: len }, (_, i) => (clamped >> (len - 1 - i)) & 1);
}

function bitsToNum(bits: number[]): number {
  return parseInt(bits.join("") || "0", 2);
}

// ─── Barrel Shifter SVG ───────────────────────────────────────────────────────

function BarrelShifterSVG({
  result,
  animKey,
  shiftType,
}: {
  result: ReturnType<typeof applyShift>;
  animKey: number;
  shiftType: ShiftType;
}) {
  const { inputBits, outputBits, bitTrace, shiftAmount } = result;
  const n = inputBits.length;
  const dotColor = SHIFT_COLORS[shiftType].dot;

  const W = 560;
  const H = 200;
  const colW = W / n;
  const inputY = 30;
  const outputY = 165;
  const neuronY = 100;

  // Animate key for CSS
  const animName = `barrel-dot-${animKey}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* Row labels */}
      <text x={-2} y={inputY + 5} textAnchor="end" fontSize={9} fill="#94A3B8">IN</text>
      <text x={-2} y={neuronY + 5} textAnchor="end" fontSize={9} fill="#94A3B8">MUX</text>
      <text x={-2} y={outputY + 5} textAnchor="end" fontSize={9} fill="#94A3B8">OUT</text>

      {bitTrace.map((trace, i) => {
        const outX = colW * i + colW / 2;
        const inX = trace.srcIdx !== null ? colW * trace.srcIdx + colW / 2 : outX;
        const isFill = trace.fill !== null;
        const val = outputBits[i];
        const srcVal = trace.srcVal;

        // Wire color
        const wireColor = val === 1 ? dotColor : "#CBD5E1";
        const delay = i * 40;

        return (
          <g key={i}>
            {/* Input bit box */}
            {trace.srcIdx !== null && (
              <g>
                <rect
                  x={inX - 12} y={inputY - 12}
                  width={24} height={24} rx={4}
                  fill={srcVal === 1 ? dotColor : "#F1F5F9"}
                  stroke={srcVal === 1 ? dotColor : "#CBD5E1"}
                  strokeWidth={1.5}
                  style={{ transition: "fill 0.2s" }}
                />
                <text x={inX} y={inputY + 5} textAnchor="middle" fontSize={11} fill={srcVal === 1 ? "#fff" : "#94A3B8"} fontWeight="700">{srcVal}</text>
                <text x={inX} y={inputY - 18} textAnchor="middle" fontSize={8} fill="#94A3B8">b{n - 1 - (trace.srcIdx)}</text>
              </g>
            )}

            {/* Fill source indicator */}
            {isFill && (
              <g>
                <rect
                  x={outX - 12} y={inputY - 12}
                  width={24} height={24} rx={4}
                  fill={trace.fill === 1 ? "#8B5CF6" : "#F1F5F9"}
                  stroke="#CBD5E1"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                />
                <text x={outX} y={inputY + 5} textAnchor="middle" fontSize={10} fill={trace.fill === 1 ? "#fff" : "#94A3B8"} fontWeight="700">
                  {shiftType === "ASR" ? "sgn" : "0"}
                </text>
                <text x={outX} y={inputY - 18} textAnchor="middle" fontSize={8} fill="#94A3B8">fill</text>
              </g>
            )}

            {/* Wire from input to MUX neuron */}
            <line
              x1={inX} y1={inputY + 12}
              x2={outX} y2={neuronY - 14}
              stroke={wireColor}
              strokeWidth={1.5}
              style={{ transition: "stroke 0.2s" }}
            />

            {/* Animated dot on wire */}
            {val === 1 && (
              <circle
                key={`dot-${animKey}-${i}`}
                r={3.5}
                fill={dotColor}
                opacity={0}
                style={{
                  offsetPath: `path('M${inX},${inputY + 12} L${outX},${neuronY - 14}')`,
                  offsetDistance: "0%",
                  animation: `barrel-travel 450ms cubic-bezier(0.23,1,0.32,1) ${delay}ms forwards`,
                } as React.CSSProperties}
              />
            )}

            {/* MUX neuron (AND gate) */}
            <circle
              cx={outX} cy={neuronY}
              r={14}
              fill={val === 1 ? `${dotColor}22` : "#F8FAFC"}
              stroke={val === 1 ? dotColor : "#CBD5E1"}
              strokeWidth={1.5}
              style={{ transition: "fill 0.25s, stroke 0.25s" }}
            />
            <text x={outX} y={neuronY - 2} textAnchor="middle" fontSize={7} fill="#1E293B" fontWeight="700">AND</text>
            <text x={outX} y={neuronY + 8} textAnchor="middle" fontSize={6} fill="#64748B">θ=1</text>

            {/* Wire from neuron to output */}
            <line
              x1={outX} y1={neuronY + 14}
              x2={outX} y2={outputY - 12}
              stroke={wireColor}
              strokeWidth={1.5}
              style={{ transition: "stroke 0.2s" }}
            />

            {/* Animated dot on output wire */}
            {val === 1 && (
              <circle
                key={`dot2-${animKey}-${i}`}
                r={3.5}
                fill={dotColor}
                opacity={0}
                style={{
                  offsetPath: `path('M${outX},${neuronY + 14} L${outX},${outputY - 12}')`,
                  offsetDistance: "0%",
                  animation: `barrel-travel 300ms cubic-bezier(0.23,1,0.32,1) ${delay + 300}ms forwards`,
                } as React.CSSProperties}
              />
            )}

            {/* Output bit box */}
            <rect
              x={outX - 12} y={outputY - 12}
              width={24} height={24} rx={4}
              fill={val === 1 ? dotColor : "#F1F5F9"}
              stroke={val === 1 ? dotColor : "#CBD5E1"}
              strokeWidth={1.5}
              style={{ transition: "fill 0.2s" }}
            />
            <text x={outX} y={outputY + 5} textAnchor="middle" fontSize={11} fill={val === 1 ? "#fff" : "#94A3B8"} fontWeight="700">{val}</text>
            <text x={outX} y={outputY + 20} textAnchor="middle" fontSize={8} fill="#94A3B8">b{n - 1 - i}</text>
          </g>
        );
      })}

      {/* Keyframes injected inline */}
      <style>{`
        @keyframes barrel-travel {
          0%   { offset-distance: 0%;   opacity: 1; }
          85%  { offset-distance: 100%; opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
      `}</style>
    </svg>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function LogicShifterPage() {
  const [shiftType, setShiftType] = useState<ShiftType>("LSL");
  const [shiftAmount, setShiftAmount] = useState(1);
  const [inputBits, setInputBits] = useState<number[]>([0, 1, 0, 1, 1, 0, 1, 0]); // 90

  const result = useMemo(
    () => applyShift(inputBits, shiftType, shiftAmount),
    [inputBits, shiftType, shiftAmount]
  );

  const animKey = useSignalAnimation([inputBits, shiftType, shiftAmount]);
  const desc = SHIFT_DESCRIPTIONS[shiftType];
  const colors = SHIFT_COLORS[shiftType];

  function toggleBit(i: number) {
    setInputBits((prev) => {
      const next = [...prev];
      next[i] = next[i] === 0 ? 1 : 0;
      return next;
    });
  }

  function setDecimal(val: number) {
    const clamped = Math.max(0, Math.min(255, val));
    setInputBits(numToBits(clamped));
  }

  const inputDecimal = bitsToNum(inputBits);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Logic Shifter
            </h2>
            <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
              An 8-bit barrel shifter built from McCulloch-Pitts AND neurons. Each output bit is
              computed by one MUX neuron that selects between a source bit and a fill value based
              on the shift amount.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {SHIFT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setShiftType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-150 ${
                  shiftType === type
                    ? colors.pill + " shadow-sm scale-105"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left controls */}
        <div className="xl:col-span-1 space-y-4">
          {/* Shift type info */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border mb-3 ${colors.pill}`}>
              {desc.name}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">{desc.description}</p>
            <div className="bg-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300">
              <span className="text-slate-500">formula: </span>
              <span className="text-sky-300">{desc.formula}</span>
            </div>
          </div>

          {/* MCP explanation */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">MCP Implementation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{desc.mcpExplanation}</p>
            <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs font-mono text-slate-600 space-y-1">
              <p><span className="text-slate-400">neurons used:</span> <span className="text-sky-600 font-bold">8 AND neurons</span></p>
              <p><span className="text-slate-400">per output bit:</span> <span className="text-sky-600 font-bold">1 neuron</span></p>
              <p><span className="text-slate-400">threshold θ:</span> <span className="text-sky-600 font-bold">1</span></p>
            </div>
          </div>

          {/* Shift amount */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Shift Amount</h3>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={7}
                value={shiftAmount}
                onChange={(e) => setShiftAmount(Number(e.target.value))}
                className="flex-1 accent-sky-500"
              />
              <span className="w-8 h-8 rounded-lg bg-sky-500 text-white text-sm font-bold font-mono flex items-center justify-center">
                {shiftAmount}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-mono mt-1 px-0.5">
              <span>0</span><span>7</span>
            </div>
          </div>

          {/* Result summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Result</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Input (dec)</span>
                <span className="font-bold text-slate-700">{result.inputDecimal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Output (dec)</span>
                <span className={`font-bold ${colors.active.replace("bg-", "text-")}`}>{result.outputDecimal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Input (bin)</span>
                <span className="font-bold text-slate-600">{result.inputBits.join("")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Output (bin)</span>
                <span className={`font-bold ${colors.active.replace("bg-", "text-")}`}>{result.outputBits.join("")}</span>
              </div>
              {result.overflow && (
                <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-700">
                  ⚠ Overflow: {result.shiftedOut.join("")} shifted out
                </div>
              )}
              {result.shiftedOut.length > 0 && !result.overflow && (
                <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-500">
                  Shifted out: <span className="font-bold">{result.shiftedOut.join("")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: main visualization */}
        <div className="xl:col-span-3 space-y-4">
          {/* Input bit editor */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Input Bits — {inputDecimal} (decimal)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">decimal:</span>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={inputDecimal}
                  onChange={(e) => setDecimal(parseInt(e.target.value) || 0)}
                  className="w-20 text-center text-sm font-mono border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
            </div>
            <div className="flex gap-1.5 justify-center flex-wrap">
              {inputBits.map((bit, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-slate-400 font-mono">b{7 - i}</span>
                  <button
                    onClick={() => toggleBit(i)}
                    className={`w-10 h-10 rounded-lg text-base font-bold border-2 transition-all duration-200 active:scale-95 ${
                      bit === 1
                        ? `${colors.active} border-transparent text-white shadow-sm`
                        : "bg-slate-100 border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {bit}
                  </button>
                  {i === 0 && (
                    <span className="text-xs text-violet-500 font-mono font-bold">MSB</span>
                  )}
                  {i === 7 && (
                    <span className="text-xs text-slate-400 font-mono">LSB</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Barrel shifter diagram */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
              Barrel Shifter — {desc.short} by {shiftAmount}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Each column is one MCP AND neuron. Wires show which input bit feeds each output position.
            </p>
            <div className="overflow-x-auto pl-4">
              <BarrelShifterSVG result={result} animKey={animKey} shiftType={shiftType} />
            </div>
            <div className="mt-3 flex gap-4 justify-center text-xs text-slate-400 font-mono flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: SHIFT_COLORS[shiftType].dot }} /> Active (1)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" /> Inactive (0)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-violet-400 inline-block" /> Fill / sign bit
              </span>
            </div>
          </div>

          {/* Bit trace table */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Bit Routing Table</h3>
            <div className="overflow-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Output Bit", "Source Bit", "Source Value", "Output Value", "Note"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.bitTrace.map((trace, i) => (
                    <tr key={i} className={`transition-colors ${result.outputBits[i] === 1 ? "bg-sky-50" : "hover:bg-slate-50"}`}>
                      <td className="px-3 py-1.5 font-bold text-slate-700">b{7 - i}</td>
                      <td className="px-3 py-1.5 text-slate-500">
                        {trace.srcIdx !== null ? `b${7 - trace.srcIdx}` : "—"}
                      </td>
                      <td className="px-3 py-1.5">
                        <span className={`inline-flex w-5 h-5 rounded items-center justify-center font-bold ${
                          trace.srcVal === 1 ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-400"
                        }`}>{trace.srcVal}</span>
                      </td>
                      <td className="px-3 py-1.5">
                        <span className={`inline-flex w-5 h-5 rounded items-center justify-center font-bold ${
                          result.outputBits[i] === 1 ? `${colors.active} text-white` : "bg-slate-100 text-slate-400"
                        }`}>{result.outputBits[i]}</span>
                      </td>
                      <td className="px-3 py-1.5 text-slate-400">
                        {trace.fill !== null
                          ? shiftType === "ASR"
                            ? "sign-fill"
                            : "zero-fill"
                          : shiftType === "ROL" || shiftType === "ROR"
                          ? "rotate"
                          : "direct"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


