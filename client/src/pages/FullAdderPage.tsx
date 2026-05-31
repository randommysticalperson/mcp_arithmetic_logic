/**
 * FullAdderPage.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 * Interactive Full Adder demo using McCulloch-Pitts neurons.
 */

import { useState } from "react";
import { fullAdder } from "@/lib/mcpNeuron";
import FullAdderDiagram from "@/components/FullAdderDiagram";
import { useSignalAnimation } from "@/hooks/useSignalAnimation";

export default function FullAdderPage() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [cin, setCin] = useState(0);

  const result = fullAdder(a, b, cin);
  const animKey = useSignalAnimation([a, b, cin]);
  // Extract intermediate values
  const xor1 = (a !== b) ? 1 : 0;
  const and1 = a === 1 && b === 1 ? 1 : 0;
  const and2 = xor1 === 1 && cin === 1 ? 1 : 0;

  const truthTable = [
    { a: 0, b: 0, cin: 0, sum: 0, cout: 0 },
    { a: 0, b: 0, cin: 1, sum: 1, cout: 0 },
    { a: 0, b: 1, cin: 0, sum: 1, cout: 0 },
    { a: 0, b: 1, cin: 1, sum: 0, cout: 1 },
    { a: 1, b: 0, cin: 0, sum: 1, cout: 0 },
    { a: 1, b: 0, cin: 1, sum: 0, cout: 1 },
    { a: 1, b: 1, cin: 0, sum: 0, cout: 1 },
    { a: 1, b: 1, cin: 1, sum: 1, cout: 1 },
  ];

  const controls = [
    { key: "a" as const, label: "A", val: a, set: setA },
    { key: "b" as const, label: "B", val: b, set: setB },
    { key: "cin" as const, label: "Cᵢₙ", val: cin, set: setCin, isCarry: true },
  ];

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Full Adder
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
          A full adder adds three binary digits: A, B, and a carry-in (Cᵢₙ). It is built from{" "}
          <strong>two half-adders and an OR gate</strong>, totalling{" "}
          <strong>9 McCulloch-Pitts neurons</strong>. The full adder is the fundamental building block
          for multi-bit binary addition.
        </p>
        <div className="mt-4 flex gap-3 flex-wrap text-sm font-mono">
          <div className="bg-sky-50 border border-sky-100 rounded-lg px-3 py-1.5">
            <span className="text-slate-400">Sum = </span>
            <span className="text-sky-700 font-semibold">(A XOR B) XOR Cᵢₙ</span>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
            <span className="text-slate-400">Cₒᵤₜ = </span>
            <span className="text-amber-700 font-semibold">(A AND B) OR ((A XOR B) AND Cᵢₙ)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls + results */}
        <div className="space-y-4">
          {/* Input toggles */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Input Controls</h3>
            <div className="flex gap-3 justify-center flex-wrap">
              {controls.map(({ label, val, set, isCarry }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <span className="text-sm font-mono font-semibold text-slate-600">{label}</span>
                  <button
                    onClick={() => set((v) => (v === 0 ? 1 : 0))}
                    className={`w-14 h-14 rounded-xl text-xl font-bold border-2 transition-all duration-200 active:scale-95 shadow-sm ${
                      val === 1
                        ? isCarry
                          ? "bg-amber-400 border-amber-300 text-white shadow-amber-200"
                          : "bg-sky-500 border-sky-400 text-white shadow-sky-200"
                        : "bg-slate-100 border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {val}
                  </button>
                  <span className="text-xs text-slate-400">{val === 1 ? "HIGH" : "LOW"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Computation steps */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Computation Steps</h3>
            <div className="space-y-2">
              {result.steps.map((step) => (
                <div key={step.label} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-xs font-mono text-slate-500">{step.label}</span>
                  <span
                    className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                      step.value === 1
                        ? step.label.includes("Cₒᵤₜ") || step.label.includes("Cᵢₙ")
                          ? "bg-amber-400 text-white"
                          : "bg-sky-500 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {step.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 mb-1">Binary result</p>
              <p className="text-2xl font-mono font-bold text-slate-800">
                {a} + {b} + {cin} ={" "}
                <span className="text-amber-500">{result.carryOut}</span>
                <span className="text-sky-500">{result.sum}</span>
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {a} + {b} + {cin} = {a + b + cin} (decimal)
              </p>
            </div>
          </div>

          {/* Truth table */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Truth Table</h3>
            <div className="overflow-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["A", "B", "Cᵢₙ", "Sum", "Cₒᵤₜ"].map((h) => (
                      <th key={h} className="px-2 py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {truthTable.map((row, i) => {
                    const active = row.a === a && row.b === b && row.cin === cin;
                    return (
                      <tr key={i} className={`border-b border-slate-100 last:border-0 transition-colors duration-200 ${active ? "bg-sky-50" : "hover:bg-slate-50"}`}>
                        {[row.a, row.b, row.cin, row.sum, row.cout].map((val, j) => (
                          <td key={j} className="px-2 py-1.5 text-center">
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold transition-all duration-200 ${
                              val === 1
                                ? j === 2 || j === 4 ? "bg-amber-400 text-white" : "bg-sky-500 text-white"
                                : "bg-slate-100 text-slate-400"
                            } ${active ? "ring-1 ring-sky-300 ring-offset-1" : ""}`}>
                              {val}
                            </span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Circuit diagram */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Circuit Diagram</h3>
            <FullAdderDiagram
              a={a} b={b} cin={cin}
              xor1={xor1} and1={and1}
              sum={result.sum} and2={and2}
              carryOut={result.carryOut}
              animKey={animKey}
            />
            <div className="mt-4 flex gap-4 justify-center text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-400 inline-block" /> HIGH / Sum
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" /> LOW
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Carry
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
