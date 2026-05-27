/**
 * LogicGates.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 * Interactive logic gate explorer using McCulloch-Pitts neurons.
 */

import { useState } from "react";
import { GATE_DEFINITIONS, type GateType } from "@/lib/mcpNeuron";
import NeuronDiagram from "@/components/NeuronDiagram";
import TruthTable from "@/components/TruthTable";
import { Badge } from "@/components/ui/badge";

const GATE_ORDER: GateType[] = ["AND", "OR", "NOT", "NAND", "NOR", "XOR", "XNOR"];

const GATE_COLORS: Record<GateType, string> = {
  AND:  "bg-sky-100 text-sky-800 border-sky-200",
  OR:   "bg-emerald-100 text-emerald-800 border-emerald-200",
  NOT:  "bg-rose-100 text-rose-800 border-rose-200",
  NAND: "bg-violet-100 text-violet-800 border-violet-200",
  NOR:  "bg-amber-100 text-amber-800 border-amber-200",
  XOR:  "bg-indigo-100 text-indigo-800 border-indigo-200",
  XNOR: "bg-teal-100 text-teal-800 border-teal-200",
};

export default function LogicGates() {
  const [selectedGate, setSelectedGate] = useState<GateType>("AND");
  const [inputs, setInputs] = useState<number[]>([0, 0]);

  const gate = GATE_DEFINITIONS[selectedGate];
  const output = gate.evaluate(inputs.slice(0, gate.inputs));

  function handleGateChange(type: GateType) {
    setSelectedGate(type);
    const newGate = GATE_DEFINITIONS[type];
    setInputs(Array(newGate.inputs).fill(0));
  }

  function toggleInput(i: number) {
    setInputs((prev) => {
      const next = [...prev];
      next[i] = next[i] === 0 ? 1 : 0;
      return next;
    });
  }

  const inputLabels = gate.inputs === 1 ? ["x₁"] : ["x₁", "x₂"];

  return (
    <div className="space-y-6">
      {/* Gate selector */}
      <div className="flex flex-wrap gap-2">
        {GATE_ORDER.map((type) => (
          <button
            key={type}
            onClick={() => handleGateChange(type)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-150 ${
              selectedGate === type
                ? GATE_COLORS[type] + " shadow-sm scale-105"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Gate info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${GATE_COLORS[selectedGate]}`}>
                {gate.type}
              </span>
              <h2 className="text-lg font-bold text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {gate.name}
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{gate.description}</p>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Formula</p>
              <p className="text-sm font-mono text-slate-700">{gate.formula}</p>
            </div>
          </div>

          {/* MCP Neuron specs */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
              MCP Neuron Architecture
            </h3>
            <div className="space-y-3">
              {gate.neurons.map((n) => (
                <div key={n.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 font-mono">{n.label}</span>
                    {n.isOutput && (
                      <Badge variant="outline" className="text-xs text-sky-600 border-sky-200">Output</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs font-mono">
                    <div>
                      <span className="text-slate-400">θ (threshold):</span>{" "}
                      <span className="text-slate-700 font-semibold">{n.threshold}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Excitatory:</span>{" "}
                      <span className="text-sky-600 font-semibold">{n.excitatory.join(", ") || "—"}</span>
                    </div>
                    {n.inhibitory.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-slate-400">Inhibitory:</span>{" "}
                        <span className="text-red-500 font-semibold">{n.inhibitory.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Circuit diagram + input toggles */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Circuit Diagram</h3>
            <NeuronDiagram gate={gate} inputs={inputs} />
          </div>

          {/* Input toggles */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Input Controls</h3>
            <div className="flex gap-4 justify-center">
              {inputLabels.map((label, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-sm font-mono font-semibold text-slate-600">{label}</span>
                  <button
                    onClick={() => toggleInput(i)}
                    className={`w-16 h-16 rounded-xl text-2xl font-bold border-2 transition-all duration-200 active:scale-95 shadow-sm ${
                      inputs[i] === 1
                        ? "bg-sky-500 border-sky-400 text-white shadow-sky-200"
                        : "bg-slate-100 border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {inputs[i]}
                  </button>
                  <span className="text-xs text-slate-400">{inputs[i] === 1 ? "HIGH" : "LOW"}</span>
                </div>
              ))}

              {/* Output display */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-mono font-semibold text-slate-600">y (out)</span>
                <div
                  className={`w-16 h-16 rounded-xl text-2xl font-bold border-2 flex items-center justify-center transition-all duration-200 ${
                    output === 1
                      ? "bg-sky-500 border-sky-400 text-white shadow-md shadow-sky-200"
                      : "bg-slate-100 border-slate-200 text-slate-400"
                  }`}
                >
                  {output}
                </div>
                <span className="text-xs text-slate-400">{output === 1 ? "HIGH" : "LOW"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Truth table */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Truth Table</h3>
            <TruthTable gate={gate} inputs={inputs.slice(0, gate.inputs)} />
            <p className="text-xs text-slate-400 mt-3 text-center">
              Highlighted row = current input state
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
