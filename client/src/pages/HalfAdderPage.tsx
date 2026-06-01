/**
 * HalfAdderPage.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 * Interactive Half Adder demo using McCulloch-Pitts neurons.
 * Includes step-through mode for pedagogical evaluation.
 */

import { useState, useMemo } from "react";
import { halfAdder } from "@/lib/mcpNeuron";
import HalfAdderDiagram from "@/components/HalfAdderDiagram";
import { useSignalAnimation } from "@/hooks/useSignalAnimation";
import StepThrough, { type Step } from "@/components/StepThrough";

export default function HalfAdderPage() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const result = halfAdder(a, b);
  const animKey = useSignalAnimation([a, b]);

  function toggle(which: "a" | "b") {
    if (which === "a") setA((v) => (v === 0 ? 1 : 0));
    else setB((v) => (v === 0 ? 1 : 0));
    setStepIdx(0);
  }

  const nandOut = a === 1 && b === 1 ? 0 : 1;
  const orOut   = a === 1 || b === 1 ? 1 : 0;

  const steps: Step[] = useMemo(() => [
    {
      id: "inputs",
      label: "Apply Inputs",
      description: `Set input A = ${a} and B = ${b}. These binary signals are fed simultaneously into both the XOR sub-circuit (NAND + OR → AND) and the Carry AND neuron.`,
      highlight: ["input-a", "input-b"],
      values: { A: a, B: b } as Record<string, number>,
    },
    {
      id: "nand",
      label: "NAND Neuron Fires",
      description: `The NAND neuron receives A=${a} and B=${b}. Its threshold θ=1 with inhibitory logic: it outputs 1 unless both inputs are 1. Result: NAND = ${nandOut}.`,
      highlight: ["nand-neuron"],
      values: { A: a, B: b, NAND: nandOut } as Record<string, number>,
    },
    {
      id: "or",
      label: "OR Neuron Fires",
      description: `The OR neuron (θ=1) fires if at least one input is 1. A=${a}, B=${b} → OR = ${orOut}.`,
      highlight: ["or-neuron"],
      values: { A: a, B: b, OR: orOut } as Record<string, number>,
    },
    {
      id: "xor",
      label: "XOR AND Neuron → Sum",
      description: `The final AND neuron (θ=2) in the XOR sub-circuit receives NAND=${nandOut} and OR=${orOut}. It fires only when both are 1. Sum = ${result.sum}.`,
      highlight: ["xor-and-neuron"],
      values: { NAND: nandOut, OR: orOut, Sum: result.sum } as Record<string, number>,
    },
    {
      id: "carry",
      label: "Carry AND Neuron",
      description: `The Carry AND neuron (θ=2) receives A=${a} and B=${b} directly. It fires only when both are 1. Carry = ${result.carry}.`,
      highlight: ["carry-neuron"],
      values: { A: a, B: b, Carry: result.carry } as Record<string, number>,
    },
    {
      id: "result",
      label: "Final Result",
      description: `Half adder complete. ${a} + ${b} = ${result.carry}${result.sum} (binary) = ${a + b} (decimal). Sum = ${result.sum}, Carry = ${result.carry}.`,
      highlight: ["sum-output", "carry-output"],
      values: { Sum: result.sum, Carry: result.carry } as Record<string, number>,
    },
  ], [a, b, nandOut, orOut, result.sum, result.carry]);

  const truthTable = [
    { a: 0, b: 0, sum: 0, carry: 0 },
    { a: 0, b: 1, sum: 1, carry: 0 },
    { a: 1, b: 0, sum: 1, carry: 0 },
    { a: 1, b: 1, sum: 0, carry: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Half Adder
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
          A half adder adds two single binary digits A and B. It produces two outputs: a{" "}
          <span className="font-semibold text-sky-600">Sum</span> (implemented via XOR — 3 MCP neurons) and a{" "}
          <span className="font-semibold text-amber-600">Carry</span> (implemented via AND — 1 MCP neuron).
          In total, the half adder uses <strong>4 McCulloch-Pitts neurons</strong>.
        </p>
        <div className="mt-4 flex gap-4 flex-wrap">
          <div className="bg-sky-50 border border-sky-100 rounded-lg px-4 py-2 text-sm font-mono">
            <span className="text-slate-400">Sum = </span>
            <span className="text-sky-700 font-semibold">A XOR B</span>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-2 text-sm font-mono">
            <span className="text-slate-400">Carry = </span>
            <span className="text-amber-700 font-semibold">A AND B</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Input Controls</h3>
            <div className="flex gap-4 justify-center">
              {(["a", "b"] as const).map((key) => {
                const val = key === "a" ? a : b;
                return (
                  <div key={key} className="flex flex-col items-center gap-2">
                    <span className="text-sm font-mono font-semibold text-slate-600 uppercase">{key}</span>
                    <button
                      onClick={() => toggle(key)}
                      className={`w-16 h-16 rounded-xl text-2xl font-bold border-2 transition-all duration-200 active:scale-95 shadow-sm ${
                        val === 1
                          ? "bg-sky-500 border-sky-400 text-white shadow-sky-200"
                          : "bg-slate-100 border-slate-200 text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      {val}
                    </button>
                    <span className="text-xs text-slate-400">{val === 1 ? "HIGH" : "LOW"}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Result */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Result</h3>
            <div className="space-y-3">
              {result.steps.map((step) => (
                <div key={step.label} className="flex items-center justify-between">
                  <span className="text-sm font-mono text-slate-600">{step.label}</span>
                  <span
                    className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                      step.value === 1
                        ? step.label.includes("Carry")
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
            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 mb-1">Binary result</p>
              <p className="text-2xl font-mono font-bold text-slate-800">
                {a} + {b} ={" "}
                <span className="text-amber-500">{result.carry}</span>
                <span className="text-sky-500">{result.sum}</span>
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {a} + {b} = {a + b} (decimal)
              </p>
            </div>
          </div>

          {/* Truth table */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Truth Table</h3>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["A", "B", "Sum", "Carry"].map((h) => (
                      <th key={h} className="px-3 py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {truthTable.map((row, i) => {
                    const active = row.a === a && row.b === b;
                    return (
                      <tr key={i} className={`border-b border-slate-100 last:border-0 transition-colors duration-200 ${active ? "bg-sky-50" : "hover:bg-slate-50"}`}>
                        {[row.a, row.b, row.sum, row.carry].map((val, j) => (
                          <td key={j} className="px-3 py-2 text-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${
                              val === 1
                                ? j >= 2
                                  ? j === 3 ? "bg-amber-400 text-white" : "bg-sky-500 text-white"
                                  : "bg-sky-500 text-white"
                                : "bg-slate-100 text-slate-400"
                            } ${active ? "ring-2 ring-sky-300 ring-offset-1" : ""}`}>
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

        {/* Circuit diagram + step-through */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Circuit Diagram</h3>
            <HalfAdderDiagram a={a} b={b} sum={result.sum} carry={result.carry} animKey={animKey} />
            <div className="mt-4 flex gap-4 justify-center text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-400 inline-block" /> HIGH signal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" /> LOW signal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Carry signal
              </span>
            </div>
          </div>

          {/* Step-through */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
              Step-Through Evaluation
            </h3>
            <StepThrough
              steps={steps}
              currentStep={stepIdx}
              onStepChange={setStepIdx}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
