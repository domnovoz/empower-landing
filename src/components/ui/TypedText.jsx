import React, { useRef, useEffect } from "react";
import { useTypewriter } from "../../hooks/useTypewriter";

export function TypedText({ text, speed = 14, onDone, className = "" }) {
  const [displayed, done] = useTypewriter(text, speed);
  const fired = useRef(false);
  useEffect(() => {
    if (done && !fired.current) {
      fired.current = true;
      onDone?.();
    }
  }, [done, onDone]);
  return (
    <span className={className}>
      {displayed}
      {!done && <span className="cursor cursor-accent" />}
    </span>
  );
}
