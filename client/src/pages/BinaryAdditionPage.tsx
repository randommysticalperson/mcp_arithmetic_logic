/**
 * BinaryAdditionPage.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 * Multi-bit binary addition AND subtraction using cascaded full adders.
 * Subtraction uses two's complement: invert B bits + Cᵢₙ = 1.
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

function invertBits(bits: number[]): number[] {
  return bits.map((b) => b === 0 ? 1 : 0);
}

export default function BinaryAdditionPage() {
  const [aBits, setABits] = useState<number[]>([0, 1, 0, 1]); // 5
  const [bBits, setBBits] = useState<number[]>([0, 0, 1, 1]); // 3
  const [mode, setMode] = useState<"add" | "sub">("add");

  // In subtraction mode: feed inverted B bits + Cin=1 (two's complement)
  const effectiveBBits = mode === "sub" ? invertBits(bBits) : bBits;
  const forcedCin = mode === "sub" ? 1 : 0;

  const result = useMemo(
    () => binaryAddition(aBits, effectiveBBits, forcedCin),
    [aBits, effectiveBBits, forcedCin]
  );

  function toggleBit(which: "a" | "b", idx: number) {
    const setter = which === "a" ? setABits : setBBits;
    setter((prev) => {
      const next = [...prev];
      next[idx] ^= 1;
      return next;
    });
  }

  function setDecimal(which: "a" | "b", val: number) {
    const clamped = Math.max(0, Math.min(15, val));
    const bits = toBits(clamped, BITS);
    if (which === "a") setABits(bits);
    else setBBits(bits);
  }

  const aDecimal = bitsToNum(aBits);
  const bDecimal = bitsToNum(bBits);

  // For subtraction: interpret result as signed 4-bit two's complement
  const rawResult = result.resultDecimal;
  const signedResult = mode === "sub"
    ? (result.carryOut === 1 ? aDecimal - bDecimal : aDecimal - bDecimal) // carry=1 means no borrow
    : rawResult;
  const isNegative = mode === "sub" && aDecimal < bDecimal;
  const displayResult = mode === "sub" ? aDecimal - bDecimal : rawResult;

  return (
    <div className="space-y-6">
      {/* Header + mode toggle */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              4-Bit Binary {mode === "add" ? "Addition" : "Subtraction"}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              {mode === "add" ? (
                <>A 4-bit ripple-carry adder chains four full adders. Each uses <strong>9 MCP neurons</strong>, totalling <strong>36 neurons</strong>. Carry-out of each stage feeds into the next carry-in.</>
              ) : (
                <>Subtraction uses <strong>two's complement</strong>: invert all B bits (8 NOT neurons) and set Cᵢₙ = 1 on the LSB full adder. The same 36-neuron adder then computes A + (¬B + 1) = A − B.</>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("add")}
              className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all duration-200 ${
                mode === "add"
                  ? "bg-sky-500 border-sky-500 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              + Addition
            </button>
            <button
              onClick={() => setMode("sub")}
              className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all duration-200 ${
                mode === "sub"
                  ? "bg-violet-500 border-violet-500 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              − Subtraction
            </button>
          </div>
        </div>

        {/* Two's complement explanation banner */}
        {mode === "sub" && (
          <div className="mt-4 bg-violet-50 border border-violet-200 rounded-xl p-4">
            <h3 className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-2">Two's Complement Method</h3>
            <div className="flex flex-wrap gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">B =</span>
                <span className="font-bold text-slate-700">{bBits.join("")}</span>
                <span className="text-slate-400">({bDecimal})</span>
              </div>
              <div className="text-violet-400">→</div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">¬B =</span>
                <span className="font-bold text-violet-700">{effectiveBBits.join("")}</span>
                <span className="text-slate-400">(invert all bits)</span>
              </div>
              <div className="text-violet-400">→</div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">¬B + 1 =</span>
                <span className="font-bold text-violet-700">Cᵢₙ = 1 on LSB</span>
              </div>
              <div className="text-violet-400">→</div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">A + (¬B + 1) =</span>
                <span className="font-bold text-violet-700">A − B</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Input panel */}
        <div className="xl:col-span-2 space-y-4">
          {(["a", "b"] as const).map((which) => {
            const bits = which === "a" ? aBits : bBits;
            const dec = which === "a" ? aDecimal : bDecimal;
            const effectiveBits = which === "b" ? effectiveBBits : bits;
            const isB = which === "b";
            return (
              <div key={which} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Input {which.toUpperCase()} — {dec}
                    {isB && mode === "sub" && <span className="ml-2 text-violet-500">(¬B = {bitsToNum(effectiveBBits)})</span>}
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
                            ? "bg-sky-500 border-sky-400 text-white shadow-sm shadow-sky-200"
                            : "bg-slate-100 border-slate-200 text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        {bit}
                      </button>
                      {/* Show inverted bit for B in sub mode */}
                      {isB && mode === "sub" && (
                        <span className={`w-8 h-6 rounded text-xs font-bold flex items-center justify-center ${
                          effectiveBits[i] === 1 ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-400"
                        }`}>
                          {effectiveBits[i]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {isB && mode === "sub" && (
                  <p className="text-xs text-violet-500 text-center mt-2 font-mono">
                    ↑ inverted bits fed into adder
                  </p>
                )}
              </div>
            );
          })}

          {/* Result summary */}
          <div className={`bg-white rounded-xl border p-5 shadow-sm ${isNegative ? "border-rose-200" : "border-slate-200"}`}>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Result</h3>
            <div className="text-center space-y-3">
              <div className="font-mono text-lg">
                <span className="text-slate-500">{aBits.join("")}</span>
                <span className="text-slate-400 mx-2 text-sm">({aDecimal})</span>
              </div>
              <div className="font-mono text-lg">
                <span className="text-slate-400 mr-1">{mode === "add" ? "+" : "−"}</span>
                <span className="text-slate-500">{bBits.join("")}</span>
                <span className="text-slate-400 mx-2 text-sm">({bDecimal})</span>
              </div>
              {mode === "sub" && (
                <div className="text-xs text-violet-500 font-mono bg-violet-50 rounded-lg py-1.5">
                  adder sees: {aBits.join("")} + {effectiveBBits.join("")} + Cᵢₙ=1
                </div>
              )}
              <div className="border-t border-slate-200 pt-3">
                <div className="font-mono text-xl font-bold">
                  {mode === "add" && result.carryOut === 1 && (
                    <span className="text-amber-500">1</span>
                  )}
                  <span className={mode === "sub" ? (isNegative ? "text-rose-500" : "text-violet-600") : "text-sky-600"}>
                    {result.resultBits.join("")}
                  </span>
                  <span className="text-slate-400 mx-2 text-sm">({displayResult})</span>
                </div>
                {mode === "add" && result.carryOut === 1 && (
                  <p className="text-xs text-amber-600 mt-1">⚠ Carry overflow!</p>
                )}
                {mode === "sub" && isNegative && (
                  <p className="text-xs text-rose-500 mt-1">⚠ Result is negative (borrow occurred)</p>
                )}
              </div>
              <div className="text-2xl font-bold text-slate-800 font-mono pt-1">
                {aDecimal} {mode === "add" ? "+" : "−"} {bDecimal} = {displayResult}
              </div>
            </div>
          </div>
        </div>

        {/* Ripple carry adder visualization */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-5">
              Ripple-Carry {mode === "add" ? "Adder" : "Subtractor"} — Stage by Stage
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
                const isLSB = bitPos === 0;
                return (
                  <div
                    key={stageIdx}
                    className={`rounded-xl border p-3 text-center space-y-2 ${
                      mode === "sub" ? "bg-violet-50 border-violet-200" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    {/* Carry in */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 font-mono mb-1">Cᵢₙ</span>
                      <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
                        stage.cin === 1 ? "bg-amber-400 text-white" : "bg-slate-200 text-slate-400"
                      }`}>
                        {stage.cin}
                      </span>
                      {mode === "sub" && isLSB && (
                        <span className="text-xs text-violet-500 font-mono mt-0.5">forced</span>
                      )}
                    </div>

                    {/* A and B inputs */}
                    <div className="flex gap-1 justify-center">
                      {[
                        { label: "A", val: stage.a },
                        { label: mode === "sub" ? "¬B" : "B", val: stage.b },
                      ].map(({ label, val }) => (
                        <div key={label} className="flex flex-col items-center">
                          <span className={`text-xs font-mono ${label.startsWith("¬") ? "text-violet-500" : "text-slate-400"}`}>{label}</span>
                          <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
                            val === 1
                              ? label.startsWith("¬") ? "bg-violet-500 text-white" : "bg-sky-500 text-white"
                              : "bg-slate-200 text-slate-400"
                          }`}>
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* FA box */}
                    <div className={`border-2 rounded-lg py-2 text-xs font-bold ${
                      mode === "sub" ? "bg-white border-violet-300 text-violet-700" : "bg-white border-slate-300 text-slate-600"
                    }`}>
                      Full Adder
                      <div className="text-xs font-normal opacity-60">9 neurons</div>
                    </div>

                    {/* Sum output */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 font-mono mb-1">Sum</span>
                      <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
                        stage.sum === 1
                          ? mode === "sub" ? "bg-violet-500 text-white" : "bg-sky-500 text-white"
                          : "bg-slate-200 text-slate-400"
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

            {/* Carry propagation */}
            <div className="mt-3 flex items-center justify-center gap-1 text-xs font-mono">
              <span className={mode === "sub" ? "text-violet-500" : "text-amber-600"}>
                {mode === "sub" ? "Borrow" : "Carry"} propagates: LSB → → → MSB
              </span>
            </div>

            {/* Final result row */}
            <div className={`mt-5 rounded-xl p-4 ${isNegative ? "bg-rose-900" : "bg-slate-800"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-mono mb-1">
                    Final Result (binary) {mode === "sub" && "— two's complement"}
                  </p>
                  <div className="flex gap-1 items-center">
                    {mode === "add" && result.carryOut === 1 && (
                      <span className="w-8 h-8 rounded bg-amber-400 flex items-center justify-center text-sm font-bold text-white">1</span>
                    )}
                    {result.resultBits.map((bit, i) => (
                      <span
                        key={i}
                        className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${
                          bit === 1
                            ? mode === "sub" ? "bg-violet-500 text-white" : "bg-sky-500 text-white"
                            : "bg-slate-600 text-slate-400"
                        }`}
                      >
                        {bit}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-mono mb-1">Decimal</p>
                  <p className={`text-3xl font-bold font-mono ${isNegative ? "text-rose-300" : "text-white"}`}>
                    {displayResult}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between text-xs text-slate-400 font-mono flex-wrap gap-2">
                <span>
                  Total MCP neurons: {BITS} × 9{mode === "sub" ? " + 8 NOT" : ""} = {BITS * 9 + (mode === "sub" ? 8 : 0)}
                </span>
                <span>
                  {aDecimal} {mode === "add" ? "+" : "−"} {bDecimal} = {displayResult}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
