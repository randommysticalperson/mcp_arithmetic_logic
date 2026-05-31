/**
 * NeuronDiagram.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 * Renders an SVG circuit diagram for a McCulloch-Pitts gate.
 * Teal (#0EA5E9) = signal HIGH, slate (#CBD5E1) = signal LOW
 * Animated signal dots travel along wires when inputs change.
 */

import { useEffect, useState } from "react";
import type { GateDefinition } from "@/lib/mcpNeuron";
import AnimatedWire from "./AnimatedWire";

interface NeuronDiagramProps {
  gate: GateDefinition;
  inputs: number[];
  className?: string;
}

const HIGH_COLOR = "#0EA5E9";
const LOW_COLOR = "#CBD5E1";
const NEURON_FILL_ACTIVE = "#E0F2FE";
const NEURON_FILL_INACTIVE = "#F8FAFC";
const INHIBITORY_COLOR = "#EF4444";

function signalColor(val: number) {
  return val === 1 ? HIGH_COLOR : LOW_COLOR;
}

function useAnimKey(deps: unknown[]) {
  const [key, setKey] = useState(0);
  const [prev, setPrev] = useState<string>("");
  const cur = JSON.stringify(deps);
  if (cur !== prev) {
    setPrev(cur);
    // Only increment after first render
    if (prev !== "") setKey((k) => k + 1);
  }
  return key;
}

// ─── Single-neuron layout (AND, OR, NOT) ──────────────────────────────────────

function SingleNeuronDiagram({ gate, inputs }: { gate: GateDefinition; inputs: number[] }) {
  const neuron = gate.neurons[0];
  const output = gate.evaluate(inputs);
  const animKey = useAnimKey([inputs]);

  const cx = 200, cy = 120, r = 36;
  const inputCount = gate.inputs;
  const inputXs = 40;
  const inputYs =
    inputCount === 1 ? [cy] :
    inputCount === 2 ? [cy - 32, cy + 32] :
    [cy - 50, cy, cy + 50];

  const showBias = gate.type === "NOT";

  return (
    <svg viewBox="0 0 400 240" className="w-full max-w-sm mx-auto" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      {inputYs.map((iy, i) => {
        const isInhibitory = neuron.inhibitory.includes(`x${i + 1}`) || (gate.type === "NOT" && i === 0);
        const val = inputs[i] ?? 0;
        return (
          <g key={i}>
            <AnimatedWire x1={inputXs + 26} y1={iy} x2={cx - r} y2={cy} value={val} animKey={animKey} delay={i * 60} isCarry={false} inhibitory={isInhibitory} dashed={isInhibitory} />
            {isInhibitory && (
              <circle cx={cx - r - 2} cy={cy} r={5} fill={val === 1 ? INHIBITORY_COLOR : LOW_COLOR} style={{ transition: "fill 0.2s" }} />
            )}
            <text x={inputXs - 8} y={iy + 5} textAnchor="end" fontSize={13} fill="#1E293B" fontWeight="600">x{i + 1}</text>
            <rect x={inputXs + 4} y={iy - 12} width={22} height={22} rx={4} fill={signalColor(val)} style={{ transition: "fill 0.2s" }} />
            <text x={inputXs + 15} y={iy + 5} textAnchor="middle" fontSize={12} fill={val === 1 ? "#fff" : "#64748B"} fontWeight="700">{val}</text>
          </g>
        );
      })}

      {showBias && (
        <g>
          <line x1={inputXs} y1={cy - 60} x2={cx - r} y2={cy} stroke={HIGH_COLOR} strokeWidth={2} strokeDasharray="4 2" />
          <text x={inputXs - 8} y={cy - 55} textAnchor="end" fontSize={11} fill="#64748B">bias=1</text>
        </g>
      )}

      {/* Neuron */}
      <circle cx={cx} cy={cy} r={r} fill={output === 1 ? NEURON_FILL_ACTIVE : NEURON_FILL_INACTIVE} stroke={output === 1 ? HIGH_COLOR : "#94A3B8"} strokeWidth={2.5} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={11} fill="#1E293B" fontWeight="700">{neuron.label}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={10} fill="#64748B">θ={neuron.threshold}</text>

      {/* Output wire */}
      <AnimatedWire x1={cx + r} y1={cy} x2={355} y2={cy} value={output} animKey={animKey} delay={200} duration={350} strokeWidth={2.5} />
      <rect x={330} y={cy - 14} width={28} height={28} rx={5} fill={signalColor(output)} style={{ transition: "fill 0.2s" }} />
      <text x={344} y={cy + 6} textAnchor="middle" fontSize={14} fill={output === 1 ? "#fff" : "#64748B"} fontWeight="700">{output}</text>
      <text x={362} y={cy + 5} fontSize={12} fill="#1E293B" fontWeight="600">y</text>
    </svg>
  );
}

// ─── XOR / XNOR multi-neuron layout ───────────────────────────────────────────

function XORDiagram({ gate, inputs }: { gate: GateDefinition; inputs: number[] }) {
  const [a, b] = inputs;
  const nand = a === 1 && b === 1 ? 0 : 1;
  const or = a === 1 || b === 1 ? 1 : 0;
  const xorOut = nand === 1 && or === 1 ? 1 : 0;
  const output = gate.evaluate(inputs);
  const animKey = useAnimKey([inputs]);

  const viewW = gate.type === "XNOR" ? 500 : 420;

  return (
    <svg viewBox={`0 0 ${viewW} 240`} className="w-full max-w-lg mx-auto" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      {[70, 170].map((iy, i) => (
        <g key={i}>
          <AnimatedWire x1={54} y1={iy} x2={130} y2={70} value={inputs[i]} animKey={animKey} delay={i * 40} />
          <AnimatedWire x1={54} y1={iy} x2={130} y2={170} value={inputs[i]} animKey={animKey} delay={i * 40 + 20} />
          <text x={22} y={iy + 5} textAnchor="end" fontSize={12} fill="#1E293B" fontWeight="600">x{i + 1}</text>
          <rect x={32} y={iy - 11} width={20} height={20} rx={3} fill={signalColor(inputs[i])} style={{ transition: "fill 0.2s" }} />
          <text x={42} y={iy + 4} textAnchor="middle" fontSize={11} fill={inputs[i] === 1 ? "#fff" : "#64748B"} fontWeight="700">{inputs[i]}</text>
        </g>
      ))}

      {/* NAND neuron */}
      <circle cx={160} cy={70} r={28} fill={nand === 1 ? NEURON_FILL_ACTIVE : NEURON_FILL_INACTIVE} stroke={nand === 1 ? HIGH_COLOR : "#94A3B8"} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
      <text x={160} y={66} textAnchor="middle" fontSize={10} fill="#1E293B" fontWeight="700">NAND</text>
      <text x={160} y={78} textAnchor="middle" fontSize={9} fill="#64748B">θ=1</text>

      {/* OR neuron */}
      <circle cx={160} cy={170} r={28} fill={or === 1 ? NEURON_FILL_ACTIVE : NEURON_FILL_INACTIVE} stroke={or === 1 ? HIGH_COLOR : "#94A3B8"} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
      <text x={160} y={166} textAnchor="middle" fontSize={10} fill="#1E293B" fontWeight="700">OR</text>
      <text x={160} y={178} textAnchor="middle" fontSize={9} fill="#64748B">θ=1</text>

      <AnimatedWire x1={188} y1={70} x2={252} y2={120} value={nand} animKey={animKey} delay={150} />
      <AnimatedWire x1={188} y1={170} x2={252} y2={140} value={or} animKey={animKey} delay={150} />

      {/* AND neuron */}
      <circle cx={280} cy={130} r={28} fill={xorOut === 1 ? NEURON_FILL_ACTIVE : NEURON_FILL_INACTIVE} stroke={xorOut === 1 ? HIGH_COLOR : "#94A3B8"} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
      <text x={280} y={126} textAnchor="middle" fontSize={10} fill="#1E293B" fontWeight="700">AND</text>
      <text x={280} y={138} textAnchor="middle" fontSize={9} fill="#64748B">θ=2</text>

      {gate.type === "XOR" ? (
        <>
          <AnimatedWire x1={308} y1={130} x2={385} y2={130} value={output} animKey={animKey} delay={280} strokeWidth={2.5} />
          <rect x={358} y={117} width={26} height={26} rx={4} fill={signalColor(output)} style={{ transition: "fill 0.2s" }} />
          <text x={371} y={135} textAnchor="middle" fontSize={13} fill={output === 1 ? "#fff" : "#64748B"} fontWeight="700">{output}</text>
          <text x={388} y={135} fontSize={12} fill="#1E293B" fontWeight="600">y</text>
        </>
      ) : (
        <>
          <AnimatedWire x1={308} y1={130} x2={342} y2={130} value={xorOut} animKey={animKey} delay={280} />
          <circle cx={370} cy={130} r={24} fill={output === 1 ? NEURON_FILL_ACTIVE : NEURON_FILL_INACTIVE} stroke={output === 1 ? HIGH_COLOR : "#94A3B8"} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
          <text x={370} y={126} textAnchor="middle" fontSize={10} fill="#1E293B" fontWeight="700">NOT</text>
          <text x={370} y={138} textAnchor="middle" fontSize={9} fill="#64748B">θ=1</text>
          <AnimatedWire x1={394} y1={130} x2={460} y2={130} value={output} animKey={animKey} delay={360} strokeWidth={2.5} />
          <rect x={433} y={117} width={26} height={26} rx={4} fill={signalColor(output)} style={{ transition: "fill 0.2s" }} />
          <text x={446} y={135} textAnchor="middle" fontSize={13} fill={output === 1 ? "#fff" : "#64748B"} fontWeight="700">{output}</text>
          <text x={463} y={135} fontSize={12} fill="#1E293B" fontWeight="600">y</text>
        </>
      )}
    </svg>
  );
}

// ─── NAND / NOR two-neuron layout ─────────────────────────────────────────────

function TwoNeuronDiagram({ gate, inputs }: { gate: GateDefinition; inputs: number[] }) {
  const firstGate = gate.type === "NAND" ? "AND" : "OR";
  const firstEval = firstGate === "AND"
    ? (inputs[0] === 1 && inputs[1] === 1 ? 1 : 0)
    : (inputs[0] === 1 || inputs[1] === 1 ? 1 : 0);
  const output = gate.evaluate(inputs);
  const animKey = useAnimKey([inputs]);

  return (
    <svg viewBox="0 0 440 240" className="w-full max-w-md mx-auto" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      {[80, 160].map((iy, i) => (
        <g key={i}>
          <AnimatedWire x1={54} y1={iy} x2={120} y2={120} value={inputs[i]} animKey={animKey} delay={i * 50} />
          <text x={22} y={iy + 5} textAnchor="end" fontSize={12} fill="#1E293B" fontWeight="600">x{i + 1}</text>
          <rect x={32} y={iy - 11} width={20} height={20} rx={3} fill={signalColor(inputs[i])} style={{ transition: "fill 0.2s" }} />
          <text x={42} y={iy + 4} textAnchor="middle" fontSize={11} fill={inputs[i] === 1 ? "#fff" : "#64748B"} fontWeight="700">{inputs[i]}</text>
        </g>
      ))}

      <circle cx={160} cy={120} r={34} fill={firstEval === 1 ? NEURON_FILL_ACTIVE : NEURON_FILL_INACTIVE} stroke={firstEval === 1 ? HIGH_COLOR : "#94A3B8"} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
      <text x={160} y={115} textAnchor="middle" fontSize={11} fill="#1E293B" fontWeight="700">{firstGate}</text>
      <text x={160} y={130} textAnchor="middle" fontSize={10} fill="#64748B">θ={gate.type === "NAND" ? 2 : 1}</text>

      <AnimatedWire x1={194} y1={120} x2={256} y2={120} value={firstEval} animKey={animKey} delay={160} dashed inhibitory />
      <circle cx={256} cy={120} r={5} fill={firstEval === 1 ? INHIBITORY_COLOR : LOW_COLOR} style={{ transition: "fill 0.2s" }} />

      <line x1={260} y1={60} x2={295} y2={120} stroke={HIGH_COLOR} strokeWidth={1.5} strokeDasharray="4 2" />
      <text x={258} y={55} textAnchor="middle" fontSize={10} fill="#64748B">bias</text>

      <circle cx={300} cy={120} r={34} fill={output === 1 ? NEURON_FILL_ACTIVE : NEURON_FILL_INACTIVE} stroke={output === 1 ? HIGH_COLOR : "#94A3B8"} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
      <text x={300} y={115} textAnchor="middle" fontSize={11} fill="#1E293B" fontWeight="700">NOT</text>
      <text x={300} y={130} textAnchor="middle" fontSize={10} fill="#64748B">θ=1</text>

      <AnimatedWire x1={334} y1={120} x2={396} y2={120} value={output} animKey={animKey} delay={280} strokeWidth={2.5} />
      <rect x={368} y={107} width={26} height={26} rx={4} fill={signalColor(output)} style={{ transition: "fill 0.2s" }} />
      <text x={381} y={125} textAnchor="middle" fontSize={13} fill={output === 1 ? "#fff" : "#64748B"} fontWeight="700">{output}</text>
      <text x={400} y={125} fontSize={12} fill="#1E293B" fontWeight="600">y</text>
    </svg>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export default function NeuronDiagram({ gate, inputs, className }: NeuronDiagramProps) {
  if (gate.type === "XOR" || gate.type === "XNOR") {
    return <div className={className}><XORDiagram gate={gate} inputs={inputs} /></div>;
  }
  if (gate.type === "NAND" || gate.type === "NOR") {
    return <div className={className}><TwoNeuronDiagram gate={gate} inputs={inputs} /></div>;
  }
  return <div className={className}><SingleNeuronDiagram gate={gate} inputs={inputs} /></div>;
}
