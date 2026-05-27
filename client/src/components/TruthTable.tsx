/**
 * TruthTable.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 * Displays a truth table with the active row highlighted in teal.
 */

import type { GateDefinition } from "@/lib/mcpNeuron";

interface TruthTableProps {
  gate: GateDefinition;
  inputs: number[];
}

export default function TruthTable({ gate, inputs }: TruthTableProps) {
  const inputLabels =
    gate.inputs === 1 ? ["x₁"] : gate.inputs === 2 ? ["x₁", "x₂"] : ["x₁", "x₂", "x₃"];

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {inputLabels.map((label) => (
              <th
                key={label}
                className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                {label}
              </th>
            ))}
            <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-l border-slate-200">
              y
            </th>
          </tr>
        </thead>
        <tbody>
          {gate.truthTable.map((row, i) => {
            const isActive = row.inputs.every((v, j) => v === inputs[j]);
            return (
              <tr
                key={i}
                className={`border-b border-slate-100 last:border-0 transition-colors duration-200 ${
                  isActive ? "bg-sky-50" : "bg-white hover:bg-slate-50"
                }`}
              >
                {row.inputs.map((val, j) => (
                  <td key={j} className="px-4 py-2.5 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded font-bold text-sm transition-all duration-200 ${
                        val === 1
                          ? "bg-sky-500 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {val}
                    </span>
                  </td>
                ))}
                <td className="px-4 py-2.5 text-center border-l border-slate-200">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded font-bold text-sm transition-all duration-200 ${
                      row.output === 1
                        ? "bg-sky-500 text-white"
                        : "bg-slate-100 text-slate-400"
                    } ${isActive ? "ring-2 ring-sky-400 ring-offset-1" : ""}`}
                  >
                    {row.output}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
