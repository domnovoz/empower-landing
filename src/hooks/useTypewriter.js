import { useState, useEffect } from "react";

export function useTypewriter(text, baseSpeed = 14) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let cancelled = false;
    let lastTime = 0;
    let nextDelay = baseSpeed;
    setDisplayed("");
    setDone(false);

    const tick = (timestamp) => {
      if (cancelled) return;
      if (!lastTime) lastTime = timestamp;

      if (timestamp - lastTime >= nextDelay) {
        setDisplayed(text.slice(0, i + 1));
        i++;
        lastTime = timestamp;
        nextDelay = Math.max(4, baseSpeed + (Math.random() * 10 - 5));

        if (i >= text.length) {
          setDone(true);
          return;
        }
      }
      requestAnimationFrame(tick);
    };

    const handle = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(handle);
    };
  }, [text, baseSpeed]);

  return [displayed, done];
}
