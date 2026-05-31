/**
 * logicShifter.ts
 * Design: Scientific Instrument / Swiss Rationalism
 *
 * Logic shift operations implemented using McCulloch-Pitts neuron principles.
 *
 * In digital hardware, a barrel shifter is built from multiplexer trees.
 * Each multiplexer selects between two inputs based on a control signal —
 * this is equivalent to a McCulloch-Pitts AND/OR network:
 *
 *   MUX(a, b, sel) = (a AND NOT sel) OR (b AND sel)
 *
 * Each output bit of the shifter is computed by one such MUX neuron group.
 *
 * Shift types:
 *   LSL  - Logical Shift Left:  shift bits left, fill right with 0s
 *   LSR  - Logical Shift Right: shift bits right, fill left with 0s
 *   ASR  - Arithmetic Shift Right: shift right, fill left with sign bit (MSB)
 *   ROL  - Rotate Left:  bits wrap around from MSB to LSB
 *   ROR  - Rotate Right: bits wrap around from LSB to MSB
 */

export type ShiftType = "LSL" | "LSR" | "ASR" | "ROL" | "ROR";

export interface ShiftResult {
  inputBits: number[];
  outputBits: number[];
  shiftAmount: number;
  shiftType: ShiftType;
  inputDecimal: number;
  outputDecimal: number;
  /** Per-bit trace: which input bit maps to which output bit */
  bitTrace: { outIdx: number; srcIdx: number | null; srcVal: number; fill: number | null }[];
  /** Overflow / carry-out flag */
  overflow: boolean;
  /** Bits shifted out */
  shiftedOut: number[];
}

const BITS = 8;

function bitsToNum(bits: number[]): number {
  // Treat as unsigned 8-bit
  return parseInt(bits.join(""), 2);
}

function numToBits(n: number, len = BITS): number[] {
  const clamped = ((n % (1 << len)) + (1 << len)) % (1 << len);
  return Array.from({ length: len }, (_, i) => (clamped >> (len - 1 - i)) & 1);
}

export function applyShift(inputBits: number[], shiftType: ShiftType, shiftAmount: number): ShiftResult {
  const n = inputBits.length;
  const amount = Math.max(0, Math.min(n, shiftAmount));
  const inputDecimal = bitsToNum(inputBits);
  const signBit = inputBits[0]; // MSB

  let outputBits: number[] = Array(n).fill(0);
  let shiftedOut: number[] = [];
  let overflow = false;

  const bitTrace: ShiftResult["bitTrace"] = [];

  switch (shiftType) {
    case "LSL": {
      // Each output bit[i] = input bit[i + amount] if (i + amount < n), else 0
      shiftedOut = inputBits.slice(0, amount);
      overflow = shiftedOut.some((b) => b === 1);
      for (let i = 0; i < n; i++) {
        const srcIdx = i + amount;
        if (srcIdx < n) {
          outputBits[i] = inputBits[srcIdx];
          bitTrace.push({ outIdx: i, srcIdx, srcVal: inputBits[srcIdx], fill: null });
        } else {
          outputBits[i] = 0;
          bitTrace.push({ outIdx: i, srcIdx: null, srcVal: 0, fill: 0 });
        }
      }
      break;
    }
    case "LSR": {
      // Each output bit[i] = input bit[i - amount] if (i - amount >= 0), else 0
      shiftedOut = inputBits.slice(n - amount);
      for (let i = 0; i < n; i++) {
        const srcIdx = i - amount;
        if (srcIdx >= 0) {
          outputBits[i] = inputBits[srcIdx];
          bitTrace.push({ outIdx: i, srcIdx, srcVal: inputBits[srcIdx], fill: null });
        } else {
          outputBits[i] = 0;
          bitTrace.push({ outIdx: i, srcIdx: null, srcVal: 0, fill: 0 });
        }
      }
      break;
    }
    case "ASR": {
      // Same as LSR but fill with sign bit instead of 0
      shiftedOut = inputBits.slice(n - amount);
      for (let i = 0; i < n; i++) {
        const srcIdx = i - amount;
        if (srcIdx >= 0) {
          outputBits[i] = inputBits[srcIdx];
          bitTrace.push({ outIdx: i, srcIdx, srcVal: inputBits[srcIdx], fill: null });
        } else {
          outputBits[i] = signBit;
          bitTrace.push({ outIdx: i, srcIdx: null, srcVal: signBit, fill: signBit });
        }
      }
      break;
    }
    case "ROL": {
      // output[i] = input[(i + amount) % n]
      for (let i = 0; i < n; i++) {
        const srcIdx = (i + amount) % n;
        outputBits[i] = inputBits[srcIdx];
        bitTrace.push({ outIdx: i, srcIdx, srcVal: inputBits[srcIdx], fill: null });
      }
      shiftedOut = inputBits.slice(0, amount);
      break;
    }
    case "ROR": {
      // output[i] = input[(i - amount + n) % n]
      for (let i = 0; i < n; i++) {
        const srcIdx = (i - amount + n) % n;
        outputBits[i] = inputBits[srcIdx];
        bitTrace.push({ outIdx: i, srcIdx, srcVal: inputBits[srcIdx], fill: null });
      }
      shiftedOut = inputBits.slice(n - amount);
      break;
    }
  }

  const outputDecimal = bitsToNum(outputBits);

  return {
    inputBits,
    outputBits,
    shiftAmount: amount,
    shiftType,
    inputDecimal,
    outputDecimal,
    bitTrace,
    overflow,
    shiftedOut,
  };
}

export const SHIFT_DESCRIPTIONS: Record<ShiftType, { name: string; short: string; description: string; mcpExplanation: string; formula: string }> = {
  LSL: {
    name: "Logical Shift Left",
    short: "LSL",
    description: "Shifts all bits toward the most-significant position. Vacated LSBs are filled with 0. Equivalent to multiplying by 2ⁿ (ignoring overflow).",
    mcpExplanation: "Each output bit is routed from a specific input bit via an AND gate (MCP neuron with threshold = 1 and one excitatory input). Vacated positions are connected to a constant-0 source — the neuron simply never fires.",
    formula: "out[i] = in[i + n]  (0 if out of range)",
  },
  LSR: {
    name: "Logical Shift Right",
    short: "LSR",
    description: "Shifts all bits toward the least-significant position. Vacated MSBs are filled with 0. Equivalent to unsigned integer division by 2ⁿ.",
    mcpExplanation: "Same MCP AND-gate routing as LSL, but the source index is decremented. The sign bit is not preserved — this treats the value as unsigned.",
    formula: "out[i] = in[i − n]  (0 if out of range)",
  },
  ASR: {
    name: "Arithmetic Shift Right",
    short: "ASR",
    description: "Like LSR, but vacated MSBs are filled with the original sign bit (MSB). Preserves the sign of two's-complement integers — equivalent to signed division by 2ⁿ.",
    mcpExplanation: "The fill neuron for each vacated position receives the sign bit (MSB) as its single excitatory input (threshold = 1). If the number is negative (MSB = 1), those neurons fire and output 1; otherwise they remain silent.",
    formula: "out[i] = in[i − n]  (sign bit if out of range)",
  },
  ROL: {
    name: "Rotate Left",
    short: "ROL",
    description: "Bits shifted out from the MSB wrap around and re-enter at the LSB. No bits are lost — the total information is preserved.",
    mcpExplanation: "Each output bit is wired to input[(i + n) mod width] via a direct AND neuron. The modular indexing is resolved at design time, so no additional logic is needed beyond the routing.",
    formula: "out[i] = in[(i + n) mod width]",
  },
  ROR: {
    name: "Rotate Right",
    short: "ROR",
    description: "Bits shifted out from the LSB wrap around and re-enter at the MSB. Like ROL but in the opposite direction.",
    mcpExplanation: "Each output bit is wired to input[(i − n + width) mod width]. The modular arithmetic is resolved at circuit design time.",
    formula: "out[i] = in[(i − n + width) mod width]",
  },
};
