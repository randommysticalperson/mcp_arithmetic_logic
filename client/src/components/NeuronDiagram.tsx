/**
 * NeuronDiagram.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 * Renders an SVG circuit diagram for a McCulloch-Pitts gate.
 * Teal (#0EA5E9) = signal HIGH, slate (#CBD5E1) = signal LOW
 */

import { useEffect, useState } from "react";
import type { GateDefinition } from "@/lib/mcpNeuron";

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

// ─── Single-neuron layout (AND, OR, NOT, NAND, NOR) ───────────────────────────

function SingleNeuronDiagram({
  gate,
  inputs,
}: {
  gate: GateDefinition;
  inputs: number[];
}) {
  const neuron = gate.neurons[0];
  const output = gate.evaluate(inputs);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [inputs.join(",")]);

  const cx = 200;
  const cy = 120;
  const r = 36;
  const inputCount = gate.inputs;
  const inputXs = 40;
  const inputYs =
    inputCount === 1
      ? [cy]
      : inputCount === 2
      ? [cy - 32, cy + 32]
      : [cy - 50, cy, cy + 50];

  // For NOT gate: show bias input
  const showBias = gate.type === "NOT";

  return (
    <svg
      viewBox="0 0 400 240"
      className="w-full max-w-sm mx-auto"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {/* Input wires */}
      {inputYs.map((iy, i) => {
        const isInhibitory = neuron.inhibitory.includes(`x${i + 1}`) || (gate.type === "NOT" && i === 0);
        const val = inputs[i] ?? 0;
        const color = isInhibitory
          ? val === 1
            ? INHIBITORY_COLOR
            : LOW_COLOR
          : signalColor(val);
        return (
          <g key={i}>
            <line
              x1={inputXs}
              y1={iy}
              x2={cx - r}
              y2={cy}
              stroke={color}
              strokeWidth={2.5}
              strokeDasharray={isInhibitory ? "6 3" : undefined}
              style={{ transition: "stroke 0.2s ease" }}
            />
            {/* Inhibitory dot */}
            {isInhibitory && (
              <circle
                cx={cx - r - 2}
                cy={cy}
                r={5}
                fill={color}
                style={{ transition: "fill 0.2s ease" }}
              />
            )}
            {/* Input label */}
            <text
              x={inputXs - 8}
              y={iy + 5}
              textAnchor="end"
              fontSize={13}
              fill="#1E293B"
              fontWeight="600"
            >
              x{i + 1}
            </text>
            {/* Input value badge */}
            <rect
              x={inputXs + 4}
              y={iy - 12}
              width={22}
              height={22}
              rx={4}
              fill={color}
              style={{ transition: "fill 0.2s ease" }}
            />
            <text
              x={inputXs + 15}
              y={iy + 5}
              textAnchor="middle"
              fontSize={12}
              fill={val === 1 ? "#fff" : "#64748B"}
              fontWeight="700"
            >
              {val}
            </text>
          </g>
        );
      })}

      {/* Bias wire for NOT */}
      {showBias && (
        <g>
          <line
            x1={inputXs}
            y1={cy - 60}
            x2={cx - r}
            y2={cy}
            stroke={HIGH_COLOR}
            strokeWidth={2}
            strokeDasharray="4 2"
          />
          <text x={inputXs - 8} y={cy - 55} textAnchor="end" fontSize={11} fill="#64748B">
            bias=1
          </text>
        </g>
      )}

      {/* Neuron circle */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={output === 1 ? NEURON_FILL_ACTIVE : NEURON_FILL_INACTIVE}
        stroke={output === 1 ? HIGH_COLOR : "#94A3B8"}
        strokeWidth={2.5}
        style={{ transition: "fill 0.25s ease, stroke 0.25s ease" }}
      />
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fontSize={11}
        fill="#1E293B"
        fontWeight="700"
      >
        {neuron.label}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fontSize={10}
        fill="#64748B"
      >
        θ={neuron.threshold}
      </text>

      {/* Output wire */}
      <line
        x1={cx + r}
        y1={cy}
        x2={360}
        y2={cy}
        stroke={signalColor(output)}
        strokeWidth={2.5}
        style={{ transition: "stroke 0.2s ease" }}
      />
      {/* Output value badge */}
      <rect
        x={330}
        y={cy - 14}
        width={28}
        height={28}
        rx={5}
        fill={signalColor(output)}
        style={{ transition: "fill 0.2s ease" }}
      />
      <text
        x={344}
        y={cy + 6}
        textAnchor="middle"
        fontSize={14}
        fill={output === 1 ? "#fff" : "#64748B"}
        fontWeight="700"
      >
        {output}
      </text>
      <text x={362} y={cy + 5} fontSize={12} fill="#1E293B" fontWeight="600">
        y
      </text>
    </svg>
  );
}

// ─── XOR / XNOR multi-neuron layout ───────────────────────────────────────────

function XORDiagram({
  gate,
  inputs,
}: {
  gate: GateDefinition;
  inputs: number[];
}) {
  const [a, b] = inputs;
  const nand = gate.type === "XOR" ? (a === 1 && b === 1 ? 0 : 1) : (a === 1 && b === 1 ? 0 : 1);
  const or = a === 1 || b === 1 ? 1 : 0;
  const xorOut = nand === 1 && or === 1 ? 1 : 0;
  const output = gate.evaluate(inputs);

  const neurons = [
    { id: "nand", label: "NAND", x: 160, y: 70, val: nand, theta: 1 },
    { id: "or", label: "OR", x: 160, y: 170, val: or, theta: 1 },
    { id: "and", label: "AND", x: 280, y: 120, val: xorOut, theta: 2 },
  ];

  const extraNot =
    gate.type === "XNOR"
      ? { id: "not", label: "NOT", x: 370, y: 120, val: output, theta: 1 }
      : null;

  const viewW = gate.type === "XNOR" ? 500 : 420;

  return (
    <svg
      viewBox={`0 0 ${viewW} 240`}
      className="w-full max-w-lg mx-auto"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {/* Input lines to NAND */}
      {[70, 170].map((iy, i) => (
        <g key={i}>
          <line x1={30} y1={iy} x2={130} y2={70} stroke={signalColor(inputs[i])} strokeWidth={2} style={{ transition: "stroke 0.2s" }} />
          <line x1={30} y1={iy} x2={130} y2={170} stroke={signalColor(inputs[i])} strokeWidth={2} style={{ transition: "stroke 0.2s" }} />
          <text x={22} y={iy + 5} textAnchor="end" fontSize={12} fill="#1E293B" fontWeight="600">x{i + 1}</text>
          <rect x={32} y={iy - 11} width={20} height={20} rx={3} fill={signalColor(inputs[i])} style={{ transition: "fill 0.2s" }} />
          <text x={42} y={iy + 4} textAnchor="middle" fontSize={11} fill={inputs[i] === 1 ? "#fff" : "#64748B"} fontWeight="700">{inputs[i]}</text>
        </g>
      ))}

      {/* Neurons */}
      {neurons.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={28} fill={n.val === 1 ? NEURON_FILL_ACTIVE : NEURON_FILL_INACTIVE} stroke={n.val === 1 ? HIGH_COLOR : "#94A3B8"} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
          <text x={n.x} y={n.y - 4} textAnchor="middle" fontSize={10} fill="#1E293B" fontWeight="700">{n.label}</text>
          <text x={n.x} y={n.y + 10} textAnchor="middle" fontSize={9} fill="#64748B">θ={n.theta}</text>
        </g>
      ))}

      {/* Wires NAND→AND, OR→AND */}
      <line x1={188} y1={70} x2={252} y2={120} stroke={signalColor(nand)} strokeWidth={2} style={{ transition: "stroke 0.2s" }} />
      <line x1={188} y1={170} x2={252} y2={120} stroke={signalColor(or)} strokeWidth={2} style={{ transition: "stroke 0.2s" }} />

      {/* Output wire */}
      {gate.type === "XOR" ? (
        <>
          <line x1={308} y1={120} x2={390} y2={120} stroke={signalColor(output)} strokeWidth={2.5} style={{ transition: "stroke 0.2s" }} />
          <rect x={360} y={107} width={26} height={26} rx={4} fill={signalColor(output)} style={{ transition: "fill 0.2s" }} />
          <text x={373} y={125} textAnchor="middle" fontSize={13} fill={output === 1 ? "#fff" : "#64748B"} fontWeight="700">{output}</text>
          <text x={392} y={125} fontSize={12} fill="#1E293B" fontWeight="600">y</text>
        </>
      ) : (
        <>
          <line x1={308} y1={120} x2={342} y2={120} stroke={signalColor(xorOut)} strokeWidth={2} style={{ transition: "stroke 0.2s" }} />
          {extraNot && (
            <>
              <circle cx={extraNot.x} cy={extraNot.y} r={24} fill={extraNot.val === 1 ? NEURON_FILL_ACTIVE : NEURON_FILL_INACTIVE} stroke={extraNot.val === 1 ? HIGH_COLOR : "#94A3B8"} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
              <text x={extraNot.x} y={extraNot.y - 4} textAnchor="middle" fontSize={10} fill="#1E293B" fontWeight="700">NOT</text>
              <text x={extraNot.x} y={extraNot.y + 10} textAnchor="middle" fontSize={9} fill="#64748B">θ=1</text>
              <line x1={394} y1={120} x2={460} y2={120} stroke={signalColor(output)} strokeWidth={2.5} style={{ transition: "stroke 0.2s" }} />
              <rect x={435} y={107} width={26} height={26} rx={4} fill={signalColor(output)} style={{ transition: "fill 0.2s" }} />
              <text x={448} y={125} textAnchor="middle" fontSize={13} fill={output === 1 ? "#fff" : "#64748B"} fontWeight="700">{output}</text>
              <text x={465} y={125} fontSize={12} fill="#1E293B" fontWeight="600">y</text>
            </>
          )}
        </>
      )}
    </svg>
  );
}

// ─── NAND / NOR two-neuron layout ─────────────────────────────────────────────

function TwoNeuronDiagram({
  gate,
  inputs,
}: {
  gate: GateDefinition;
  inputs: number[];
}) {
  const firstGate = gate.type === "NAND" ? "AND" : "OR";
  const firstEval = firstGate === "AND"
    ? (inputs[0] === 1 && inputs[1] === 1 ? 1 : 0)
    : (inputs[0] === 1 || inputs[1] === 1 ? 1 : 0);
  const output = gate.evaluate(inputs);

  return (
    <svg
      viewBox="0 0 440 240"
      className="w-full max-w-md mx-auto"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {/* Inputs */}
      {[80, 160].map((iy, i) => (
        <g key={i}>
          <line x1={30} y1={iy} x2={120} y2={120} stroke={signalColor(inputs[i])} strokeWidth={2} style={{ transition: "stroke 0.2s" }} />
          <text x={22} y={iy + 5} textAnchor="end" fontSize={12} fill="#1E293B" fontWeight="600">x{i + 1}</text>
          <rect x={32} y={iy - 11} width={20} height={20} rx={3} fill={signalColor(inputs[i])} style={{ transition: "fill 0.2s" }} />
          <text x={42} y={iy + 4} textAnchor="middle" fontSize={11} fill={inputs[i] === 1 ? "#fff" : "#64748B"} fontWeight="700">{inputs[i]}</text>
        </g>
      ))}

      {/* First neuron */}
      <circle cx={160} cy={120} r={34} fill={firstEval === 1 ? NEURON_FILL_ACTIVE : NEURON_FILL_INACTIVE} stroke={firstEval === 1 ? HIGH_COLOR : "#94A3B8"} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
      <text x={160} y={115} textAnchor="middle" fontSize={11} fill="#1E293B" fontWeight="700">{firstGate}</text>
      <text x={160} y={130} textAnchor="middle" fontSize={10} fill="#64748B">θ={gate.type === "NAND" ? 2 : 1}</text>

      {/* Wire between neurons — inhibitory */}
      <line x1={194} y1={120} x2={256} y2={120} stroke={firstEval === 1 ? INHIBITORY_COLOR : LOW_COLOR} strokeWidth={2} strokeDasharray="6 3" style={{ transition: "stroke 0.2s" }} />
      <circle cx={256} cy={120} r={5} fill={firstEval === 1 ? INHIBITORY_COLOR : LOW_COLOR} style={{ transition: "fill 0.2s" }} />

      {/* Bias wire */}
      <line x1={260} y1={60} x2={295} y2={120} stroke={HIGH_COLOR} strokeWidth={1.5} strokeDasharray="4 2" />
      <text x={258} y={55} textAnchor="middle" fontSize={10} fill="#64748B">bias</text>

      {/* NOT neuron */}
      <circle cx={300} cy={120} r={34} fill={output === 1 ? NEURON_FILL_ACTIVE : NEURON_FILL_INACTIVE} stroke={output === 1 ? HIGH_COLOR : "#94A3B8"} strokeWidth={2} style={{ transition: "fill 0.25s, stroke 0.25s" }} />
      <text x={300} y={115} textAnchor="middle" fontSize={11} fill="#1E293B" fontWeight="700">NOT</text>
      <text x={300} y={130} textAnchor="middle" fontSize={10} fill="#64748B">θ=1</text>

      {/* Output */}
      <line x1={334} y1={120} x2={400} y2={120} stroke={signalColor(output)} strokeWidth={2.5} style={{ transition: "stroke 0.2s" }} />
      <rect x={370} y={107} width={26} height={26} rx={4} fill={signalColor(output)} style={{ transition: "fill 0.2s" }} />
      <text x={383} y={125} textAnchor="middle" fontSize={13} fill={output === 1 ? "#fff" : "#64748B"} fontWeight="700">{output}</text>
      <text x={402} y={125} fontSize={12} fill="#1E293B" fontWeight="600">y</text>
    </svg>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export default function NeuronDiagram({ gate, inputs, className }: NeuronDiagramProps) {
  if (gate.type === "XOR" || gate.type === "XNOR") {
    return (
      <div className={className}>
        <XORDiagram gate={gate} inputs={inputs} />
      </div>
    );
  }
  if (gate.type === "NAND" || gate.type === "NOR") {
    return (
      <div className={className}>
        <TwoNeuronDiagram gate={gate} inputs={inputs} />
      </div>
    );
  }
  return (
    <div className={className}>
      <SingleNeuronDiagram gate={gate} inputs={inputs} />
    </div>
  );
}
