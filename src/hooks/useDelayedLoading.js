import { useEffect, useState } from "react";

/**
 * Anti-flicker: returns true only after `isLoading` has been true for at least `delayMs`.
 * If the response arrives before the delay, no skeleton is shown.
 */
export function useDelayedLoading(isLoading, delayMs = 150) {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timer = null;
    if (!isLoading) {
      timer = setTimeout(() => setShowLoading(false), 0);
      return () => clearTimeout(timer);
    }
    timer = setTimeout(() => setShowLoading(true), delayMs);
    return () => clearTimeout(timer);
  }, [isLoading, delayMs]);

  return isLoading && showLoading;
}
