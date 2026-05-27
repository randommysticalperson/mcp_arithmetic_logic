/**
 * BinaryAdditionPage.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 * Multi-bit binary addition using cascaded full adders (McCulloch-Pitts neurons).
 */

import { useState, useMemo } from "react";
import { binaryAddition } from "@/lib/mcpNeuron";

const BITS = 4;

function toBits(n: number, len: number): number[] {
  return Array.from({ length: len }, (_, i) => (n >> (len - 1 - i)) & 1);
}

function bitsToNum(bits: number[]): number {
  return parseInt(bits.join("") || "0", 2);
}

export default function BinaryAdditionPage() {
  const [aBits, setABits] = useState<number[]>([0, 1, 0, 1]); // 5
  const [bBits, setBBits] = useState<number[]>([0, 0, 1, 1]); // 3

  const result = useMemo(() => binaryAddition(aBits, bBits), [aBits, bBits]);

  function toggleBit(which: "a" | "b", idx: number) {
    if (which === "a") {
      setABits((prev) => {
        const next = [...prev];
        next[idx] = next[idx] === 0 ? 1 : 0;
        return next;
      });
    } else {
      setBBits((prev) => {
        const next = [...prev];
        next[idx] = next[idx] === 0 ? 1 : 0;
        return next;
      });
    }
  }

  function setDecimal(which: "a" | "b", val: number) {
    const clamped = Math.max(0, Math.min(15, val));
    const bits = toBits(clamped, BITS);
    if (which === "a") setABits(bits);
    else setBBits(bits);
  }

  const aDecimal = bitsToNum(aBits);
  const bDecimal = bitsToNum(bBits);
  const resultBitsWithCarry = result.carryOut === 1
    ? [1, ...result.resultBits]
    : result.resultBits;

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          4-Bit Binary Addition
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
          A 4-bit ripple-carry adder chains four full adders together. Each full adder is built from{" "}
          <strong>9 McCulloch-Pitts neurons</strong>, so the complete 4-bit adder uses{" "}
          <strong>36 MCP neurons</strong>. The carry-out of each stage feeds into the carry-in of the next.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Input panel */}
        <div className="xl:col-span-2 space-y-4">
          {/* Bit toggles for A */}
          {(["a", "b"] as const).map((which) => {
            const bits = which === "a" ? aBits : bBits;
            const dec = which === "a" ? aDecimal : bDecimal;
            return (
              <div key={which} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Input {which.toUpperCase()} (decimal: {dec})
                  </h3>
                  <input
                    type="number"
                    min={0}
                    max={15}
                    value={dec}
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
                            ? "bg-sky-500 border-sky-400 text-white shadow-sm shadow-sky-200"
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

          {/* Result summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Result</h3>
            <div className="text-center space-y-3">
              <div className="font-mono text-lg">
                <span className="text-slate-500">{aBits.join("")}</span>
                <span className="text-slate-400 mx-2 text-sm">({aDecimal})</span>
              </div>
              <div className="font-mono text-lg">
                <span className="text-slate-400 mr-1">+</span>
                <span className="text-slate-500">{bBits.join("")}</span>
                <span className="text-slate-400 mx-2 text-sm">({bDecimal})</span>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <div className="font-mono text-xl font-bold">
                  {result.carryOut === 1 && (
                    <span className="text-amber-500">1</span>
                  )}
                  <span className="text-sky-600">{result.resultBits.join("")}</span>
                  <span className="text-slate-400 mx-2 text-sm">({result.resultDecimal})</span>
                </div>
                {result.carryOut === 1 && (
                  <p className="text-xs text-amber-600 mt-1">⚠ Carry overflow!</p>
                )}
              </div>
              <div className="text-2xl font-bold text-slate-800 font-mono pt-1">
                {aDecimal} + {bDecimal} = {result.resultDecimal}
              </div>
            </div>
          </div>
        </div>

        {/* Ripple carry adder visualization */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-5">
              Ripple-Carry Adder — Stage by Stage
            </h3>

            {/* Column headers */}
            <div className="grid grid-cols-4 gap-3 mb-2 px-2">
              {[3, 2, 1, 0].map((bit) => (
                <div key={bit} className="text-center text-xs text-slate-400 font-mono">
                  Bit {bit} (FA{bit})
                </div>
              ))}
            </div>

            {/* Full adder stages */}
            <div className="grid grid-cols-4 gap-3">
              {[...result.bits].reverse().map((stage, stageIdx) => {
                const bitPos = BITS - 1 - stageIdx;
                return (
                  <div
                    key={stageIdx}
                    className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-center space-y-2"
                  >
                    {/* Carry in */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 font-mono mb-1">Cᵢₙ</span>
                      <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
                        stage.cin === 1 ? "bg-amber-400 text-white" : "bg-slate-200 text-slate-400"
                      }`}>
                        {stage.cin}
                      </span>
                    </div>

                    {/* A and B inputs */}
                    <div className="flex gap-1 justify-center">
                      {[{ label: "A", val: stage.a }, { label: "B", val: stage.b }].map(({ label, val }) => (
                        <div key={label} className="flex flex-col items-center">
                          <span className="text-xs text-slate-400 font-mono">{label}</span>
                          <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
                            val === 1 ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-400"
                          }`}>
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* FA box */}
                    <div className="bg-white border-2 border-slate-300 rounded-lg py-2 text-xs font-bold text-slate-600">
                      Full Adder
                      <div className="text-xs text-slate-400 font-normal">9 neurons</div>
                    </div>

                    {/* Sum output */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 font-mono mb-1">Sum</span>
                      <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
                        stage.sum === 1 ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-400"
                      }`}>
                        {stage.sum}
                      </span>
                    </div>

                    {/* Carry out */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 font-mono mb-1">Cₒᵤₜ</span>
                      <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
                        stage.cout === 1 ? "bg-amber-400 text-white" : "bg-slate-200 text-slate-400"
                      }`}>
                        {stage.cout}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Carry propagation arrow */}
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-amber-600 font-mono">
              <span>Carry propagates: LSB</span>
              <span>→ → →</span>
              <span>MSB</span>
            </div>

            {/* Final result row */}
            <div className="mt-5 bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-mono mb-1">Final Result (binary)</p>
                  <div className="flex gap-1 items-center">
                    {result.carryOut === 1 && (
                      <span className="w-8 h-8 rounded bg-amber-400 flex items-center justify-center text-sm font-bold text-white">1</span>
                    )}
                    {result.resultBits.map((bit, i) => (
                      <span
                        key={i}
                        className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${
                          bit === 1 ? "bg-sky-500 text-white" : "bg-slate-600 text-slate-400"
                        }`}
                      >
                        {bit}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-mono mb-1">Decimal</p>
                  <p className="text-3xl font-bold text-white font-mono">{result.resultDecimal}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between text-xs text-slate-400 font-mono">
                <span>Total MCP neurons: {BITS} × 9 = {BITS * 9}</span>
                <span>{aDecimal} + {bDecimal} = {result.resultDecimal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
