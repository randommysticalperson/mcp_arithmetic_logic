/**
 * ALUPage.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 *
 * 8-bit ALU with 3-bit opcode selector.
 * Operations: ADD, SUB, AND, OR, XOR, NOT, SHL, SHR
 * Each operation is explained in terms of MCP neurons used.
 */

import { useState, useMemo } from "react";

const BITS = 8;

type OpCode = "ADD" | "SUB" | "AND" | "OR" | "XOR" | "NOT" | "SHL" | "SHR";

interface OpDef {
  code: OpCode;
  opcode: string; // 3-bit binary
  label: string;
  symbol: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  neurons: number;
  usesB: boolean;
  description: string;
  formula: string;
}

const OPS: OpDef[] = [
  {
    code: "ADD", opcode: "000", label: "ADD", symbol: "+",
    color: "sky", bgColor: "bg-sky-500", borderColor: "border-sky-400", textColor: "text-sky-700",
    neurons: 72, usesB: true,
    description: "8-bit ripple-carry addition. Each bit position uses a Full Adder (9 neurons). Carry-out of each stage feeds the next.",
    formula: "A + B",
  },
  {
    code: "SUB", opcode: "001", label: "SUB", symbol: "−",
    color: "violet", bgColor: "bg-violet-500", borderColor: "border-violet-400", textColor: "text-violet-700",
    neurons: 80, usesB: true,
    description: "Two's complement subtraction: invert B (8 NOT neurons) + Cin=1 on LSB, then add. Uses same adder as ADD plus 8 NOT neurons.",
    formula: "A + ¬B + 1",
  },
  {
    code: "AND", opcode: "010", label: "AND", symbol: "∧",
    color: "emerald", bgColor: "bg-emerald-500", borderColor: "border-emerald-400", textColor: "text-emerald-700",
    neurons: 8, usesB: true,
    description: "Bitwise AND: 8 independent AND neurons (θ=2), one per bit position. Each fires only when both Aᵢ and Bᵢ are 1.",
    formula: "A AND B",
  },
  {
    code: "OR", opcode: "011", label: "OR", symbol: "∨",
    color: "orange", bgColor: "bg-orange-500", borderColor: "border-orange-400", textColor: "text-orange-700",
    neurons: 8, usesB: true,
    description: "Bitwise OR: 8 independent OR neurons (θ=1), one per bit position. Each fires when at least one of Aᵢ or Bᵢ is 1.",
    formula: "A OR B",
  },
  {
    code: "XOR", opcode: "100", label: "XOR", symbol: "⊕",
    color: "pink", bgColor: "bg-pink-500", borderColor: "border-pink-400", textColor: "text-pink-700",
    neurons: 24, usesB: true,
    description: "Bitwise XOR: each bit uses 3 MCP neurons (NAND + OR + AND). 8 × 3 = 24 neurons total.",
    formula: "A XOR B",
  },
  {
    code: "NOT", opcode: "101", label: "NOT", symbol: "¬",
    color: "amber", bgColor: "bg-amber-500", borderColor: "border-amber-400", textColor: "text-amber-700",
    neurons: 8, usesB: false,
    description: "Bitwise NOT: 8 inhibitory NOT neurons (θ=0, inhibitory input). Each fires only when its input is 0.",
    formula: "¬A",
  },
  {
    code: "SHL", opcode: "110", label: "SHL", symbol: "≪",
    color: "teal", bgColor: "bg-teal-500", borderColor: "border-teal-400", textColor: "text-teal-700",
    neurons: 8, usesB: false,
    description: "Logical shift left by 1: bit i of output = bit i−1 of input. Implemented by routing each input neuron to the next higher position. LSB is filled with 0.",
    formula: "A << 1",
  },
  {
    code: "SHR", opcode: "111", label: "SHR", symbol: "≫",
    color: "cyan", bgColor: "bg-cyan-500", borderColor: "border-cyan-400", textColor: "text-cyan-700",
    neurons: 8, usesB: false,
    description: "Logical shift right by 1: bit i of output = bit i+1 of input. MSB is filled with 0. Implemented by routing each neuron to the next lower position.",
    formula: "A >> 1",
  },
];

function toBits(n: number, len: number): number[] {
  return Array.from({ length: len }, (_, i) => (n >> (len - 1 - i)) & 1);
}

function bitsToNum(bits: number[]): number {
  return bits.reduce((acc, b) => (acc << 1) | b, 0);
}

function computeALU(op: OpCode, aBits: number[], bBits: number[]): number[] {
  const a = bitsToNum(aBits);
  const b = bitsToNum(bBits);
  let result = 0;
  switch (op) {
    case "ADD": result = (a + b) & 0xFF; break;
    case "SUB": result = ((a - b) + 256) & 0xFF; break;
    case "AND": result = a & b; break;
    case "OR":  result = a | b; break;
    case "XOR": result = a ^ b; break;
    case "NOT": result = (~a) & 0xFF; break;
    case "SHL": result = (a << 1) & 0xFF; break;
    case "SHR": result = (a >> 1) & 0xFF; break;
  }
  return toBits(result, BITS);
}

function toHex(bits: number[]): string {
  return "0x" + bitsToNum(bits).toString(16).toUpperCase().padStart(2, "0");
}

export default function ALUPage() {
  const [aBits, setABits] = useState<number[]>([0, 1, 0, 1, 0, 1, 1, 0]); // 86
  const [bBits, setBBits] = useState<number[]>([0, 0, 1, 1, 0, 0, 1, 0]); // 50
  const [selectedOp, setSelectedOp] = useState<OpCode>("ADD");

  const op = OPS.find((o) => o.code === selectedOp)!;
  const resultBits = useMemo(() => computeALU(selectedOp, aBits, bBits), [selectedOp, aBits, bBits]);

  const aDecimal = bitsToNum(aBits);
  const bDecimal = bitsToNum(bBits);
  const resultDecimal = bitsToNum(resultBits);

  function toggleBit(which: "a" | "b", idx: number) {
    const setter = which === "a" ? setABits : setBBits;
    setter((prev) => { const n = [...prev]; n[idx] ^= 1; return n; });
  }

  function setDecimal(which: "a" | "b", val: number) {
    const clamped = Math.max(0, Math.min(255, val));
    if (which === "a") setABits(toBits(clamped, BITS));
    else setBBits(toBits(clamped, BITS));
  }

  // Per-bit operation result for visualization
  const perBitResults = useMemo(() => {
    return aBits.map((aBit, i) => {
      const bBit = bBits[i];
      const rBit = resultBits[i];
      return { aBit, bBit, rBit };
    });
  }, [aBits, bBits, resultBits]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          8-Bit ALU
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
          An Arithmetic Logic Unit (ALU) performs arithmetic and logical operations selected by a <strong>3-bit opcode</strong>.
          This ALU supports 8 operations, each implemented entirely with McCulloch-Pitts neurons.
          Select an operation below to see the opcode, neuron count, and per-bit computation.
        </p>
      </div>

      {/* Opcode selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Operation Select (3-bit Opcode)</h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {OPS.map((o) => (
            <button
              key={o.code}
              onClick={() => setSelectedOp(o.code)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 active:scale-95 ${
                selectedOp === o.code
                  ? `${o.bgColor} ${o.borderColor} text-white shadow-md`
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="text-lg font-bold">{o.symbol}</span>
              <span className="text-xs font-bold">{o.label}</span>
              <span className={`text-xs font-mono ${selectedOp === o.code ? "text-white/70" : "text-slate-400"}`}>{o.opcode}</span>
            </button>
          ))}
        </div>

        {/* Selected op info */}
        <div className={`mt-4 rounded-xl border p-4 bg-${op.color}-50 border-${op.color}-200`}
          style={{ backgroundColor: `var(--${op.color}-50, #f8fafc)`, borderColor: `var(--${op.color}-200, #e2e8f0)` }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-2xl font-bold ${op.textColor}`}>{op.symbol} {op.label}</span>
                <span className="font-mono text-xs bg-slate-800 text-slate-100 px-2 py-0.5 rounded">opcode: {op.opcode}</span>
                <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{op.neurons} MCP neurons</span>
              </div>
              <p className="text-sm text-slate-600 max-w-xl">{op.description}</p>
            </div>
            <div className="font-mono text-sm bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-700">
              {op.formula}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {(["a", "b"] as const).filter((w) => w === "a" || op.usesB).map((which) => {
            const bits = which === "a" ? aBits : bBits;
            const dec = which === "a" ? aDecimal : bDecimal;
            return (
              <div key={which} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Operand {which.toUpperCase()}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">{toHex(bits)}</span>
                    <input
                      type="number" min={0} max={255} value={dec}
                      onChange={(e) => setDecimal(which, parseInt(e.target.value) || 0)}
                      className="w-16 text-center text-sm font-mono border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                  </div>
                </div>
                <div className="flex gap-1.5 justify-center flex-wrap">
                  {bits.map((bit, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-xs text-slate-400 font-mono">b{BITS - 1 - i}</span>
                      <button
                        onClick={() => toggleBit(which, i)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold border-2 transition-all duration-200 active:scale-95 ${
                          bit === 1
                            ? "bg-sky-500 border-sky-400 text-white"
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
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Result</h3>
            <div className="text-center space-y-2">
              <p className="font-mono text-sm text-slate-500">
                {op.usesB ? `${aDecimal} ${op.symbol} ${bDecimal}` : `${op.symbol} ${aDecimal}`}
              </p>
              <p className="text-3xl font-bold font-mono text-slate-800">{resultDecimal}</p>
              <p className="text-sm font-mono text-slate-400">{toHex(resultBits)}</p>
              <div className="flex gap-1 justify-center mt-2">
                {resultBits.map((bit, i) => (
                  <span key={i} className={`w-8 h-8 rounded text-xs font-bold flex items-center justify-center ${
                    bit === 1 ? `${op.bgColor} text-white` : "bg-slate-100 text-slate-400"
                  }`}>
                    {bit}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Per-bit visualization */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              Per-Bit MCP Neuron Computation
            </h3>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {perBitResults.map(({ aBit, bBit, rBit }, i) => {
                const bitPos = BITS - 1 - i;
                return (
                  <div key={i} className="bg-slate-50 rounded-xl border border-slate-200 p-2 text-center space-y-1.5">
                    <div className="text-xs text-slate-400 font-mono font-bold">b{bitPos}</div>

                    {/* Input A */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 font-mono">A</span>
                      <span className={`w-7 h-7 rounded text-xs font-bold flex items-center justify-center ${
                        aBit === 1 ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-400"
                      }`}>{aBit}</span>
                    </div>

                    {/* Input B (if used) */}
                    {op.usesB && (
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-400 font-mono">B</span>
                        <span className={`w-7 h-7 rounded text-xs font-bold flex items-center justify-center ${
                          bBit === 1 ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-400"
                        }`}>{bBit}</span>
                      </div>
                    )}

                    {/* Neuron box */}
                    <div className={`rounded-lg py-1 text-xs font-bold border ${op.bgColor} text-white border-transparent`}>
                      {op.label}
                    </div>

                    {/* Result */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 font-mono">Out</span>
                      <span className={`w-7 h-7 rounded text-xs font-bold flex items-center justify-center transition-all duration-200 ${
                        rBit === 1 ? `${op.bgColor} text-white` : "bg-slate-200 text-slate-400"
                      }`}>{rBit}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Operation summary bar */}
            <div className="mt-5 bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs text-slate-400 font-mono mb-1">ALU Output (binary)</p>
                  <div className="flex gap-1">
                    {resultBits.map((bit, i) => (
                      <span key={i} className={`w-8 h-8 rounded text-sm font-bold flex items-center justify-center ${
                        bit === 1 ? `${op.bgColor} text-white` : "bg-slate-600 text-slate-400"
                      }`}>{bit}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-mono mb-1">Decimal / Hex</p>
                  <p className="text-2xl font-bold text-white font-mono">{resultDecimal}</p>
                  <p className="text-sm text-slate-400 font-mono">{toHex(resultBits)}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between text-xs text-slate-400 font-mono flex-wrap gap-2">
                <span>Opcode: {op.opcode} ({op.label}) · {op.neurons} MCP neurons</span>
                <span>
                  {op.usesB
                    ? `${aDecimal} ${op.symbol} ${bDecimal} = ${resultDecimal}`
                    : `${op.symbol}${aDecimal} = ${resultDecimal}`}
                </span>
              </div>
            </div>

            {/* Neuron count comparison */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Neuron Count by Operation</h4>
              <div className="space-y-1.5">
                {OPS.map((o) => (
                  <div key={o.code} className="flex items-center gap-2">
                    <span className={`text-xs font-mono w-8 text-right ${o.code === selectedOp ? o.textColor + " font-bold" : "text-slate-400"}`}>
                      {o.label}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${o.bgColor}`}
                        style={{ width: `${(o.neurons / 80) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono w-8 ${o.code === selectedOp ? o.textColor + " font-bold" : "text-slate-400"}`}>
                      {o.neurons}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
