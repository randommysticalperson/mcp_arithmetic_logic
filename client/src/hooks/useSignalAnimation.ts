/**
 * useSignalAnimation.ts
 * Tracks a "generation" counter that increments whenever inputs change.
 * Components use this to trigger CSS animation restarts via key props.
 */

import { useEffect, useRef, useState } from "react";

export function useSignalAnimation(deps: unknown[]) {
  const [gen, setGen] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setGen((g) => g + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return gen;
}
