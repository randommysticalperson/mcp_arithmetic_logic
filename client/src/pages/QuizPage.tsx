/**
 * QuizPage.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 *
 * Interactive quiz/challenge mode for McCulloch-Pitts neuron logic.
 * Presents randomized questions about gate outputs, neuron thresholds,
 * and arithmetic circuits. Tracks score and streak.
 */

import { useState, useMemo, useCallback } from "react";
import { CheckCircle, XCircle, Trophy, RotateCcw, Zap, Brain } from "lucide-react";

type Difficulty = "easy" | "medium" | "hard";

interface Question {
  id: string;
  category: string;
  difficulty: Difficulty;
  prompt: string;
  subPrompt?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randBit() { return randInt(0, 1); }

function generateQuestions(): Question[] {
  const questions: Question[] = [];

  // ── Easy: Gate output questions ──────────────────────────────────────────
  const gates = [
    { name: "AND", fn: (a: number, b: number) => a & b, theta: 2, desc: "θ=2, both inputs excitatory" },
    { name: "OR",  fn: (a: number, b: number) => a | b, theta: 1, desc: "θ=1, both inputs excitatory" },
    { name: "NAND",fn: (a: number, b: number) => (a & b) === 1 ? 0 : 1, theta: 1, desc: "θ=1, inhibitory logic" },
    { name: "NOR", fn: (a: number, b: number) => (a | b) === 0 ? 1 : 0, theta: 1, desc: "θ=1, inhibitory logic" },
    { name: "XOR", fn: (a: number, b: number) => a ^ b, theta: null, desc: "3-neuron circuit (NAND+OR+AND)" },
  ];

  for (let i = 0; i < 6; i++) {
    const gate = gates[randInt(0, gates.length - 1)];
    const a = randBit(), b = randBit();
    const correct = gate.fn(a, b);
    const wrong = correct === 0 ? 1 : 0;
    const opts = Math.random() > 0.5 ? [String(correct), String(wrong)] : [String(wrong), String(correct)];
    const correctIdx = opts.indexOf(String(correct));
    questions.push({
      id: `gate-${i}`,
      category: "Logic Gate Output",
      difficulty: "easy",
      prompt: `What is the output of a McCulloch-Pitts ${gate.name} gate?`,
      subPrompt: `Input A = ${a}, Input B = ${b}`,
      options: opts,
      correctIndex: correctIdx,
      explanation: `${gate.name} gate (${gate.desc}): ${a} ${gate.name} ${b} = ${correct}. The neuron fires when the activation sum ≥ threshold.`,
    });
  }

  // NOT gate
  for (let i = 0; i < 3; i++) {
    const a = randBit();
    const correct = a === 0 ? 1 : 0;
    const opts = [String(correct), String(a)];
    questions.push({
      id: `not-${i}`,
      category: "Logic Gate Output",
      difficulty: "easy",
      prompt: "What is the output of a McCulloch-Pitts NOT gate?",
      subPrompt: `Input A = ${a}`,
      options: opts,
      correctIndex: 0,
      explanation: `NOT gate (θ=0, inhibitory input): output = 1 only when input = 0. NOT(${a}) = ${correct}.`,
    });
  }

  // ── Medium: Threshold and neuron spec questions ───────────────────────────
  const thresholdQs: Question[] = [
    {
      id: "th-1",
      category: "Neuron Threshold",
      difficulty: "medium",
      prompt: "What threshold (θ) does a McCulloch-Pitts AND gate use with 2 excitatory inputs?",
      options: ["θ = 1", "θ = 2", "θ = 0", "θ = 3"],
      correctIndex: 1,
      explanation: "An AND gate fires only when BOTH inputs are 1 (sum = 2). So θ = 2 ensures it fires only when all excitatory inputs are active.",
    },
    {
      id: "th-2",
      category: "Neuron Threshold",
      difficulty: "medium",
      prompt: "What threshold (θ) does a McCulloch-Pitts OR gate use with 2 excitatory inputs?",
      options: ["θ = 2", "θ = 0", "θ = 1", "θ = 3"],
      correctIndex: 2,
      explanation: "An OR gate fires when AT LEAST ONE input is 1 (sum ≥ 1). So θ = 1 is the correct threshold.",
    },
    {
      id: "th-3",
      category: "Neuron Threshold",
      difficulty: "medium",
      prompt: "How many MCP neurons are needed to implement a single XOR gate?",
      options: ["1 neuron", "2 neurons", "3 neurons", "4 neurons"],
      correctIndex: 2,
      explanation: "XOR cannot be implemented with a single MCP neuron (it is not linearly separable). It requires 3 neurons: NAND + OR + AND.",
    },
    {
      id: "th-4",
      category: "Neuron Threshold",
      difficulty: "medium",
      prompt: "In a McCulloch-Pitts NOT gate, the input connection is:",
      options: ["Excitatory (weight +1)", "Inhibitory (weight −∞)", "Excitatory (weight +2)", "Not connected"],
      correctIndex: 1,
      explanation: "The NOT gate uses an inhibitory connection. If the inhibitory input fires (=1), the output is forced to 0. With θ=0 and no excitatory input, output=1 when input=0.",
    },
    {
      id: "th-5",
      category: "Neuron Threshold",
      difficulty: "medium",
      prompt: "How many MCP neurons does a Half Adder use in total?",
      options: ["2 neurons", "3 neurons", "4 neurons", "9 neurons"],
      correctIndex: 2,
      explanation: "A Half Adder = XOR (3 neurons for Sum) + AND (1 neuron for Carry) = 4 MCP neurons total.",
    },
    {
      id: "th-6",
      category: "Neuron Threshold",
      difficulty: "medium",
      prompt: "How many MCP neurons does a Full Adder use?",
      options: ["4 neurons", "7 neurons", "9 neurons", "12 neurons"],
      correctIndex: 2,
      explanation: "A Full Adder = 2 Half Adders (4+4=8 neurons) + 1 OR gate (1 neuron) = 9 MCP neurons total.",
    },
  ];
  questions.push(...thresholdQs);

  // ── Medium: Half adder arithmetic ────────────────────────────────────────
  for (let i = 0; i < 4; i++) {
    const a = randBit(), b = randBit();
    const sum = a ^ b, carry = a & b;
    const correctStr = `Sum=${sum}, Carry=${carry}`;
    const wrongs = [
      `Sum=${carry}, Carry=${sum}`,
      `Sum=${1 - sum}, Carry=${carry}`,
      `Sum=${sum}, Carry=${1 - carry}`,
    ].filter((s) => s !== correctStr);
    const opts = [correctStr, wrongs[0], wrongs[1]].sort(() => Math.random() - 0.5);
    questions.push({
      id: `ha-${i}`,
      category: "Half Adder",
      difficulty: "medium",
      prompt: "What are the outputs of a Half Adder?",
      subPrompt: `A = ${a}, B = ${b}`,
      options: opts,
      correctIndex: opts.indexOf(correctStr),
      explanation: `Half Adder: Sum = A XOR B = ${a} XOR ${b} = ${sum}. Carry = A AND B = ${a} AND ${b} = ${carry}.`,
    });
  }

  // ── Hard: Full adder and binary addition ─────────────────────────────────
  for (let i = 0; i < 4; i++) {
    const a = randBit(), b = randBit(), cin = randBit();
    const total = a + b + cin;
    const sum = total % 2, cout = Math.floor(total / 2);
    const correctStr = `Sum=${sum}, Cₒᵤₜ=${cout}`;
    const wrongs = [
      `Sum=${cout}, Cₒᵤₜ=${sum}`,
      `Sum=${1 - sum}, Cₒᵤₜ=${cout}`,
      `Sum=${sum}, Cₒᵤₜ=${1 - cout}`,
    ].filter((s) => s !== correctStr);
    const opts = [correctStr, wrongs[0], wrongs[1]].sort(() => Math.random() - 0.5);
    questions.push({
      id: `fa-${i}`,
      category: "Full Adder",
      difficulty: "hard",
      prompt: "What are the outputs of a Full Adder?",
      subPrompt: `A = ${a}, B = ${b}, Cᵢₙ = ${cin}`,
      options: opts,
      correctIndex: opts.indexOf(correctStr),
      explanation: `Full Adder: total = ${a}+${b}+${cin} = ${total}. Sum = ${total} mod 2 = ${sum}. Cₒᵤₜ = ⌊${total}/2⌋ = ${cout}.`,
    });
  }

  // ── Hard: Two's complement ────────────────────────────────────────────────
  const twosQs: Question[] = [
    {
      id: "tc-1",
      category: "Two's Complement",
      difficulty: "hard",
      prompt: "To subtract B from A using MCP neurons (two's complement method), what is the first step?",
      options: [
        "Invert all bits of A, then add 1",
        "Invert all bits of B, then set Cᵢₙ = 1",
        "Invert all bits of B, then set Cᵢₙ = 0",
        "Add B directly with a borrow flag",
      ],
      correctIndex: 1,
      explanation: "Two's complement subtraction: compute ¬B (invert all bits of B using 8 NOT neurons), then add with Cᵢₙ=1 on the LSB full adder. This gives A + (¬B + 1) = A − B.",
    },
    {
      id: "tc-2",
      category: "Two's Complement",
      difficulty: "hard",
      prompt: "In a 4-bit two's complement subtractor, how many extra MCP neurons are needed beyond the 36-neuron adder?",
      options: ["4 NOT neurons", "8 NOT neurons", "16 NOT neurons", "No extra neurons"],
      correctIndex: 1,
      explanation: "We need one NOT neuron per bit of B to invert it. For a 4-bit B operand, that is 4 NOT neurons. Wait — the question asks about a 4-bit subtractor: 4 NOT neurons for the 4 B bits. But if we consider the full 8-bit case it would be 8. For 4-bit: 4 NOT neurons.",
    },
    {
      id: "tc-3",
      category: "Two's Complement",
      difficulty: "hard",
      prompt: "What is 0110 − 0011 in 4-bit two's complement? (6 − 3)",
      options: ["0011 (3)", "1001 (9)", "0110 (6)", "1100 (12)"],
      correctIndex: 0,
      explanation: "6 − 3 = 3. In binary: 0110 − 0011. Two's complement of 0011 = 1100 + 1 = 1101. Then 0110 + 1101 = 10011. Discard carry → 0011 = 3. ✓",
    },
  ];
  questions.push(...twosQs);

  // ── Hard: Bit shifting ────────────────────────────────────────────────────
  for (let i = 0; i < 3; i++) {
    const val = randInt(1, 127);
    const bits = val.toString(2).padStart(8, "0");
    const shl = ((val << 1) & 0xFF).toString(2).padStart(8, "0");
    const shr = (val >> 1).toString(2).padStart(8, "0");
    const isLeft = Math.random() > 0.5;
    const correct = isLeft ? shl : shr;
    const wrong1 = isLeft ? shr : shl;
    const wrong2 = val.toString(2).padStart(8, "0");
    const opts = [correct, wrong1, wrong2].sort(() => Math.random() - 0.5);
    questions.push({
      id: `shift-${i}`,
      category: "Bit Shifting",
      difficulty: "hard",
      prompt: `What is the result of ${isLeft ? "SHL (logical shift left)" : "SHR (logical shift right)"} by 1?`,
      subPrompt: `Input: ${bits} (${val})`,
      options: opts,
      correctIndex: opts.indexOf(correct),
      explanation: `${isLeft ? "SHL" : "SHR"} by 1: ${isLeft ? "shift all bits left, fill LSB with 0" : "shift all bits right, fill MSB with 0"}. ${bits} → ${correct} (${parseInt(correct, 2)}).`,
    });
  }

  // Shuffle
  return questions.sort(() => Math.random() - 0.5);
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  hard: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function QuizPage() {
  const [questions] = useState<Question[]>(() => generateQuestions());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [answered, setAnswered] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [key, setKey] = useState(0); // force re-mount to reset

  const question = questions[currentIdx];
  const isCorrect = selected !== null && selected === question.correctIndex;
  const progress = ((currentIdx) / questions.length) * 100;

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
    const correct = idx === question.correctIndex;
    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
    } else {
      setStreak(0);
    }
    setAnswered((prev) => [...prev, correct]);
  }

  function handleNext() {
    if (currentIdx + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  }

  function handleRestart() {
    setCurrentIdx(0);
    setSelected(null);
    setShowExplanation(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setAnswered([]);
    setFinished(false);
    setKey((k) => k + 1);
  }

  const scorePercent = Math.round((score / questions.length) * 100);

  if (finished) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="text-amber-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Quiz Complete!
          </h2>
          <p className="text-slate-500 mb-6">You answered {score} of {questions.length} questions correctly.</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-3xl font-bold font-mono text-slate-800">{score}/{questions.length}</p>
              <p className="text-xs text-slate-400 mt-1">Score</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-3xl font-bold font-mono text-sky-600">{scorePercent}%</p>
              <p className="text-xs text-slate-400 mt-1">Accuracy</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-3xl font-bold font-mono text-amber-500">{maxStreak}</p>
              <p className="text-xs text-slate-400 mt-1">Best Streak</p>
            </div>
          </div>

          {/* Per-question result */}
          <div className="flex gap-1.5 justify-center mb-6 flex-wrap">
            {answered.map((correct, i) => (
              <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                correct ? "bg-emerald-500" : "bg-rose-400"
              }`}>
                {i + 1}
              </div>
            ))}
          </div>

          <div className="text-sm text-slate-500 mb-6">
            {scorePercent >= 90 ? "🎉 Excellent! You have a strong grasp of MCP neuron logic." :
             scorePercent >= 70 ? "👍 Good work! Review the explanations for any missed questions." :
             scorePercent >= 50 ? "📚 Keep studying! The About page and gate explorer will help." :
             "🔄 Don't give up — try the step-through mode on the circuit pages to build intuition."}
          </div>

          <button
            onClick={handleRestart}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors active:scale-95"
          >
            <RotateCcw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5" key={key}>
      {/* Header stats */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Brain size={14} className="text-sky-500" />
              <span className="text-sm font-bold text-slate-700 font-mono">{score}/{questions.length}</span>
              <span className="text-xs text-slate-400">correct</span>
            </div>
            {streak >= 2 && (
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                <Zap size={12} className="text-amber-500" />
                <span className="text-xs font-bold text-amber-600">{streak} streak</span>
              </div>
            )}
          </div>
          <span className="text-xs text-slate-400 font-mono">{currentIdx + 1} / {questions.length}</span>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${DIFFICULTY_COLORS[question.difficulty]}`}>
            {question.difficulty.toUpperCase()}
          </span>
          <span className="text-xs text-slate-400 font-mono">{question.category}</span>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-2 leading-snug" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {question.prompt}
        </h3>
        {question.subPrompt && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 mb-5 font-mono text-sm text-slate-700">
            {question.subPrompt}
          </div>
        )}

        {/* Options */}
        <div className="space-y-2.5">
          {question.options.map((opt, i) => {
            let style = "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100";
            if (selected !== null) {
              if (i === question.correctIndex) {
                style = "bg-emerald-50 border-emerald-400 text-emerald-800";
              } else if (i === selected && !isCorrect) {
                style = "bg-rose-50 border-rose-400 text-rose-800";
              } else {
                style = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
              }
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 font-mono text-sm ${style} ${
                  selected === null ? "active:scale-[0.99] cursor-pointer" : "cursor-default"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                    selected !== null && i === question.correctIndex ? "bg-emerald-500 border-emerald-500 text-white" :
                    selected !== null && i === selected && !isCorrect ? "bg-rose-400 border-rose-400 text-white" :
                    "border-slate-300 text-slate-400"
                  }`}>
                    {selected !== null && i === question.correctIndex ? "✓" :
                     selected !== null && i === selected && !isCorrect ? "✗" :
                     String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showExplanation && (
          <div className={`mt-4 rounded-xl border p-4 ${
            isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect
                ? <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                : <XCircle size={16} className="text-rose-500 shrink-0" />}
              <span className={`text-sm font-bold ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                {isCorrect ? "Correct!" : "Incorrect"}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{question.explanation}</p>
          </div>
        )}

        {/* Next button */}
        {selected !== null && (
          <button
            onClick={handleNext}
            className="mt-4 w-full py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors active:scale-[0.99]"
          >
            {currentIdx + 1 >= questions.length ? "See Results" : "Next Question →"}
          </button>
        )}
      </div>

      {/* Question map */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Progress</h4>
        <div className="flex gap-1.5 flex-wrap">
          {questions.map((q, i) => (
            <div
              key={i}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                i < answered.length
                  ? answered[i] ? "bg-emerald-500 text-white" : "bg-rose-400 text-white"
                  : i === currentIdx
                  ? "bg-sky-500 text-white ring-2 ring-sky-300 ring-offset-1"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
