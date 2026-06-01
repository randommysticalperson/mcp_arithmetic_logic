/**
 * StepThrough.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 *
 * Reusable step-through controller for circuit evaluation.
 * Shows a sequence of computation steps with prev/next/auto-play controls.
 */

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from "lucide-react";

export interface Step {
  id: string;
  label: string;
  description: string;
  highlight: string[];   // IDs of elements to highlight at this step
  values: Record<string, number>; // signal values at this step
}

interface StepThroughProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  className?: string;
}

export default function StepThrough({ steps, currentStep, onStepChange, className = "" }: StepThroughProps) {
  const [playing, setPlaying] = useState(false);

  const next = useCallback(() => {
    onStepChange(Math.min(currentStep + 1, steps.length - 1));
  }, [currentStep, steps.length, onStepChange]);

  const prev = useCallback(() => {
    onStepChange(Math.max(currentStep - 1, 0));
  }, [currentStep, onStepChange]);

  const reset = useCallback(() => {
    setPlaying(false);
    onStepChange(0);
  }, [onStepChange]);

  useEffect(() => {
    if (!playing) return;
    if (currentStep >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => next(), 900);
    return () => clearTimeout(timer);
  }, [playing, currentStep, steps.length, next]);

  const step = steps[currentStep];

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {/* Progress bar */}
      <div className="h-1 bg-slate-100 rounded-t-xl overflow-hidden">
        <div
          className="h-full bg-sky-400 transition-all duration-500"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="p-4">
        {/* Step header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center font-mono">
              {currentStep + 1}
            </span>
            <span className="text-sm font-bold text-slate-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {step.label}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">{currentStep + 1} / {steps.length}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed mb-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
          {step.description}
        </p>

        {/* Signal values at this step */}
        {Object.keys(step.values).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(step.values).map(([key, val]) => (
              <div key={key} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-all duration-300
                ${val === 1 ? "bg-sky-50 border-sky-200 text-sky-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                <span className={`w-2 h-2 rounded-full ${val === 1 ? "bg-sky-400" : "bg-slate-300"}`} />
                <span className="font-semibold">{key}</span>
                <span className="font-bold">=</span>
                <span className="font-bold">{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Reset"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={prev}
            disabled={currentStep === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex-1 flex gap-1">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => { setPlaying(false); onStepChange(i); }}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? "bg-sky-500" : i < currentStep ? "bg-sky-200" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={currentStep === steps.length - 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setPlaying((p) => !p)}
            className={`p-1.5 rounded-lg transition-colors ${
              playing ? "bg-sky-100 text-sky-600" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            }`}
            title={playing ? "Pause" : "Auto-play"}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
