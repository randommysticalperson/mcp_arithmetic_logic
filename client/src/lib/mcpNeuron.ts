/**
 * McCulloch-Pitts Neuron Engine
 * Design: Scientific Instrument / Swiss Rationalism
 *
 * A McCulloch-Pitts neuron computes:
 *   output = 1  if  (sum of excitatory inputs) - (sum of inhibitory inputs) >= threshold
 *   output = 0  otherwise
 *
 * All inputs and outputs are binary (0 or 1).
 */

export interface MCPNeuron {
  id: string;
  label: string;
  threshold: number;
  /** Indices into the input array that are excitatory (+1 weight) */
  excitatoryInputs: number[];
  /** Indices into the input array that are inhibitory (-∞ weight, any inhibitory=1 → output=0) */
  inhibitoryInputs: number[];
}

/** Evaluate a single McCulloch-Pitts neuron */
export function evaluateMCP(
  neuron: MCPNeuron,
  inputs: number[]
): { output: number; activation: number } {
  // If any inhibitory input is 1, output is always 0
  for (const idx of neuron.inhibitoryInputs) {
    if (inputs[idx] === 1) return { output: 0, activation: -Infinity };
  }
  const activation = neuron.excitatoryInputs.reduce(
    (sum, idx) => sum + (inputs[idx] ?? 0),
    0
  );
  return {
    output: activation >= neuron.threshold ? 1 : 0,
    activation,
  };
}

// ─── Gate Definitions ──────────────────────────────────────────────────────────

export type GateType = "AND" | "OR" | "NOT" | "NAND" | "NOR" | "XOR" | "XNOR";

export interface GateDefinition {
  type: GateType;
  name: string;
  description: string;
  inputs: number; // number of input bits
  /** Evaluate the gate for given inputs */
  evaluate: (inputs: number[]) => number;
  /** McCulloch-Pitts representation */
  neurons: MCPNeuronSpec[];
  /** Human-readable formula */
  formula: string;
  /** Truth table rows */
  truthTable: { inputs: number[]; output: number }[];
}

export interface MCPNeuronSpec {
  id: string;
  label: string;
  threshold: number;
  excitatory: string[]; // input variable names or neuron ids
  inhibitory: string[];
  isOutput: boolean;
}

export const GATE_DEFINITIONS: Record<GateType, GateDefinition> = {
  AND: {
    type: "AND",
    name: "AND Gate",
    description:
      "Output is 1 only when ALL inputs are 1. A single MCP neuron with threshold equal to the number of inputs.",
    inputs: 2,
    evaluate: ([a, b]) => (a === 1 && b === 1 ? 1 : 0),
    formula: "y = 1  iff  x₁ + x₂ ≥ 2",
    neurons: [
      {
        id: "n1",
        label: "AND",
        threshold: 2,
        excitatory: ["x₁", "x₂"],
        inhibitory: [],
        isOutput: true,
      },
    ],
    truthTable: [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 0 },
      { inputs: [1, 0], output: 0 },
      { inputs: [1, 1], output: 1 },
    ],
  },
  OR: {
    type: "OR",
    name: "OR Gate",
    description:
      "Output is 1 when AT LEAST ONE input is 1. A single MCP neuron with threshold = 1.",
    inputs: 2,
    evaluate: ([a, b]) => (a === 1 || b === 1 ? 1 : 0),
    formula: "y = 1  iff  x₁ + x₂ ≥ 1",
    neurons: [
      {
        id: "n1",
        label: "OR",
        threshold: 1,
        excitatory: ["x₁", "x₂"],
        inhibitory: [],
        isOutput: true,
      },
    ],
    truthTable: [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 1 },
      { inputs: [1, 0], output: 1 },
      { inputs: [1, 1], output: 1 },
    ],
  },
  NOT: {
    type: "NOT",
    name: "NOT Gate",
    description:
      "Inverts the input. Uses an inhibitory connection — if the input is 1, the neuron is suppressed.",
    inputs: 1,
    evaluate: ([a]) => (a === 0 ? 1 : 0),
    formula: "y = 1  iff  x₁ = 0  (inhibitory: fires when no input)",
    neurons: [
      {
        id: "n1",
        label: "NOT",
        threshold: 1,
        excitatory: ["bias"],
        inhibitory: ["x₁"],
        isOutput: true,
      },
    ],
    truthTable: [
      { inputs: [0], output: 1 },
      { inputs: [1], output: 0 },
    ],
  },
  NAND: {
    type: "NAND",
    name: "NAND Gate",
    description:
      "NOT-AND: output is 0 only when ALL inputs are 1. Implemented as AND followed by NOT.",
    inputs: 2,
    evaluate: ([a, b]) => (a === 1 && b === 1 ? 0 : 1),
    formula: "y = NOT(x₁ AND x₂)",
    neurons: [
      {
        id: "n_and",
        label: "AND",
        threshold: 2,
        excitatory: ["x₁", "x₂"],
        inhibitory: [],
        isOutput: false,
      },
      {
        id: "n_not",
        label: "NOT",
        threshold: 1,
        excitatory: ["bias"],
        inhibitory: ["n_and"],
        isOutput: true,
      },
    ],
    truthTable: [
      { inputs: [0, 0], output: 1 },
      { inputs: [0, 1], output: 1 },
      { inputs: [1, 0], output: 1 },
      { inputs: [1, 1], output: 0 },
    ],
  },
  NOR: {
    type: "NOR",
    name: "NOR Gate",
    description:
      "NOT-OR: output is 1 only when ALL inputs are 0. Implemented as OR followed by NOT.",
    inputs: 2,
    evaluate: ([a, b]) => (a === 0 && b === 0 ? 1 : 0),
    formula: "y = NOT(x₁ OR x₂)",
    neurons: [
      {
        id: "n_or",
        label: "OR",
        threshold: 1,
        excitatory: ["x₁", "x₂"],
        inhibitory: [],
        isOutput: false,
      },
      {
        id: "n_not",
        label: "NOT",
        threshold: 1,
        excitatory: ["bias"],
        inhibitory: ["n_or"],
        isOutput: true,
      },
    ],
    truthTable: [
      { inputs: [0, 0], output: 1 },
      { inputs: [0, 1], output: 0 },
      { inputs: [1, 0], output: 0 },
      { inputs: [1, 1], output: 0 },
    ],
  },
  XOR: {
    type: "XOR",
    name: "XOR Gate",
    description:
      "Exclusive-OR: output is 1 when inputs DIFFER. Requires 3 MCP neurons: NAND, OR, and AND.",
    inputs: 2,
    evaluate: ([a, b]) => (a !== b ? 1 : 0),
    formula: "y = (x₁ NAND x₂) AND (x₁ OR x₂)",
    neurons: [
      {
        id: "n_nand",
        label: "NAND",
        threshold: 1,
        excitatory: ["x₁", "x₂"],
        inhibitory: [],
        isOutput: false,
      },
      {
        id: "n_or",
        label: "OR",
        threshold: 1,
        excitatory: ["x₁", "x₂"],
        inhibitory: [],
        isOutput: false,
      },
      {
        id: "n_and",
        label: "AND",
        threshold: 2,
        excitatory: ["n_nand", "n_or"],
        inhibitory: [],
        isOutput: true,
      },
    ],
    truthTable: [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 1 },
      { inputs: [1, 0], output: 1 },
      { inputs: [1, 1], output: 0 },
    ],
  },
  XNOR: {
    type: "XNOR",
    name: "XNOR Gate",
    description:
      "Exclusive-NOR: output is 1 when inputs are EQUAL. The complement of XOR.",
    inputs: 2,
    evaluate: ([a, b]) => (a === b ? 1 : 0),
    formula: "y = NOT(x₁ XOR x₂)",
    neurons: [
      {
        id: "n_nand",
        label: "NAND",
        threshold: 1,
        excitatory: ["x₁", "x₂"],
        inhibitory: [],
        isOutput: false,
      },
      {
        id: "n_or",
        label: "OR",
        threshold: 1,
        excitatory: ["x₁", "x₂"],
        inhibitory: [],
        isOutput: false,
      },
      {
        id: "n_xor",
        label: "AND",
        threshold: 2,
        excitatory: ["n_nand", "n_or"],
        inhibitory: [],
        isOutput: false,
      },
      {
        id: "n_not",
        label: "NOT",
        threshold: 1,
        excitatory: ["bias"],
        inhibitory: ["n_xor"],
        isOutput: true,
      },
    ],
    truthTable: [
      { inputs: [0, 0], output: 1 },
      { inputs: [0, 1], output: 0 },
      { inputs: [1, 0], output: 0 },
      { inputs: [1, 1], output: 1 },
    ],
  },
};

// ─── Arithmetic Circuits ───────────────────────────────────────────────────────

export interface HalfAdderResult {
  sum: number;
  carry: number;
  steps: { label: string; value: number }[];
}

export function halfAdder(a: number, b: number): HalfAdderResult {
  const xorGate = GATE_DEFINITIONS.XOR;
  const andGate = GATE_DEFINITIONS.AND;
  const sum = xorGate.evaluate([a, b]);
  const carry = andGate.evaluate([a, b]);
  return {
    sum,
    carry,
    steps: [
      { label: "A", value: a },
      { label: "B", value: b },
      { label: "Sum (A XOR B)", value: sum },
      { label: "Carry (A AND B)", value: carry },
    ],
  };
}

export interface FullAdderResult {
  sum: number;
  carryOut: number;
  steps: { label: string; value: number }[];
}

export function fullAdder(
  a: number,
  b: number,
  cin: number
): FullAdderResult {
  const xor = GATE_DEFINITIONS.XOR.evaluate;
  const and = GATE_DEFINITIONS.AND.evaluate;
  const or = GATE_DEFINITIONS.OR.evaluate;

  const xor1 = xor([a, b]);
  const and1 = and([a, b]);
  const sum = xor([xor1, cin]);
  const and2 = and([xor1, cin]);
  const carryOut = or([and1, and2]);

  return {
    sum,
    carryOut,
    steps: [
      { label: "A", value: a },
      { label: "B", value: b },
      { label: "Cᵢₙ", value: cin },
      { label: "A XOR B", value: xor1 },
      { label: "A AND B", value: and1 },
      { label: "(A XOR B) AND Cᵢₙ", value: and2 },
      { label: "Sum = (A XOR B) XOR Cᵢₙ", value: sum },
      { label: "Cₒᵤₜ = (A AND B) OR ((A XOR B) AND Cᵢₙ)", value: carryOut },
    ],
  };
}

export interface BinaryAdditionResult {
  bits: { a: number; b: number; cin: number; sum: number; cout: number }[];
  resultBits: number[];
  carryOut: number;
  aDecimal: number;
  bDecimal: number;
  resultDecimal: number;
}

export function binaryAddition(
  aBits: number[],
  bBits: number[]
): BinaryAdditionResult {
  const n = Math.max(aBits.length, bBits.length);
  const a = [...aBits].reverse();
  const b = [...bBits].reverse();
  while (a.length < n) a.push(0);
  while (b.length < n) b.push(0);

  const bits: BinaryAdditionResult["bits"] = [];
  let carry = 0;
  const resultBits: number[] = [];

  for (let i = 0; i < n; i++) {
    const res = fullAdder(a[i], b[i], carry);
    bits.push({ a: a[i], b: b[i], cin: carry, sum: res.sum, cout: res.carryOut });
    resultBits.push(res.sum);
    carry = res.carryOut;
  }

  const aDecimal = parseInt(aBits.join(""), 2);
  const bDecimal = parseInt(bBits.join(""), 2);
  const resultDecimal = aDecimal + bDecimal;

  return {
    bits,
    resultBits: [...resultBits].reverse(),
    carryOut: carry,
    aDecimal,
    bDecimal,
    resultDecimal,
  };
}
