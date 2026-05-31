/**
 * AnimatedWire.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 *
 * Renders an SVG line with a traveling signal dot animation.
 * The dot color matches the signal value (teal = HIGH, slate = LOW).
 * Animation is triggered by the `animKey` prop changing.
 */

import { useId } from "react";

const HIGH_COLOR = "#0EA5E9";
const LOW_COLOR = "#94A3B8";
const CARRY_COLOR = "#F59E0B";

interface AnimatedWireProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  value: number;
  animKey: number;
  delay?: number;       // ms delay before dot starts
  duration?: number;    // ms for dot to travel full wire
  strokeWidth?: number;
  dashed?: boolean;
  isCarry?: boolean;
  inhibitory?: boolean;
}

export default function AnimatedWire({
  x1, y1, x2, y2,
  value,
  animKey,
  delay = 0,
  duration = 400,
  strokeWidth = 2,
  dashed = false,
  isCarry = false,
  inhibitory = false,
}: AnimatedWireProps) {
  const uid = useId().replace(/:/g, "");
  const pathId = `wire-${uid}`;

  const wireColor = inhibitory
    ? value === 1 ? "#EF4444" : LOW_COLOR
    : isCarry
    ? value === 1 ? CARRY_COLOR : LOW_COLOR
    : value === 1 ? HIGH_COLOR : LOW_COLOR;

  const dotColor = wireColor;

  // Path length approximation for stroke-dashoffset animation
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);

  const animName = `dot-travel-${uid}`;
  const keyframes = `
    @keyframes ${animName} {
      0%   { offset-distance: 0%;   opacity: 1; }
      85%  { offset-distance: 100%; opacity: 1; }
      100% { offset-distance: 100%; opacity: 0; }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <defs>
        <path id={pathId} d={`M${x1},${y1} L${x2},${y2}`} />
      </defs>

      {/* Static wire */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={wireColor}
        strokeWidth={strokeWidth}
        strokeDasharray={dashed ? "6 3" : undefined}
        style={{ transition: "stroke 0.2s ease" }}
      />

      {/* Traveling dot — re-mounts on animKey change to restart animation */}
      {value === 1 && (
        <circle
          key={`dot-${animKey}`}
          r={4}
          fill={dotColor}
          opacity={0}
          style={{
            offsetPath: `path('M${x1},${y1} L${x2},${y2}')`,
            offsetDistance: "0%",
            animation: `${animName} ${duration}ms cubic-bezier(0.23,1,0.32,1) ${delay}ms forwards`,
          } as React.CSSProperties}
        />
      )}
    </>
  );
}
