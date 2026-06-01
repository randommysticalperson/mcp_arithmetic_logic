/**
 * MultiplierPage.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 *
 * 4-bit binary multiplier using partial products (AND gates) + ripple-carry adder tree.
 * Shows the full partial product matrix and how they are summed.
 */

import { useState, useMemo } from "react";

const BITS = 4;

function toBits(n: number, len: number): number[] {
  return Array.from({ length: len }, (_, i) => (n >> (len - 1 - i)) & 1);
}

function bitsToNum(bits: number[]): number {
  return bits.reduce((acc, b) => (acc << 1) | b, 0);
}

interface PartialProduct {
  row: number;   // which B bit (0 = LSB)
  col: number;   // which A bit (0 = LSB)
  value: number; // AND result
  weight: number; // bit position in final result
}

function computeMultiplier(aBits: number[], bBits: number[]) {
  // aBits and bBits are MSB-first; reverse for LSB-indexed computation
  const a = [...aBits].reverse();
  const b = [...bBits].reverse();

  // Partial products: pp[i][j] = b[i] AND a[j], weight = i+j
  const partials: PartialProduct[] = [];
  for (let i = 0; i < BITS; i++) {
    for (let j = 0; j < BITS; j++) {
      partials.push({
        row: i,
        col: j,
        value: b[i] & a[j],
        weight: i + j,
      });
    }
  }

  // Sum partial products by weight
  const resultLen = BITS * 2;
  const result = toBits(bitsToNum(aBits) * bitsToNum(bBits), resultLen);

  return { partials, result, resultDecimal: bitsToNum(aBits) * bitsToNum(bBits) };
}

export default function MultiplierPage() {
  const [aBits, setABits] = useState<number[]>([0, 1, 1, 0]); // 6
  const [bBits, setBBits] = useState<number[]>([0, 1, 0, 1]); // 5

  const { partials, result, resultDecimal } = useMemo(
    () => computeMultiplier(aBits, bBits),
    [aBits, bBits]
  );

  const aDecimal = bitsToNum(aBits);
  const bDecimal = bitsToNum(bBits);

  function toggleBit(which: "a" | "b", idx: number) {
    const setter = which === "a" ? setABits : setBBits;
    setter((prev) => { const n = [...prev]; n[idx] ^= 1; return n; });
  }

  function setDecimal(which: "a" | "b", val: number) {
    const clamped = Math.max(0, Math.min(15, val));
    if (which === "a") setABits(toBits(clamped, BITS));
    else setBBits(toBits(clamped, BITS));
  }

  // Build partial product rows (MSB-first display)
  // Row i corresponds to b[BITS-1-i] (MSB first)
  const ppRows = useMemo(() => {
    const a = [...aBits].reverse();
    const b = [...bBits].reverse();
    return Array.from({ length: BITS }, (_, rowIdx) => {
      // rowIdx 0 = b[0] (LSB), display reversed
      const bIdx = rowIdx;
      const bBit = b[bIdx];
      const cols = Array.from({ length: BITS }, (_, colIdx) => ({
        value: bBit & a[colIdx],
        aIdx: colIdx,
        bIdx,
        shift: bIdx, // left shift amount
      }));
      return { bIdx, bBit, cols };
    });
  }, [aBits, bBits]);

  const totalNeurons = BITS * BITS + (BITS - 1) * BITS * 9; // AND gates + adder tree

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          4-Bit Binary Multiplier
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
          Binary multiplication reduces to <strong>partial products</strong> (AND gates) summed by a <strong>ripple-carry adder tree</strong>.
          For 4-bit inputs, there are 16 AND neurons (one per bit pair) and 3 layers of 4-bit adders (3 × 9 = 27 neurons each).
          Total: <strong>{totalNeurons} MCP neurons</strong> for a 4×4 multiplier producing an 8-bit result.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-mono">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
            <span className="text-slate-400">Partial products: </span>
            <span className="text-emerald-700 font-semibold">16 AND neurons</span>
          </div>
          <div className="bg-sky-50 border border-sky-200 rounded-lg px-3 py-1.5">
            <span className="text-slate-400">Adder tree: </span>
            <span className="text-sky-700 font-semibold">3 × 4-bit adders = 108 neurons</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
            <span className="text-slate-400">Result: </span>
            <span className="text-amber-700 font-semibold">8-bit output</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {(["a", "b"] as const).map((which) => {
            const bits = which === "a" ? aBits : bBits;
            const dec = which === "a" ? aDecimal : bDecimal;
            return (
              <div key={which} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Input {which.toUpperCase()} = {dec}
                  </h3>
                  <input
                    type="number" min={0} max={15} value={dec}
                    onChange={(e) => setDecimal(which, parseInt(e.target.value) || 0)}
                    className="w-16 text-center text-sm font-mono border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  {bits.map((bit, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-xs text-slate-400 font-mono">b{BITS - 1 - i}</span>
                      <button
                        onClick={() => toggleBit(which, i)}
                        className={`w-12 h-12 rounded-lg text-lg font-bold border-2 transition-all duration-200 active:scale-95 ${
                          bit === 1
                            ? "bg-sky-500 border-sky-400 text-white shadow-sm"
                            : "bg-slate-100 border-slate-200 text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        {bit}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Result */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Result</h3>
            <div className="text-center space-y-2">
              <p className="font-mono text-sm text-slate-500">{aDecimal} × {bDecimal}</p>
              <p className="text-4xl font-bold font-mono text-slate-800">{resultDecimal}</p>
              <div className="flex gap-1 justify-center mt-2 flex-wrap">
                {result.map((bit, i) => (
                  <span key={i} className={`w-8 h-8 rounded text-xs font-bold flex items-center justify-center ${
                    bit === 1 ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    {bit}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-400 font-mono">{BITS * 2}-bit result</p>
            </div>
          </div>

          {/* MCP breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">MCP Neuron Breakdown</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">AND gates (partial products)</span>
                <span className="font-bold text-emerald-600">{BITS}×{BITS} = {BITS * BITS}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Half adder (row 0)</span>
                <span className="font-bold text-sky-600">4 neurons</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Full adder rows (×3)</span>
                <span className="font-bold text-sky-600">3 × 9 = 27</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between font-bold">
                <span className="text-slate-700">Total</span>
                <span className="text-slate-800">{BITS * BITS + 4 + 27} neurons</span>
              </div>
            </div>
          </div>
        </div>

        {/* Partial product matrix */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              Partial Product Matrix (AND Gates)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Each cell = Bᵢ AND Aⱼ. Row i is shifted left by i positions (weight 2ⁱ).
            </p>

            {/* A bit labels */}
            <div className="flex items-center mb-2">
              <div className="w-20 shrink-0" />
              <div className="flex gap-2">
                {[...aBits].map((bit, i) => (
                  <div key={i} className="w-10 text-center">
                    <span className="text-xs text-slate-400 font-mono">A{BITS - 1 - i}</span>
                    <div className={`w-10 h-7 rounded text-xs font-bold flex items-center justify-center mt-0.5 ${
                      bit === 1 ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-400"
                    }`}>{bit}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Partial product rows */}
            {[...ppRows].reverse().map((row) => {
              const displayBIdx = BITS - 1 - row.bIdx;
              return (
                <div key={row.bIdx} className="flex items-center gap-2 mb-2">
                  {/* B bit label */}
                  <div className="w-20 shrink-0 flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-mono">B{displayBIdx}</span>
                    <span className={`w-7 h-7 rounded text-xs font-bold flex items-center justify-center ${
                      row.bBit === 1 ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-400"
                    }`}>{row.bBit}</span>
                    <span className="text-xs text-slate-300">×</span>
                  </div>

                  {/* Shift padding */}
                  <div style={{ width: `${row.bIdx * 44}px` }} className="shrink-0" />

                  {/* AND results */}
                  <div className="flex gap-2">
                    {[...row.cols].reverse().map((cell, ci) => (
                      <div key={ci} className="w-10 text-center">
                        <div className={`w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center border-2 transition-all duration-200 ${
                          cell.value === 1
                            ? "bg-emerald-500 border-emerald-400 text-white shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-300"
                        }`}>
                          {cell.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shift annotation */}
                  {row.bIdx > 0 && (
                    <span className="text-xs text-slate-300 font-mono ml-1">
                      ×2^{row.bIdx}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Divider */}
            <div className="border-t-2 border-slate-300 my-3 ml-20" />

            {/* Final result */}
            <div className="flex items-center gap-2">
              <div className="w-20 shrink-0 text-xs font-bold text-slate-500 font-mono text-right pr-2">
                Result
              </div>
              <div className="flex gap-1">
                {result.map((bit, i) => (
                  <span key={i} className={`w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center ${
                    bit === 1 ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    {bit}
                  </span>
                ))}
              </div>
              <span className="text-sm font-mono text-slate-500 ml-2">= {resultDecimal}</span>
            </div>
          </div>

          {/* Adder tree explanation */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
              Adder Tree — Summing Partial Products
            </h3>
            <div className="space-y-3">
              {[
                {
                  label: "Stage 1: Row 0 + Row 1",
                  desc: "Add partial product rows 0 and 1 using a 4-bit ripple-carry adder (36 neurons). Produces a 5-bit intermediate sum.",
                  color: "sky",
                },
                {
                  label: "Stage 2: Stage1 + Row 2",
                  desc: "Add the Stage 1 result with partial product row 2 (shifted left by 2). Another 4-bit adder (36 neurons). Produces a 6-bit intermediate.",
                  color: "violet",
                },
                {
                  label: "Stage 3: Stage2 + Row 3",
                  desc: "Add the Stage 2 result with partial product row 3 (shifted left by 3). Final 4-bit adder (36 neurons). Produces the 8-bit final product.",
                  color: "emerald",
                },
              ].map((stage, i) => (
                <div key={i} className={`rounded-xl border p-4 bg-${stage.color}-50 border-${stage.color}-100`}
                  style={{
                    backgroundColor: stage.color === "sky" ? "#f0f9ff" : stage.color === "violet" ? "#f5f3ff" : "#f0fdf4",
                    borderColor: stage.color === "sky" ? "#bae6fd" : stage.color === "violet" ? "#ddd6fe" : "#bbf7d0",
                  }}>
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      stage.color === "sky" ? "bg-sky-500" : stage.color === "violet" ? "bg-violet-500" : "bg-emerald-500"
                    }`}>{i + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-700 mb-1">{stage.label}</p>
                      <p className="text-xs text-slate-500">{stage.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Final result display */}
            <div className="mt-4 bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-mono mb-1">8-bit Product</p>
                  <div className="flex gap-1">
                    {result.map((bit, i) => (
                      <span key={i} className={`w-8 h-8 rounded text-sm font-bold flex items-center justify-center ${
                        bit === 1 ? "bg-emerald-500 text-white" : "bg-slate-600 text-slate-400"
                      }`}>{bit}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-mono mb-1">Decimal</p>
                  <p className="text-3xl font-bold text-white font-mono">{resultDecimal}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400 font-mono">
                {aDecimal} × {bDecimal} = {resultDecimal} · Total: {BITS * BITS + 4 + 27} MCP neurons
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
